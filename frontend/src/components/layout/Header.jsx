import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  useMediaQuery,
  useTheme,
  Avatar,
  Container
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Work';
import CompareIcon from '@mui/icons-material/Compare';
import EmailIcon from '@mui/icons-material/Email';
import FeedbackIcon from '@mui/icons-material/Feedback';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebaseConfig';
import sessionManager from '../../utils/sessionManager';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
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
  
  // For user display info, prefer Firebase user data (unused for now but may be needed for future features)
  // const displayName = firebaseUser?.displayName || reduxUser?.displayName || 'User';
  // const photoURL = firebaseUser?.photoURL || reduxUser?.photoURL;
  
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
    { name: 'Home', path: '/', icon: <HomeIcon /> },
    { name: 'Resume Parser', path: '/resume', icon: <DescriptionIcon /> },
    { name: 'Job Matcher', path: '/job-match', icon: <WorkIcon /> },
    { name: 'Match Results', path: '/match-results', icon: <CompareIcon /> },
    { name: 'Keyword Insights', path: '/keyword-insights', icon: <AnalyticsIcon /> },
    { name: 'Cover Letter', path: '/cover-letter', icon: <EmailIcon /> },
    { name: 'Feedback', path: '/feedback', icon: <FeedbackIcon /> },
  ];
  
  const handleLogout = () => {
    // Clear all session data and redirect
    sessionManager.clearSession();
    dispatch(logout());
    navigate('/');
    if (isMobile) {
      setDrawerOpen(false);
    }
  };
  
  // Authentication-specific items
  const authItems = isLoggedIn 
    ? [
        { name: 'Score Board', path: '/dashboard', icon: <DashboardIcon /> },
        { name: 'Logout', path: '#', icon: <LogoutIcon />, onClick: handleLogout },
      ]
    : [
        { name: 'Login', path: '/login', icon: <LoginIcon /> },
        { name: 'Register', path: '/register', icon: <PersonAddIcon /> },
      ];
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleNavigation = (path, onClick) => {
    if (onClick) {
      onClick();
    } else if (path) {
      navigate(path);
    }
    
    if (isMobile) {
      setDrawerOpen(false);
    }
  };
  
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ 
        p: 3,
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #303f9f 30%, #1976d2 90%)',
        color: 'white'
      }}>
        <Avatar 
          sx={{ 
            bgcolor: 'white', 
            color: theme.palette.primary.main,
            mr: 2,
            width: 40,
            height: 40,
            fontWeight: 'bold'
          }}
        >
          AI
        </Avatar>
        <Typography variant="h6" component="div">
          Resume Optimizer
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.name} 
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              my: 0.5,
              mx: 1,
              borderRadius: 1,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light,
                color: 'white',
                '& .MuiListItemIcon-root': {
                  color: 'white',
                }
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
      <Divider />
      
      {/* Guest user encouragement */}
      {isGuestSession && (
        <Box sx={{ p: 2, mx: 1, my: 1, borderRadius: 1, backgroundColor: theme.palette.info.light, color: 'white' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            👋 Guest Mode Active
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
            Sign up to save your work and access your Score Board!
          </Typography>
          <Button 
            size="small" 
            variant="contained" 
            color="secondary" 
            fullWidth
            onClick={() => handleNavigation('/register')}
          >
            Create Account
          </Button>
        </Box>
      )}
      
      <List>
        {authItems.map((item) => (
          <ListItem 
            button 
            key={item.name} 
            onClick={() => handleNavigation(item.path, item.onClick)}
            selected={location.pathname === item.path}
            sx={{
              my: 0.5,
              mx: 1,
              borderRadius: 1,
              '&.Mui-selected': {
                backgroundColor: theme.palette.secondary.main,
                color: 'white',
                '& .MuiListItemIcon-root': {
                  color: 'white',
                }
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
  
  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'linear-gradient(90deg, #303f9f 0%, #1976d2 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 1, sm: 2 }, py: 1 }}>
            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'white', 
                      color: theme.palette.primary.main,
                      mr: 1.5,
                      width: 32,
                      height: 32,
                      fontWeight: 'bold'
                    }}
                  >
                    AI
                  </Avatar>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Resume Optimizer
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Box 
                  component={Link} 
                  to="/" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    textDecoration: 'none', 
                    color: 'inherit',
                    mr: 4,
                    '&:hover': {
                      opacity: 0.9,
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'white', 
                      color: theme.palette.primary.main,
                      mr: 1.5,
                      width: 36,
                      height: 36,
                      fontWeight: 'bold'
                    }}
                  >
                    AI
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Resume Optimizer
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1, display: 'flex' }}>
                  {navItems.map((item) => (
                    <Button 
                      key={item.name}
                      color="inherit"
                      component={Link}
                      to={item.path}
                      sx={{ 
                        mx: 0.5,
                        px: 1.5,
                        py: 1,
                        borderBottom: location.pathname === item.path ? '3px solid white' : '3px solid transparent',
                        borderRadius: '4px 4px 0 0',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                      startIcon={item.icon}
                    >
                      {item.name}
                    </Button>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {/* Guest mode indicator for desktop */}
                  {isGuestSession && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mr: 2, 
                        px: 1.5, 
                        py: 0.5, 
                        borderRadius: 4, 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        fontSize: '0.75rem'
                      }}
                    >
                      👋 Guest Mode
                    </Typography>
                  )}
                  
                  {authItems.map((item) => (
                    <Button 
                      key={item.name}
                      color="inherit"
                      onClick={item.onClick}
                      component={item.onClick ? undefined : Link}
                      to={item.onClick ? undefined : item.path}
                      variant={item.name === 'Register' ? 'contained' : 'outlined'}
                      sx={{ 
                        ml: 1,
                        px: 2,
                        borderRadius: 8,
                        borderColor: 'white',
                        backgroundColor: item.name === 'Register' ? 'white' : 'transparent',
                        color: item.name === 'Register' ? theme.palette.primary.main : 'white',
                        '&:hover': {
                          backgroundColor: item.name === 'Register' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.15)',
                          borderColor: 'white',
                        }
                      }}
                      startIcon={item.icon}
                    >
                      {item.name}
                    </Button>
                  ))}
                </Box>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar sx={{ mb: 1 }} /> {/* Empty toolbar to offset content below the fixed AppBar */}
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
