import React, { useEffect, useRef, useState, useCallback } from "react";
import RightBar from "./RightBar";
import styles from "./Mapping.module.css";
import BrushOutlinedIcon from "@mui/icons-material/BrushOutlined";
import { Button } from "@mui/material";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const MapComponent = ({
  initialCordinate = [],
  loc,
  uniqueId,
  Loc_address,
  user_email,
}) => {
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const [drawnCoordinates, setDrawnCoordinates] = useState(initialCordinate);
  const [drawingModeEnabled, setDrawingModeEnabled] = useState(false);
  const [drawingControlEnabled, setDrawingControlEnabled] = useState(true);
  const [enteredLocation, setEnteredLocation] = useState(Loc_address || null);
  const [area, setTotalArea] = useState(null);
  const [savedDataList, setSavedDataList] = useState([]);
  const [cost, setCost] = useState(null);
  const [drawnShapes, setDrawnShapes] = useState([]);
  const [drawnShapeIndividual, setDrawnShapeIndividual] = useState(null);
  const drawingManagerRef = useRef(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)
  const [rightBarVisible, setRightBarVisible] = useState(false);
  const [menuBtnVisibility, setMenuBtnVisibility] = useState(false);
  const [addressLocation , setAddressLocation] = useState("");
  const [addressLocationCod, setAddressLocationCod] = useState("")
  const [detailAddress, setDetailAddress] = useState({
    streetNumber: '',
    streetName: '',
    city: '',
    county: '',
    state: '',
    stateCode: '',
    country: '',
    countryCode: '',
    postalCode: '',
    subpremise: '',
    formatted_address:''
  });

  const uniqueIdentifier =  JSON.parse(localStorage.getItem('uniqueIdentifier')).uniqueIdentifier;
  const loadScript = (src, id) => {
    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById(id);

      if (existingScript) {
        resolve();
      } else {
        const script = document.createElement("script");
        script.src = src;
        script.id = id;

        script.onload = () => {
          resolve();
        };

        script.onerror = (error) => {
          reject(
            new Error(`Failed to load script: ${src}. Error: ${error.message}`)
          );
        };
        document.body.appendChild(script);
      }
    });
  };

  function removeDuplicates(arr) {
    const seen = new Map();
    return arr.filter((item) => {
      return (
        !seen.has(item.drawnShapeIndividual.id) &&
        seen.set(item.drawnShapeIndividual.id, true)
      );
    });
  }

  function removeDuplicatesShape(arr) {
    const seen = new Map();
    return arr.filter((item) => {
      return !seen.has(item.id) && seen.set(item.id, true);
    });
  }

  const onSave = async ({
    shape = null,
    prevCoordinates = null,
    prevCost = null,
    prevArea = null,
  }) => {
    const savedData = {
      area: prevArea || area,
      cost: prevCost || cost,
      coordinates: prevCoordinates || getLatLngArray(),
      drawnShapeIndividual: shape || drawnShapeIndividual,
    };

    try {
      setSavedDataList((prevList) => {
        const updatedList = removeDuplicates([...prevList, savedData]);
        return updatedList;
      });

      setDrawingModeEnabled(false);
      setDrawnCoordinates([]);
      setCost(null);
      setTotalArea(null);
      setDrawnShapeIndividual(null);

      if (!prevCoordinates) {
        const sendingData = {
          unique_identifier: uniqueIdentifier,
          area: prevArea || area,
          cost: prevCost || cost,
          coordinates: prevCoordinates || getLatLngArray(),
          id_shape: drawnShapeIndividual?.id || null,
          address: enteredLocation,
        };

        await axios.post(
          `${process.env.REACT_APP_BASE_URL}/shapes/create-shape/`,
          sendingData
        );
        const drawingManager = drawingManagerRef.current;
        drawingManager.setOptions({
          drawingMode: null,
          drawingControl: false,
        });
      }
    } catch (error) {
      console.error("Error posting data to the backend:", error);
    }
  };

  const initMap = useCallback(async () => {
    await loadScript(
      `https://maps.googleapis.com/maps/api/js?key=AIzaSyAoPL6TBzQQOofG6GwNjR_kdnxhn6MjFIc&libraries=places,drawing,geometry`,
      "google-maps-script"
    );

    if (
      window.google &&
      window.google.maps &&
      window.google.maps.drawing &&
      window.google.maps.places
    ) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: centerCoords,
        zoom: 17,
      });

      initialCordinate.forEach(({ id_shape, coordinates, area, cost }) => {
        const shapesCoordinates = coordinates.map((lt) => ({
          lat: lt[1],
          lng: lt[0],
        }));
        const shapes = new window.google.maps.Polygon({
          paths: shapesCoordinates,
          strokeColor: "red",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "red",
          fillOpacity: 0.35,
        });
        const shape = {
          id: id_shape,
          drawnShape: shapes,
        };

        onSave({
          shape,
          prevCoordinates: shapesCoordinates,
          prevCost: cost,
          prevArea: area,
        });

        setDrawnShapes((prevShapes) => {
          const newShapes = [...prevShapes, shape];
          return newShapes;
        });
        shapes.setMap(map);
      });

      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,

        drawingControlOptions: {
          position: window.google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [window.google.maps.drawing.POLYGON],
        },
      });

      drawingManager.setMap(map);
      drawingManagerRef.current = drawingManager;

      const searchInput = new window.google.maps.places.Autocomplete(
        searchInputRef.current
      );
      searchInput.bindTo("bounds", map);

      searchInput.addListener("place_changed", () => {
        const place = searchInput.getPlace();

        for (const component of place.address_components) {
          const types = component.types;
        
          if (types.includes('street_number')) {
            detailAddress.streetNumber = component.long_name ;
          } else if (types.includes('route')) {
            detailAddress.streetName = component.long_name;
          } else if (types.includes('locality')) {
            detailAddress.city = component.long_name;
          } else if (types.includes('administrative_area_level_2')) {
            detailAddress.county = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            detailAddress.state = component.short_name;
            detailAddress.stateCode = component.short_name;
          } else if (types.includes('country')) {
            detailAddress.country = component.short_name;
            detailAddress.countryCode = component.short_name;
          } else if (types.includes('postal_code')) {
            detailAddress.postalCode = component.long_name;
          } else if (types.includes('subpremise')) {
            detailAddress.subpremise = component.long_name;
          }
        }

        const completeAdd = place.formatted_address;
        setAddressLocation(completeAdd);

        setDetailAddress(prevDetailAddress => ({
          ...prevDetailAddress,
          streetNumber: detailAddress.streetNumber,
          streetName: detailAddress.streetName,
          city: detailAddress.city,
          county: detailAddress.county,
          state: detailAddress.state,
          stateCode: detailAddress.stateCode,
          country: detailAddress.country,
          countryCode: detailAddress.countryCode,
          postalCode: detailAddress.postalCode,
          subpremise: detailAddress.subpremise,
          formatted_address: completeAdd,
        }))
        // , () => {
        //   console.log('detailAddress...', detailAddress);
        // });

        const latitude = place.geometry.location.lat();
        const longitude = place.geometry.location.lng();

        setAddressLocation(completeAdd);
        setEnteredLocation(completeAdd);
        setAddressLocationCod({ lat: latitude, lng: longitude });

        if (place.geometry) {
          map.setCenter(place.geometry.location);
          map.setZoom(19);

          const request = {
            placeId: place.place_id,
            fields: ["name", "formatted_address", "place_id", "geometry"],
          };
          const infowindow = new window.google.maps.InfoWindow();
          const service = new window.google.maps.places.PlacesService(map);
          service.getDetails(request, (placeDetails, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              placeDetails &&
              placeDetails.geometry &&
              placeDetails.geometry.location
            ) {
              const marker = new window.google.maps.Marker({
                map,
                position: placeDetails.geometry.location,
              });

              window.google.maps.event.addListener(marker, "click", () => {
                const content = document.createElement("div");
                const nameElement = document.createElement("h2");

                nameElement.textContent = placeDetails.name;
                content.appendChild(nameElement);
                const placeAddressElement = document.createElement("p");

                placeAddressElement.textContent = placeDetails.formatted_address;
                content.appendChild(placeAddressElement);
                infowindow.setContent(content);
                infowindow.open(map, marker);
              });
            }
          });
        } else {
          console.error("Place details not available for input:", place.name);
        }
      });
      window.google.maps.event.addListener(
        drawingManager,
        "overlaycomplete",
        (event) => {
          if (event.type === "polygon") {
            const coordinates = event.overlay.getPath().getArray();
            setDrawnCoordinates(coordinates);
            const area = calculateAreaInSquareMeters(coordinates);
            setTotalArea(area);
            const drawnShape = event.overlay;
            const shape = { id: uuidv4(), drawnShape };
            setDrawnShapeIndividual(shape);
            setDrawnShapes((prevShapes) => [...prevShapes, shape]);
          }
        }
      );
    } else {
      console.error("Google Maps API not loaded");
    }
  }, [detailAddress]);

  let centerCoords;
  if (loc && loc.lat && loc.lng) {
    centerCoords = { lat: loc.lng , lng: loc.lat };
  } else {
    centerCoords = { lat: 33.812511, lng: -117.918976 };
  }

  const calculateAreaInSquareMeters = (coordinates) => {
    if (coordinates.length < 3) {
      console.error(
        "At least 3 coordinates are required to calculate the area."
      );
      return null;
    }
    const polygon = new window.google.maps.Polygon({ paths: coordinates });
    const area = window.google.maps.geometry.spherical.computeArea(
      polygon.getPath()
    );
    const areaInSquareMeters = Math.abs(area);
    const roundedResult = areaInSquareMeters.toFixed(0);
    setTotalArea(parseFloat(roundedResult));
    return parseFloat(roundedResult);
  };

  const toggleDrawingMode = () => {
    const drawingManager = drawingManagerRef.current;
    if (!drawingModeEnabled) {
      drawingManager.setOptions({
        drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
      });
      window.google.maps.event.addListenerOnce(
        drawingManager,
        "overlaycomplete",
        (event) => {
          drawingManager.setOptions({
            drawingMode: null,
            drawingControl: false,
          });
          setDrawingModeEnabled(true);
          setRightBarVisible(true);
        }
      );
    } else {
      drawingManager.setOptions({
        drawingMode: null,
        drawingControl: false,
      });
    }
    setDrawingModeEnabled(!drawingModeEnabled);
  };

  const handleDeleteCard = (index) => {
    const updatedDataList = [...savedDataList];
    const deletedData = updatedDataList.splice(index, 1)[0];
    setSavedDataList(updatedDataList);
    const deletedShape = drawnShapes.find(
      (shape) => shape.getPath().getArray() === deletedData.coordinates
    );
    if (deletedShape) {
      deletedShape.setMap(null);
      setDrawnShapes((prevShapes) =>
        prevShapes.filter((shape) => shape !== deletedShape)
      );
    }
  };

  const getLatLngArray = () => {
    return drawnCoordinates.map(({ lat, lng }) => ({ lat: lat(), lng: lng() }));
  };

  const handleResize = (e) => {
    setScreenWidth(e.target.innerWidth)
  }
  useEffect(() => {
    initMap()

  }, []);

  useEffect(() => {
    if(screenWidth > 1200) {
      setRightBarVisible(true)
      setMenuBtnVisibility(false)
    }
    else {
      setRightBarVisible(false)
      setMenuBtnVisibility(true)
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [screenWidth])

  useEffect(() => {
    if (area) {
      const costPerSquareMeter = 12.5;
      const calculatedCost = area * costPerSquareMeter;
      setCost(calculatedCost);
    }
  }, [area]);

  // useEffect(() => {
  //   console.log('detailAddress...', detailAddress);
  // }, [detailAddress]);

  const handleListButtonClick = () => {
    setRightBarVisible(!rightBarVisible);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchContainer}>
        <div className={styles.innerWrapper}>
          <span className={styles.prompt}>Enter your address:</span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder={
              Loc_address
                ? Loc_address || addressLocation
                : initialCordinate.length > 0
                ? "Search disabled"
                : "Search place here..."
            }
            className={styles.searchInput}
            disabled={initialCordinate.length > 0}
          />
            
          <Button
            variant="contained"
            color="primary"
            size="small"
            className={styles.searchButton}
            disabled={!drawingControlEnabled}
          >
            Search
          </Button>
        </div>
        <div className={styles.mapContainer}>
          <div ref={mapRef} className={styles.map} />
        </div>
        <div className={styles.draw_Button}>
          <Button
            variant="contained"
            size="large"
            onClick={toggleDrawingMode}
            className={styles.drawingButton}
            disabled={!drawingControlEnabled}
            endIcon={<BrushOutlinedIcon />}
          >
            {drawingModeEnabled
              ? "Turn Off Drawing Mode"
              : "Turn On Drawing Mode"}
          </Button>
          {menuBtnVisibility && <div className={styles.list_Button}>
              <Button onClick={handleListButtonClick}
              variant="contained"
              size="large">
                <FormatListBulletedIcon/>
              </Button>
          </div>}
        </div>
        
        <div></div>
      </div>

      <RightBar
        drawnCoordinates={drawnCoordinates}
        area={area}
        rightBarVisible={rightBarVisible}
        cost={cost}
        drawingModeEnabled={drawingModeEnabled}
        onSave={onSave}
        savedDataListt={savedDataList}
        setSavedDataListt={setSavedDataList}
        handleDeleteCard={handleDeleteCard}
        location={addressLocationCod}
        address={addressLocation}
        setDrawnShapes={setDrawnShapes}
        unique_identifier={uniqueId}
        Loc_address={Loc_address}
        user_email={user_email}
        setRightBarVisible={setRightBarVisible}
        addressDetails = {detailAddress}
      />
    </div>
  );
};

export default MapComponent;
