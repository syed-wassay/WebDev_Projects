import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./Verification.module.css";

const Verification = () => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const navigate = useNavigate();
  const [mapObjectExists, setMapObjectExists] = useState(true);
  const [mapObjectData, setMapObjectData] = useState(null);
  const [locationCoordinates, setLocation] = useState([]);
  const [address, setAddress] = useState('')
  const [userEmail , setUserEmail] =useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const uniqueIdentifier = urlParams.get('unique_identifier');
    localStorage.setItem('uniqueIdentifier',JSON.stringify({uniqueIdentifier}) )


    
    const fetchMapObjectData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/shapes/api/data/?unique_identifier=${uniqueIdentifier}`);
        setMapObjectData(response.data['shapes'].map((data) => data));
        const address = (response.data.map_object.address);
        const user_id =  response.data.map_object.user;
        const email_response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/get-email/?id=${user_id}`)
        setUserEmail(email_response.data.email)
        
        setLocation(response.data.map_object.location);
        navigate('/map', {
          state: {
            mapObjectData: response.data.shapes.map((data) => data),
            locationCoordinates: response.data.map_object.location,
            uniqueIdentifier: uniqueIdentifier,
            address: address,
            email: userEmail
          },
        });
      } catch (error) {
        console.error('Error while fetching map object data:', error);
      }
    };

    const sendVerificationRequest = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/verify_email/?token=${token}`);

        if (response.status === 200) {
          try {
            const checkLocationResponse = await axios.get(
              `${process.env.REACT_APP_BASE_URL}/shapes/api/check_location/?unique_identifier=${uniqueIdentifier}`
            );

            if (checkLocationResponse.data.result === 1) {
              setMapObjectExists(true);
              setVerificationStatus('approved');

              await fetchMapObjectData();
            } else {
              navigate('/mapping',{
                state: {
                  uniqueIdentifier: uniqueIdentifier,
                  address: address,
                  email: userEmail
                },
              })
            }
          } catch (error) {
            console.error('Error during location check:', error);
          }
        } else {
          console.log('Token not received, try again');
        }
      } catch (error) {
        console.error('API request failed:', error);
      }
    };

    sendVerificationRequest();
  }, []);

  return (
    <div className={`${styles.container} ${loading ? styles.loading : ''}`}>
      <h1 className={styles.heading}>Verification</h1>
      <p> Verification successful please wait you are being redirected to the application  </p>

      {loading ? (
        <div className={styles.loader}></div>
      ) : (

        <>
          {verificationStatus === "approved" && (
            <p className={styles.successMessage}>Verification successful! Your account is approved.</p>
          )}

          {verificationStatus === "tryAgain" && (
            <p className={styles.errorMessage}>Verification failed. Please try again.</p>
          )}

          {mapObjectExists && mapObjectData && (
            <div className={styles.mapObjectInfo}>
              <p>Map object found!</p>
            </div>
          )}

          {!mapObjectExists && <p className={styles.errorMessage}>Map object not found.</p>}
        </>
      )}
    </div>
      );
};

export default Verification;
