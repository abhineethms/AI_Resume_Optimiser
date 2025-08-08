import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Avatar,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Tab,
  Tabs,
  Paper,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Shield as PrivacyIcon,
  Storage as StorageIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebaseConfig';
import { fetchUserDetails, logout } from '../../features/auth/authSlice';
import axiosWithAuth from '../../utils/axiosWithAuth';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [user] = useAuthState(auth);
  const { userDetails } = useSelector(state => state.auth);
  
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    location: '',
    company: '',
    position: '',
    bio: '',
    website: '',
    linkedin: '',
    github: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    analyticsTracking: true,
    dataSharing: false,
    marketingEmails: false
  });

  const [accountStats, setAccountStats] = useState({
    accountCreated: null,
    lastLogin: null,
    totalResumes: 0,
    totalJobs: 0,
    totalMatches: 0,
    storageUsed: 0,
    storageLimit: 1024 // MB
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        email: user.email || '',
        phone: userDetails?.phone || '',
        location: userDetails?.location || '',
        company: userDetails?.company || '',
        position: userDetails?.position || '',
        bio: userDetails?.bio || '',
        website: userDetails?.website || '',
        linkedin: userDetails?.linkedin || '',
        github: userDetails?.github || ''
      });
    }
    fetchAccountStats();
    fetchUserPreferences();
  }, [user, userDetails]);

  const fetchAccountStats = async () => {
    try {
      const response = await axiosWithAuth.get('/api/auth/account-stats');
      setAccountStats(response.data.data || accountStats);
    } catch (error) {
      console.error('Failed to fetch account stats:', error);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const response = await axiosWithAuth.get('/api/auth/preferences');
      setPreferences(response.data.data || preferences);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosWithAuth.put('/api/auth/profile', profileData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      dispatch(fetchUserDetails());
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await axiosWithAuth.put('/api/auth/preferences', preferences);
      setSuccess('Preferences updated successfully');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      setError('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await axiosWithAuth.delete('/api/auth/account');
      dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      setError('Failed to delete account');
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await axiosWithAuth.get('/api/auth/export-data');
      const blob = new Blob([JSON.stringify(response.data.data, null, 2)], { 
        type: 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-resume-optimizer-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export data:', error);
      setError('Failed to export data');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Profile & Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account information, preferences, and privacy settings
        </Typography>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<EditIcon />} label="Profile" />
          <Tab icon={<NotificationsIcon />} label="Preferences" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<AnalyticsIcon />} label="Account" />
        </Tabs>
      </Box>

      {/* Profile Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Profile Picture Section */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  src={user?.photoURL || ''}
                  alt={user?.displayName || 'User'}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  {profileData.displayName || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {profileData.email}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => {/* Implement photo upload */}}
                >
                  Change Photo
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Personal Information
                  </Typography>
                  {!isEditing ? (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={() => {
                          setIsEditing(false);
                          setProfileData({
                            displayName: user?.displayName || '',
                            email: user?.email || '',
                            phone: userDetails?.phone || '',
                            location: userDetails?.location || '',
                            company: userDetails?.company || '',
                            position: userDetails?.position || '',
                            bio: userDetails?.bio || '',
                            website: userDetails?.website || '',
                            linkedin: userDetails?.linkedin || '',
                            github: userDetails?.github || ''
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Display Name"
                      value={profileData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <EditIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profileData.email}
                      disabled
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      value={profileData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Position"
                      value={profileData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      multiline
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={profileData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://example.com"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="LinkedIn"
                      value={profileData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      disabled={!isEditing}
                      placeholder="linkedin.com/in/username"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="GitHub"
                      value={profileData.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      disabled={!isEditing}
                      placeholder="github.com/username"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Preferences Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notifications
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Receive updates about your matches and analysis"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.emailNotifications}
                        onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Marketing Emails"
                      secondary="Receive tips and product updates"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.marketingEmails}
                        onChange={(e) => handlePreferenceChange('marketingEmails', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Privacy & Data
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <AnalyticsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Analytics Tracking"
                      secondary="Help improve our service with usage analytics"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.analyticsTracking}
                        onChange={(e) => handlePreferenceChange('analyticsTracking', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PrivacyIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Data Sharing"
                      secondary="Allow anonymous data sharing for research"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.dataSharing}
                        onChange={(e) => handlePreferenceChange('dataSharing', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={handleSavePreferences}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
              >
                Save Preferences
              </Button>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Security
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Your account is secured with Firebase Authentication. Use your provider's security settings to manage your password and two-factor authentication.
                </Typography>
                <Button
                  variant="outlined"
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Manage Google Account Security
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Data Export
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Download all your data including resumes, job descriptions, and analysis results.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportData}
                >
                  Export My Data
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ border: '1px solid', borderColor: 'error.main' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  Danger Zone
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Once you delete your account, there is no going back. Please be certain.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Account Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          {/* Account Overview */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Overview
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Account Created"
                      secondary={accountStats.accountCreated ? 
                        new Date(accountStats.accountCreated).toLocaleDateString() : 
                        'Unknown'
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Last Login"
                      secondary={accountStats.lastLogin ? 
                        new Date(accountStats.lastLogin).toLocaleDateString() : 
                        'Recently'
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="User ID"
                      secondary={user?.uid || 'Unknown'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Usage Statistics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Usage Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {accountStats.totalResumes}
                      </Typography>
                      <Typography variant="caption">Resumes</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="secondary">
                        {accountStats.totalJobs}
                      </Typography>
                      <Typography variant="caption">Jobs</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {accountStats.totalMatches}
                      </Typography>
                      <Typography variant="caption">Matches</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Storage Usage */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Storage Usage
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StorageIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {accountStats.storageUsed} MB used of {accountStats.storageLimit} MB
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(accountStats.storageUsed / accountStats.storageLimit) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {Math.round(((accountStats.storageLimit - accountStats.storageUsed) / accountStats.storageLimit) * 100)}% remaining
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle color="error">Delete Account</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Are you absolutely sure you want to delete your account? This action cannot be undone and will:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Delete all your resumes and job descriptions" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Remove all match analyses and cover letters" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Permanently delete your profile and preferences" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Cancel any active subscriptions" />
            </ListItem>
          </List>
          <Typography color="error" fontWeight="bold">
            This action is permanent and cannot be reversed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {loading ? 'Deleting...' : 'Delete My Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;