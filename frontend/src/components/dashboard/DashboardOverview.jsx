import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Chip,
  IconButton
} from '@mui/material';
import {
  Description as ResumeIcon,
  Work as JobIcon,
  Compare as MatchIcon,
  Email as CoverLetterIcon,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axiosWithAuth from '../../utils/axiosWithAuth';

const StatCard = ({ title, value, icon, color, subtitle, onClick, action }) => (
  <Card 
    sx={{ 
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': onClick ? { 
        transform: 'translateY(-4px)',
        boxShadow: 4
      } : {}
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box 
          sx={{ 
            p: 1, 
            borderRadius: 2, 
            bgcolor: `${color}.light`,
            color: `${color}.main`,
            mr: 2
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        {action && (
          <IconButton onClick={(e) => {
            e.stopPropagation();
            action();
          }}>
            <AddIcon />
          </IconButton>
        )}
      </Box>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [dashboardData, setDashboardData] = useState({
    stats: {
      resumesUploaded: 0,
      jobsAnalyzed: 0,
      matchesCreated: 0,
      coverLettersGenerated: 0
    },
    recentActivities: [],
    recentDocuments: {
      resumes: [],
      jobs: [],
      matches: []
    },
    usageInsights: {
      totalProcessingTime: 0,
      averageMatchScore: 0,
      topSkills: [],
      improvementAreas: []
    },
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      const [statsRes, activitiesRes, documentsRes] = await Promise.all([
        axiosWithAuth.get('/api/dashboard/stats'),
        axiosWithAuth.get('/api/dashboard/activities'),
        axiosWithAuth.get('/api/dashboard/recent-documents')
      ]);

      setDashboardData(prev => ({
        ...prev,
        stats: statsRes.data.data || prev.stats,
        recentActivities: activitiesRes.data.data || [],
        recentDocuments: documentsRes.data.data || prev.recentDocuments,
        loading: false
      }));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
    }
  };

  const quickActions = [
    {
      title: 'Upload Resume',
      description: 'Parse a new resume document',
      icon: <ResumeIcon />,
      color: 'primary',
      action: () => navigate('/resume')
    },
    {
      title: 'Add Job Description',
      description: 'Process a new job posting',
      icon: <JobIcon />,
      color: 'secondary',
      action: () => navigate('/job-match')
    },
    {
      title: 'Create Match',
      description: 'Compare resume with job',
      icon: <MatchIcon />,
      color: 'success',
      action: () => navigate('/match-results')
    },
    {
      title: 'Generate Cover Letter',
      description: 'Create tailored cover letter',
      icon: <CoverLetterIcon />,
      color: 'info',
      action: () => navigate('/cover-letter')
    }
  ];

  if (dashboardData.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.displayName || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your resume optimization overview and recent activity.
        </Typography>
      </Box>

      {dashboardData.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {dashboardData.error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resumes Processed"
            value={dashboardData.stats.resumesUploaded}
            icon={<ResumeIcon />}
            color="primary"
            subtitle="Total documents analyzed"
            onClick={() => navigate('/dashboard/resumes')}
            action={() => navigate('/resume')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Jobs Analyzed"
            value={dashboardData.stats.jobsAnalyzed}
            icon={<JobIcon />}
            color="secondary"
            subtitle="Job descriptions processed"
            onClick={() => navigate('/dashboard/jobs')}
            action={() => navigate('/job-match')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Matches Created"
            value={dashboardData.stats.matchesCreated}
            icon={<MatchIcon />}
            color="success"
            subtitle="Resume-job comparisons"
            onClick={() => navigate('/dashboard/matches')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Cover Letters"
            value={dashboardData.stats.coverLettersGenerated}
            icon={<CoverLetterIcon />}
            color="info"
            subtitle="Generated documents"
            onClick={() => navigate('/dashboard/matches')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={action.action}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            bgcolor: `${action.color}.light`,
                            color: `${action.color}.main`,
                            mr: 2
                          }}
                        >
                          {action.icon}
                        </Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {action.title}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {action.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TimeIcon sx={{ mr: 1 }} />
                Recent Activity
              </Typography>
              {dashboardData.recentActivities.length > 0 ? (
                <List dense>
                  {dashboardData.recentActivities.slice(0, 5).map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {activity.type === 'resume' && <ResumeIcon color="primary" />}
                          {activity.type === 'job' && <JobIcon color="secondary" />}
                          {activity.type === 'match' && <MatchIcon color="success" />}
                          {activity.type === 'cover_letter' && <CoverLetterIcon color="info" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.description}
                          secondary={new Date(activity.timestamp).toLocaleDateString()}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      {index < Math.min(dashboardData.recentActivities.length - 1, 4) && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent activity yet
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/resume')}
                  >
                    Get Started
                  </Button>
                </Box>
              )}
              
              {dashboardData.recentActivities.length > 5 && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/dashboard/history')}
                  >
                    View All History
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress and Insights */}
      {dashboardData.stats.resumesUploaded > 0 && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <AnalyticsIcon sx={{ mr: 1 }} />
                  Usage Insights
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Processing Efficiency
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((dashboardData.stats.matchesCreated / Math.max(dashboardData.stats.resumesUploaded, 1)) * 100, 100)}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round((dashboardData.stats.matchesCreated / Math.max(dashboardData.stats.resumesUploaded, 1)) * 100)}% of resumes matched with jobs
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Cover Letter Generation
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((dashboardData.stats.coverLettersGenerated / Math.max(dashboardData.stats.matchesCreated, 1)) * 100, 100)}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round((dashboardData.stats.coverLettersGenerated / Math.max(dashboardData.stats.matchesCreated, 1)) * 100)}% of matches have cover letters
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Overall Progress
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`${dashboardData.stats.resumesUploaded} Resume${dashboardData.stats.resumesUploaded !== 1 ? 's' : ''}`}
                        size="small" 
                        color="primary" 
                      />
                      <Chip 
                        label={`${dashboardData.stats.jobsAnalyzed} Job${dashboardData.stats.jobsAnalyzed !== 1 ? 's' : ''}`}
                        size="small" 
                        color="secondary" 
                      />
                      <Chip 
                        label={`${dashboardData.stats.matchesCreated} Match${dashboardData.stats.matchesCreated !== 1 ? 'es' : ''}`}
                        size="small" 
                        color="success" 
                      />
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/dashboard/analytics')}
                  >
                    View Detailed Analytics
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DashboardOverview;