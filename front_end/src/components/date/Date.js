import React, { useState } from "react";
import NavBar from "../navBar/Navbar";
import { Button, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import styles from "./Date.module.css";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const Date = () => {
  const dataa = JSON.parse(sessionStorage.getItem("data"));
  const location = useLocation();
  const unique_identifier = location?.state.unique_identifier;
  const Loc_address = location?.state.Loc_address;
  const addesses = location?.state.address;
  const user_email = location?.state.user_email;
  const address_id = localStorage.getItem('address_id');
  
  
  const [formData, setFormData] = useState({
    email: localStorage.getItem("email") || user_email,
    address: address_id,
    firstName: "",
    lastName: "",
    phone: "", 
  });
  
  const [date_from, setSelectedDateFrom] = useState(null);
  const [date_to, setSelectedDateTo] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const navigation = useNavigate();

  const handleDateFromChange = (date) => {
    setSelectedDateFrom(date);
  };

  const handleDateToChange = (date) => {
    setSelectedDateTo(date);
  };
  const setAppointment = async () => {
    setIsButtonDisabled(true);

    const validationErrors = validateFormData(formData);
    if (Object.keys(validationErrors).length > 0) {
      console.error("Validation errors:", validationErrors);
      setIsButtonDisabled(false);
      return;
    }
    try {
      const backendEndpoint = `${process.env.REACT_APP_BASE_URL}/appointment/create/?unique_identifier=${unique_identifier}`;
      const data = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: address_id,
        date_from,
        date_to,
      };
      const response = await axios.post(backendEndpoint, data);
      if (response.status === 201) {
        resetForm()
        setShowMessage(true);
          setTimeout(() => {
            setShowMessage(false);
            localStorage.clear();
            sessionStorage.clear();
            setIsButtonDisabled(false);
            navigation("/");
          }, 3000);
      } else {
        console.error("Server returned an error:", response.data);
      }
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const validateFormData = (data) => {
    return {};
  };

  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      area: "",
      cost: "",
      address: "",
    });

    setSelectedDateFrom(null);
    setSelectedDateTo(null);
  };

  return (
    <>
      <NavBar />
      <div className={styles.heading}>
        <h1>Appointment</h1>
      </div>
      <div className={styles.wrapper}>
        <div className={styles.right}>
          <div className={styles.container}>
            <div className={styles.right_fields}>
              <TextField
                id="outlined-basic"
                label="First name"
                variant="outlined"
                placeholder="First name"
                className={styles.textField}
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              <TextField
                id="outlined-basic"
                label="Last name"
                variant="outlined"
                placeholder="Last name"
                className={styles.textField}
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
              <TextField
                id="outlined-basic"
                label="Email address"
                variant="outlined"
                placeholder="Email address"
                className={styles.textField}
                value={formData.email || user_email}
                disabled
              />
              <TextField
                id="outlined-basic"
                label="Phone number"
                variant="outlined"
                placeholder="Phone number"
                className={styles.textField}
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>
        </div>
        <div className={styles.left}>
          <div className={styles.container}>
            <div className={styles.right_fields}>
              <TextField
                id="outlined-basic"
                label="Address"
                variant="outlined"
                placeholder="Address"
                className={styles.textField}
                value={addesses || Loc_address}
                disabled
              />
              <div className={styles.recordTextField}>
                {dataa &&
                  dataa.map((item, index) => (
                    <div key={index} className={styles.rowContainer}>
                      <TextField
                        className={styles.textField}
                        id={`outlined-basic-area-${index}`}
                        placeholder="Estimated Area"
                        variant="outlined"
                        fullWidth
                        defaultValue={`Area: ${Math.round(item.area)}m²`}
                        InputProps={{ readOnly: true }}
                      />
                      <TextField
                        className={styles.textField}
                        id={`outlined-basic-cost-${index}`}
                        placeholder="Estimated Cost"
                        variant="outlined"
                        fullWidth
                        defaultValue={`Cost: $${Math.round(item.cost)}`}
                        InputProps={{ readOnly: true }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.lastFields}>
        <div className={styles.datePickerContainer}>
          <div className={styles.input}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date from"
                value={date_from}
                onChange={handleDateFromChange}
                disablePast={true}
                sx={{
                  width: ['64%', '100%'],
                  margin: 'auto',
                  '@media screen and (max-width: 768px)': {
                    width: '100%',
                  },
                }}
              />
            </LocalizationProvider>
          </div>
          <div className={styles.input}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date to"
                value={date_to}
                onChange={handleDateToChange}
                minDate={date_from}
                sx={{
                  width: ['64%','100%'],
                  margin: 'auto',
                  '@media screen and (max-width: 768px)': {
                    width: '100%',
                  },
                }}
              />
            </LocalizationProvider>
          </div>
        </div>
      </div>
      <div className={styles.button}>
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          className={styles.sendButton}
          style={{ padding: "10px 110px" }}
          onClick={setAppointment}
          disabled={isButtonDisabled}
        >
          Send
        </Button>
      </div>
      {showMessage && (
        <div className={styles.message}>
          Appointment booked successfully!
        </div>
      )}

    </>
  );
};

export default Date;
