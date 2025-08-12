import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebaseConfig';
import { login, clearError } from '../features/auth/authSlice';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import { Eye, EyeOff, Mail, Lock, AlertCircle, X } from 'lucide-react';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page to redirect to after login (if any)
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Firebase auth state
  const [firebaseUser, firebaseLoading] = useAuthState(auth);
  
  // Redux auth state
  const { isAuthenticated, error, isLoading } = useSelector(state => state.auth);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  
  const { email, password } = formData;
  
  // Show error snackbar when error state changes
  useEffect(() => {
    if (error) {
      setErrorOpen(true);
      console.log("Login error:", error); // For debugging
    }
  }, [error]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated || firebaseUser) {
      navigate(from, { replace: true });
    }
    
    // Clear any auth errors when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, firebaseUser, navigate, from, dispatch]);
  
  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear field-specific error when user types
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };
  
  // Handle error snackbar close
  const handleErrorClose = () => {
    setErrorOpen(false);
    // Don't clear the error from Redux here so it still shows in the form
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Basic form validation
  const validateForm = () => {
    const errors = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous errors
    dispatch(clearError());
    setErrorOpen(false);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Dispatch login action
    await dispatch(login({ email, password }));
  };
  
  // Handle Google sign-in success
  const handleGoogleSuccess = () => {
    navigate(from, { replace: true });
  };
  
  // Handle Google sign-in error
  const handleGoogleError = (error) => {
    console.error('Google sign-in error:', error);
  };
  
  // Show loading state while checking auth
  if (firebaseLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading-spinner w-16 h-16"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome <span className="text-gradient">Back</span>
          </h1>
          <p className="text-gray-400">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          {/* Static error alert for form context */}
          {error && (
            <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-300 flex items-center fade-in">
              <AlertCircle className="w-5 h-5 mr-3 text-red-400" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  autoFocus
                  value={email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`input-primary w-full pl-10 ${
                    formErrors.email ? 'input-error' : ''
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              {formErrors.email && (
                <p className="mt-2 text-red-400 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`input-primary w-full pl-10 pr-10 ${
                    formErrors.password ? 'input-error' : ''
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-2 text-red-400 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-neon-400 hover:text-neon-300 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner w-5 h-5 mr-2"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-dark-900 text-gray-400">OR</span>
              </div>
            </div>

            {/* Google Auth Button */}
            <GoogleAuthButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-neon-400 hover:text-neon-300 font-semibold transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Floating notification for errors */}
        {errorOpen && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4">
            <div className="bg-red-900 border border-red-700 text-red-300 px-6 py-3 rounded-lg shadow-glow fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                  <span>{error}</span>
                </div>
                <button 
                  onClick={handleErrorClose}
                  className="ml-4 text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;