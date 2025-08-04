import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

const HomeButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    console.log('HomeButton mounted, current path:', location.pathname);
  }, [location.pathname]);
  
  // Don't show the button on the home page
  if (location.pathname === '/') {
    console.log('On home page, not showing button');
    return null;
  }
  
  console.log('Rendering HomeButton component');
  
  return (
    <Box 
      sx={{ 
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1100
      }}
    >
      <Tooltip title="Home">
        <IconButton 
          color="primary" 
          onClick={() => navigate('/')}
          size="large"
          sx={{ 
            backgroundColor: 'rgba(255,255,255,0.9)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,1)',
            },
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <HomeIcon fontSize="medium" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default HomeButton;
