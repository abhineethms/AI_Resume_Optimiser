import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Description as ResumeIcon,
  Work as JobIcon,
  Email as CoverLetterIcon,
  Feedback as FeedbackIcon,
} from '@mui/icons-material';

const featureCards = [
  {
    title: 'Resume Parser',
    description: 'Upload your resume and our AI will extract key information to optimize your job applications.',
    icon: <ResumeIcon sx={{ fontSize: 60 }} />,
    link: '/resume',
    color: '#3f51b5',
  },
  {
    title: 'Job Matcher',
    description: 'Match your resume with job descriptions to see how well you fit and what skills you need to highlight.',
    icon: <JobIcon sx={{ fontSize: 60 }} />,
    link: '/job-match',
    color: '#f50057',
  },
  {
    title: 'Cover Letter Generator',
    description: 'Generate tailored cover letters that highlight your relevant skills and experience for each job.',
    icon: <CoverLetterIcon sx={{ fontSize: 60 }} />,
    link: '/cover-letter',
    color: '#00bcd4',
  },
  {
    title: 'Resume Feedback',
    description: 'Get AI-powered feedback on how to improve your resume for better job application success.',
    icon: <FeedbackIcon sx={{ fontSize: 60 }} />,
    link: '/feedback',
    color: '#4caf50',
  },
];

const HomePage = () => {
  const theme = useTheme();

  return (
    <Box className="page-container" sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Paper
          sx={{
            position: 'relative',
            backgroundColor: 'grey.800',
            color: '#fff',
            mb: 0,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: 'url(https://source.unsplash.com/random?office,professional)',
            borderRadius: 0,
            overflow: 'hidden',
            width: '100%',
            minHeight: '600px',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              left: 0,
              backgroundColor: 'rgba(0,0,0,.7)',
              backgroundImage: 'linear-gradient(to right, rgba(25,25,112,0.8), rgba(0,0,0,0.6))',
            }}
          />
          <Container maxWidth="xl">
            <Grid container spacing={4} sx={{ position: 'relative', py: { xs: 6, md: 10 } }}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    position: 'relative',
                    p: { xs: 3, md: 0 },
                    pr: { md: 0 },
                    mt: { xs: 2, md: 4 },
                  }}
                >
                  <Typography 
                    component="h1" 
                    variant="h2" 
                    color="inherit" 
                    gutterBottom 
                    className="slide-up"
                    sx={{ fontWeight: 'bold', mb: 2 }}
                  >
                    AI-Powered Resume Optimization
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color="inherit" 
                    paragraph 
                    className="slide-up" 
                    sx={{ 
                      animation: 'slideUp 0.5s ease-out 0.2s both',
                      mb: 4,
                      maxWidth: '90%'
                    }}
                  >
                    Land your dream job with our AI tools that optimize your resume, match job descriptions, and generate tailored cover letters.
                  </Typography>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    className="slide-up"
                    sx={{ animation: 'slideUp 0.5s ease-out 0.4s both', mb: 6 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      component={RouterLink}
                      to="/resume"
                      sx={{ 
                        borderRadius: 8, 
                        py: 1.5, 
                        px: 4,
                        fontSize: '1.1rem',
                        backgroundColor: theme.palette.secondary.main,
                        '&:hover': {
                          backgroundColor: theme.palette.secondary.dark,
                        }
                      }}
                    >
                      Get Started Now
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      color="inherit"
                      component={RouterLink}
                      to="/register"
                      sx={{ 
                        borderRadius: 8, 
                        py: 1.5, 
                        px: 4,
                        fontSize: '1.1rem',
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                        }
                      }}
                    >
                      Sign Up Free
                    </Button>
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Grid container spacing={2} className="feature-highlights" sx={{ animation: 'fadeIn 0.8s ease-out 0.6s both' }}>
                    {[
                      {
                        icon: <ResumeIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
                        title: 'ATS-Friendly Format',
                        description: 'Optimize your resume to pass Applicant Tracking Systems'
                      },
                      {
                        icon: <JobIcon sx={{ fontSize: 40, color: '#f50057' }} />,
                        title: 'Smart Keyword Matching',
                        description: 'Match your skills with job descriptions for higher relevance'
                      },
                      {
                        icon: <CoverLetterIcon sx={{ fontSize: 40, color: '#00bcd4' }} />,
                        title: 'Custom Cover Letters',
                        description: 'Generate tailored cover letters in seconds'
                      },
                      {
                        icon: <FeedbackIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
                        title: 'Actionable Feedback',
                        description: 'Get expert suggestions to improve your application'
                      }
                    ].map((feature, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Paper
                          elevation={4}
                          sx={{
                            p: 2.5,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            color: 'text.primary',
                            transition: 'transform 0.3s',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                            },
                            borderLeft: `4px solid ${index === 0 ? theme.palette.secondary.main : 
                                         index === 1 ? '#f50057' : 
                                         index === 2 ? '#00bcd4' : '#4caf50'}`,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {feature.icon}
                            <Typography variant="h6" component="h3" sx={{ ml: 1, fontWeight: 'bold' }}>
                              {feature.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            {feature.description}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Paper>
        
        {/* Stats Banner */}
        <Paper
          elevation={4}
          sx={{
            position: 'relative',
            zIndex: 2,
            mx: { xs: 2, md: 8, lg: 15 },
            mt: -4,
            mb: 6,
            py: 3,
            px: 4,
            borderRadius: 2,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}
        >
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            {[
              { value: 'AI-Powered', label: 'Resume Analysis' },
              { value: 'Industry-Specific', label: 'Recommendations' },
              { value: 'Instant', label: 'Feedback' },
              { value: 'Free', label: 'Basic Features' }
            ].map((stat, index) => (
              <Grid item xs={6} sm={3} key={index} sx={{ textAlign: 'center' }}>
                <Typography variant="h5" component="p" sx={{ fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2">{stat.label}</Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
      
      {/* Features Section */}
      <Box sx={{ 
        py: 8, 
        width: '100%',
        background: 'linear-gradient(180deg, #ffffff 0%, rgba(240, 242, 245, 0.8) 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
          transform: 'translateY(-100%)',
        }
      }}>
        <Container maxWidth="xl">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
            className="section-title"
            sx={{ 
              mb: 2,
              fontWeight: 'bold',
              position: 'relative',
              '&::after': {
                content: '""',
                display: 'block',
                width: '80px',
                height: '4px',
                backgroundColor: theme.palette.secondary.main,
                margin: '16px auto 0',
                borderRadius: '2px',
              }
            }}
          >
            Our Features
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            color="text.secondary" 
            sx={{ mb: 6, maxWidth: '800px', mx: 'auto', px: { xs: 2, sm: 0 } }}
          >
            Powerful tools to optimize your job application process
          </Typography>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {featureCards.map((card, index) => (
              <Grid item key={card.title} xs={12} sm={6} md={6} lg={3} className="fade-in" sx={{ animation: `fadeIn 0.5s ease-in ${index * 0.2}s both` }}>
                <Card
                  component={RouterLink}
                  to={card.link}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease-in-out',
                    textDecoration: 'none',
                    color: 'inherit',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                    },
                    cursor: 'pointer',
                  }}
                >
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
                      p: 3,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'white',
                    }}
                  >
                    {card.icon}
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 'bold' }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.description}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        borderRadius: 8,
                        borderColor: card.color,
                        color: card.color,
                        '&:hover': {
                          borderColor: card.color,
                          backgroundColor: `${card.color}10`,
                        }
                      }}
                    >
                      Try Now
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ 
        position: 'relative',
        py: 8, 
        width: '100%',
        backgroundImage: 'linear-gradient(to right, rgba(25,25,112,0.03), rgba(0,0,0,0.02))',
        backgroundSize: 'cover',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '8px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }
      }}>
        <Container maxWidth="xl">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
            className="section-title"
            sx={{ 
              mb: 2,
              fontWeight: 'bold',
              position: 'relative',
              '&::after': {
                content: '""',
                display: 'block',
                width: '80px',
                height: '4px',
                backgroundColor: theme.palette.primary.main,
                margin: '16px auto 0',
                borderRadius: '2px',
              }
            }}
          >
            How It Works
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            color="text.secondary" 
            sx={{ mb: 6, maxWidth: '800px', mx: 'auto', px: { xs: 2, sm: 0 } }}
          >
            Three simple steps to optimize your resume and land your dream job
          </Typography>
          <Grid container spacing={{ xs: 3, sm: 4, md: 5 }} justifyContent="center">
            {/* Step 1 */}
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%', 
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <Box sx={{
                  height: '8px',
                  width: '100%',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                }} />
                <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                  <Box 
                    sx={{ 
                      bgcolor: theme.palette.primary.main, 
                      color: 'white', 
                      width: { xs: 60, sm: 70 }, 
                      height: { xs: 60, sm: 70 }, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      margin: '0 auto 24px',
                      fontSize: { xs: '24px', sm: '28px' },
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    1
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Upload Your Resume
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Upload your resume in PDF, DOCX, or TXT format. Our advanced AI parser will extract key information including:
                  </Typography>
                  <Box sx={{ textAlign: 'left', pl: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Contact information</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Work experience</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Education history</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Skills and certifications</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Step 2 */}
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%', 
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <Box sx={{
                  height: '8px',
                  width: '100%',
                  background: `linear-gradient(90deg, #ff9800, #ffc107)`,
                }} />
                <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                  <Box 
                    sx={{ 
                      bgcolor: '#ff9800', 
                      color: 'white', 
                      width: { xs: 60, sm: 70 }, 
                      height: { xs: 60, sm: 70 }, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      margin: '0 auto 24px',
                      fontSize: { xs: '24px', sm: '28px' },
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    2
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Add Job Description
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Paste a job description or upload a job posting PDF. Our system will analyze:
                  </Typography>
                  <Box sx={{ textAlign: 'left', pl: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Required skills</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Key responsibilities</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Preferred qualifications</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Company values and culture</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Step 3 */}
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%', 
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <Box sx={{
                  height: '8px',
                  width: '100%',
                  background: `linear-gradient(90deg, #9c27b0, #ba68c8)`,
                }} />
                <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                  <Box 
                    sx={{ 
                      bgcolor: '#9c27b0', 
                      color: 'white', 
                      width: { xs: 60, sm: 70 }, 
                      height: { xs: 60, sm: 70 }, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      margin: '0 auto 24px',
                      fontSize: { xs: '24px', sm: '28px' },
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    3
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Get Matches & Analysis
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Our AI analyzes your resume against the job requirements and provides:
                  </Typography>
                  <Box sx={{ textAlign: 'left', pl: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Skill match percentage</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Missing keywords and skills</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Experience alignment</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• ATS optimization suggestions</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Step 4 */}
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%', 
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <Box sx={{
                  height: '8px',
                  width: '100%',
                  background: `linear-gradient(90deg, #4caf50, #8bc34a)`,
                }} />
                <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                  <Box 
                    sx={{ 
                      bgcolor: '#4caf50', 
                      color: 'white', 
                      width: { xs: 60, sm: 70 }, 
                      height: { xs: 60, sm: 70 }, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      margin: '0 auto 24px',
                      fontSize: { xs: '24px', sm: '28px' },
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    4
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Optimize & Apply
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Use our tools to perfect your application:
                  </Typography>
                  <Box sx={{ textAlign: 'left', pl: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Tailored cover letter generation</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Resume improvement suggestions</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Interview preparation tips</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Follow-up email templates</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Additional Information */}
          <Box sx={{ mt: 8, bgcolor: 'rgba(0,0,0,0.04)', p: 4, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
              Why Our AI Resume Optimizer Works
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    ATS-Friendly Format
                  </Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  Our system ensures your resume passes through Applicant Tracking Systems by optimizing format, keywords, and content structure that hiring software looks for.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Industry-Specific Analysis
                  </Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  We've trained our AI on thousands of successful resumes across different industries to provide tailored recommendations specific to your field and career level.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Continuous Learning
                  </Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  Our AI continuously improves by analyzing successful job applications and staying updated with the latest hiring trends and recruiter preferences.
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button 
                variant="contained" 
                size="large" 
                component={RouterLink} 
                to="/resume" 
                sx={{ borderRadius: 8, px: 4 }}
              >
                Start Optimizing Your Resume
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, width: '100%' }}>
        <Container maxWidth="lg">
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 4,
              bgcolor: theme.palette.primary.main,
              color: 'white',
            }}
          >
            <Typography variant="h4" gutterBottom>
              Ready to Optimize Your Job Search?
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 4 }}>
              Join thousands of job seekers who have improved their resumes and landed their dream jobs.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={RouterLink}
                to="/resume"
                sx={{ borderRadius: 8 }}
              >
                Get Started Now
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                component={RouterLink}
                to="/register"
                sx={{ borderRadius: 8 }}
              >
                Create Account
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
