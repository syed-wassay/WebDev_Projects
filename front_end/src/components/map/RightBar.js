import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./RightBar.module.css";
import {
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
} from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RightBar = ({
  area,
  cost,
  drawingModeEnabled,
  onSave,
  savedDataListt,
  setSavedDataListt,
  location,
  address,
  setDrawnShapes,
  unique_identifier,
  Loc_address,
  user_email,
  setRightBarVisible,
  rightBarVisible,
  addressDetails,
}) => {
  const navigation = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [addressResponseId , setAddressResponseId] = useState('')

  const handleDeleteCard = async (data) => {
    const uniqueIdentifier = unique_identifier;
    await axios
      .delete(
        `${process.env.REACT_APP_BASE_URL}/shapes/delete-shape/?unique_identifier=${uniqueIdentifier}&id_shape=${data.drawnShapeIndividual.id}`
      )
      .then((res) => {
        data.drawnShapeIndividual.drawnShape.setMap(null);
        setSavedDataListt((saveDataList) =>
          saveDataList.filter(
            (saveDataList) =>
              saveDataList.drawnShapeIndividual.id !==
              data.drawnShapeIndividual.id
          )
        );
        setDrawnShapes((drawnShapes) =>
          drawnShapes.filter((shape) => {
            if (shape.id == data.drawnShapeIndividual.id) {
              shape.drawnShape.setMap(null);
            }
            return shape.id !== data.drawnShapeIndividual.id;
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleNextButtonClick = async () => {
    if (savedDataListt.length === 0) {
      alert("Please save some data before proceeding.");
      return;
    }
    const stringifyObjArray = savedDataListt.map(
      ({ area, coordinates, cost }) => ({ area, coordinates, cost })
    );
    sessionStorage.setItem("data", JSON.stringify(stringifyObjArray));
    const lat_cood = location.lat;
    const lng_cood = location.lng;

    const localAddressString = localStorage.getItem('address');
    let responseAddress =  addressDetails;
    if(localAddressString){
      responseAddress = JSON.parse(localAddressString);
      localStorage.removeItem('address');
    }
    axios
    .patch(
      `${process.env.REACT_APP_BASE_URL}/shapes/api/map_object/update/?unique_identifier=${unique_identifier}`,
      { lat_cood, lng_cood,'detailedAddress': responseAddress }
    ).then(response => {
      if(response.data.address_id){
          localStorage.setItem('address_id', JSON.stringify(response.data.address_id));
        }
    }
      ).catch((err) => console.log(err));
    navigation("/date", {
      state: {
        unique_identifier: unique_identifier,
        Loc_address: Loc_address,
        address: address,
        user_email: user_email,
        address_Id: addressResponseId,
      },
    });
  };
  return (
    rightBarVisible &&
    <div
      className={styles.wrapper}
    >
      <div className={styles.rightBar}>
        <div className={styles.closeButton}>
          <IconButton
            aria-label="close"
            onClick={() => setRightBarVisible(false)}
          >
            <CloseIcon />
          </IconButton>
        </div>

        <div className={styles.topCard}>
          <div className={styles.dataComming}>
            {area !== null && (
              <p>
                <b>Area in Sqm: </b>
                {area.toFixed(0)} m<sup>2</sup>
              </p>
            )}
            {cost !== null && (
              <p>
                <b>Estimated Cost: </b>${cost.toFixed(0)}
              </p>
            )}
          </div>

          {drawingModeEnabled && (
            <div className={styles.saveButton}>
              <Button
                variant="contained"
                size="large"
                onClick={onSave}
                disabled={area === null}
              >
                Save
              </Button>
            </div>
          )}
        </div>
        <div className={styles.color}>
          <div className={styles.saveHeading}>
            {savedDataListt
              .slice()
              .reverse()
              .map((data, index) => (
                <Card
                  key={`card-${index}`}
                  className={styles.card}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <CardContent className={styles.cardContent}>
                    <div>
                      <Typography
                        color="text.secondary"
                        component="div"
                        className={styles.totalArea}
                      >
                        <span>Area:</span> {data.area.toFixed(0)} m
                        <sup>2</sup>
                      </Typography>
                      {data.cost && (
                        <Typography
                          color="text.secondary"
                          className={styles.cost}
                        >
                          <span>Cost:</span> ${data.cost.toFixed(0)}
                        </Typography>
                      )}
                    </div>
                    <IconButton
                      aria-label="delete"
                      onClick={() => {
                        handleDeleteCard(data);
                      }}
                      className={`${styles.iconButton} ${
                        isHovered ? styles.hovered : ""
                      }`}
                    >
                      <DeleteOutlinedIcon />
                    </IconButton>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
        <div className={styles.nextButtonContainer}>
          <span>Done? set appointment with us</span>
          <Button
            variant="contained"
            size="small"
            onClick={handleNextButtonClick}
            disabled={savedDataListt.length === 0}
            className={styles.nextButton}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RightBar;