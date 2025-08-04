import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Chip,
  Alert,
  Stack,
  Tabs,
  Tab,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  CheckCircleOutline as CheckIcon,
  WarningAmber as WarningIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { fetchKeywordInsights } from '../redux/slices/keywordSlice';
import ProcessStepper from '../components/ui/ProcessStepper';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`keyword-tabpanel-${index}`}
      aria-labelledby={`keyword-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const KeywordInsightsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentResume } = useSelector((state) => state.resume);
  const { currentJob } = useSelector((state) => state.job);
  const { currentMatch } = useSelector((state) => state.match);
  const { 
    currentKeywordInsights, 
    loading, 
    error 
  } = useSelector((state) => state.keyword);

  // State for UI controls
  const [tabValue, setTabValue] = useState(0);
  const [selectedCluster, setSelectedCluster] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Restore data from localStorage if needed
  useEffect(() => {
    const initializeData = async () => {
      try {
        // If we don't have current resume or job in Redux, check localStorage
        let resumeToUse = currentResume;
        let jobToUse = currentJob;
        let matchToUse = currentMatch;
        
        if (!resumeToUse) {
          console.log('No resume in Redux state, checking localStorage...');
          const savedResume = JSON.parse(localStorage.getItem('currentResume'));
          if (savedResume) {
            console.log('Resume found in localStorage:', savedResume._id);
            resumeToUse = savedResume;
          } else {
            console.error('No resume found in localStorage');
          }
        } else {
          console.log('Using resume from Redux state:', currentResume._id);
        }
        
        if (!jobToUse) {
          console.log('No job in Redux state, checking localStorage...');
          const savedJob = JSON.parse(localStorage.getItem('currentJob'));
          if (savedJob) {
            console.log('Job found in localStorage:', savedJob._id);
            jobToUse = savedJob;
          } else {
            console.error('No job found in localStorage');
          }
        } else {
          console.log('Using job from Redux state:', currentJob._id);
        }

        if (!matchToUse) {
          console.log('No match in Redux state, checking localStorage...');
          const savedMatch = JSON.parse(localStorage.getItem('currentMatch'));
          if (savedMatch) {
            console.log('Match found in localStorage:', savedMatch);
            matchToUse = savedMatch;
          } else {
            console.error('No match found in localStorage');
          }
        } else {
          console.log('Using match from Redux state:', currentMatch);
        }
        
        // If still no resume or job data available, redirect to resume parser
        if (!resumeToUse || !jobToUse) {
          console.error("Missing resume or job data. Redirecting to resume parser.");
          navigate('/resume');
          return;
        }
        
        // Make sure we have IDs
        if (!resumeToUse?._id && !resumeToUse?.resumeId && !resumeToUse?.id) {
          console.error("Resume object exists but has no valid ID property (_id, resumeId, or id)");
          // Try to fix the resume object if possible
          if (resumeToUse) {
            // If we have the resume data but no ID, let's check if the ID might be stored elsewhere
            if (matchToUse?.resumeId) {
              resumeToUse._id = matchToUse.resumeId;
              console.log("Using resumeId from match:", matchToUse.resumeId);
            } else {
              navigate('/resume');
              return;
            }
          } else {
            navigate('/resume');
            return;
          }
        }
        
        if (!jobToUse?._id && !jobToUse?.jobId && !jobToUse?.id) {
          console.error("Job object exists but has no valid ID property (_id, jobId, or id)");
          // Try to fix the job object if possible
          if (jobToUse) {
            // If we have the job data but no ID, let's check if the ID might be stored elsewhere
            if (matchToUse?.jobId) {
              jobToUse._id = matchToUse.jobId;
              console.log("Using jobId from match:", matchToUse.jobId);
            } else {
              navigate('/job-match');
              return;
            }
          } else {
            navigate('/job-match');
            return;
          }
        }

        // Get the appropriate ID regardless of property name
        const resumeId = resumeToUse._id || resumeToUse.resumeId || resumeToUse.id;
        const jobId = jobToUse._id || jobToUse.jobId || jobToUse.id;
        
        console.log("Final IDs for keyword insights:", {
          resumeId,
          jobId
        });

        // Fetch keyword insights if we don't have them yet
        if (!currentKeywordInsights) {
          try {
            console.log("Fetching keyword insights with:", {
              resumeId,
              jobId
            });
            
            dispatch(fetchKeywordInsights({ 
              resumeId, 
              jobId 
            }));
          } catch (err) {
            console.error("Error dispatching fetchKeywordInsights:", err);
          }
        }
      } catch (error) {
        console.error("Error in KeywordInsightsPage initialization:", error);
      }
    };
    
    initializeData();
  }, [currentResume, currentJob, currentMatch, currentKeywordInsights, dispatch, navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClusterChange = (event) => {
    setSelectedCluster(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleContinue = () => {
    navigate('/cover-letter');
  };

  const handleBack = () => {
    navigate('/match-results');
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Strong':
        return { color: 'success', icon: <CheckIcon /> };
      case 'Weak':
        return { color: 'warning', icon: <WarningIcon /> };
      case 'Missing':
        return { color: 'error', icon: <CancelIcon /> };
      default:
        return { color: 'default', icon: null };
    }
  };

  // Filter keywords based on selected cluster and search term
  const getFilteredKeywords = () => {
    if (!currentKeywordInsights) return [];

    return currentKeywordInsights.keywords.filter(keyword => {
      const matchesCluster = selectedCluster === 'All' || keyword.cluster === selectedCluster;
      const matchesSearch = searchTerm === '' || keyword.word.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCluster && matchesSearch;
    });
  };

  // Prepare chart data
  const prepareCoverageChartData = () => {
    if (!currentKeywordInsights) return null;
    
    const coverageColors = {
      'Full': 'rgba(76, 175, 80, 0.7)',    // Green
      'Partial': 'rgba(255, 152, 0, 0.7)', // Orange
      'None': 'rgba(244, 67, 54, 0.7)'     // Red
    };
    
    const clusters = currentKeywordInsights.clusters;
    const coverageLabels = clusters.map(cluster => cluster);
    const coverageData = clusters.map(cluster => {
      const status = currentKeywordInsights.coverage[cluster];
      return {
        label: cluster,
        value: status === 'Full' ? 100 : status === 'Partial' ? 50 : 0,
        status: status
      };
    });
    
    const data = {
      labels: coverageLabels,
      datasets: [{
        data: coverageData.map(item => item.value),
        backgroundColor: coverageData.map(item => coverageColors[item.status]),
        borderWidth: 1
      }]
    };
    
    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const status = coverageData[i].status;
                  return {
                    text: `${label} (${status})`,
                    fillStyle: coverageColors[status],
                    index: i
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = coverageData[context.dataIndex].status;
              return `${label}: ${value}`;
            }
          }
        }
      }
    };
    
    return { data, options };
  };

  const prepareKeywordStrengthChart = () => {
    if (!currentKeywordInsights) return null;
    
    // Count keyword strengths
    const strengthCounts = {
      'Strong': 0,
      'Weak': 0,
      'Missing': 0
    };
    
    currentKeywordInsights.keywords.forEach(keyword => {
      if (strengthCounts[keyword.strength] !== undefined) {
        strengthCounts[keyword.strength]++;
      }
    });
    
    const data = {
      labels: Object.keys(strengthCounts),
      datasets: [{
        label: 'Keyword Count',
        data: Object.values(strengthCounts),
        backgroundColor: [
          'rgba(76, 175, 80, 0.7)',  // Green for Strong
          'rgba(255, 152, 0, 0.7)',  // Orange for Weak
          'rgba(244, 67, 54, 0.7)'   // Red for Missing
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(244, 67, 54, 1)'
        ],
        borderWidth: 1
      }]
    };
    
    const options = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Keyword Strength Distribution'
        }
      }
    };
    
    return { data, options };
  };

  // Calculate summary statistics
  const calculateStats = () => {
    if (!currentKeywordInsights) return {};
    
    const keywords = currentKeywordInsights.keywords;
    const total = keywords.length;
    const strong = keywords.filter(k => k.strength === 'Strong').length;
    const weak = keywords.filter(k => k.strength === 'Weak').length;
    const missing = keywords.filter(k => k.strength === 'Missing').length;
    
    const strongPercent = Math.round((strong / total) * 100);
    const weakPercent = Math.round((weak / total) * 100);
    const missingPercent = Math.round((missing / total) * 100);
    
    return {
      total,
      strong,
      weak,
      missing,
      strongPercent,
      weakPercent,
      missingPercent
    };
  };

  const stats = calculateStats();
  const coverageChartData = prepareCoverageChartData();
  const strengthChartData = prepareKeywordStrengthChart();
  const filteredKeywords = getFilteredKeywords();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <ProcessStepper activeStep={3} />
      </Box>
      
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Advanced Keyword Insights
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {currentKeywordInsights && (
        <>
          {/* Tabs Navigation */}
          <Paper sx={{ mb: 4 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
              aria-label="keyword insights tabs"
            >
              <Tab label="Overview" icon={<CheckIcon />} iconPosition="start" />
              <Tab label="Skill Categories" icon={<WarningIcon />} iconPosition="start" />
              <Tab label="Keywords Detail" icon={<CancelIcon />} iconPosition="start" />
            </Tabs>
            
            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={4}>
                {/* Summary Stats */}
                <Grid item xs={12} md={6}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Keyword Match Summary
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Total Keywords: <strong>{stats.total}</strong>
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, bgcolor: 'success.light' }}>
                            <Typography variant="h5" color="success.dark">
                              {stats.strongPercent}%
                            </Typography>
                            <Typography variant="body2" color="success.dark">
                              Strong ({stats.strong})
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, bgcolor: 'warning.light' }}>
                            <Typography variant="h5" color="warning.dark">
                              {stats.weakPercent}%
                            </Typography>
                            <Typography variant="body2" color="warning.dark">
                              Weak ({stats.weak})
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, bgcolor: 'error.light' }}>
                            <Typography variant="h5" color="error.dark">
                              {stats.missingPercent}%
                            </Typography>
                            <Typography variant="body2" color="error.dark">
                              Missing ({stats.missing})
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" paragraph>
                          Your resume matches <strong>{stats.strongPercent}%</strong> of keywords strongly and <strong>{stats.weakPercent}%</strong> weakly. <strong>{stats.missingPercent}%</strong> of keywords are missing.
                        </Typography>
                        <Alert severity={stats.strongPercent > 60 ? "success" : stats.strongPercent > 30 ? "warning" : "error"} sx={{ mt: 1 }}>
                          {stats.strongPercent > 60 
                            ? "Great job! Your resume has strong keyword alignment with this job description." 
                            : stats.strongPercent > 30 
                              ? "Your resume matches some keywords, but there's room for improvement." 
                              : "Consider updating your resume to better match the job description keywords."}
                        </Alert>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Strength Distribution Chart */}
                <Grid item xs={12} md={6}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Keyword Strength Distribution
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {strengthChartData && <Bar data={strengthChartData.data} options={strengthChartData.options} />}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Skill Categories Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={4}>
                {/* Coverage Chart */}
                <Grid item xs={12} md={7}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Skill Category Coverage
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {coverageChartData && <Doughnut data={coverageChartData.data} options={coverageChartData.options} />}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Category Details */}
                <Grid item xs={12} md={5}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Category Details
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Stack spacing={2}>
                        {currentKeywordInsights.clusters.map((cluster) => {
                          const coverageStatus = currentKeywordInsights.coverage[cluster];
                          const { color, icon } = (() => {
                            switch (coverageStatus) {
                              case 'Full': return { color: 'success', icon: <CheckIcon /> };
                              case 'Partial': return { color: 'warning', icon: <WarningIcon /> };
                              case 'None': return { color: 'error', icon: <CancelIcon /> };
                              default: return { color: 'default', icon: null };
                            }
                          })();
                          
                          // Count keywords in this cluster
                          const clusterKeywords = currentKeywordInsights.keywords.filter(k => k.cluster === cluster);
                          const totalInCluster = clusterKeywords.length;
                          const strongInCluster = clusterKeywords.filter(k => k.strength === 'Strong').length;
                          const weakInCluster = clusterKeywords.filter(k => k.strength === 'Weak').length;
                          const missingInCluster = clusterKeywords.filter(k => k.strength === 'Missing').length;
                          
                          return (
                            <Card key={cluster} variant="outlined" sx={{ p: 1 }}>
                              <Grid container alignItems="center">
                                <Grid item xs={9}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {cluster}
                                  </Typography>
                                  <Chip 
                                    label={coverageStatus} 
                                    color={color} 
                                    icon={icon}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                  />
                                </Grid>
                                <Grid item xs={3}>
                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" display="block" color="text.secondary">
                                      Total: {totalInCluster}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="success.main">
                                      Strong: {strongInCluster}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="warning.main">
                                      Weak: {weakInCluster}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="error.main">
                                      Missing: {missingInCluster}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Card>
                          );
                        })}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Keywords Detail Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel id="cluster-select-label">Filter by Category</InputLabel>
                  <Select
                    labelId="cluster-select-label"
                    value={selectedCluster}
                    label="Filter by Category"
                    onChange={handleClusterChange}
                    startAdornment={<FilterIcon sx={{ mr: 1, color: 'action.active' }} />}
                  >
                    <MenuItem value="All">All Categories</MenuItem>
                    {currentKeywordInsights.clusters.map((cluster) => (
                      <MenuItem value={cluster} key={cluster}>{cluster}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label="Search Keywords"
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
              
              {filteredKeywords.length === 0 && (
                <Alert severity="info">No keywords match your current filters.</Alert>
              )}
              
              <Grid container spacing={2}>
                {filteredKeywords.map((keyword, index) => {
                  const { color, icon } = getStrengthColor(keyword.strength);
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <Card 
                        variant="outlined"
                        sx={{
                          borderLeft: 5,
                          borderColor: `${color}.main`,
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 2
                          }
                        }}
                      >
                        <CardContent>
                          <Tooltip title={`This keyword appears ${keyword.resumeCount} times in your resume and ${keyword.jdCount} times in the job description`} arrow>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                {keyword.word}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {keyword.cluster}
                              </Typography>
                              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Chip 
                                  label={keyword.strength} 
                                  color={color} 
                                  icon={icon}
                                  size="small"
                                />
                                <Typography variant="caption">
                                  {keyword.resumeCount} / {keyword.jdCount}
                                </Typography>
                              </Box>
                            </Box>
                          </Tooltip>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </TabPanel>
          </Paper>

          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              sx={{ 
                borderRadius: 8,
                px: 4,
                py: 1.5,
                borderWidth: 2,
                borderColor: 'primary.main',
                color: 'primary.main',
                fontWeight: 'medium',
              }}
            >
              Back to Match Results
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
              }}
            >
              Continue to Cover Letter
            </Button>
          </Stack>
        </>
      )}
    </Container>
  );
};

export default KeywordInsightsPage;
