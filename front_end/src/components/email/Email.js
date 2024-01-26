import React, { useState } from "react";
import NavBar from "../navBar/Navbar";
import { Button, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import styles from "./Email.module.css";
import axios from "axios";

const validateEmail = (email) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

const Email = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
    
  const sendEmail = async () => {
    setError("");
    if (!validateEmail(email)) {
      setError("Invalid email format. Please enter a valid email address.");
      return;
    }

    try {
      setIsLoading(true);
      localStorage.setItem('email', email);
      const construction_type = localStorage.getItem('buttonName');
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/register/`, { email , construction_type  });
      setMessage
      (
        <React.Fragment>
          <h3>Thank you for confirming your email!</h3>
          <br />
          <span>
            Next step is to find your property on the map and draw the area you
            want to maintain.
          </span>
          <br />
          <p>Please check your email for a link to open the map page.</p>
          </React.Fragment>
      );
      } catch (error) {
        setError("Error sending email. Please try again later.");
        console.error("Error sending email:", error);
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.content}>
          <span>
            Please enter your email
          </span>
        </div>
        <div className={styles.content}>
          <div className={styles.buttonContainer}>
            <TextField
              id="outlined-basic"
              label="Email"
              variant="outlined"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              error={error !== ""}
              className={styles.input}
            />
            </div>
            <Button
              variant="contained"
              size="medium"
              endIcon={<SendIcon />}
              onClick={sendEmail}
              disabled={isLoading || message}
              className={styles.sendButton}
              >
              {isLoading ? "Sending..." : message ? "Sent" : "Send"}
            </Button>
          
        </div>
        {error && <div className={styles.error-message}>{error}</div>}
        {message && <div className={styles.message}>{message}</div>}
      </div>
    </>
  );
};

export default Email;