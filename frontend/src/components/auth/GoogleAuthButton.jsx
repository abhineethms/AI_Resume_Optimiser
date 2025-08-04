import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { googleLogin } from '../../features/auth/authSlice';

/**
 * Google Authentication Button Component
 * Provides a styled button for Google Sign-in functionality
 */
const GoogleAuthButton = ({ onSuccess, onError, buttonText = "Sign in with Google" }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Dispatch the Google login action from our Redux slice
      const resultAction = await dispatch(googleLogin());
      
      if (googleLogin.fulfilled.match(resultAction)) {
        // If login was successful and onSuccess callback provided, call it
        if (onSuccess) {
          onSuccess(resultAction.payload);
        }
      } else {
        // If there was an error and onError callback provided, call it
        if (onError) {
          onError(resultAction.error);
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      fullWidth
      variant="outlined"
      startIcon={isLoading ? <CircularProgress size={20} /> : <GoogleIcon />}
      sx={{
        borderColor: '#4285F4',
        color: '#4285F4',
        textTransform: 'none',
        fontSize: '16px',
        fontWeight: 'bold',
        '&:hover': {
          borderColor: '#4285F4',
          backgroundColor: 'rgba(66, 133, 244, 0.04)'
        },
        '&:disabled': {
          color: '#4285F4',
          opacity: 0.7,
        },
        py: 1,
        mb: 2
      }}
    >
      {isLoading ? 'Signing in...' : buttonText}
    </Button>
  );
};

export default GoogleAuthButton;