import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Typography,
  Link,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Info as InfoIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  History as HistoryIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useState } from 'react';

const GuestBanner = ({ 
  message = "You're using AI Resume Optimizer as a guest",
  showFeatures = true,
  variant = "info",
  persistent = false
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  if (!open && !persistent) return null;

  const guestLimitations = [
    "Results are not saved",
    "No history access",
    "Limited to current session",
    "No dashboard features"
  ];

  const premiumFeatures = [
    "Save all analyses permanently",
    "Access complete history",
    "Advanced dashboard",
    "Bulk operations",
    "Export capabilities"
  ];

  return (
    <Box sx={{ mb: 2 }}>
      <Alert 
        severity={variant}
        icon={<InfoIcon />}
        action={
          !persistent && (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setOpen(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          )
        }
      >
        <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon fontSize="small" />
          {message}
        </AlertTitle>
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          Create a free account to unlock the full power of AI Resume Optimizer and save your progress.
        </Typography>

        {showFeatures && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
              Current Limitations:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {guestLimitations.map((limitation, index) => (
                <Chip 
                  key={index} 
                  label={limitation} 
                  size="small" 
                  variant="outlined" 
                  color="warning"
                />
              ))}
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
              Unlock with Free Account:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {premiumFeatures.map((feature, index) => (
                <Chip 
                  key={index} 
                  label={feature} 
                  size="small" 
                  variant="outlined" 
                  color="success"
                />
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/register')}
            startIcon={<PersonIcon />}
          >
            Create Free Account
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={() => navigate('/dashboard')}
            startIcon={<DashboardIcon />}
            sx={{ ml: 'auto' }}
          >
            See Dashboard Preview
          </Button>
        </Box>
      </Alert>
    </Box>
  );
};

export default GuestBanner;