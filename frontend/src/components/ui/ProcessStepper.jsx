import React from 'react';
import { 
  Stepper, 
  Step, 
  StepLabel, 
  StepConnector, 
  Box, 
  Typography,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Description as ResumeIcon,
  Work as JobIcon,
  Compare as MatchIcon,
  Analytics as KeywordIcon,
  Email as CoverLetterIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Custom connector with gradient styling
const GradientConnector = styled(StepConnector)(({ theme }) => ({
  [`&.MuiStepConnector-alternativeLabel`]: {
    top: 22,
  },
  [`&.MuiStepConnector-active`]: {
    [`& .MuiStepConnector-line`]: {
      backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
    },
  },
  [`&.MuiStepConnector-completed`]: {
    [`& .MuiStepConnector-line`]: {
      backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
    },
  },
  [`& .MuiStepConnector-line`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

// Custom step icon styles
const StepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  ...(ownerState.active && {
    backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  }),
}));

// Custom step icon component
function StepIcon(props) {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <ResumeIcon />,
    2: <JobIcon />,
    3: <MatchIcon />,
    4: <KeywordIcon />,
    5: <CoverLetterIcon />,
  };

  return (
    <StepIconRoot ownerState={{ active, completed }} className={className}>
      {icons[String(icon)]}
    </StepIconRoot>
  );
}

// Main ProcessStepper component
const ProcessStepper = ({ activeStep = 0 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Steps in the application process
  const steps = [
    { label: 'Resume Parser', description: 'Upload and parse your resume' },
    { label: 'Job Matcher', description: 'Enter job description' },
    { label: 'Match Results', description: 'View compatibility analysis' },
    { label: 'Keyword Insights', description: 'Analyze keyword relevance' },
    { label: 'Cover Letter', description: 'Generate tailored cover letter' }
  ];

  return (
    <Box sx={{ 
      width: '100%', 
      mb: 4,
      p: 3,
      borderRadius: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    }}>
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel={!isMobile}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        connector={<GradientConnector />}
      >
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel 
              StepIconComponent={StepIcon}
              optional={!isMobile && (
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
              )}
            >
              {step.label}
              {isMobile && (
                <Typography variant="caption" display="block" color="text.secondary">
                  {step.description}
                </Typography>
              )}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default ProcessStepper;
