import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebaseConfig';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Protected Route Component
 * Ensures that only authenticated users can access protected routes
 * Uses both Firebase Auth state and Redux state for reliable authentication checks
 */
const ProtectedRoute = () => {
  const location = useLocation();
  
  // Get auth state from Firebase using react-firebase-hooks
  const [firebaseUser, firebaseLoading] = useAuthState(auth);
  
  // Get auth state from Redux store
  const { isAuthenticated, user: reduxUser } = useSelector((state) => state.auth);
  
  // Show loading spinner while Firebase auth state is being determined
  if (firebaseLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh' 
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Authenticating...
        </Typography>
      </Box>
    );
  }
  
  // If neither Firebase nor Redux show the user is authenticated, redirect to login
  if (!firebaseUser && !isAuthenticated && !reduxUser) {
    // Redirect to login page with return URL in state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // User is authenticated, render the protected content via Outlet
  return <Outlet />;
};

export default ProtectedRoute;