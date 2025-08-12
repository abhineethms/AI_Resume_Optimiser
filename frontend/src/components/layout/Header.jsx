import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  Briefcase, 
  BarChart3, 
  Target, 
  Mail, 
  MessageSquare, 
  BarChart2,
  LogIn, 
  UserPlus, 
  LogOut,
  Zap
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebaseConfig';
import sessionManager from '../../utils/sessionManager';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get auth state from both Firebase and Redux
  const [firebaseUser] = useAuthState(auth);
  const reduxUser = useSelector((state) => state.auth?.user);
  
  // User is logged in if either Firebase or Redux shows them as authenticated
  const isLoggedIn = !!firebaseUser || !!reduxUser;
  
  // Get session info
  const sessionData = sessionManager.getSessionData();
  const isGuestSession = sessionData?.isGuest === true;
  
  // Log auth state for debugging
  useEffect(() => {
    console.log('Auth State in Header:', { 
      firebaseUser: firebaseUser ? 'Logged in' : 'Not logged in', 
      reduxUser: reduxUser ? 'Logged in' : 'Not logged in',
      isLoggedIn,
      isGuestSession,
      sessionId: sessionData?.sessionId
    });
  }, [firebaseUser, reduxUser, isLoggedIn, isGuestSession, sessionData]);
  
  // Core app features available to all users (guest and authenticated)
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Resume Parser', path: '/resume', icon: FileText },
    { name: 'Job Matcher', path: '/job-match', icon: Briefcase },
    { name: 'Match Results', path: '/match-results', icon: Target },
    { name: 'Keyword Insights', path: '/keyword-insights', icon: BarChart3 },
    { name: 'Cover Letter', path: '/cover-letter', icon: Mail },
    { name: 'Feedback', path: '/feedback', icon: MessageSquare },
  ];
  
  const handleLogout = () => {
    // Clear all session data and redirect
    sessionManager.clearSession();
    dispatch(logout());
    navigate('/');
    setIsMobileMenuOpen(false);
  };
  
  // Authentication-specific items
  const authItems = isLoggedIn 
    ? [
        { name: 'Score Board', path: '/dashboard', icon: BarChart2 },
        { name: 'Logout', path: '#', icon: LogOut, onClick: handleLogout },
      ]
    : [
        { name: 'Login', path: '/login', icon: LogIn },
        { name: 'Register', path: '/register', icon: UserPlus },
      ];
  
  const handleNavigation = (path, onClick) => {
    if (onClick) {
      onClick();
    } else if (path) {
      navigate(path);
    }
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-dark-950 to-dark-900 border-b border-dark-800 backdrop-blur-sm">
        <div className="content-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 hover:opacity-90 transition-opacity duration-200 group"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-neon rounded-lg flex items-center justify-center font-bold text-dark-950 shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
              <span className="text-xl font-bold text-gradient hidden sm:block">
                Resume Optimizer
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`nav-link flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 relative group ${
                      isActive(item.path) ? 'nav-link-active bg-dark-800' : 'hover:bg-dark-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                    {isActive(item.path) && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-neon-500"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Auth Section & Guest Indicator */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Guest mode indicator */}
              {isGuestSession && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-dark-800 border border-dark-600 rounded-full">
                  <span className="text-sm text-gray-400">👋 Guest Mode</span>
                </div>
              )}
              
              {/* Auth buttons */}
              <div className="flex items-center space-x-2">
                {authItems.map((item) => {
                  const Icon = item.icon;
                  const isRegister = item.name === 'Register';
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.path, item.onClick)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        isRegister 
                          ? 'btn-primary' 
                          : 'btn-secondary'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-800 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-dark-900 border-t border-dark-800">
            <div className="content-container py-4">
              {/* Mobile Logo Header */}
              <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-dark-800">
                <div className="w-8 h-8 bg-gradient-neon rounded-lg flex items-center justify-center font-bold text-dark-950">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-gradient">Resume Optimizer</span>
              </div>

              {/* Mobile Navigation Items */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive(item.path) 
                          ? 'bg-dark-800 border-l-4 border-neon-500 text-neon-400' 
                          : 'hover:bg-dark-800 text-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Guest mode card for mobile */}
              {isGuestSession && (
                <div className="mt-4 p-4 bg-dark-800 border border-dark-600 rounded-lg">
                  <h3 className="font-semibold text-neon-400 mb-2 flex items-center">
                    👋 Guest Mode Active
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Sign up to save your work and access your Score Board!
                  </p>
                  <button 
                    onClick={() => handleNavigation('/register')}
                    className="btn-primary w-full"
                  >
                    Create Account
                  </button>
                </div>
              )}

              {/* Mobile Auth Items */}
              <div className="mt-4 pt-4 border-t border-dark-800 space-y-2">
                {authItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.path, item.onClick)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left transition-all duration-200 ${
                        item.name === 'Register'
                          ? 'btn-primary justify-center'
                          : 'hover:bg-dark-800 text-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to push content below fixed header */}
      <div className="h-16"></div>
    </>
  );
};

export default Header;