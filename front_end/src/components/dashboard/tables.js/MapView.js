import React, { useEffect } from 'react';

const MapView = ({ latitude, longitude, zoom , coordinatesArray }) => {
  const convertedData = coordinatesArray.map(coords => {
    return coords.map(point => ({ lat: point[1], lng: point[0] }));
  });

  const loadMap = () => {
    if (window.google) {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        zoom: zoom,
        center: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
        mapTypeId: "terrain",
      });
  
      convertedData.forEach(coords => {
        const polygon = new window.google.maps.Polygon({
          paths: coords,
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0.35,
        });
        polygon.setMap(map);
      });
  
      return map;
    } else {
      throw new Error("Google Maps API not available.");
    }
  };

  useEffect(() => {
    const initMap = async () => {
      try {
        await loadMap();
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAoPL6TBzQQOofG6GwNjR_kdnxhn6MjFIc&callback=initMap`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = (error) => console.error("Error loading Google Maps API:", error);
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [latitude, longitude, zoom]);

  return <div id="map" style={{ height: '93%' }}></div>;
};

export default MapView;
