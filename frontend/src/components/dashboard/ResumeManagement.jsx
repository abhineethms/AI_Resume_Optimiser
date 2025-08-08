import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Skeleton,
  Fab,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Description as ResumeIcon,
  CalendarToday as DateIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axiosWithAuth from '../../utils/axiosWithAuth';

const ResumeCard = ({ resume, onView, onEdit, onDelete, onDownload, onShare }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
              <ResumeIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div" noWrap>
                {resume.fileName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Uploaded {formatDate(resume.createdAt)}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleMenuOpen} size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>

        {resume.personalInfo && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Personal Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {resume.personalInfo.name && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2">{resume.personalInfo.name}</Typography>
                </Box>
              )}
              {resume.personalInfo.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" noWrap>{resume.personalInfo.email}</Typography>
                </Box>
              )}
              {resume.personalInfo.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2">{resume.personalInfo.phone}</Typography>
                </Box>
              )}
              {resume.personalInfo.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2">{resume.personalInfo.location}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {resume.skills && (resume.skills.technical?.length > 0 || resume.skills.soft?.length > 0) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Key Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {resume.skills.technical?.slice(0, 3).map((skill, index) => (
                <Chip key={index} label={skill} size="small" variant="outlined" color="primary" />
              ))}
              {resume.skills.soft?.slice(0, 2).map((skill, index) => (
                <Chip key={index} label={skill} size="small" variant="outlined" color="secondary" />
              ))}
              {(resume.skills.technical?.length > 3 || resume.skills.soft?.length > 2) && (
                <Chip label={`+${(resume.skills.technical?.length || 0) + (resume.skills.soft?.length || 0) - 5} more`} size="small" variant="outlined" />
              )}
            </Box>
          </Box>
        )}

        {resume.experience && resume.experience.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Latest Experience
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {resume.experience[0].position}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {resume.experience[0].company}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ViewIcon />}
            onClick={() => onView(resume)}
            sx={{ flex: 1 }}
          >
            View
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => onDownload(resume)}
            sx={{ flex: 1 }}
          >
            Download
          </Button>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onView(resume); handleMenuClose(); }}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => { onEdit(resume); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => { onDownload(resume); handleMenuClose(); }}>
          <DownloadIcon sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem onClick={() => { onShare(resume); handleMenuClose(); }}>
          <ShareIcon sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { onDelete(resume); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

const ResumeManagement = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResume, setSelectedResume] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosWithAuth.get('/api/resume/all');
      setResumes(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
      setError('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (resume) => {
    setSelectedResume(resume);
    setViewDialogOpen(true);
  };

  const handleEdit = (resume) => {
    // Navigate to edit page or open edit dialog
    navigate(`/resume/edit/${resume._id}`);
  };

  const handleDelete = (resume) => {
    setSelectedResume(resume);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedResume) return;
    
    try {
      setDeleteLoading(true);
      await axiosWithAuth.delete(`/api/resume/${selectedResume._id}`);
      setResumes(resumes.filter(r => r._id !== selectedResume._id));
      setDeleteDialogOpen(false);
      setSelectedResume(null);
    } catch (error) {
      console.error('Failed to delete resume:', error);
      setError('Failed to delete resume');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownload = async (resume) => {
    try {
      if (resume.fileUrl) {
        window.open(resume.fileUrl, '_blank');
      } else {
        const response = await axiosWithAuth.get(`/api/resume/${resume._id}/download`);
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to download resume:', error);
      setError('Failed to download resume');
    }
  };

  const handleShare = (resume) => {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: `Resume: ${resume.fileName}`,
        text: `Check out this resume: ${resume.personalInfo?.name || 'Unknown'}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/resume/view/${resume._id}`);
      // Show success message
    }
  };

  const filteredResumes = resumes.filter(resume =>
    resume.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.personalInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.personalInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Resume Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your uploaded resumes and view their details
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/resume')}
          size="large"
        >
          Upload New Resume
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search resumes by name, filename, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Resume Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={200} />
                  <Skeleton variant="text" height={40} sx={{ mt: 1 }} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredResumes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ResumeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {searchTerm ? 'No resumes found' : 'No resumes uploaded yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Upload your first resume to get started with AI-powered optimization'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/resume')}
            size="large"
          >
            Upload Your First Resume
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredResumes.map((resume) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={resume._id}>
              <ResumeCard
                resume={resume}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDownload={handleDownload}
                onShare={handleShare}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/resume')}
      >
        <AddIcon />
      </Fab>

      {/* View Resume Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Resume Details: {selectedResume?.fileName}
        </DialogTitle>
        <DialogContent>
          {selectedResume && (
            <Box>
              {/* Personal Information */}
              {selectedResume.personalInfo && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Personal Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1">{selectedResume.personalInfo.name || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{selectedResume.personalInfo.email || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{selectedResume.personalInfo.phone || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Location</Typography>
                      <Typography variant="body1">{selectedResume.personalInfo.location || 'Not provided'}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Skills */}
              {selectedResume.skills && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Skills
                  </Typography>
                  {selectedResume.skills.technical?.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Technical Skills</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedResume.skills.technical.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" color="primary" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {selectedResume.skills.soft?.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Soft Skills</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedResume.skills.soft.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" color="secondary" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Experience */}
              {selectedResume.experience?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Experience
                  </Typography>
                  {selectedResume.experience.map((exp, index) => (
                    <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < selectedResume.experience.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                      <Typography variant="subtitle1" fontWeight="bold">{exp.position}</Typography>
                      <Typography variant="body2" color="text.secondary">{exp.company} • {exp.duration}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>{exp.description}</Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Education */}
              {selectedResume.education?.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom color="primary">
                    Education
                  </Typography>
                  {selectedResume.education.map((edu, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">{edu.degree}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {edu.institution} • {edu.fieldOfStudy} • {edu.graduationYear}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => handleDownload(selectedResume)}
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedResume?.fileName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumeManagement;