import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Container, Box, CircularProgress } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase/firebaseConfig';
import { setUser } from './features/auth/authSlice';
import axiosWithAuth from './utils/axiosWithAuth';
import sessionManager from './utils/sessionManager';

// Layout components
import Header from './components/layout/Header';
// import Footer from './components/layout/Footer';

// Auth components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Page components
import HomePage from './pages/HomePage';
import ResumeParserPage from './pages/ResumeParserPage';
import JobMatcherPage from './pages/JobMatcherPage';
import MatchResultsPage from './pages/MatchResultsPage';
import KeywordInsightsPage from './pages/KeywordInsightsPage';
import CoverLetterPage from './pages/CoverLetterPage';
import FeedbackPage from './pages/FeedbackPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const isHomePage = location.pathname === '/';
  const [initializing, setInitializing] = useState(true);
  
  // Monitor Firebase auth state and sync with Redux
  const [user, loading] = useAuthState(auth);
  
  useEffect(() => {
    const handleAuthStateChange = async () => {
      try {
        console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
        
        if (user) {
          // Get the user's Firebase ID token
          const idToken = await user.getIdToken(true);
          console.log('Firebase token obtained (first 10 chars):', idToken.substring(0, 10) + '...');
          
          // Update Redux state when Firebase auth state changes
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            idToken
          };
          
          console.log('Dispatching setUser with:', {
            uid: userData.uid,
            email: userData.email,
            displayName: userData.displayName
          });
          
          dispatch(setUser(userData));
          
          // Initialize user session (converting from guest if needed)
          const existingSession = sessionManager.getSessionData();
          if (existingSession?.isGuest) {
            console.log('Converting guest session to user session');
            sessionManager.convertGuestToUser(userData);
          } else {
            sessionManager.initUserSession(userData);
          }
          
          // Verify token with backend
          if (location.pathname !== '/login' && location.pathname !== '/register') {
            try {
              // The axiosWithAuth interceptor will automatically attach the token
              console.log('Verifying token with backend...');
              const response = await axiosWithAuth.post('/auth/verify-token');
              console.log('Token verification successful:', response.data);
            } catch (error) {
              console.error('Token verification failed:', error);
              // If token verification fails, we'll let the ProtectedRoute handle the redirect
            }
          }
        } else if (!loading) {
          // Clear user from Redux when logged out, but maintain guest session
          console.log('User logged out, initializing guest session');
          dispatch(setUser(null));
          sessionManager.initGuestSession();
        }
        
        // Only set initializing to false once we're done with auth check
        if (!loading) {
          console.log('Authentication initialization complete');
          setInitializing(false);
        }
      } catch (error) {
        console.error('Auth state handling error:', error);
        setInitializing(false);
      }
    };
    
    handleAuthStateChange();
  }, [user, loading, dispatch, location.pathname]);
  
  // Initialize session on app start
  useEffect(() => {
    console.log('Initializing session manager...');
    if (!user && !loading) {
      // If no user is logged in, ensure we have a guest session
      sessionManager.initGuestSession();
    }
  }, [user, loading]);
  
  // Determine which container to use based on route
  const getContainer = (element) => {
    if (isHomePage) {
      return (
        <Box component="main" sx={{ mt: 0, mb: 8, minHeight: '80vh', width: '100%' }}>
          {element}
        </Box>
      );
    } else {
      return (
        <Container component="main" sx={{ mt: 8, mb: 8, minHeight: '80vh' }}>
          {element}
        </Container>
      );
    }
  };
  
  // Show loading indicator while Firebase auth is initializing
  if (initializing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  return (
    <>
      <Header />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={getContainer(<HomePage />)} />
        <Route path="/login" element={getContainer(<LoginPage />)} />
        <Route path="/register" element={getContainer(<RegisterPage />)} />
        
        {/* Protected routes - require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={getContainer(<DashboardPage />)} />
        </Route>
        
        {/* Application workflow routes */}
        <Route path="/resume" element={getContainer(<ResumeParserPage />)} />
        <Route path="/job-match" element={getContainer(<JobMatcherPage />)} />
        <Route path="/match-results" element={getContainer(<MatchResultsPage />)} />
        <Route path="/keyword-insights" element={getContainer(<KeywordInsightsPage />)} />
        <Route path="/cover-letter" element={getContainer(<CoverLetterPage />)} />
        <Route path="/feedback" element={getContainer(<FeedbackPage />)} />
        
        {/* Catch-all route */}
        <Route path="*" element={getContainer(<NotFoundPage />)} />
      </Routes>
      {/* <Footer /> */}
    </>
  );
};

export default App;
