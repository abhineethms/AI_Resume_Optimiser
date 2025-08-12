import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Lightbulb,
  Check,
  AlertTriangle,
  Star,
  Edit3,
  RefreshCw,
  Target,
  Award,
  BookOpen
} from 'lucide-react';
import { getResumeFeedback } from '../redux/slices/matchSlice';

const FeedbackPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  
  const { currentResume } = useSelector((state) => state.resume);
  const { currentJob } = useSelector((state) => state.job);
  const { 
    currentMatch, 
    feedback, 
    isLoading, 
    isError, 
    message 
  } = useSelector((state) => state.match);

  const toggleAccordion = (index) => {
    setExpandedAccordion(expandedAccordion === index ? null : index);
  };

  // Ensure we have the necessary data
  useEffect(() => {
    if (!currentResume) {
      navigate('/resume');
      return;
    }
    
    if (!currentJob) {
      navigate('/job-match');
      return;
    }
    
    if (!currentMatch) {
      navigate('/match-results');
      return;
    }
    
    // If we have match data but no feedback, request it
    if (currentMatch && !feedback && !isLoading) {
      dispatch(getResumeFeedback({ 
        resumeId: currentResume._id, 
        jobId: currentJob._id,
        matchId: currentMatch._id
      }));
    }
  }, [currentResume, currentJob, currentMatch, feedback, isLoading, dispatch, navigate]);

  // Handle regenerating feedback
  const handleRegenerateFeedback = () => {
    dispatch(getResumeFeedback({ 
      resumeId: currentResume._id, 
      jobId: currentJob._id,
      matchId: currentMatch._id
    }));
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="text-center py-16">
            <div className="loading-spinner w-16 h-16 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Analyzing your resume for improvement opportunities...
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Our AI is identifying ways to enhance your resume for this specific job.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-300 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-3 text-red-400" />
            <span>{message || 'An error occurred while generating resume feedback.'}</span>
          </div>
          <div className="text-center">
            <button 
              onClick={handleRegenerateFeedback}
              className="btn-primary flex items-center justify-center mx-auto"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="text-center py-16">
            <div className="loading-spinner w-16 h-16 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Preparing your feedback...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Resume <span className="text-gradient">Improvement Feedback</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Based on your match with <span className="text-neon-400 font-medium">{currentJob.title}</span> at <span className="text-electric-400 font-medium">{currentJob.company}</span>, here are personalized suggestions to improve your resume.
          </p>
        </div>

        {/* Overall Feedback Summary */}
        <div className="card p-6 mb-8">
          <div className="flex items-center mb-6">
            <Target className="w-6 h-6 text-neon-400 mr-3" />
            <h2 className="text-2xl font-bold text-white">Summary</h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-6">
            {feedback.summary}
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-neon-900 border border-neon-700 rounded-lg p-4 text-center">
              <Check className="w-8 h-8 text-neon-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-neon-300 mb-1">Strengths</h3>
              <p className="text-neon-400 text-sm">
                {feedback.strengthsCount || feedback.strengths?.length || 0} key strengths identified
              </p>
            </div>
            
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-yellow-300 mb-1">Improvement Areas</h3>
              <p className="text-yellow-400 text-sm">
                {feedback.improvementsCount || feedback.improvementAreas?.length || 0} areas to enhance
              </p>
            </div>
            
            <div className="bg-electric-900 border border-electric-700 rounded-lg p-4 text-center">
              <Lightbulb className="w-8 h-8 text-electric-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-electric-300 mb-1">Suggestions</h3>
              <p className="text-electric-400 text-sm">
                {feedback.suggestionsCount || feedback.recommendations?.length || 0} actionable recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Strengths Section */}
        {feedback.strengths && feedback.strengths.length > 0 && (
          <div className="card p-6 mb-8">
            <div className="flex items-center mb-6">
              <Check className="w-6 h-6 text-neon-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Resume Strengths</h2>
            </div>
            <div className="border-b border-dark-700 mb-6"></div>
            
            <div className="space-y-4">
              {feedback.strengths.map((strength, index) => (
                <div key={index} className="bg-neon-900 border border-neon-700 rounded-lg p-4 flex items-start">
                  <Star className="w-5 h-5 text-neon-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-neon-300 mb-2">{strength.title}</h3>
                    <p className="text-neon-400 text-sm">{strength.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvement Areas Section */}
        {feedback.improvementAreas && feedback.improvementAreas.length > 0 && (
          <div className="card p-6 mb-8">
            <div className="flex items-center mb-6">
              <AlertTriangle className="w-6 h-6 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Areas for Improvement</h2>
            </div>
            <div className="border-b border-dark-700 mb-6"></div>
            
            <div className="space-y-4">
              {feedback.improvementAreas.map((area, index) => (
                <div key={index} className="border border-dark-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full bg-yellow-900 border-b border-yellow-700 p-4 text-left flex items-center justify-between hover:bg-yellow-800 transition-colors duration-200"
                  >
                    <span className="font-semibold text-yellow-300">{area.title}</span>
                    <ChevronDown 
                      className={`w-5 h-5 text-yellow-400 transition-transform duration-200 ${
                        expandedAccordion === index ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  
                  {expandedAccordion === index && (
                    <div className="bg-dark-800 p-4 space-y-4 fade-in">
                      <p className="text-gray-300 leading-relaxed">
                        {area.description}
                      </p>
                      
                      <div>
                        <h4 className="font-semibold text-yellow-300 mb-2">Why this matters:</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {area.impact}
                        </p>
                      </div>
                      
                      <div className="bg-dark-700 border border-dark-600 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <Lightbulb className="w-4 h-4 text-electric-400 mr-2" />
                          <span className="text-sm font-medium text-electric-400">Suggestion</span>
                        </div>
                        <p className="text-gray-300 text-sm">
                          {area.suggestion}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specific Recommendations Section */}
        {feedback.recommendations && feedback.recommendations.length > 0 && (
          <div className="card p-6 mb-8">
            <div className="flex items-center mb-6">
              <Lightbulb className="w-6 h-6 text-electric-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Actionable Recommendations</h2>
            </div>
            <div className="border-b border-dark-700 mb-6"></div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {feedback.recommendations.map((recommendation, index) => (
                <div key={index} className="bg-dark-800 border border-dark-600 rounded-lg p-6">
                  <div className="flex items-start mb-4">
                    <Award className="w-5 h-5 text-electric-400 mr-2 mt-1 flex-shrink-0" />
                    <h3 className="font-semibold text-white">{recommendation.title}</h3>
                  </div>
                  
                  <p className="text-gray-400 leading-relaxed mb-4">
                    {recommendation.description}
                  </p>
                  
                  <div className="bg-electric-900 border border-electric-700 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-electric-300 mb-2">Example:</h4>
                    <p className="text-electric-400 text-sm italic">
                      {recommendation.example}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keywords to Include Section */}
        {feedback.keywordsToInclude && feedback.keywordsToInclude.length > 0 && (
          <div className="card p-6 mb-8">
            <div className="flex items-center mb-6">
              <BookOpen className="w-6 h-6 text-neon-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Keywords to Include</h2>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Consider incorporating these keywords in your resume to improve ATS matching and relevance:
            </p>
            
            <div className="flex flex-wrap gap-2">
              {feedback.keywordsToInclude.map((keyword, index) => (
                <span key={index} className="badge badge-info">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/resume')}
              className="btn-primary flex items-center justify-center"
            >
              <Edit3 className="w-5 h-5 mr-2" />
              Update Resume
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex items-center justify-center"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;