import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebaseConfig';

/**
 * Protected Route Component
 * Ensures that only authenticated users can access user-specific routes like dashboard
 * Uses Firebase Auth state as the primary authentication source
 * Note: Core app features (resume parsing, job matching, etc.) are accessible to guests
 */
const ProtectedRoute = () => {
  const location = useLocation();
  
  // Get auth state from Firebase using react-firebase-hooks
  const [firebaseUser, firebaseLoading] = useAuthState(auth);
  
  // Get auth state from Redux store as fallback
  const { user: reduxUser } = useSelector((state) => state.auth);
  
  // Show loading spinner while Firebase auth state is being determined
  if (firebaseLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="loading-spinner w-16 h-16"></div>
        <h2 className="text-xl font-semibold text-white mt-4">
          Authenticating...
        </h2>
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login for user-specific routes
  if (!firebaseUser && !reduxUser) {
    // Redirect to login page with return URL in state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // User is authenticated, render the protected content via Outlet
  return <Outlet />;
};

export default ProtectedRoute;