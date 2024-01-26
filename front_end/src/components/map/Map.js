import { useLocation } from "react-router-dom";
import NavBar from "../navBar/Navbar";
import Mapping from "./Mapping";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Map = () => {
  const [mapObjectData, setMapObjectData] = useState([]);
  const [address, setAddress] = useState();
  const [userEmail, setUserEmail] = useState([]);
  const [locationSerachCood, setLocationSerachCood] = useState([]);
  const [loading , setLoading ] = useState(true)
  
  const uniqueIdentifier =  JSON.parse(localStorage.getItem('uniqueIdentifier')).uniqueIdentifier;

  useEffect(() => {
    setLoading(true)
    axios.get(`${process.env.REACT_APP_BASE_URL}/shapes/api/data/?unique_identifier=${uniqueIdentifier}`)
      .then(response => {
        setMapObjectData(response.data.shapes.map((data) => data));
        const addressData = response.data.address[0];
        if (addressData) {
          setAddress(addressData.formatted_address);
        }
        if(response.data.address.length>0){
          localStorage.setItem('address' , JSON.stringify(response.data.address[0]));
        }

        const locationArray = response.data.map_object.location;
        if (locationArray && locationArray.length >= 2) {
          const lat = locationArray[0];
          const lng = locationArray[1];
          setLocationSerachCood({ lng , lat });
        } else {
          console.error('Invalid location array:', locationArray);
        }

        const user_id = response.data.map_object.user;
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/get-email/?id=${user_id}`)
          .then((res) => {
            setUserEmail(res.data.email)
          })
          .catch(err => console.log(err))
      }).finally(_ =>
        {
          setLoading(false)
        }
      )

  }, [])

  return (
    <div>
      {loading ? <div >Loading....</div>: 
      <>
      <NavBar />
      <Mapping
        initialCordinate={mapObjectData}
        loc={locationSerachCood}
        uniqueId={uniqueIdentifier}
        Loc_address={address}
        user_email={userEmail}
        // addressObject = {addressObject}
      />
      </>}
    </div>
  );
};

export default Map;