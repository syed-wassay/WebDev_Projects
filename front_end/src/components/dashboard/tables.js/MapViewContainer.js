import React from 'react';
import MapView from './MapView';
import Button from "@mui/material/Button";
import styles from "./MapViewContainer.module.css";

const MapViewContainer = ({latitude, longitude, coordinatesArray , zoom, center , onClose }) => {
  return (
    <div>
        <div className={styles.popupOverlay}> 
          <div  className={styles.popupContent}>
            <MapView latitude={latitude} longitude={longitude} zoom={zoom} center={center} coordinatesArray={coordinatesArray} />
            <Button variant="contained" onClick={onClose} className={styles.closeButton}>
              Close
            </Button>
            </div>
        </div>
    </div>
  );
};
export default MapViewContainer;