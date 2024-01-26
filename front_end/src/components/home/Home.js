  import React, { useState } from "react";
  import NavBar from "../navBar/Navbar.js";
  import styles from './Home.module.css'
  import mapBgImage from './../../Assets/map-bg.png'
  import { Button, ButtonGroup } from "@mui/material";
  import { useNavigate } from "react-router-dom";

  const Home = () => {
    const [message, setMessage] = useState("");
    const navigation = useNavigate()


    const pageHandler = () =>{
      localStorage.setItem('buttonName', 'Residential');
      navigation('/email');
    }

    return(
      <>
        <NavBar />
        <div className={styles.container}>
          <div className={styles.imageContainer}>
            <img src={mapBgImage} alt="Map Background" className={styles.image} />
          </div>
          <div className={styles.buttonContainer}>
            <ButtonGroup
              disableElevation
              variant="contained"
              aria-label="Disabled elevation buttons"
            >
              <Button onClick={pageHandler}>Residential Customers</Button>
              <Button>Commercial Customers</Button>
            </ButtonGroup>
          </div>
        </div>
      </>
    );
  };

  export default Home;
