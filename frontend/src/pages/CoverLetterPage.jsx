import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Copy,
  Download,
  Edit3,
  RefreshCw,
  Mail,
  Check,
  AlertCircle,
  Lightbulb,
  Search,
  Target,
  FileText,
  ArrowRight,
  X
} from 'lucide-react';
import {
  generateCoverLetter,
  setCurrentMatch
} from '../redux/slices/matchSlice';
import { setCurrentResume } from '../redux/slices/resumeSlice';
import { setCurrentJob } from '../redux/slices/jobSlice';
import ProcessStepper from '../components/ui/ProcessStepper';

const CoverLetterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentResume } = useSelector((state) => state.resume);
  const { currentJob } = useSelector((state) => state.job);
  const { 
    currentMatch, 
    coverLetter, 
    isLoading, 
    isError, 
    message 
  } = useSelector((state) => state.match);

  const [editMode, setEditMode] = useState(false);
  const [editedCoverLetter, setEditedCoverLetter] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Simulate progress for loading animation
  useEffect(() => {
    let timer;
    if (isLoading && generationProgress < 95) {
      timer = setInterval(() => {
        setGenerationProgress(prevProgress => {
          // Slow down as we approach 95%
          const increment = prevProgress < 60 ? 2 : prevProgress < 80 ? 1 : 0.5;
          return Math.min(prevProgress + increment, 95);
        });
      }, 300);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading, generationProgress]);

  // Reset progress when loading completes
  useEffect(() => {
    if (!isLoading) {
      setGenerationProgress(0);
    }
  }, [isLoading]);

  // Ensure we have the necessary data
  useEffect(() => {
    let hasData = true;
    
    // Check if we have resume data, if not try to get from localStorage
    if (!currentResume) {
      const storedResume = localStorage.getItem('currentResume');
      if (storedResume) {
        try {
          const parsedResume = JSON.parse(storedResume);
          console.log('Retrieved resume from localStorage:', parsedResume);
          // Dispatch action to set the resume in Redux state
          dispatch(setCurrentResume(parsedResume));
        } catch (error) {
          console.error('Error parsing resume from localStorage:', error);
          hasData = false;
        }
      } else {
        hasData = false;
        navigate('/resume');
        return;
      }
    }
    
    // Check if we have job data, if not try to get from localStorage
    if (!currentJob) {
      const storedJob = localStorage.getItem('currentJob');
      if (storedJob) {
        try {
          const parsedJob = JSON.parse(storedJob);
          console.log('Retrieved job from localStorage:', parsedJob);
          // Dispatch action to set the job in Redux state
          dispatch(setCurrentJob(parsedJob));
        } catch (error) {
          console.error('Error parsing job from localStorage:', error);
          hasData = false;
        }
      } else {
        hasData = false;
        navigate('/job-match');
        return;
      }
    }
    
    // Check if we have match data, if not try to get from localStorage
    if (!currentMatch) {
      const storedMatch = localStorage.getItem('currentMatch');
      if (storedMatch) {
        try {
          const parsedMatch = JSON.parse(storedMatch);
          console.log('Retrieved match from localStorage:', parsedMatch);
          // Dispatch action to set the match in Redux state
          dispatch(setCurrentMatch(parsedMatch));
        } catch (error) {
          console.error('Error parsing match from localStorage:', error);
          hasData = false;
        }
      } else {
        hasData = false;
        navigate('/match-results');
        return;
      }
    }
    
    // If we have match data but no cover letter, generate one
    if (hasData && currentMatch && !coverLetter && !isLoading) {
      const resumeId = currentResume?._id || currentResume?.resumeId;
      const jobId = currentJob?._id || currentJob?.jobId || currentJob?.id;
      const matchId = currentMatch?._id || currentMatch?.matchId;
      
      console.log('Generating cover letter with IDs:', { resumeId, jobId, matchId });
      
      if (resumeId && jobId && matchId) {
        dispatch(generateCoverLetter({ 
          resumeId, 
          jobId,
          matchId
        }));
      } else {
        console.error('Missing required IDs for cover letter generation:', { resumeId, jobId, matchId });
      }
    }
    
    // Initialize edited cover letter when we get a new one
    if (coverLetter && !editedCoverLetter) {
      setEditedCoverLetter(coverLetter);
    }
  }, [currentResume, currentJob, currentMatch, coverLetter, isLoading, dispatch, navigate, editedCoverLetter]);

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(editMode ? editedCoverLetter : coverLetter);
    setCopySuccess(true);
  };

  // Handle download as .txt file
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([editMode ? editedCoverLetter : coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${currentJob.company}_${currentJob.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle regenerating the cover letter
  const handleRegenerate = () => {
    const resumeId = currentResume?._id || currentResume?.resumeId;
    const jobId = currentJob?._id || currentJob?.jobId || currentJob?.id;
    const matchId = currentMatch?._id || currentMatch?.matchId;
    
    console.log('Regenerating cover letter with IDs:', { resumeId, jobId, matchId });
    
    if (resumeId && jobId && matchId) {
      dispatch(generateCoverLetter({ 
        resumeId, 
        jobId,
        matchId
      }));
      setEditMode(false);
    } else {
      console.error('Missing required IDs for cover letter regeneration:', { resumeId, jobId, matchId });
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      // Exiting edit mode, save changes
      setEditMode(false);
    } else {
      // Entering edit mode
      setEditMode(true);
    }
  };

  // Handle cover letter text changes
  const handleCoverLetterChange = (e) => {
    setEditedCoverLetter(e.target.value);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setCopySuccess(false);
  };

  // Loading animation component
  const LoadingAnimation = () => (
    <div className="page-container">
      <div className="content-container">
        <div className="mb-8">
          <ProcessStepper activeStep={4} />
        </div>
        
        <div className="card p-8">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Progress Circle */}
            <div className="relative w-32 h-32 mb-8">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-dark-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={351.86}
                  strokeDashoffset={351.86 - (351.86 * generationProgress) / 100}
                  className="text-neon-500 transition-all duration-300 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {Math.round(generationProgress)}%
                  </div>
                  <div className="text-xs text-gray-400">Generating</div>
                </div>
              </div>
            </div>
            
            <div className="max-w-md fade-in">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center">
                <Mail className="w-6 h-6 mr-3 text-neon-400" />
                Crafting Your Cover Letter
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Our AI is analyzing your resume and the job description to create a personalized cover letter 
                that highlights your relevant skills and experiences.
              </p>
            </div>
            
            {/* Animated dots */}
            <div className="flex justify-center items-center space-x-2 mt-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-neon-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="mb-8">
            <ProcessStepper activeStep={4} />
          </div>
          
          <div className="card p-8 text-center">
            <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-300 flex items-center justify-center max-w-md mx-auto">
              <AlertCircle className="w-5 h-5 mr-3 text-red-400" />
              <span>{message || 'Failed to generate cover letter. Please try again.'}</span>
            </div>
            <button 
              onClick={handleRegenerate}
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

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="mb-8">
          <ProcessStepper activeStep={4} />
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Your Tailored <span className="text-gradient">Cover Letter</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Customize this AI-generated cover letter to highlight your qualifications for{' '}
            <span className="text-neon-400 font-medium">{currentJob?.title}</span> at{' '}
            <span className="text-electric-400 font-medium">{currentJob?.company}</span>.
          </p>
        </div>

        {/* Cover Letter Actions */}
        <div className="card p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-neon-400 mr-3" />
              <span className="text-lg font-medium text-white">Cover Letter Actions:</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleEditMode}
                className={`p-3 rounded-lg transition-all duration-200 tooltip ${
                  editMode 
                    ? 'bg-neon-500 text-dark-950 hover:bg-neon-600' 
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-neon-400'
                }`}
                title={editMode ? "Save Changes" : "Edit Cover Letter"}
              >
                <Edit3 className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleCopy}
                className="p-3 bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-neon-400 rounded-lg transition-all duration-200"
                title="Copy to Clipboard"
              >
                <Copy className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleDownload}
                className="p-3 bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-electric-400 rounded-lg transition-all duration-200"
                title="Download as Text File"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleRegenerate}
                className="p-3 bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-neon-400 rounded-lg transition-all duration-200"
                title="Regenerate Cover Letter"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            
            <div className="w-full sm:w-auto fade-in">
              <p className="text-gray-400 text-sm">
                Matched to: <span className="text-neon-400 font-medium">{currentJob?.title}</span> at{' '}
                <span className="text-electric-400 font-medium">{currentJob?.company}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Cover Letter Content */}
        <div className="card p-6 mb-8">
          <div className="flex items-center mb-6 fade-in">
            <FileText className="w-6 h-6 text-neon-400 mr-3" />
            <h2 className="text-2xl font-bold text-white">Cover Letter</h2>
          </div>
          <div className="border-b border-dark-700 mb-6"></div>
          
          {editMode ? (
            <div className="fade-in">
              <textarea
                value={editedCoverLetter}
                onChange={handleCoverLetterChange}
                rows={20}
                className="input-primary w-full resize-none font-normal leading-relaxed"
                placeholder="Edit your cover letter..."
              />
            </div>
          ) : (
            <div className="fade-in">
              <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 min-h-[400px] whitespace-pre-wrap font-normal leading-relaxed text-gray-300">
                {editedCoverLetter || coverLetter}
              </div>
            </div>
          )}
        </div>

        {/* Tips and Recommendations */}
        <div className="card p-6 mb-8 fade-in">
          <div className="flex items-center mb-6">
            <Lightbulb className="w-6 h-6 text-neon-400 mr-3" />
            <h2 className="text-2xl font-bold text-white">Cover Letter Tips</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 slide-in">
              <div className="flex items-center mb-3">
                <Target className="w-5 h-5 text-neon-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Personalization</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Consider adding more personal touches to make the cover letter uniquely yours. 
                Mention specific achievements that align with the job requirements.
              </p>
            </div>
            
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 slide-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center mb-3">
                <AlertCircle className="w-5 h-5 text-electric-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Addressing Gaps</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                If there are skill gaps identified in your match results, consider addressing how 
                you're working to develop those skills or how your existing skills can compensate.
              </p>
            </div>
            
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 slide-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center mb-3">
                <Search className="w-5 h-5 text-neon-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Company Research</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Enhance your cover letter by researching the company's values, culture, and recent 
                achievements. Reference these to show your genuine interest in the organization.
              </p>
            </div>
            
            <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 slide-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center mb-3">
                <Check className="w-5 h-5 text-electric-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Proofreading</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Always proofread your cover letter for grammar and spelling errors. Consider having 
                someone else review it as well for feedback on tone and content.
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="text-center fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/feedback')}
              className="btn-primary flex items-center justify-center"
            >
              Get Resume Feedback
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex items-center justify-center"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Copy Success Notification */}
        {copySuccess && (
          <div className="fixed bottom-4 right-4 bg-neon-900 border border-neon-700 text-neon-300 px-6 py-3 rounded-lg shadow-glow fade-in">
            <div className="flex items-center">
              <Check className="w-5 h-5 mr-2 text-neon-400" />
              Cover letter copied to clipboard!
              <button 
                onClick={handleCloseSnackbar}
                className="ml-4 text-neon-400 hover:text-neon-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverLetterPage;
