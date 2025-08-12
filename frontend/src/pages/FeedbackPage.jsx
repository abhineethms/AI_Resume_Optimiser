import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Lightbulb as TipIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { getResumeFeedback } from '../redux/slices/matchSlice';

const FeedbackPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentResume } = useSelector((state) => state.resume);
  const { currentJob } = useSelector((state) => state.job);
  const { 
    currentMatch, 
    feedback, 
    isLoading, 
    isError, 
    message 
  } = useSelector((state) => state.match);

  // Ensure we have the necessary data
  useEffect(() => {
    if (!currentResume) {
      navigate('/resume');
      return;
    }
    
    if (!currentJob) {
      navigate('/job-match');
      return;
    }
    
    if (!currentMatch) {
      navigate('/match-results');
      return;
    }
    
    // If we have match data but no feedback, request it
    if (currentMatch && !feedback && !isLoading) {
      dispatch(getResumeFeedback({ 
        resumeId: currentResume._id, 
        jobId: currentJob._id,
        matchId: currentMatch._id
      }));
    }
  }, [currentResume, currentJob, currentMatch, feedback, isLoading, dispatch, navigate]);

  // Handle regenerating feedback
  const handleRegenerateFeedback = () => {
    dispatch(getResumeFeedback({ 
      resumeId: currentResume._id, 
      jobId: currentJob._id,
      matchId: currentMatch._id
    }));
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" className="page-container">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h5" sx={{ mt: 3 }}>
            Analyzing your resume for improvement opportunities...
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Our AI is identifying ways to enhance your resume for this specific job.
          </Typography>
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg" className="page-container">
        <Alert severity="error" sx={{ mb: 3 }}>
          {message || 'An error occurred while generating resume feedback.'}
        </Alert>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            onClick={handleRegenerateFeedback}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  if (!feedback) {
    return (
      <Container maxWidth="lg" className="page-container">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h5" sx={{ mt: 3 }}>
            Preparing your feedback...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="page-container">
      <Typography variant="h4" component="h1" className="section-title" gutterBottom>
        Resume Improvement Feedback
      </Typography>
      <Typography variant="body1" paragraph>
        Based on your match with {currentJob.title} at {currentJob.company}, here are personalized suggestions to improve your resume.
      </Typography>

      {/* Overall Feedback Summary */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Summary
        </Typography>
        <Typography variant="body1" paragraph>
          {feedback.summary}
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined" sx={{ height: '100%', bgcolor: 'success.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'success.dark' }}>
                    Strengths
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'success.dark' }}>
                    {feedback.strengthsCount} key strengths identified
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined" sx={{ height: '100%', bgcolor: 'warning.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'warning.dark' }}>
                    Improvement Areas
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'warning.dark' }}>
                    {feedback.improvementsCount} areas to enhance
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined" sx={{ height: '100%', bgcolor: 'info.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'info.dark' }}>
                    Suggestions
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'info.dark' }}>
                    {feedback.suggestionsCount} actionable recommendations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Strengths Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CheckIcon color="success" sx={{ mr: 1 }} />
          <Typography variant="h5">
            Resume Strengths
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <List>
          {feedback.strengths.map((strength, index) => (
            <ListItem key={index} alignItems="flex-start" sx={{ mb: 2, bgcolor: 'success.light', borderRadius: 1, py: 1 }}>
              <ListItemIcon>
                <StarIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary={strength.title}
                secondary={strength.description}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Improvement Areas Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} />
          <Typography variant="h5">
            Areas for Improvement
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <List>
          {feedback.improvementAreas.map((area, index) => (
            <Accordion key={index} sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ bgcolor: 'warning.light' }}
              >
                <Typography fontWeight="bold">{area.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {area.description}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Why this matters:
                </Typography>
                <Typography variant="body2" paragraph>
                  {area.impact}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    icon={<TipIcon />} 
                    label="Suggestion" 
                    color="primary" 
                    size="small" 
                    sx={{ mr: 1 }} 
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {area.suggestion}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </List>
      </Paper>

      {/* Specific Recommendations Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TipIcon color="info" sx={{ mr: 1 }} />
          <Typography variant="h5">
            Actionable Recommendations
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {feedback.recommendations.map((recommendation, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {recommendation.title}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {recommendation.description}
                  </Typography>
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Example:
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      {recommendation.example}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Keywords to Include Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Keywords to Include
        </Typography>
        <Typography variant="body1" paragraph>
          Consider incorporating these keywords in your resume to improve ATS matching and relevance:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {feedback.keywordsToInclude.map((keyword, index) => (
            <Chip 
              key={index} 
              label={keyword} 
              color="primary" 
              variant="outlined" 
            />
          ))}
        </Box>
      </Paper>

      {/* Next Steps */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => navigate('/resume')}
          startIcon={<EditIcon />}
          sx={{ mr: 2 }}
        >
          Update Resume
        </Button>
        <Button 
          variant="outlined" 
          color="primary" 
          size="large"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default FeedbackPage;
