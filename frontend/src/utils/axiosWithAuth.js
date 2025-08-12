import axios from 'axios';
import { auth } from '../firebase/firebaseConfig';
import sessionManager from './sessionManager';

/**
 * Create an Axios instance with interceptors configured to automatically
 * attach Firebase ID tokens to outgoing requests
 */
const axiosWithAuth = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

// Add a request interceptor to attach Firebase tokens
axiosWithAuth.interceptors.request.use(
  async (config) => {
    try {
      // Get the current user from Firebase Auth
      let user = auth.currentUser;
      
      // If no current user, wait a bit for Firebase Auth to initialize
      if (!user) {
        console.log('No current user, waiting for Firebase Auth...');
        await new Promise(resolve => setTimeout(resolve, 100));
        user = auth.currentUser;
      }
      
      // Log for debugging
      console.log('axiosWithAuth interceptor - user:', user ? `Authenticated (${user.email})` : 'Not authenticated');
      
      // If user is authenticated, get a fresh token and add to headers
      if (user) {
        const token = await user.getIdToken(true);
        
        // Log token for debugging (first 10 chars only)
        console.log('Token being sent (first 10 chars):', token.substring(0, 10) + '...');
        
        // Set the Authorization header with Bearer prefix
        config.headers.Authorization = `Bearer ${token}`;
        
        // Remove any session ID headers since we're authenticated
        delete config.headers['X-Session-ID'];
        
        // Log the authentication method
        console.log('Request authenticated with Firebase token');
      } else {
        // For guest users, ensure we have a session and add session ID to headers
        let sessionData = sessionManager.getSessionData();
        
        // Initialize guest session if none exists
        if (!sessionData?.sessionId) {
          console.log('No session found, initializing guest session...');
          sessionData = sessionManager.initGuestSession();
        }
        
        if (sessionData?.sessionId) {
          config.headers['X-Session-ID'] = sessionData.sessionId;
          console.log('Guest session ID being sent:', sessionData.sessionId.substring(0, 10) + '...');
        } else {
          console.warn('Failed to create guest session ID');
        }
      }
      
      return config;
    } catch (error) {
      console.error('Error adding auth token to request:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
axiosWithAuth.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Force refresh the token
        const user = auth.currentUser;
        if (user) {
          const newToken = await user.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Retry the request with new token
          return axiosWithAuth(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error refreshing auth token:', refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosWithAuth;