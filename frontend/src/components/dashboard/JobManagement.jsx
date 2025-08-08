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
  Paper,
  Divider,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Work as JobIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as SalaryIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axiosWithAuth from '../../utils/axiosWithAuth';

const JobCard = ({ job, onView, onEdit, onDelete, onShare, onMatch }) => {
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

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Avatar sx={{ bgcolor: 'secondary.light', width: 40, height: 40 }}>
              <JobIcon />
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h6" component="div" noWrap title={job.title}>
                {job.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Added {formatDate(job.createdAt)}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleMenuOpen} size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          {job.company && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <BusinessIcon fontSize="small" color="action" />
              <Typography variant="body2" fontWeight="medium">{job.company}</Typography>
            </Box>
          )}
          {job.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body2">{job.location}</Typography>
            </Box>
          )}
          {job.salaryRange && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <SalaryIcon fontSize="small" color="action" />
              <Typography variant="body2">{job.salaryRange}</Typography>
            </Box>
          )}
        </Box>

        {job.description && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Job Description
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {truncateText(job.description)}
            </Typography>
          </Box>
        )}

        {job.requirements && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Key Requirements
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {job.requirements.technical?.slice(0, 3).map((req, index) => (
                <Chip key={index} label={req} size="small" variant="outlined" color="primary" />
              ))}
              {job.requirements.soft?.slice(0, 2).map((req, index) => (
                <Chip key={index} label={req} size="small" variant="outlined" color="secondary" />
              ))}
              {((job.requirements.technical?.length || 0) + (job.requirements.soft?.length || 0)) > 5 && (
                <Chip 
                  label={`+${((job.requirements.technical?.length || 0) + (job.requirements.soft?.length || 0)) - 5} more`} 
                  size="small" 
                  variant="outlined" 
                />
              )}
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ViewIcon />}
            onClick={() => onView(job)}
            sx={{ flex: 1 }}
          >
            View
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => onMatch(job)}
            sx={{ flex: 1 }}
          >
            Match Resume
          </Button>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onView(job); handleMenuClose(); }}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => { onMatch(job); handleMenuClose(); }}>
          <JobIcon sx={{ mr: 1 }} />
          Match with Resume
        </MenuItem>
        <MenuItem onClick={() => { onEdit(job); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => { onShare(job); handleMenuClose(); }}>
          <ShareIcon sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { onDelete(job); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

const JobManagement = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosWithAuth.get('/api/job/all');
      setJobs(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setError('Failed to load job descriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (job) => {
    setSelectedJob(job);
    setViewDialogOpen(true);
  };

  const handleEdit = (job) => {
    navigate(`/job/edit/${job._id}`);
  };

  const handleDelete = (job) => {
    setSelectedJob(job);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedJob) return;
    
    try {
      setDeleteLoading(true);
      await axiosWithAuth.delete(`/api/job/${selectedJob._id}`);
      setJobs(jobs.filter(j => j._id !== selectedJob._id));
      setDeleteDialogOpen(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Failed to delete job:', error);
      setError('Failed to delete job description');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleMatch = (job) => {
    navigate('/job-match', { state: { selectedJob: job } });
  };

  const handleShare = (job) => {
    if (navigator.share) {
      navigator.share({
        title: `Job: ${job.title} at ${job.company}`,
        text: `Check out this job opportunity: ${job.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/job/view/${job._id}`);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Job Descriptions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage job descriptions and match them with your resumes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/job-match')}
          size="large"
        >
          Add Job Description
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search jobs by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {/* Implement filtering */}}
              >
                Filter
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Job Grid */}
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
      ) : filteredJobs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <JobIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {searchTerm ? 'No jobs found' : 'No job descriptions added yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Add job descriptions to start matching them with your resumes'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/job-match')}
            size="large"
          >
            Add Your First Job
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredJobs.map((job) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={job._id}>
              <JobCard
                job={job}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShare={handleShare}
                onMatch={handleMatch}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button */}
      <Fab
        color="secondary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/job-match')}
      >
        <AddIcon />
      </Fab>

      {/* View Job Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Job Details: {selectedJob?.title}
        </DialogTitle>
        <DialogContent>
          {selectedJob && (
            <Box>
              {/* Job Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Job Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Company</Typography>
                    <Typography variant="body1">{selectedJob.company || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Location</Typography>
                    <Typography variant="body1">{selectedJob.location || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Salary Range</Typography>
                    <Typography variant="body1">{selectedJob.salaryRange || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Added</Typography>
                    <Typography variant="body1">{new Date(selectedJob.createdAt).toLocaleDateString()}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Job Description */}
              {selectedJob.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Job Description
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedJob.description}
                  </Typography>
                </Box>
              )}

              {/* Requirements */}
              {selectedJob.requirements && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Requirements
                  </Typography>
                  {selectedJob.requirements.technical?.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Technical Requirements</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedJob.requirements.technical.map((req, index) => (
                          <Chip key={index} label={req} size="small" color="primary" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {selectedJob.requirements.soft?.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Soft Skills</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedJob.requirements.soft.map((req, index) => (
                          <Chip key={index} label={req} size="small" color="secondary" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {selectedJob.requirements.experience && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Experience</Typography>
                      <Typography variant="body2">{selectedJob.requirements.experience}</Typography>
                    </Box>
                  )}
                  {selectedJob.requirements.education && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Education</Typography>
                      <Typography variant="body2">{selectedJob.requirements.education}</Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Responsibilities */}
              {selectedJob.responsibilities?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Responsibilities
                  </Typography>
                  <List dense>
                    {selectedJob.responsibilities.map((responsibility, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText primary={`• ${responsibility}`} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Benefits */}
              {selectedJob.benefits?.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom color="primary">
                    Benefits
                  </Typography>
                  <List dense>
                    {selectedJob.benefits.map((benefit, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText primary={`• ${benefit}`} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => handleMatch(selectedJob)}
          >
            Match with Resume
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
            Are you sure you want to delete the job "{selectedJob?.title}" at {selectedJob?.company}? This action cannot be undone.
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

export default JobManagement;