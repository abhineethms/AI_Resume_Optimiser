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
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Fade,
  Grow,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
} from '@mui/icons-material';
import { parseResume, reset } from '../redux/slices/resumeSlice';
import { clearCurrentMatch } from '../redux/slices/matchSlice';
import { clearKeywordInsights } from '../redux/slices/keywordSlice';
import ProcessStepper from '../components/ui/ProcessStepper';

const ResumeParserPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { currentResume, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.resume
  );

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Reset state on component unmount
  React.useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Clear current match when a resume is successfully parsed
  useEffect(() => {
    if (isSuccess && currentResume) {
      // Clear any existing match data when a new resume is uploaded
      dispatch(clearCurrentMatch());
      // Also clear any existing keyword insights when a new resume is uploaded
      dispatch(clearKeywordInsights());
      console.log('Current match and keyword insights cleared after new resume upload');
    }
  }, [isSuccess, currentResume, dispatch]);

  // Simulate upload progress when loading
  React.useEffect(() => {
    let progressInterval;
    
    if (isLoading) {
      setUploadProgress(0);
      progressInterval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          // Increase progress but cap at 90% until actual completion
          const newProgress = prevProgress + (Math.random() * 10);
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 500);
    } else if (isSuccess) {
      setUploadProgress(100);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isLoading, isSuccess]);

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
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      setFileError('Please upload a PDF or DOCX file');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!file) {
      setFileError('Please select a file to upload');
      return;
    }

    const resumeData = {
      file,
      token: user?.token,
    };

    dispatch(parseResume(resumeData));
  };

  const handleContinue = () => {
    navigate('/job-match');
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
            Analyzing Your Resume
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our AI is extracting key information from your resume including skills, 
            experience, and education details.
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
          <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary">
            Processing {file?.name}
          </Typography>
        </Box>
      </Fade>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Process Stepper */}
      <ProcessStepper activeStep={0} />
      
      <Typography variant="h4" component="h1" className="section-title" gutterBottom>
        Resume Parser
      </Typography>
      <Typography variant="body1" paragraph>
        Upload your resume to extract key information and prepare for job matching.
        Our AI will analyze your resume and extract skills, experience, and education details.
      </Typography>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {!isSuccess ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mt: 4, 
            borderRadius: 2,
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
          }}
        >
          {isLoading ? (
            <LoadingAnimation />
          ) : (
            <form onSubmit={handleSubmit}>
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
                onClick={() => document.getElementById('resume-upload').click()}
              >
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <UploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {file ? 'File selected' : 'Drag and drop your resume here'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {file ? file.name : 'or click to browse files'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supported formats: PDF, DOCX (Max 5MB)
                </Typography>
                
                {file && (
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={file.name}
                      onDelete={() => setFile(null)}
                      color="primary"
                    />
                  </Box>
                )}
                
                {fileError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {fileError}
                  </Alert>
                )}
              </Box>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!file || isLoading}
                  startIcon={<UploadIcon />}
                  sx={{ borderRadius: 8 }}
                >
                  Parse Resume
                </Button>
              </Box>
            </form>
          )}
        </Paper>
      ) : (
        <Box sx={{ mt: 4 }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            Resume parsed successfully!
          </Alert>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Name" secondary={currentResume?.name || 'N/A'} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary="Email" secondary={currentResume?.email || 'N/A'} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary="Phone" secondary={currentResume?.phone || 'N/A'} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary="Location" secondary={currentResume?.location || 'N/A'} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {currentResume?.skills?.map((skill, index) => (
                      <Chip key={index} label={skill} color="primary" variant="outlined" />
                    ))}
                    {(!currentResume?.skills || currentResume.skills.length === 0) && (
                      <Typography variant="body2" color="text.secondary">
                        No skills found
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
                    Languages
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {currentResume?.languages?.map((language, index) => (
                      <Chip 
                        key={index} 
                        label={language.name + (language.proficiency ? ` (${language.proficiency})` : '')} 
                        color="secondary" 
                        variant="outlined" 
                      />
                    ))}
                    {(!currentResume?.languages || currentResume.languages.length === 0) && (
                      <Typography variant="body2" color="text.secondary">
                        No languages found
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
                    Online Profiles
                  </Typography>
                  <List dense>
                    {currentResume?.urls?.map((url, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <Divider component="li" />}
                        <ListItem>
                          <ListItemText 
                            primary={url.urlType || 'Link'} 
                            secondary={
                              <a href={url.url} target="_blank" rel="noopener noreferrer">
                                {url.url}
                              </a>
                            } 
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                    {(!currentResume?.urls || currentResume.urls.length === 0) && (
                      <Typography variant="body2" color="text.secondary">
                        No online profiles found
                      </Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Experience
                  </Typography>
                  {currentResume?.experience?.map((exp, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {exp.title} at {exp.company}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {exp.description}
                      </Typography>
                      {index < currentResume.experience.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                  {(!currentResume?.experience || currentResume.experience.length === 0) && (
                    <Typography variant="body2" color="text.secondary">
                      No experience found
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Education
                  </Typography>
                  {currentResume?.education?.map((edu, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {edu.degree} in {edu.field}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {edu.institution}, {edu.startDate} - {edu.endDate || 'Present'}
                      </Typography>
                      {edu.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {edu.description}
                        </Typography>
                      )}
                      {index < currentResume.education.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                  {(!currentResume?.education || currentResume.education.length === 0) && (
                    <Typography variant="body2" color="text.secondary">
                      No education found
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Certifications
                  </Typography>
                  <List>
                    {currentResume?.certifications?.map((cert, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <Divider component="li" />}
                        <ListItem>
                          <ListItemText 
                            primary={cert.name} 
                            secondary={
                              <>
                                {cert.issuer && <span>Issuer: {cert.issuer}<br/></span>}
                                {cert.date && <span>Date: {cert.date}<br/></span>}
                                {cert.url && (
                                  <a href={cert.url} target="_blank" rel="noopener noreferrer">
                                    View Certificate
                                  </a>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                    {(!currentResume?.certifications || currentResume.certifications.length === 0) && (
                      <Typography variant="body2" color="text.secondary">
                        No certifications found
                      </Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Achievements
                  </Typography>
                  <List>
                    {currentResume?.achievements?.map((achievement, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <Divider component="li" />}
                        <ListItem>
                          <ListItemText 
                            primary={achievement.title} 
                            secondary={
                              <>
                                {achievement.date && <span>Date: {achievement.date}<br/></span>}
                                {achievement.description && <span>{achievement.description}</span>}
                              </>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                    {(!currentResume?.achievements || currentResume.achievements.length === 0) && (
                      <Typography variant="body2" color="text.secondary">
                        No achievements found
                      </Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Projects
                  </Typography>
                  {currentResume?.projects?.map((project, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {project.name}
                      </Typography>
                      {project.role && (
                        <Typography variant="body2" color="text.secondary">
                          Role: {project.role}
                        </Typography>
                      )}
                      {(project.startDate || project.endDate) && (
                        <Typography variant="body2" color="text.secondary">
                          {project.startDate || ''} {project.startDate && project.endDate ? '-' : ''} {project.endDate || ''}
                        </Typography>
                      )}
                      {project.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {project.description}
                        </Typography>
                      )}
                      {project.url && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <a href={project.url} target="_blank" rel="noopener noreferrer">
                            Project Link
                          </a>
                        </Typography>
                      )}
                      {index < currentResume.projects.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                  {(!currentResume?.projects || currentResume.projects.length === 0) && (
                    <Typography variant="body2" color="text.secondary">
                      No projects found
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Publications
                  </Typography>
                  {currentResume?.publications?.map((publication, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {publication.title}
                      </Typography>
                      {publication.publisher && (
                        <Typography variant="body2" color="text.secondary">
                          Publisher: {publication.publisher}
                        </Typography>
                      )}
                      {publication.date && (
                        <Typography variant="body2" color="text.secondary">
                          Date: {publication.date}
                        </Typography>
                      )}
                      {publication.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {publication.description}
                        </Typography>
                      )}
                      {publication.url && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <a href={publication.url} target="_blank" rel="noopener noreferrer">
                            View Publication
                          </a>
                        </Typography>
                      )}
                      {index < currentResume.publications.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                  {(!currentResume?.publications || currentResume.publications.length === 0) && (
                    <Typography variant="body2" color="text.secondary">
                      No publications found
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => dispatch(reset())}
              sx={{ 
                borderRadius: 8,
                px: 4,
                py: 1.5,
                borderWidth: 2,
                borderColor: 'primary.main',
                color: 'primary.main',
                fontWeight: 'medium',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: 'primary.dark',
                  backgroundColor: 'rgba(63, 81, 181, 0.04)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Parse Another Resume
            </Button>
            <Button
              variant="contained"
              onClick={handleContinue}
              sx={{ 
                borderRadius: 8,
                px: 4,
                py: 1.5,
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                background: 'linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Continue to Job Matching
            </Button>
          </Stack>
        </Box>
      )}
    </Container>
  );
};

export default ResumeParserPage;
