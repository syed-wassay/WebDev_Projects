import React, { useState, useEffect } from 'react';
import Navbar from './../navBar/Navbar';
import SideBar from './Sidebar';
import styles from './PrivateRoute.module.css';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const PrivateRoute = ({ children, showOptions }) => {
  const [toggleSidebar, setToggleSidebar] = useState(true);
  const [showToggleButton, setShowToggleButton] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const location = useLocation();
  const navigate = useNavigate()

  const handleResize = (e) => {
    setScreenWidth(e.target.innerWidth);
  };

  useEffect(() => {
    if (screenWidth > 1500) {
      setToggleSidebar(true);
      setShowToggleButton(false);
    } else {
      setToggleSidebar(false);
      setShowToggleButton(true);
    }

    window.addEventListener('resize', handleResize);

    if( !sessionStorage.getItem('authenticated') || sessionStorage.getItem('authenticated') === 'false' ){
      navigate('/admin');
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [screenWidth]);

  return (
    <div className={styles.container}>
      <Navbar
        showHome={showOptions}
        showToggleButton={showToggleButton}
        toggleSidebar={toggleSidebar}
        setToggleSidebar={setToggleSidebar}
        showSidebarIcon={location.pathname === '/appointment'}
        style={{ zIndex: 2 }}
      />
      <div className={styles.flexContainer}>
        {toggleSidebar && <SideBar toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />}
        <div className={styles.mainContent}>{children}</div>
      </div>
    </div>
  );
};

export default PrivateRoute;

