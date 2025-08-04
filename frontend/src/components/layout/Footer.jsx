import React from 'react';
import { Box, Container, Typography, Link, Grid, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'light' 
          ? theme.palette.grey[200] 
          : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              AI Resume Optimizer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Optimize your resume with AI technology to match job descriptions, generate cover letters, and receive feedback.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Features
            </Typography>
            <Link component={RouterLink} to="/resume" color="text.secondary" display="block">
              Resume Parser
            </Link>
            <Link component={RouterLink} to="/job-match" color="text.secondary" display="block">
              Job Matcher
            </Link>
            <Link component={RouterLink} to="/cover-letter" color="text.secondary" display="block">
              Cover Letter Generator
            </Link>
            <Link component={RouterLink} to="/feedback" color="text.secondary" display="block">
              Resume Feedback
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Account
            </Typography>
            <Link component={RouterLink} to="/login" color="text.secondary" display="block">
              Login
            </Link>
            <Link component={RouterLink} to="/register" color="text.secondary" display="block">
              Register
            </Link>
            <Link component={RouterLink} to="/dashboard" color="text.secondary" display="block">
              Dashboard
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Link component={RouterLink} to="/privacy" color="text.secondary" display="block">
              Privacy Policy
            </Link>
            <Link component={RouterLink} to="/terms" color="text.secondary" display="block">
              Terms of Service
            </Link>
          </Grid>
        </Grid>
        
        <Box mt={3}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link color="inherit" component={RouterLink} to="/">
              AI Resume Optimizer
            </Link>{' '}
            {currentYear}
            {'.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
