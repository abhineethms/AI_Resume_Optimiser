import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
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

  // Helper function to get score-based styling
  const getScoreColor = (score) => {
    if (score >= 70) return 'neon';
    if (score >= 50) return 'yellow';
    return 'red';
  };

  const getScoreClasses = (score) => {
    const color = getScoreColor(score);
    return {
      bg: color === 'neon' ? 'bg-neon-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500',
      text: color === 'neon' ? 'text-neon-400' : color === 'yellow' ? 'text-yellow-400' : 'text-red-400',
      border: color === 'neon' ? 'border-neon-500' : color === 'yellow' ? 'border-yellow-500' : 'border-red-500'
    };
  };

  // Prepare chart data for overall match score
  const prepareChartData = (score) => {
    return {
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: [
          score >= 70 ? 'rgba(16, 185, 129, 0.8)' : 
          score >= 50 ? 'rgba(245, 158, 11, 0.8)' : 'rgba(239, 68, 68, 0.8)',
          'rgba(31, 41, 55, 0.3)' // dark-800 with opacity
        ],
        borderColor: [
          score >= 70 ? 'rgba(16, 185, 129, 1)' : 
          score >= 50 ? 'rgba(245, 158, 11, 1)' : 'rgba(239, 68, 68, 1)',
          'rgba(31, 41, 55, 0.5)'
        ],
        borderWidth: 2,
        cutout: '70%'
      }],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    }
  };

  // Loading state with animated progress
  if (isLoading) {
    const progressSteps = [
      { threshold: 20, text: 'Comparing skills and qualifications...', icon: Target },
      { threshold: 40, text: 'Identifying your strengths...', icon: TrendingUp },
      { threshold: 60, text: 'Finding improvement areas...', icon: TrendingDown },
      { threshold: 80, text: 'Calculating match score...', icon: BarChart3 }
    ];

    return (
      <div className="page-container">
        <div className="content-container">
          <div className="mb-8">
            <ProcessStepper activeStep={2} />
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Analyzing Your <span className="text-gradient">Match</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Our AI is comparing your resume with the job requirements. This process typically takes a few moments.
            </p>

            {/* Progress Circle */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-dark-700"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={351.86}
                  strokeDashoffset={351.86 - (351.86 * analysisProgress) / 100}
                  className="text-neon-500 transition-all duration-300 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {Math.round(analysisProgress)}%
                  </div>
                  <div className="text-xs text-gray-400">Complete</div>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="space-y-4 max-w-md mx-auto">
              {progressSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = analysisProgress >= step.threshold;
                const isComplete = analysisProgress > step.threshold + 20;

                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-500 ${
                      isActive 
                        ? 'bg-dark-800 border-neon-500 shadow-glow-sm' 
                        : 'bg-dark-900 border-dark-700'
                    } ${isActive ? 'fade-in' : 'opacity-50'}`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isComplete 
                        ? 'bg-neon-500 text-dark-950' 
                        : isActive 
                        ? 'bg-neon-900 text-neon-400' 
                        : 'bg-dark-700 text-gray-500'
                    }`}>
                      {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {step.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Animated dots */}
            <div className="flex justify-center items-center space-x-2 mt-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-neon-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="card p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-4">Analysis Error</h2>
            <p className="text-gray-400 mb-6">{message || 'An error occurred during analysis'}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/job-match')}
                className="btn-secondary"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Job Matcher
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No match data
  if (!currentMatch) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="card p-8 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-4">No Match Results</h2>
            <p className="text-gray-400 mb-6">
              We couldn't find match results. Please ensure you have uploaded both your resume and job description.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/resume')}
                className="btn-secondary"
              >
                Upload Resume
              </button>
              <button 
                onClick={() => navigate('/job-match')}
                className="btn-primary"
              >
                Add Job Description
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { overallScore, categoryScores, matchedSkills, missingSkills, strengths, improvementAreas, summary } = currentMatch;
  const scoreClasses = getScoreClasses(overallScore);

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Process Stepper */}
        <div className="mb-8">
          <ProcessStepper activeStep={2} />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Match <span className="text-gradient">Results</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Here's how well your resume matches the job requirements
          </p>
        </div>

        {/* Overall Match Score Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Chart and Score */}
          <div className="card p-8 text-center">
            <h2 className="text-2xl font-semibold text-white mb-6">Overall Match Score</h2>
            
            <div className="relative w-48 h-48 mx-auto mb-6">
              <Doughnut data={prepareChartData(overallScore)} options={chartOptions} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${scoreClasses.text}`}>
                    {overallScore}%
                  </div>
                  <div className="text-gray-400 text-sm">Match</div>
                </div>
              </div>
            </div>

            <div className={`inline-flex items-center px-4 py-2 rounded-full border ${
              overallScore >= 70 
                ? 'bg-neon-900 border-neon-700 text-neon-300'
                : overallScore >= 50
                ? 'bg-yellow-900 border-yellow-700 text-yellow-300'
                : 'bg-red-900 border-red-700 text-red-300'
            }`}>
              {overallScore >= 70 ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : overallScore >= 50 ? (
                <AlertCircle className="w-5 h-5 mr-2" />
              ) : (
                <X className="w-5 h-5 mr-2" />
              )}
              <span className="font-medium">
                {overallScore >= 70 ? 'Excellent Match' : 
                 overallScore >= 50 ? 'Good Match' : 
                 'Needs Improvement'}
              </span>
            </div>

            {summary && (
              <div className="mt-6 p-4 bg-dark-800 rounded-lg border border-dark-600">
                <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="card p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Category Breakdown</h3>
            <div className="space-y-4">
              {categoryScores && categoryScores.length > 0 ? (
                categoryScores.map((category, index) => {
                  const categoryClasses = getScoreClasses(category.score);
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-medium">{category.category}</span>
                        <span className={`font-semibold ${categoryClasses.text}`}>
                          {category.score}%
                        </span>
                      </div>
                      <div className="progress-bar h-2">
                        <div 
                          className={`progress-fill h-full ${categoryClasses.bg}`}
                          style={{ width: `${category.score}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No category breakdown available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Skills Comparison */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Matched Skills */}
          <div className="card p-8">
            <div className="flex items-center mb-6">
              <Check className="w-6 h-6 text-neon-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">Matched Skills</h3>
              <span className="ml-auto bg-neon-900 text-neon-300 px-3 py-1 rounded-full text-sm font-medium">
                {matchedSkills?.length || 0}
              </span>
            </div>
            
            {matchedSkills && matchedSkills.length > 0 ? (
              <div className="space-y-3">
                {matchedSkills.map((skill, index) => (
                  <div key={index} className="flex items-center p-3 bg-neon-900 border border-neon-700 rounded-lg">
                    <Check className="w-5 h-5 text-neon-400 mr-3 flex-shrink-0" />
                    <span className="text-neon-300 font-medium">{skill}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No matched skills identified</p>
            )}
          </div>

          {/* Missing Skills */}
          <div className="card p-8">
            <div className="flex items-center mb-6">
              <X className="w-6 h-6 text-red-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">Missing Skills</h3>
              <span className="ml-auto bg-red-900 text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                {missingSkills?.length || 0}
              </span>
            </div>
            
            {missingSkills && missingSkills.length > 0 ? (
              <div className="space-y-3">
                {missingSkills.map((skill, index) => (
                  <div key={index} className="flex items-center p-3 bg-red-900 border border-red-700 rounded-lg">
                    <X className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                    <span className="text-red-300 font-medium">{skill}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">All required skills are present!</p>
            )}
          </div>
        </div>

        {/* Strengths vs Improvement Areas */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Strengths */}
          <div className="card p-8">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-6 h-6 text-neon-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">Your Strengths</h3>
            </div>
            
            {strengths && strengths.length > 0 ? (
              <div className="space-y-3">
                {strengths.map((strength, index) => (
                  <div key={index} className="flex items-start p-4 bg-dark-800 border border-dark-600 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-neon-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{strength}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No specific strengths identified</p>
            )}
          </div>

          {/* Improvement Areas */}
          <div className="card p-8">
            <div className="flex items-center mb-6">
              <TrendingDown className="w-6 h-6 text-yellow-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">Areas to Improve</h3>
            </div>
            
            {improvementAreas && improvementAreas.length > 0 ? (
              <div className="space-y-3">
                {improvementAreas.map((area, index) => (
                  <div key={index} className="flex items-start p-4 bg-dark-800 border border-dark-600 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{area}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-neon-400 mx-auto mb-3" />
                <p className="text-neon-400 font-medium">Excellent! No major improvement areas identified.</p>
                <p className="text-gray-400 text-sm mt-2">Your resume is well-aligned with the job requirements.</p>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card card-hover p-8 text-center">
            <BarChart3 className="w-12 h-12 text-neon-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Detailed Keyword Analysis</h3>
            <p className="text-gray-400 mb-6">
              Get deeper insights into keyword matching and optimization opportunities.
            </p>
            <button 
              onClick={() => {
                // Save current match to localStorage for keyword insights
                localStorage.setItem('currentMatch', JSON.stringify(currentMatch));
                navigate('/keyword-insights');
              }}
              className="btn-primary w-full"
            >
              View Keyword Insights
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>

          <div className="card card-hover p-8 text-center">
            <FileText className="w-12 h-12 text-electric-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Generate Cover Letter</h3>
            <p className="text-gray-400 mb-6">
              Create a personalized cover letter based on your match results.
            </p>
            <button 
              onClick={() => {
                // Save current match to localStorage for cover letter generation
                localStorage.setItem('currentMatch', JSON.stringify(currentMatch));
                navigate('/cover-letter');
              }}
              className="btn-secondary w-full"
            >
              Create Cover Letter
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <button 
            onClick={() => navigate('/job-match')}
            className="btn-ghost"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Job Matcher
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchResultsPage;