import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Snackbar,
  Grow,
  Fade,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  generateCoverLetter,
  setCurrentMatch
} from '../redux/slices/matchSlice';
import { setCurrentResume } from '../redux/slices/resumeSlice';
import { setCurrentJob } from '../redux/slices/jobSlice';
import ProcessStepper from '../components/ui/ProcessStepper';

const CoverLetterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentResume } = useSelector((state) => state.resume);
  const { currentJob } = useSelector((state) => state.job);
  const { 
    currentMatch, 
    coverLetter, 
    isLoading, 
    isError, 
    message 
  } = useSelector((state) => state.match);

  const [editMode, setEditMode] = useState(false);
  const [editedCoverLetter, setEditedCoverLetter] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Simulate progress for loading animation
  useEffect(() => {
    let timer;
    if (isLoading && generationProgress < 95) {
      timer = setInterval(() => {
        setGenerationProgress(prevProgress => {
          // Slow down as we approach 95%
          const increment = prevProgress < 60 ? 2 : prevProgress < 80 ? 1 : 0.5;
          return Math.min(prevProgress + increment, 95);
        });
      }, 300);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading, generationProgress]);

  // Reset progress when loading completes
  useEffect(() => {
    if (!isLoading) {
      setGenerationProgress(0);
    }
  }, [isLoading]);

  // Ensure we have the necessary data
  useEffect(() => {
    let hasData = true;
    
    // Check if we have resume data, if not try to get from localStorage
    if (!currentResume) {
      const storedResume = localStorage.getItem('currentResume');
      if (storedResume) {
        try {
          const parsedResume = JSON.parse(storedResume);
          console.log('Retrieved resume from localStorage:', parsedResume);
          // Dispatch action to set the resume in Redux state
          dispatch(setCurrentResume(parsedResume));
        } catch (error) {
          console.error('Error parsing resume from localStorage:', error);
          hasData = false;
        }
      } else {
        hasData = false;
        navigate('/resume');
        return;
      }
    }
    
    // Check if we have job data, if not try to get from localStorage
    if (!currentJob) {
      const storedJob = localStorage.getItem('currentJob');
      if (storedJob) {
        try {
          const parsedJob = JSON.parse(storedJob);
          console.log('Retrieved job from localStorage:', parsedJob);
          // Dispatch action to set the job in Redux state
          dispatch(setCurrentJob(parsedJob));
        } catch (error) {
          console.error('Error parsing job from localStorage:', error);
          hasData = false;
        }
      } else {
        hasData = false;
        navigate('/job-match');
        return;
      }
    }
    
    // Check if we have match data, if not try to get from localStorage
    if (!currentMatch) {
      const storedMatch = localStorage.getItem('currentMatch');
      if (storedMatch) {
        try {
          const parsedMatch = JSON.parse(storedMatch);
          console.log('Retrieved match from localStorage:', parsedMatch);
          // Dispatch action to set the match in Redux state
          dispatch(setCurrentMatch(parsedMatch));
        } catch (error) {
          console.error('Error parsing match from localStorage:', error);
          hasData = false;
        }
      } else {
        hasData = false;
        navigate('/match-results');
        return;
      }
    }
    
    // If we have match data but no cover letter, generate one
    if (hasData && currentMatch && !coverLetter && !isLoading) {
      const resumeId = currentResume?._id || currentResume?.resumeId;
      const jobId = currentJob?._id || currentJob?.jobId || currentJob?.id;
      const matchId = currentMatch?._id || currentMatch?.matchId;
      
      console.log('Generating cover letter with IDs:', { resumeId, jobId, matchId });
      
      if (resumeId && jobId && matchId) {
        dispatch(generateCoverLetter({ 
          resumeId, 
          jobId,
          matchId
        }));
      } else {
        console.error('Missing required IDs for cover letter generation:', { resumeId, jobId, matchId });
      }
    }
    
    // Initialize edited cover letter when we get a new one
    if (coverLetter && !editedCoverLetter) {
      setEditedCoverLetter(coverLetter);
    }
  }, [currentResume, currentJob, currentMatch, coverLetter, isLoading, dispatch, navigate, editedCoverLetter]);

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(editMode ? editedCoverLetter : coverLetter);
    setCopySuccess(true);
  };

  // Handle download as .txt file
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([editMode ? editedCoverLetter : coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${currentJob.company}_${currentJob.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle regenerating the cover letter
  const handleRegenerate = () => {
    const resumeId = currentResume?._id || currentResume?.resumeId;
    const jobId = currentJob?._id || currentJob?.jobId || currentJob?.id;
    const matchId = currentMatch?._id || currentMatch?.matchId;
    
    console.log('Regenerating cover letter with IDs:', { resumeId, jobId, matchId });
    
    if (resumeId && jobId && matchId) {
      dispatch(generateCoverLetter({ 
        resumeId, 
        jobId,
        matchId
      }));
      setEditMode(false);
    } else {
      console.error('Missing required IDs for cover letter regeneration:', { resumeId, jobId, matchId });
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      // Exiting edit mode, save changes
      setEditMode(false);
    } else {
      // Entering edit mode
      setEditMode(true);
    }
  };

  // Handle cover letter text changes
  const handleCoverLetterChange = (e) => {
    setEditedCoverLetter(e.target.value);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setCopySuccess(false);
  };

  // Loading animation component
  const LoadingAnimation = () => (
    <Container maxWidth="lg" className="page-container">
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mt: 4, 
            borderRadius: 2,
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
          }}
        >
          <Box sx={{ 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            py: 6
          }}>
            <Box sx={{ position: 'relative', mb: 4 }}>
              <CircularProgress 
                variant="determinate" 
                value={generationProgress} 
                size={120} 
                thickness={4} 
                sx={{ 
                  color: (theme) => theme.palette.primary.light,
                }} 
              />
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Typography variant="h4" component="div" color="primary">
                  {Math.round(generationProgress)}%
                </Typography>
              </Box>
            </Box>
            
            <Grow in={true} timeout={1000}>
              <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
                <Typography variant="h6" gutterBottom>
                  Crafting Your Cover Letter
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our AI is analyzing your resume and the job description to create a personalized cover letter 
                  that highlights your relevant skills and experiences.
                </Typography>
              </Box>
            </Grow>
            
            <Box sx={{ width: '100%', mt: 4, display: 'flex', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((dot) => (
                <Fade 
                  key={dot}
                  in={true} 
                  style={{ 
                    transitionDelay: `${dot * 150}ms`,
                    animationIterationCount: 'infinite',
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      mx: 0.5,
                      bgcolor: 'primary.main',
                      borderRadius: '50%',
                      animation: 'bounce 1.4s infinite ease-in-out both',
                      animationDelay: `${dot * 0.16}s`,
                      '@keyframes bounce': {
                        '0%, 80%, 100%': {
                          transform: 'scale(0)',
                        },
                        '40%': {
                          transform: 'scale(1)',
                        },
                      },
                    }}
                  />
                </Fade>
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError) {
    return (
      <Container maxWidth="lg" className="page-container">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {message || 'Failed to generate cover letter. Please try again.'}
          </Alert>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleRegenerate}
            startIcon={<RefreshIcon />}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="page-container">
      {/* Page Header */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Tailored Cover Letter
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize this AI-generated cover letter to highlight your qualifications for {currentJob?.title} at {currentJob?.company}.
        </Typography>
      </Box>

      {/* Process Stepper */}
      <Box sx={{ mb: 4 }}>
        <ProcessStepper activeStep={2} />
      </Box>

      {/* Cover Letter Actions */}
      <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography variant="body1" fontWeight="medium">
              Cover Letter Actions:
            </Typography>
          </Grid>
          <Grid item>
            <Tooltip title={editMode ? "Save Changes" : "Edit Cover Letter"}>
              <IconButton onClick={toggleEditMode} color={editMode ? "success" : "primary"}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title="Copy to Clipboard">
              <IconButton onClick={handleCopy} color="primary">
                <CopyIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title="Download as Text File">
              <IconButton onClick={handleDownload} color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title="Regenerate Cover Letter">
              <IconButton onClick={handleRegenerate} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item xs />
          <Grid item>
            <Grow in={true} timeout={800}>
              <Typography variant="body2" color="text.secondary">
                Matched to: <strong>{currentJob?.title}</strong> at <strong>{currentJob?.company}</strong>
              </Typography>
            </Grow>
          </Grid>
        </Grid>
      </Paper>

      {/* Cover Letter Content */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Grow in={true} timeout={500}>
          <Typography variant="h6" gutterBottom>
            Cover Letter
          </Typography>
        </Grow>
        <Divider sx={{ mb: 3 }} />
        
        {editMode ? (
          <TextField
            fullWidth
            multiline
            variant="outlined"
            value={editedCoverLetter}
            onChange={handleCoverLetterChange}
            minRows={15}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                fontSize: '1rem',
                lineHeight: 1.8,
              }
            }}
          />
        ) : (
          <Fade in={true} timeout={800}>
            <Box 
              sx={{ 
                whiteSpace: 'pre-wrap', 
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                fontSize: '1rem',
                lineHeight: 1.8,
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                minHeight: '400px',
                bgcolor: '#fafafa'
              }}
            >
              {editedCoverLetter || coverLetter}
            </Box>
          </Fade>
        )}
      </Paper>

      {/* Tips and Recommendations */}
      <Fade in={true} timeout={1000}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Cover Letter Tips
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Grow in={true} timeout={1200}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Personalization
                    </Typography>
                    <Typography variant="body2">
                      Consider adding more personal touches to make the cover letter uniquely yours. 
                      Mention specific achievements that align with the job requirements.
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grow in={true} timeout={1400}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Addressing Gaps
                    </Typography>
                    <Typography variant="body2">
                      If there are skill gaps identified in your match results, consider addressing how 
                      you're working to develop those skills or how your existing skills can compensate.
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grow in={true} timeout={1600}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Company Research
                    </Typography>
                    <Typography variant="body2">
                      Enhance your cover letter by researching the company's values, culture, and recent 
                      achievements. Reference these to show your genuine interest in the organization.
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grow in={true} timeout={1800}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Proofreading
                    </Typography>
                    <Typography variant="body2">
                      Always proofread your cover letter for grammar and spelling errors. Consider having 
                      someone else review it as well for feedback on tone and content.
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Next Steps */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Fade in={true} timeout={2000}>
          <div>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate('/feedback')}
              sx={{ mr: 2 }}
            >
              Get Resume Feedback
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </Fade>
      </Box>

      {/* Copy Success Notification */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Cover letter copied to clipboard!"
      />
    </Container>
  );
};

export default CoverLetterPage;
