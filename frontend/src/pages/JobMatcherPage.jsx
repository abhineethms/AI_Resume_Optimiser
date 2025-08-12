import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Check,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Building,
  MapPin,
  Clock,
  Star,
  Briefcase,
  Zap
} from 'lucide-react';
import { parseJobFile, parseJobText, reset } from '../redux/slices/jobSlice';
import ProcessStepper from '../components/ui/ProcessStepper';

// TabPanel component for tab content
function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`job-tabpanel-${index}`}
      aria-labelledby={`job-tab-${index}`}
      className={value === index ? 'block p-6' : 'hidden'}
    >
      {children}
    </div>
  );
}

const JobMatcherPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // const { user } = useSelector((state) => state.auth); // May be needed for future features
  const { currentResume } = useSelector((state) => state.resume);
  const { currentJob, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.job
  );

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [jobText, setJobText] = useState('');
  const [textError, setTextError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Reset state on component unmount
  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Simulate upload progress when loading
  useEffect(() => {
    let timer;
    if (isLoading) {
      setUploadProgress(0);
      timer = setInterval(() => {
        setUploadProgress((prevProgress) => {
          const newProgress = prevProgress + Math.random() * 10;
          return newProgress >= 100 ? 99 : newProgress;
        });
      }, 500);
    } else if (isSuccess) {
      setUploadProgress(100);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading, isSuccess]);

  // Check if resume exists, if not redirect to resume page
  useEffect(() => {
    if (!currentResume) {
      navigate('/resume');
    }
  }, [currentResume, navigate]);

  // Tab change handler for manual tab switching
  // const handleTabChange = (event, newValue) => {
  //   setTabValue(newValue);
  // };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    setFileError('');
    
    if (!selectedFile) {
      return;
    }

    // Check file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(selectedFile.type)) {
      setFileError('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    // Check file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileError('File size should be less than 5MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleTextChange = (e) => {
    setJobText(e.target.value);
    if (e.target.value.trim().length > 0) {
      setTextError('');
    }
  };

  const handleFileSubmit = (e) => {
    e.preventDefault();
    
    if (!file) {
      setFileError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('jobDescription', file);

    dispatch(parseJobFile(formData));
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    
    if (!jobText.trim()) {
      setTextError('Please enter a job description');
      return;
    }

    dispatch(parseJobText(jobText));
  };

  const handleContinue = () => {
    navigate('/match-results');
  };

  // Loading animation component
  const LoadingAnimation = () => (
    <div className="flex flex-col items-center justify-center py-12">
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
            strokeDashoffset={351.86 - (351.86 * uploadProgress) / 100}
            className="text-neon-500 transition-all duration-300 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {Math.round(uploadProgress)}%
            </div>
            <div className="text-xs text-gray-400">Processing</div>
          </div>
        </div>
      </div>
      
      <div className="text-center max-w-md fade-in">
        <h3 className="text-xl font-semibold text-white mb-4">
          Analyzing Job Description
        </h3>
        <p className="text-gray-400 leading-relaxed">
          Our AI is extracting key information from your job description including required skills, 
          qualifications, and responsibilities.
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
      
      {/* Processing file indicator */}
      {uploadProgress > 30 && (
        <div className="mt-6 fade-in">
          <div className="inline-flex items-center space-x-3 p-4 bg-dark-800 border border-dark-600 rounded-lg">
            {file ? (
              <>
                <FileText className="w-5 h-5 text-neon-400" />
                <span className="text-gray-300 font-medium">Processing {file.name}</span>
              </>
            ) : (
              <>
                <Briefcase className="w-5 h-5 text-neon-400" />
                <span className="text-gray-300 font-medium">Processing job description text</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="mb-8">
          <ProcessStepper activeStep={1} />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Job Description <span className="text-gradient">Parser</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Upload or paste a job description to match with your resume.
            Our AI will analyze the job requirements and compare them with your skills and experience.
          </p>
        </div>

        {/* Error Alert */}
        {isError && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-300 flex items-center fade-in">
            <AlertCircle className="w-5 h-5 mr-3 text-red-400" />
            <span>{message}</span>
          </div>
        )}

        {isLoading ? (
          <div className="card p-8">
            <LoadingAnimation />
          </div>
        ) : !isSuccess ? (
          <div className="max-w-4xl mx-auto">
            <div className="card overflow-hidden">
              {/* Tab Headers */}
              <div className="tab-list">
                <button
                  className={`tab ${tabValue === 0 ? 'tab-active' : ''}`}
                  onClick={() => setTabValue(0)}
                  id="job-tab-0"
                  aria-controls="job-tabpanel-0"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Upload File
                </button>
                <button
                  className={`tab ${tabValue === 1 ? 'tab-active' : ''}`}
                  onClick={() => setTabValue(1)}
                  id="job-tab-1"
                  aria-controls="job-tabpanel-1"
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  Paste Text
                </button>
              </div>
              
              {/* File Upload Tab */}
              <TabPanel value={tabValue} index={0}>
                <form onSubmit={handleFileSubmit}>
                  <div
                    className={`file-upload-zone ${dragActive ? 'border-neon-500 bg-dark-900' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="job-file-upload"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                    />
                    <label htmlFor="job-file-upload" className="cursor-pointer flex flex-col items-center">
                      <Upload className={`w-16 h-16 mb-4 ${dragActive ? 'text-neon-400' : 'text-gray-400'}`} />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {dragActive ? 'Drop your file here' : 'Drag & Drop or Click to Upload'}
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Supports PDF, DOCX, and TXT files (Max 5MB)
                      </p>
                      {file && (
                        <div className="mt-4 flex items-center p-3 bg-dark-800 rounded-lg">
                          <Check className="w-5 h-5 text-neon-400 mr-2" />
                          <span className="text-gray-300">
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                  
                  {fileError && (
                    <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded-lg text-red-300 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-3 text-red-400" />
                      <span>{fileError}</span>
                    </div>
                  )}
                  
                  <div className="mt-6 text-center">
                    <button
                      type="submit"
                      disabled={!file || isLoading}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto min-w-[200px]"
                    >
                      {isLoading ? (
                        <>
                          <div className="loading-spinner w-5 h-5 mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FileText className="w-5 h-5 mr-2" />
                          Parse Job Description
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </TabPanel>
              
              {/* Text Input Tab */}
              <TabPanel value={tabValue} index={1}>
                <form onSubmit={handleTextSubmit}>
                  <div className="mb-6">
                    <textarea
                      rows={12}
                      placeholder="Paste job description text here..."
                      value={jobText}
                      onChange={handleTextChange}
                      className={`input-primary w-full resize-none ${textError ? 'input-error' : ''}`}
                    />
                    {textError && (
                      <p className="mt-2 text-red-400 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {textError}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={!jobText.trim() || isLoading}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto min-w-[200px]"
                    >
                      {isLoading ? (
                        <>
                          <div className="loading-spinner w-5 h-5 mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Briefcase className="w-5 h-5 mr-2" />
                          Parse Job Description
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </TabPanel>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Success Alert */}
            <div className="mb-8 p-4 bg-neon-900 border border-neon-700 rounded-lg text-neon-300 flex items-center fade-in">
              <Check className="w-5 h-5 mr-3 text-neon-400" />
              <span>Job description successfully parsed!</span>
            </div>
            
            {/* Job Overview Card */}
            <div className="card p-6 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {currentJob?.title || 'Job Title'}
                  </h2>
                  <div className="flex items-center text-gray-400 space-x-4">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {currentJob?.company || 'Company'}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {currentJob?.location || 'Location'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-6 h-6 text-neon-400" />
                </div>
              </div>
              
              <div className="border-t border-dark-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Job Description</h3>
                <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                  {currentJob?.description || 'No description available'}
                </p>
              </div>
            </div>
            
            {/* Skills Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Required Skills */}
              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <Star className="w-6 h-6 text-neon-400 mr-3" />
                  <h3 className="text-xl font-semibold text-white">Required Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentJob?.requiredSkills?.map((skill, index) => (
                    <span key={index} className="badge badge-success">
                      {skill}
                    </span>
                  )) || (
                    <p className="text-gray-400">No required skills found</p>
                  )}
                </div>
              </div>
              
              {/* Preferred Skills */}
              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-electric-400 mr-3" />
                  <h3 className="text-xl font-semibold text-white">Preferred Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentJob?.preferredSkills?.map((skill, index) => (
                    <span key={index} className="badge badge-info">
                      {skill}
                    </span>
                  )) || (
                    <p className="text-gray-400">No preferred skills found</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => dispatch(reset())}
                className="btn-secondary flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Parse Another Job
              </button>
              <button
                onClick={handleContinue}
                className="btn-primary flex items-center justify-center"
              >
                Continue to Match Results
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMatcherPage;
