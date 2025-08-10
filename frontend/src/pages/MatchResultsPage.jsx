import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Grow,
} from '@mui/material';
import {
  Check as MatchIcon,
  Close as MissingIcon,
  TrendingUp as StrengthIcon,
  TrendingDown as WeaknessIcon,
  CompareArrows as CompareIcon,
} from '@mui/icons-material';
import { compareResumeJob } from '../redux/slices/matchSlice';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ProcessStepper from '../components/ui/ProcessStepper';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const MatchResultsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentResume } = useSelector((state) => state.resume);
  const { currentJob } = useSelector((state) => state.job);
  const { currentMatch, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.match
  );
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Ensure we have both resume and job data
  useEffect(() => {
    if (!currentResume) {
      navigate('/resume');
      return;
    }
    
    if (!currentJob) {
      navigate('/job-match');
      return;
    }
    
    // If we have resume and job but no match, trigger the comparison
    if (currentResume && currentJob && !currentMatch && !isLoading) {
      // Use the correct property names for IDs
      const resumeId = currentResume.resumeId || currentResume._id;
      const jobId = currentJob.jobId || currentJob._id || currentJob.id;
      
      console.log('Resume and Job IDs:', { resumeId, jobId });
      console.log('Current Job Object:', currentJob);
      
      if (resumeId && jobId) {
        dispatch(compareResumeJob({ resumeId, jobId }));
      } else {
        console.error('Missing required IDs for comparison:', { resumeId, jobId });
      }
    }
  }, [currentResume, currentJob, currentMatch, isLoading, dispatch, navigate]);

  // Debug: Log currentMatch data when it changes
  useEffect(() => {
    if (currentMatch) {
      console.log('Current Match Data:', currentMatch);
      console.log('Strengths:', currentMatch.strengths);
      console.log('Improvement Areas:', currentMatch.improvementAreas);
    }
  }, [currentMatch]);

  // Simulate analysis progress when loading
  useEffect(() => {
    let timer;
    if (isLoading) {
      setAnalysisProgress(0);
      timer = setInterval(() => {
        setAnalysisProgress((prevProgress) => {
          const newProgress = prevProgress + Math.random() * 8;
          return newProgress >= 100 ? 99 : newProgress;
        });
      }, 600);
    } else if (isSuccess) {
      setAnalysisProgress(100);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading, isSuccess]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // We don't reset here because we want to keep the match data for the cover letter page
    };
  }, []);

  // Prepare chart data
  const getMatchScoreChartData = () => {
    if (!currentMatch) return null;
    
    return {
      labels: ['Match', 'Gap'],
      datasets: [
        {
          data: [currentMatch.overallScore, 100 - currentMatch.overallScore],
          backgroundColor: ['#4caf50', '#f5f5f5'],
          borderColor: ['#388e3c', '#e0e0e0'],
          borderWidth: 1,
          cutout: '70%',
        },
      ],
    };
  };

  const handleContinueToCoverLetter = () => {
    // Save current state to localStorage before navigating
    if (currentMatch) {
      localStorage.setItem('currentMatch', JSON.stringify(currentMatch));
    }
    navigate('/cover-letter');
  };

  const handleContinueToKeywordInsights = () => {
    // Create properly structured objects to store in localStorage
    if (currentMatch) {
      // Store the match data
      localStorage.setItem('currentMatch', JSON.stringify(currentMatch));
      
      // Get the resumeId and jobId from the redux state or from the earlier comparison
      const resumeId = currentResume?.resumeId || currentResume?._id;
      const jobId = currentJob?.jobId || currentJob?._id || currentJob?.id;
      
      console.log('Using IDs for keyword insights:', { 
        resumeId,
        jobId
      });
      
      // Create resume and job objects with consistent _id format
      if (resumeId) {
        const resumeData = {
          ...currentResume,
          _id: resumeId
        };
        localStorage.setItem('currentResume', JSON.stringify(resumeData));
        console.log('Saved resume to localStorage with ID:', resumeId);
      } else {
        console.error('No resumeId found for the current resume');
        return; // Don't navigate if we don't have valid resumeId
      }
      
      if (jobId) {
        const jobData = {
          ...currentJob,
          _id: jobId
        };
        localStorage.setItem('currentJob', JSON.stringify(jobData));
        console.log('Saved job to localStorage with ID:', jobId);
      } else {
        console.error('No jobId found for the current job');
        return; // Don't navigate if we don't have valid jobId
      }
    } else {
      console.error('Cannot navigate to keyword insights - no match data available');
      return; // Don't navigate if we don't have the required data
    }
    
    navigate('/keyword-insights');
  };

  // Loading animation component
  const LoadingAnimation = () => (
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
            value={analysisProgress} 
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
              {Math.round(analysisProgress)}%
            </Typography>
          </Box>
        </Box>
        
        <Grow in={true} timeout={1000}>
          <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
            <Typography variant="h6" gutterBottom>
              Analyzing Resume-Job Match
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Our AI is comparing your resume with the job description to identify matching skills, 
              experience gaps, and provide personalized recommendations.
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
        
        <Grid container spacing={2} sx={{ mt: 6, maxWidth: 600 }}>
          <Grid item xs={12}>
            <Fade in={analysisProgress > 20} timeout={800}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CompareIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Comparing skills and qualifications...
                </Typography>
              </Box>
            </Fade>
          </Grid>
          <Grid item xs={12}>
            <Fade in={analysisProgress > 40} timeout={800}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StrengthIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Identifying your strengths...
                </Typography>
              </Box>
            </Fade>
          </Grid>
          <Grid item xs={12}>
            <Fade in={analysisProgress > 60} timeout={800}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WeaknessIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Finding improvement areas...
                </Typography>
              </Box>
            </Fade>
          </Grid>
          <Grid item xs={12}>
            <Fade in={analysisProgress > 80} timeout={800}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MatchIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Calculating overall match score...
                </Typography>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );

  if (isLoading || (!currentMatch && !isError)) {
    return (
      <Container maxWidth="lg" className="page-container">
        <ProcessStepper activeStep={2} />
        <Typography variant="h4" component="h1" className="section-title" gutterBottom>
          Match Results
        </Typography>
        <Typography variant="body1" paragraph>
          We're analyzing how your resume matches with the job requirements.
        </Typography>
        <LoadingAnimation />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg" className="page-container">
        <Alert severity="error" sx={{ mb: 3 }}>
          {message || 'An error occurred while comparing your resume with the job description.'}
        </Alert>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            onClick={() => dispatch(compareResumeJob({ 
              resumeId: currentResume._id, 
              jobId: currentJob._id 
            }))}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  if (!currentMatch) {
    return (
      <Container maxWidth="lg" className="page-container">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h5" sx={{ mt: 3 }}>
            Preparing match results...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="page-container">
      <ProcessStepper activeStep={2} />
      <Typography variant="h4" component="h1" className="section-title" gutterBottom>
        Match Results
      </Typography>
      <Typography variant="body1" paragraph>
        See how your resume matches with the job requirements and where you can improve.
      </Typography>

      {/* Overall Match Score */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'relative', width: '100%', maxWidth: 200, mx: 'auto' }}>
              <Doughnut data={getMatchScoreChartData()} options={{ plugins: { legend: { display: false } } }} />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {currentMatch.overallScore}%
                </Typography>
                <Typography variant="body2">Match Score</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              {currentMatch.overallScore >= 80
                ? 'Excellent Match!'
                : currentMatch.overallScore >= 60
                ? 'Good Match'
                : 'Needs Improvement'}
            </Typography>
            <Typography variant="body1" paragraph>
              {currentMatch.summary}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Match Breakdown:
              </Typography>
              {currentMatch.categoryScores.map((category, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{category.category}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {category.score}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={category.score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: category.score >= 80 ? '#4caf50' : category.score >= 60 ? '#ff9800' : '#f44336',
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Skills Category Analysis */}
      <Paper elevation={3} sx={{ p: 4, my: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Skills Category Analysis
        </Typography>
        <Box sx={{ mt: 3 }}>
          {currentMatch && currentMatch.categoryScores && currentMatch.categoryScores.map((category, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body1">{category.category}</Typography>
                <Typography variant="body1" fontWeight="medium">{category.score}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={category.score} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  bgcolor: 'rgba(0, 0, 0, 0.08)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'primary.main',
                  }
                }} 
              />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Skills Comparison */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Skills Match
              </Typography>
              <List dense>
                {currentMatch.matchedSkills.map((skill, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <MatchIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={skill} 
                      secondary={
                        currentJob.requiredSkills.includes(skill) 
                          ? 'Required Skill' 
                          : 'Preferred Skill'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Missing Skills
              </Typography>
              <List dense>
                {currentMatch.missingSkills.map((skill, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <MissingIcon color="error" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={skill} 
                      secondary={
                        currentJob.requiredSkills.includes(skill) 
                          ? 'Required Skill' 
                          : 'Preferred Skill'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Strengths and Improvement Areas */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <StrengthIcon color="success" sx={{ mr: 1 }} />
                Your Strengths
              </Typography>
              <List>
                {currentMatch.strengths.map((strength, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={strength} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <WeaknessIcon color="error" sx={{ mr: 1 }} />
                Areas to Improve
              </Typography>
              {currentMatch.improvementAreas && currentMatch.improvementAreas.length > 0 ? (
                <List>
                  {currentMatch.improvementAreas.map((area, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={area} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No specific improvement areas were identified. Your resume appears to match well with this job's requirements.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Next Steps */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Next Steps
        </Typography>
        <Typography variant="body1" paragraph>
          Based on your match results, we recommend the following next steps:
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analyze Keyword Relevance
                </Typography>
                <Typography variant="body2" paragraph>
                  Get detailed insights on how well your resume's keywords align with the job requirements and identify areas for improvement.
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={handleContinueToKeywordInsights}
                  sx={{ mt: 1 }}
                >
                  View Keyword Insights
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Generate a Tailored Cover Letter
                </Typography>
                <Typography variant="body2" paragraph>
                  Create a personalized cover letter that highlights your matching skills and addresses potential gaps.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleContinueToCoverLetter}
                  sx={{ mt: 1 }}
                >
                  Create Cover Letter
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default MatchResultsPage;
