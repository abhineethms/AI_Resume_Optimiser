import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  X,
  ArrowLeft,
  ArrowRight,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react';
import { fetchKeywordInsights } from '../redux/slices/keywordSlice';
import ProcessStepper from '../components/ui/ProcessStepper';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Tab Panel component
function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`keyword-tabpanel-${index}`}
      aria-labelledby={`keyword-tab-${index}`}
    >
      {value === index && (
        <div className="pt-6">
          {children}
        </div>
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
          console.log('Resume found in Redux state:', resumeToUse._id);
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
          console.log('Job found in Redux state:', jobToUse._id);
        }
        
        if (!matchToUse) {
          console.log('No match in Redux state, checking localStorage...');
          const savedMatch = JSON.parse(localStorage.getItem('currentMatch'));
          if (savedMatch) {
            console.log('Match found in localStorage:', savedMatch._id);
            matchToUse = savedMatch;
          } else {
            console.error('No match found in localStorage');
          }
        } else {
          console.log('Match found in Redux state:', matchToUse._id);
        }

        // Check if we need to fetch keyword insights
        if (!currentKeywordInsights && resumeToUse && matchToUse) {
          console.log('Dispatching fetchKeywordInsights...');
          const matchId = matchToUse._id || matchToUse.id;
          if (matchId) {
            console.log('Fetching keyword insights for match:', matchId);
            await dispatch(fetchKeywordInsights(matchId));
          } else {
            console.error('No match ID found');
          }
        } else if (currentKeywordInsights) {
          console.log('Keyword insights already available:', currentKeywordInsights);
        } else {
          console.log('Missing required data for keyword insights');
        }
      } catch (error) {
        console.error('Error initializing keyword insights data:', error);
      }
    };

    initializeData();
  }, [dispatch, currentResume, currentJob, currentMatch, currentKeywordInsights]);

  // Helper function to get status-based styling
  const getStatusStyling = (strength) => {
    switch (strength) {
      case 'Strong':
        return {
          bg: 'bg-neon-900 border-neon-700',
          text: 'text-neon-300',
          icon: CheckCircle,
          iconColor: 'text-neon-400'
        };
      case 'Weak':
        return {
          bg: 'bg-yellow-900 border-yellow-700',
          text: 'text-yellow-300',
          icon: AlertTriangle,
          iconColor: 'text-yellow-400'
        };
      case 'Missing':
        return {
          bg: 'bg-red-900 border-red-700',
          text: 'text-red-300',
          icon: X,
          iconColor: 'text-red-400'
        };
      default:
        return {
          bg: 'bg-dark-800 border-dark-600',
          text: 'text-gray-300',
          icon: Target,
          iconColor: 'text-gray-400'
        };
    }
  };

  // Helper function to get coverage-based styling
  const getCoverageStyling = (coverage) => {
    switch (coverage) {
      case 'Full':
        return 'bg-neon-500';
      case 'Partial':
        return 'bg-yellow-500';
      case 'None':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Filter keywords based on cluster and search term
  const getFilteredKeywords = () => {
    if (!currentKeywordInsights?.keywords) return [];
    
    return currentKeywordInsights.keywords.filter(keyword => {
      const matchesCluster = selectedCluster === 'All' || keyword.cluster === selectedCluster;
      const matchesSearch = searchTerm === '' || keyword.word.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCluster && matchesSearch;
    });
  };

  // Prepare chart data for keyword strength distribution
  const prepareKeywordStrengthChart = () => {
    if (!currentKeywordInsights?.keywords) return null;

    const counts = currentKeywordInsights.keywords.reduce((acc, keyword) => {
      acc[keyword.strength] = (acc[keyword.strength] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: ['Strong', 'Weak', 'Missing'],
      datasets: [{
        label: 'Keyword Count',
        data: [
          counts.Strong || 0,
          counts.Weak || 0,
          counts.Missing || 0
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // neon-500
          'rgba(245, 158, 11, 0.8)', // yellow-500
          'rgba(239, 68, 68, 0.8)'   // red-500
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)', // neon-500
          'rgba(245, 158, 11, 1)', // yellow-500
          'rgba(239, 68, 68, 1)'   // red-500
        ],
        borderWidth: 2,
        borderRadius: 4
      }]
    };
  };

  // Prepare chart data for skill category coverage
  const prepareCoverageChartData = () => {
    if (!currentKeywordInsights?.clusters || !currentKeywordInsights?.coverage) return null;

    const clusters = currentKeywordInsights.clusters;
    const coverage = currentKeywordInsights.coverage;
    
    const coverageData = clusters.map(cluster => ({
      cluster,
      coverage: coverage[cluster] || 'None'
    }));

    const coverageColors = {
      'Full': 'rgba(16, 185, 129, 0.8)',   // neon-500
      'Partial': 'rgba(245, 158, 11, 0.8)', // yellow-500
      'None': 'rgba(239, 68, 68, 0.8)'      // red-500
    };

    return {
      labels: coverageData.map(item => item.cluster),
      datasets: [{
        data: coverageData.map(item => {
          return item.coverage === 'Full' ? 100 : 
                 item.coverage === 'Partial' ? 50 : 0;
        }),
        backgroundColor: coverageData.map(item => coverageColors[item.coverage]),
        borderColor: coverageData.map(item => coverageColors[item.coverage].replace('0.8', '1')),
        borderWidth: 2
      }]
    };
  };

  // Calculate statistics
  const getStatistics = () => {
    if (!currentKeywordInsights?.keywords) return null;

    const total = currentKeywordInsights.keywords.length;
    const counts = currentKeywordInsights.keywords.reduce((acc, keyword) => {
      acc[keyword.strength] = (acc[keyword.strength] || 0) + 1;
      return acc;
    }, {});

    const strong = counts.Strong || 0;
    const weak = counts.Weak || 0;
    const missing = counts.Missing || 0;
    const strongPercentage = total > 0 ? Math.round((strong / total) * 100) : 0;

    return { total, strong, weak, missing, strongPercentage };
  };

  const stats = getStatistics();
  const filteredKeywords = getFilteredKeywords();
  const strengthChartData = prepareKeywordStrengthChart();
  const coverageChartData = prepareCoverageChartData();

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#d1d5db', // gray-300
          font: {
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)', // dark-900
        titleColor: '#10b981', // neon-500
        bodyColor: '#d1d5db', // gray-300
        borderColor: '#374151', // dark-700
        borderWidth: 1
      }
    },
    scales: strengthChartData ? {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#9ca3af' // gray-400
        },
        grid: {
          color: 'rgba(55, 65, 81, 0.3)' // dark-700 with opacity
        }
      },
      x: {
        ticks: {
          color: '#9ca3af' // gray-400
        },
        grid: {
          color: 'rgba(55, 65, 81, 0.3)' // dark-700 with opacity
        }
      }
    } : {}
  };

  // Loading state
  if (loading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <div className="loading-spinner w-16 h-16 mx-auto mb-4"></div>
              <p className="text-gray-400">Analyzing keywords and insights...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="card p-8 text-center">
            <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-4">Analysis Error</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/match-results')}
              className="btn-secondary"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Match Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!currentKeywordInsights) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="card p-8 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-4">No Keyword Insights</h2>
            <p className="text-gray-400 mb-6">
              We couldn't find keyword insights for this match. Please ensure you have completed the resume parsing and job matching process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/match-results')}
                className="btn-secondary"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Match Results
              </button>
              <button 
                onClick={() => navigate('/resume')}
                className="btn-primary"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 0, label: 'Overview', icon: Activity },
    { id: 1, label: 'Skill Categories', icon: Target },
    { id: 2, label: 'Keywords Detail', icon: TrendingUp }
  ];

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Process Stepper */}
        <div className="mb-8">
          <ProcessStepper activeStep={3} />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Keyword <span className="text-gradient">Insights</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Detailed analysis of how your resume matches the job requirements
          </p>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
              <div className="text-gray-400">Total Keywords</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-neon-400 mb-2">{stats.strong}</div>
              <div className="text-gray-400">Strong Matches</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.weak}</div>
              <div className="text-gray-400">Weak Matches</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">{stats.missing}</div>
              <div className="text-gray-400">Missing Keywords</div>
            </div>
          </div>
        )}

        {/* Alert based on performance */}
        {stats && (
          <div className={`p-4 rounded-lg border mb-8 ${
            stats.strongPercentage >= 70 
              ? 'bg-neon-900 border-neon-700 text-neon-300'
              : stats.strongPercentage >= 50
              ? 'bg-yellow-900 border-yellow-700 text-yellow-300'
              : 'bg-red-900 border-red-700 text-red-300'
          }`}>
            <div className="flex items-center">
              {stats.strongPercentage >= 70 ? (
                <CheckCircle className="w-5 h-5 mr-3 text-neon-400" />
              ) : stats.strongPercentage >= 50 ? (
                <AlertTriangle className="w-5 h-5 mr-3 text-yellow-400" />
              ) : (
                <X className="w-5 h-5 mr-3 text-red-400" />
              )}
              <div>
                <div className="font-semibold">
                  {stats.strongPercentage >= 70 
                    ? 'Excellent Match!' 
                    : stats.strongPercentage >= 50 
                    ? 'Good Match' 
                    : 'Needs Improvement'}
                </div>
                <div className="text-sm opacity-90">
                  {stats.strongPercentage}% of keywords are strong matches. 
                  {stats.strongPercentage < 70 && ' Consider improving weak and missing keywords.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="card p-0 mb-8">
          <div className="tab-list">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTabValue(tab.id)}
                  className={`tab flex items-center ${tabValue === tab.id ? 'tab-active' : ''}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-white mb-4">Keyword Strength Distribution</h2>
                  <p className="text-gray-400 mb-6">Distribution of keyword matches across different strength levels</p>
                </div>
                
                {strengthChartData && (
                  <div className="chart-container">
                    <div className="h-80">
                      <Bar data={strengthChartData} options={chartOptions} />
                    </div>
                  </div>
                )}
              </div>
            </TabPanel>

            {/* Skill Categories Tab */}
            <TabPanel value={tabValue} index={1}>
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-white mb-4">Skill Category Coverage</h2>
                  <p className="text-gray-400 mb-6">Coverage analysis across different skill categories</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Doughnut Chart */}
                  {coverageChartData && (
                    <div className="chart-container">
                      <div className="h-80">
                        <Doughnut data={coverageChartData} options={chartOptions} />
                      </div>
                    </div>
                  )}

                  {/* Category Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Category Details</h3>
                    {currentKeywordInsights?.clusters?.map((cluster) => {
                      const coverage = currentKeywordInsights.coverage?.[cluster] || 'None';
                      const styling = getCoverageStyling(coverage);
                      
                      return (
                        <div key={cluster} className="card p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full ${styling}`}></div>
                              <span className="font-medium text-white">{cluster}</span>
                            </div>
                            <span className={`badge ${
                              coverage === 'Full' ? 'badge-success' :
                              coverage === 'Partial' ? 'badge-warning' : 
                              'badge-error'
                            }`}>
                              {coverage}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabPanel>

            {/* Keywords Detail Tab */}
            <TabPanel value={tabValue} index={2}>
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Cluster Filter */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Filter className="w-4 h-4 inline mr-2" />
                      Filter by Category
                    </label>
                    <select
                      value={selectedCluster}
                      onChange={(e) => setSelectedCluster(e.target.value)}
                      className="input-primary w-full"
                    >
                      <option value="All">All Categories</option>
                      {currentKeywordInsights?.clusters?.map((cluster) => (
                        <option key={cluster} value={cluster}>
                          {cluster}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search Filter */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Search className="w-4 h-4 inline mr-2" />
                      Search Keywords
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search keywords..."
                        className="input-primary w-full pl-10"
                      />
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Results Count */}
                <div className="text-gray-400 text-sm">
                  Showing {filteredKeywords.length} of {currentKeywordInsights?.keywords?.length || 0} keywords
                </div>

                {/* Keywords Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredKeywords.map((keyword, index) => {
                    const styling = getStatusStyling(keyword.strength);
                    const Icon = styling.icon;
                    
                    return (
                      <div key={index} className={`card card-hover p-4 border ${styling.bg}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Icon className={`w-5 h-5 ${styling.iconColor}`} />
                            <span className={`font-semibold ${styling.text}`}>
                              {keyword.word}
                            </span>
                          </div>
                          <span className={`badge ${
                            keyword.strength === 'Strong' ? 'badge-success' :
                            keyword.strength === 'Weak' ? 'badge-warning' : 
                            'badge-error'
                          }`}>
                            {keyword.strength}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-gray-400">
                            <span>Category:</span>
                            <span className="text-gray-300">{keyword.cluster}</span>
                          </div>
                          <div className="flex justify-between text-gray-400">
                            <span>Resume:</span>
                            <span className="text-gray-300">{keyword.resumeCount || 0} times</span>
                          </div>
                          <div className="flex justify-between text-gray-400">
                            <span>Job Description:</span>
                            <span className="text-gray-300">{keyword.jdCount || 0} times</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredKeywords.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No keywords found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                  </div>
                )}
              </div>
            </TabPanel>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <button 
            onClick={() => navigate('/match-results')}
            className="btn-secondary"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Match Results
          </button>
          <button 
            onClick={() => navigate('/cover-letter')}
            className="btn-primary"
          >
            Continue to Cover Letter
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeywordInsightsPage;