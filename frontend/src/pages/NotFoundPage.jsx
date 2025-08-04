import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Paper,
  Stack
} from '@mui/material';
import { 
  SentimentDissatisfied as SadFaceIcon,
  Home as HomeIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh'
        }}
      >
        <Paper 
          elevation={3}
          sx={{ 
            p: 5, 
            borderRadius: 2,
            textAlign: 'center',
            width: '100%'
          }}
        >
          <SadFaceIcon 
            sx={{ 
              fontSize: 100,
              color: 'text.secondary',
              mb: 2
            }} 
          />
          
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2
            }}
          >
            404
          </Typography>
          
          <Typography variant="h4" component="h2" gutterBottom>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Oops! The page you are looking for doesn't exist or has been moved.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<HomeIcon />}
              component={Link}
              to="/"
              sx={{ px: 4, py: 1 }}
            >
              Go Home
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<BackIcon />}
              onClick={() => window.history.back()}
              sx={{ px: 4, py: 1 }}
            >
              Go Back
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage;