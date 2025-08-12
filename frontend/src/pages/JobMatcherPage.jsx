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
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  TextField,
  Tabs,
  Tab,
  Fade,
  Grow,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Check as CheckIcon,
  Description as FileIcon,
  TextFields as TextIcon,
} from '@mui/icons-material';
import { parseJobFile, parseJobText, reset } from '../redux/slices/jobSlice';
import ProcessStepper from '../components/ui/ProcessStepper';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`job-tabpanel-${index}`}
      aria-labelledby={`job-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const JobMatcherPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // const { user } = useSelector((state) => state.auth); // May be needed for future features
  const { currentResume } = useSelector((state) => state.resume);
  const { currentJob, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.job
  );

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [jobText, setJobText] = useState('');
  const [textError, setTextError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Reset state on component unmount
  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Simulate upload progress when loading
  useEffect(() => {
    let timer;
    if (isLoading) {
      setUploadProgress(0);
      timer = setInterval(() => {
        setUploadProgress((prevProgress) => {
          const newProgress = prevProgress + Math.random() * 10;
          return newProgress >= 100 ? 99 : newProgress;
        });
      }, 500);
    } else if (isSuccess) {
      setUploadProgress(100);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading, isSuccess]);

  // Check if resume exists, if not redirect to resume page
  useEffect(() => {
    if (!currentResume) {
      navigate('/resume');
    }
  }, [currentResume, navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    setFileError('');
    
    if (!selectedFile) {
      return;
    }

    // Check file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(selectedFile.type)) {
      setFileError('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    // Check file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileError('File size should be less than 5MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleTextChange = (e) => {
    setJobText(e.target.value);
    if (e.target.value.trim().length > 0) {
      setTextError('');
    }
  };

  const handleFileSubmit = (e) => {
    e.preventDefault();
    
    if (!file) {
      setFileError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('jobDescription', file);

    dispatch(parseJobFile(formData));
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    
    if (!jobText.trim()) {
      setTextError('Please enter a job description');
      return;
    }

    dispatch(parseJobText(jobText));
  };

  const handleContinue = () => {
    navigate('/match-results');
  };

  // Loading animation component
  const LoadingAnimation = () => (
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
          value={uploadProgress} 
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
            {Math.round(uploadProgress)}%
          </Typography>
        </Box>
      </Box>
      
      <Grow in={isLoading} timeout={1000}>
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Analyzing Job Description
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our AI is extracting key information from your job description including required skills, 
            qualifications, and responsibilities.
          </Typography>
        </Box>
      </Grow>
      
      <Box sx={{ width: '100%', mt: 4, display: 'flex', justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map((dot) => (
          <Fade 
            key={dot}
            in={isLoading} 
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
      
      <Fade in={isLoading && uploadProgress > 30} timeout={1000}>
        <Box sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
          {file ? (
            <>
              <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">
                Processing {file.name}
              </Typography>
            </>
          ) : (
            <>
              <TextIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">
                Processing job description text
              </Typography>
            </>
          )}
        </Box>
      </Fade>
    </Box>
  );

  return (
    <Container maxWidth="lg" className="page-container">
      <Typography variant="h4" component="h1" className="section-title" gutterBottom>
        Job Description Parser
      </Typography>
      <Typography variant="body1" paragraph>
        Upload or paste a job description to match with your resume.
        Our AI will analyze the job requirements and compare them with your skills and experience.
      </Typography>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <ProcessStepper activeStep={1} />

      {isLoading ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mt: 4, 
            borderRadius: 2,
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
          }}
        >
          <LoadingAnimation />
        </Paper>
      ) : !isSuccess ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mt: 4, 
            borderRadius: 2,
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="job description input tabs">
              <Tab icon={<FileIcon />} label="Upload File" id="job-tab-0" aria-controls="job-tabpanel-0" />
              <Tab icon={<TextIcon />} label="Paste Text" id="job-tab-1" aria-controls="job-tabpanel-1" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleFileSubmit}>
              <Box
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                sx={{
                  border: '2px dashed',
                  borderColor: dragActive ? 'primary.main' : 'grey.400',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: dragActive ? 'rgba(63, 81, 181, 0.08)' : 'transparent',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <input
                  type="file"
                  id="job-file-upload"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt"
                  style={{ display: 'none' }}
                />
                <label htmlFor="job-file-upload" style={{ cursor: 'pointer', width: '100%', height: '100%' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <UploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Drag & Drop or Click to Upload
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supports PDF, DOCX, and TXT files (Max 5MB)
                    </Typography>
                    {file && (
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <CheckIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </label>
              </Box>
              
              {fileError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {fileError}
                </Alert>
              )}
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!file || isLoading}
                  startIcon={isLoading ? <CircularProgress size={24} /> : null}
                  sx={{ borderRadius: 8, minWidth: 200 }}
                >
                  {isLoading ? 'Processing...' : 'Parse Job Description'}
                </Button>
              </Box>
            </form>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleTextSubmit}>
              <TextField
                fullWidth
                multiline
                rows={10}
                variant="outlined"
                placeholder="Paste job description text here..."
                value={jobText}
                onChange={handleTextChange}
                error={!!textError}
                helperText={textError}
                sx={{ mb: 3 }}
              />
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!jobText.trim() || isLoading}
                  startIcon={isLoading ? <CircularProgress size={24} /> : null}
                  sx={{ borderRadius: 8, minWidth: 200 }}
                >
                  {isLoading ? 'Processing...' : 'Parse Job Description'}
                </Button>
              </Box>
            </form>
          </TabPanel>
        </Paper>
      ) : (
        <Box sx={{ mt: 4 }}>
          <Alert severity="success" sx={{ mb: 4 }}>
            Job description successfully parsed!
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {currentJob?.title || 'Job Title'}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {currentJob?.company || 'Company'} • {currentJob?.location || 'Location'}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Job Description
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {currentJob?.description || 'No description available'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Required Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {currentJob?.requiredSkills?.map((skill, index) => (
                      <Chip key={index} label={skill} color="primary" />
                    ))}
                    {(!currentJob?.requiredSkills || currentJob.requiredSkills.length === 0) && (
                      <Typography variant="body2" color="text.secondary">
                        No required skills found
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Preferred Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {currentJob?.preferredSkills?.map((skill, index) => (
                      <Chip key={index} label={skill} color="secondary" variant="outlined" />
                    ))}
                    {(!currentJob?.preferredSkills || currentJob.preferredSkills.length === 0) && (
                      <Typography variant="body2" color="text.secondary">
                        No preferred skills found
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Job Description
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {currentJob?.description || 'No detailed description available'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => dispatch(reset())}
              sx={{ borderRadius: 8 }}
            >
              Parse Another Job
            </Button>
            <Button
              variant="contained"
              onClick={handleContinue}
              sx={{ borderRadius: 8 }}
            >
              Continue to Match Results
            </Button>
          </Stack>
        </Box>
      )}
    </Container>
  );
};

export default JobMatcherPage;
