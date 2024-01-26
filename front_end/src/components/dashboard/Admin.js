import React, { useState } from 'react';
import { Button, TextField, Typography, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useStyles from './Admin.module.css';

const Admin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/admin-login/`, {
        email: formData.email,
        password: formData.password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        console.log(response.data)
        sessionStorage.setItem('authenticated' , 'XURGI, XBQM QA QIWTIW XLEXXMR');
        navigate('/appointment');
      } else {
        setError('Incorrect email or password');
      }
    } catch (error) {
      console.error('Error during API call:', error);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <Grid container className={useStyles.container}>
      <Paper elevation={3} className={useStyles.paper}>
        <Typography variant="h5">Admin Login</Typography>
        <form className={useStyles.form} onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            variant="outlined"
            margin="normal"
            fullWidth
            required
            autoFocus
            onChange={handleChange}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            margin="normal"
            fullWidth
            required
            onChange={handleChange}
          />
          {error && (
            <Typography color="error" variant="body2" className={useStyles.errorMessage}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className={useStyles.submit}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Grid>
  );
};

export default Admin;
