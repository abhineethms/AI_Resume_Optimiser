import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebaseConfig';
import { fetchUserDetails, logout } from '../features/auth/authSlice';
import axiosWithAuth from '../utils/axiosWithAuth';

// Material UI imports
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Description as ResumeIcon,
  Work as JobIcon,
  Compare as MatchIcon,
  Email as CoverLetterIcon,
  Person as PersonIcon,
  Psychology as KeywordIcon
} from '@mui/icons-material';

// Define the workflow steps for the app process
const workflowSteps = [
  {
    title: 'Parse Resume',
    icon: <ResumeIcon />,
    description: 'Upload your resume to extract key information',
    path: '/resume',
    color: '#3f51b5'
  },
  {
    title: 'Match Jobs',
    icon: <JobIcon />,
    description: 'Upload job descriptions to match with your resume',
    path: '/job-match',
    color: '#2196f3'
  },
  {
    title: 'View Results',
    icon: <MatchIcon />,
    description: 'See how well your resume matches job descriptions',
    path: '/match-results',
    color: '#00bcd4'
  },
  {
    title: 'Generate Cover Letter',
    icon: <CoverLetterIcon />,
    description: 'Create tailored cover letters for each job',
    path: '/cover-letter',
    color: '#009688'
  }
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get auth state from Firebase
  const [user, loading] = useAuthState(auth);
  
  // Get auth state from Redux
  const { isLoading } = useSelector(state => state.auth);
  
  // Local state for dashboard data
  const [dashboardData, setDashboardData] = useState({
    recentActivities: [],
    stats: {
      resumesUploaded: 0,
      jobsAnalyzed: 0,
      matchesCreated: 0,
      coverLettersGenerated: 0,
      keywordInsights: 0
    },
    loading: true,
    error: null
  });
  
  // Fetch user details and dashboard data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user details
        await dispatch(fetchUserDetails());
        
        // Fetch dashboard data
        const response = await axiosWithAuth.get('/auth/dashboard');
        console.log('Dashboard API response:', response.data);
        
        setDashboardData(prevData => ({
          ...prevData,
          stats: response.data.data.stats || prevData.stats,
          recentActivities: response.data.data.recentActivities || [],
          loading: false
        }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prevData => ({
          ...prevData,
          loading: false,
          error: error.message || 'Failed to load dashboard data'
        }));
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user, dispatch]);
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };
  
  // Show loading state while checking auth
  if (loading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Grid container spacing={4}>
        {/* User Profile Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={user.photoURL || ''}
                alt={user.displayName || 'User'}
                sx={{ width: 100, height: 100, mb: 2 }}
              >
                {!user.photoURL && <PersonIcon sx={{ fontSize: 60 }} />}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {user.displayName || 'Welcome!'}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              
              <Button 
                variant="outlined" 
                component={Link} 
                to="/profile" 
                sx={{ mt: 1 }}
              >
                Edit Profile
              </Button>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* User Stats */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              📊 Score Board
            </Typography>
            
            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <ResumeIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Resumes Parsed</Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        {dashboardData.stats.resumesUploaded}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <JobIcon color="secondary" />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Jobs Analyzed</Typography>
                      <Typography variant="h6" color="secondary" sx={{ fontWeight: 'bold' }}>
                        {dashboardData.stats.jobsAnalyzed}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <MatchIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Matches Created</Typography>
                      <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                        {dashboardData.stats.matchesCreated || 0}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <CoverLetterIcon color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Cover Letters</Typography>
                      <Typography variant="h6" color="info.main" sx={{ fontWeight: 'bold' }}>
                        {dashboardData.stats.coverLettersGenerated}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <KeywordIcon color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Keyword Insights</Typography>
                      <Typography variant="h6" color="warning.main" sx={{ fontWeight: 'bold' }}>
                        {dashboardData.stats.keywordInsights || 0}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Button 
              fullWidth 
              variant="contained" 
              color="error" 
              onClick={handleLogout} 
              sx={{ mt: 2 }}
            >
              Logout
            </Button>
          </Paper>
        </Grid>
        
        {/* Main Content Section */}
        <Grid item xs={12} md={8}>
          {/* Workflow Process Cards */}
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Resume Optimization Process
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Optimize your job applications by following our 4-step process. Start by parsing your resume, then match it against job descriptions to get insights and generate tailored cover letters.
          </Typography>
          
          <Grid container spacing={3}>
            {workflowSteps.map((step, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card 
                  elevation={4}
                  sx={{ 
                    height: '100%',
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-5px)' }
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: step.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {React.cloneElement(step.icon, { sx: { mr: 1 } })}
                    <Typography variant="h6">
                      Step {index + 1}: {step.title}
                    </Typography>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">
                      {step.description}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="large" 
                      fullWidth 
                      variant="contained" 
                      component={Link}
                      to={step.path}
                      sx={{ 
                        backgroundColor: step.color,
                        '&:hover': {
                          backgroundColor: step.color,
                          filter: 'brightness(90%)'
                        }
                      }}
                    >
                      {index === 0 ? 'Start Here' : 'Go to Step'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Recent Activities Section */}
          {dashboardData.recentActivities.length > 0 && (
            <>
              <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>
                Recent Activities
              </Typography>
              
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <List>
                  {dashboardData.recentActivities.map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={activity.description}
                          secondary={new Date(activity.timestamp).toLocaleString()}
                        />
                      </ListItem>
                      {index < dashboardData.recentActivities.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;