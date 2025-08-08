import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  Alert,
  Skeleton,
  Paper,
  Divider,
  CircularProgress,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
  Rating
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Compare as MatchIcon,
  TrendingUp as TrendingUpIcon,
  Email as CoverLetterIcon,
  Description as ResumeIcon,
  Work as JobIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Search as SearchIcon
} from '@mui/icons-material';
// import { useSelector } from 'react-redux';
import axiosWithAuth from '../../utils/axiosWithAuth';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`match-tabpanel-${index}`}
      aria-labelledby={`match-tab-${index}`}
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

const MatchCard = ({ match, onView, onDelete, onDownloadCoverLetter, onShare }) => {
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircleIcon color="success" />;
    if (score >= 60) return <WarningIcon color="warning" />;
    return <CancelIcon color="error" />;
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
            <Avatar sx={{ bgcolor: 'success.light', width: 40, height: 40 }}>
              <MatchIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div" noWrap>
                Match Analysis
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(match.createdAt)}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleMenuOpen} size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Match Score */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" color="primary">
              Overall Match Score
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getScoreIcon(match.overallScore)}
              <Typography variant="h6" fontWeight="bold">
                {match.overallScore}%
              </Typography>
            </Box>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={match.overallScore} 
            color={getScoreColor(match.overallScore)}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Resume and Job Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Documents Matched
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ResumeIcon fontSize="small" color="action" />
            <Typography variant="body2" noWrap>
              {match.resumeId?.fileName || 'Resume'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <JobIcon fontSize="small" color="action" />
            <Typography variant="body2" noWrap>
              {match.jobId?.title || 'Job Position'} - {match.jobId?.company || 'Company'}
            </Typography>
          </Box>
        </Box>

        {/* Detailed Scores */}
        {match.analysis && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Detailed Analysis
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Skills</Typography>
                  <Typography variant="h6" color={getScoreColor(match.analysis.skillsMatch)}>
                    {match.analysis.skillsMatch}%
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Experience</Typography>
                  <Typography variant="h6" color={getScoreColor(match.analysis.experienceMatch)}>
                    {match.analysis.experienceMatch}%
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Technical</Typography>
                  <Typography variant="h6" color={getScoreColor(match.analysis.technicalMatch)}>
                    {match.analysis.technicalMatch}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Key Insights */}
        {match.analysis && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Key Insights
            </Typography>
            {match.analysis.strengths?.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="success.main" fontWeight="bold">
                  ✓ Strengths ({match.analysis.strengths.length})
                </Typography>
              </Box>
            )}
            {match.analysis.gaps?.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="error.main" fontWeight="bold">
                  ⚠ Gaps ({match.analysis.gaps.length})
                </Typography>
              </Box>
            )}
            {match.analysis.suggestions?.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="info.main" fontWeight="bold">
                  💡 Suggestions ({match.analysis.suggestions.length})
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Cover Letter Status */}
        {match.coverLetter && (
          <Box sx={{ mb: 2 }}>
            <Chip 
              icon={<CoverLetterIcon />}
              label="Cover Letter Generated" 
              size="small" 
              color="info" 
              variant="outlined"
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ViewIcon />}
            onClick={() => onView(match)}
            sx={{ flex: 1 }}
          >
            View Details
          </Button>
          {match.coverLetter && (
            <Button
              size="small"
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => onDownloadCoverLetter(match)}
              sx={{ flex: 1 }}
            >
              Cover Letter
            </Button>
          )}
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onView(match); handleMenuClose(); }}>
          <ViewIcon sx={{ mr: 1 }} />
          View Analysis
        </MenuItem>
        {match.coverLetter && (
          <MenuItem onClick={() => { onDownloadCoverLetter(match); handleMenuClose(); }}>
            <CoverLetterIcon sx={{ mr: 1 }} />
            Download Cover Letter
          </MenuItem>
        )}
        <MenuItem onClick={() => { onShare(match); handleMenuClose(); }}>
          <ShareIcon sx={{ mr: 1 }} />
          Share Results
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { onDelete(match); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

const MatchHistory = () => {
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterScore, setFilterScore] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalMatches: 0,
    averageScore: 0,
    topPerformingResume: null,
    improvementTrends: []
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await axiosWithAuth.get('/api/match/analytics');
      setAnalytics(response.data.data || analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  }, [analytics]);

  const fetchMatchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosWithAuth.get('/api/match/all');
      setMatches(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch match history:', error);
      setError('Failed to load match history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchHistory();
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleView = (match) => {
    setSelectedMatch(match);
    setViewDialogOpen(true);
  };

  const handleDelete = (match) => {
    setSelectedMatch(match);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMatch) return;
    
    try {
      setDeleteLoading(true);
      await axiosWithAuth.delete(`/api/match/${selectedMatch._id}`);
      setMatches(matches.filter(m => m._id !== selectedMatch._id));
      setDeleteDialogOpen(false);
      setSelectedMatch(null);
    } catch (error) {
      console.error('Failed to delete match:', error);
      setError('Failed to delete match');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownloadCoverLetter = async (match) => {
    try {
      const response = await axiosWithAuth.get(`/api/match/${match._id}/cover-letter`);
      const blob = new Blob([response.data.coverLetter], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cover-letter-${match.jobId?.title || 'job'}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download cover letter:', error);
      setError('Failed to download cover letter');
    }
  };

  const handleShare = (match) => {
    if (navigator.share) {
      navigator.share({
        title: `Resume Match Analysis - ${match.overallScore}%`,
        text: `Check out my resume match analysis with ${match.jobId?.company}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/match/view/${match._id}`);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredMatches = matches.filter(match => {
    const matchesSearch = 
      match.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.jobId?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.resumeId?.fileName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesScore = filterScore === 'all' || 
      (filterScore === 'high' && match.overallScore >= 80) ||
      (filterScore === 'medium' && match.overallScore >= 60 && match.overallScore < 80) ||
      (filterScore === 'low' && match.overallScore < 60);
    
    return matchesSearch && matchesScore;
  });

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.overallScore - a.overallScore;
      case 'date':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Matches & Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View your resume-job matching history and analysis results
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<MatchIcon />}
          onClick={() => navigate('/job-match')}
          size="large"
        >
          Create New Match
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Match History" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Match History Tab */}
      <TabPanel value={tabValue} index={0}>
        {/* Search and Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by job title, company, or resume..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="date">Date (Newest)</MenuItem>
                  <MenuItem value="score">Match Score (Highest)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter Score</InputLabel>
                <Select
                  value={filterScore}
                  label="Filter Score"
                  onChange={(e) => setFilterScore(e.target.value)}
                >
                  <MenuItem value="all">All Scores</MenuItem>
                  <MenuItem value="high">High (80%+)</MenuItem>
                  <MenuItem value="medium">Medium (60-79%)</MenuItem>
                  <MenuItem value="low">Low (&lt;60%)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Match Grid */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Card>
                  <CardContent>
                    <Skeleton variant="rectangular" height={250} />
                    <Skeleton variant="text" height={40} sx={{ mt: 1 }} />
                    <Skeleton variant="text" height={20} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : sortedMatches.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <MatchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {searchTerm || filterScore !== 'all' ? 'No matches found' : 'No matches created yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || filterScore !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Start by matching your resume with job descriptions to see analysis results'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<MatchIcon />}
              onClick={() => navigate('/job-match')}
              size="large"
            >
              Create Your First Match
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {sortedMatches.map((match) => (
              <Grid item xs={12} sm={6} md={4} key={match._id}>
                <MatchCard
                  match={match}
                  onView={handleView}
                  onDelete={handleDelete}
                  onDownloadCoverLetter={handleDownloadCoverLetter}
                  onShare={handleShare}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {analytics.totalMatches}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Matches
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {Math.round(analytics.averageScore)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Score
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {matches.filter(m => m.coverLetter).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cover Letters
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {matches.filter(m => m.overallScore >= 80).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  High Matches (80%+)
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Insights */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Insights
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Analyze your matching performance and identify areas for improvement.
                </Typography>
                
                {matches.length > 0 ? (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Score Distribution
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="success.main">
                            {Math.round((matches.filter(m => m.overallScore >= 80).length / matches.length) * 100)}%
                          </Typography>
                          <Typography variant="caption">High Matches</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="warning.main">
                            {Math.round((matches.filter(m => m.overallScore >= 60 && m.overallScore < 80).length / matches.length) * 100)}%
                          </Typography>
                          <Typography variant="caption">Medium Matches</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="error.main">
                            {Math.round((matches.filter(m => m.overallScore < 60).length / matches.length) * 100)}%
                          </Typography>
                          <Typography variant="caption">Low Matches</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No data available yet. Create some matches to see insights.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* View Match Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Match Analysis Details
        </DialogTitle>
        <DialogContent>
          {selectedMatch && (
            <Box>
              {/* Match Overview */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Resume</Typography>
                    <Typography variant="body1">{selectedMatch.resumeId?.fileName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Job Position</Typography>
                    <Typography variant="body1">
                      {selectedMatch.jobId?.title} at {selectedMatch.jobId?.company}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Overall Score</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={selectedMatch.overallScore / 20} readOnly precision={0.1} />
                      <Typography variant="h6">{selectedMatch.overallScore}%</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Analysis Date</Typography>
                    <Typography variant="body1">
                      {new Date(selectedMatch.createdAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Detailed Scores */}
              {selectedMatch.analysis && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Detailed Analysis
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="h4" color="primary">
                          {selectedMatch.analysis.skillsMatch}%
                        </Typography>
                        <Typography variant="subtitle2">Skills Match</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="h4" color="secondary">
                          {selectedMatch.analysis.experienceMatch}%
                        </Typography>
                        <Typography variant="subtitle2">Experience Match</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="h4" color="success.main">
                          {selectedMatch.analysis.technicalMatch}%
                        </Typography>
                        <Typography variant="subtitle2">Technical Match</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Strengths, Gaps, and Suggestions */}
              {selectedMatch.analysis && (
                <Grid container spacing={3}>
                  {selectedMatch.analysis.strengths?.length > 0 && (
                    <Grid item xs={12} md={4}>
                      <Typography variant="h6" gutterBottom color="success.main">
                        Strengths
                      </Typography>
                      <List dense>
                        {selectedMatch.analysis.strengths.map((strength, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <CheckCircleIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={strength} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  )}
                  
                  {selectedMatch.analysis.gaps?.length > 0 && (
                    <Grid item xs={12} md={4}>
                      <Typography variant="h6" gutterBottom color="error.main">
                        Areas to Improve
                      </Typography>
                      <List dense>
                        {selectedMatch.analysis.gaps.map((gap, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <WarningIcon color="error" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={gap} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  )}
                  
                  {selectedMatch.analysis.suggestions?.length > 0 && (
                    <Grid item xs={12} md={4}>
                      <Typography variant="h6" gutterBottom color="info.main">
                        Suggestions
                      </Typography>
                      <List dense>
                        {selectedMatch.analysis.suggestions.map((suggestion, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <TrendingUpIcon color="info" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={suggestion} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedMatch?.coverLetter && (
            <Button 
              variant="contained" 
              onClick={() => handleDownloadCoverLetter(selectedMatch)}
              startIcon={<DownloadIcon />}
            >
              Download Cover Letter
            </Button>
          )}
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
            Are you sure you want to delete this match analysis? This action cannot be undone.
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

export default MatchHistory;