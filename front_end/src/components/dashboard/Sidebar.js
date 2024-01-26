import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { DashboardOutlined, LogoutOutlined } from '@mui/icons-material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

const SideBar = ({ toggleSidebar, setToggleSidebar }) => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogoutClick = () => {
    sessionStorage.removeItem('authenticated');
    navigate('/admin');
  };

  return (
    <>
      <Drawer
        variant="temporary"
        open={toggleSidebar}
        onClose={() => setToggleSidebar(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '200px',
            marginTop: '65px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <List>
          <ListItem button onClick={() => navigate('/appointment')}>
            <ListItemIcon>
              <DashboardOutlined />
            </ListItemIcon>
            <ListItemText primary="Appointment" />
          </ListItem>
          <ListItem button onClick={handleLogoutClick}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default SideBar;


