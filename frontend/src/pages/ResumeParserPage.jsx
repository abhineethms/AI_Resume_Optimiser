import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Star,
  ExternalLink,
  Calendar,
  Building
} from 'lucide-react';
import { parseResume, reset } from '../redux/slices/resumeSlice';
import { clearCurrentMatch } from '../redux/slices/matchSlice';
import { clearKeywordInsights } from '../redux/slices/keywordSlice';
import ProcessStepper from '../components/ui/ProcessStepper';

const ResumeParserPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // const { user } = useSelector((state) => state.auth);
  const { currentResume, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.resume
  );

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Reset state on component unmount
  React.useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Clear current match when a resume is successfully parsed
  useEffect(() => {
    if (isSuccess && currentResume) {
      // Clear any existing match data when a new resume is uploaded
      dispatch(clearCurrentMatch());
      // Also clear any existing keyword insights when a new resume is uploaded
      dispatch(clearKeywordInsights());
      console.log('Current match and keyword insights cleared after new resume upload');
    }
  }, [isSuccess, currentResume, dispatch]);

  // Simulate upload progress when loading
  React.useEffect(() => {
    let progressInterval;
    
    if (isLoading) {
      setUploadProgress(0);
      progressInterval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          // Increase progress but cap at 90% until actual completion
          const newProgress = prevProgress + (Math.random() * 10);
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 500);
    } else if (isSuccess) {
      setUploadProgress(100);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isLoading, isSuccess]);

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
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      setFileError('Please upload a PDF or DOCX file');
      return;
    }

    // Check file size (5MB limit)
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

  const handleUpload = () => {
    if (!file) {
      setFileError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    dispatch(parseResume(formData));
  };

  const handleReset = () => {
    setFile(null);
    setFileError('');
    dispatch(reset());
  };

  const formatFileSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  // Loading component
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="mb-8">
            <ProcessStepper activeStep={0} />
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Processing Your <span className="text-gradient">Resume</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Our AI is extracting key information from your resume. This process typically takes a few moments.
            </p>

            {/* Progress Circle */}
            <div className="relative w-32 h-32 mx-auto mb-8">
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
                  <div className="text-2xl font-bold text-white">
                    {Math.round(uploadProgress)}%
                  </div>
                  <div className="text-xs text-gray-400">Processing</div>
                </div>
              </div>
            </div>

            {/* Processing file indicator */}
            {file && (
              <div className="inline-flex items-center space-x-3 p-4 bg-dark-800 border border-dark-600 rounded-lg fade-in">
                <FileText className="w-5 h-5 text-neon-400" />
                <span className="text-gray-300 font-medium">{file.name}</span>
              </div>
            )}

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

  // Success state - display parsed resume
  if (isSuccess && currentResume) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="mb-8">
            <ProcessStepper activeStep={0} />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-neon rounded-full mb-4 shadow-glow">
              <CheckCircle className="w-8 h-8 text-dark-950" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Resume <span className="text-gradient">Parsed Successfully!</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Here's the information we extracted from your resume
            </p>
          </div>

          {/* Resume Data */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Personal Information */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <User className="w-6 h-6 text-neon-400 mr-3" />
                <h2 className="text-xl font-semibold text-white">Personal Information</h2>
              </div>
              <div className="space-y-3">
                {currentResume.name && (
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{currentResume.name}</span>
                  </div>
                )}
                {currentResume.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{currentResume.email}</span>
                  </div>
                )}
                {currentResume.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{currentResume.phone}</span>
                  </div>
                )}
                {currentResume.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{currentResume.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <Star className="w-6 h-6 text-neon-400 mr-3" />
                <h2 className="text-xl font-semibold text-white">Skills</h2>
              </div>
              {currentResume.skills && currentResume.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentResume.skills.map((skill, index) => (
                    <span key={index} className="badge badge-info">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No skills found</p>
              )}
            </div>

            {/* Languages */}
            {currentResume.languages && currentResume.languages.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {currentResume.languages.map((language, index) => (
                    <span key={index} className="badge badge-warning">
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Online Profiles */}
            {currentResume.onlineProfiles && currentResume.onlineProfiles.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Online Profiles</h2>
                <div className="space-y-3">
                  {currentResume.onlineProfiles.map((profile, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                      <span className="text-gray-300">{profile.type || 'Profile'}</span>
                      <a 
                        href={profile.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-neon-400 hover:text-neon-300 flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Experience */}
          {currentResume.experience && currentResume.experience.length > 0 && (
            <div className="card p-6 mb-8">
              <div className="flex items-center mb-6">
                <Briefcase className="w-6 h-6 text-neon-400 mr-3" />
                <h2 className="text-xl font-semibold text-white">Work Experience</h2>
              </div>
              <div className="space-y-6">
                {currentResume.experience.map((exp, index) => (
                  <div key={index} className={`${index !== 0 ? 'border-t border-dark-700 pt-6' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{exp.title}</h3>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </div>
                    </div>
                    <div className="flex items-center text-gray-300 mb-3">
                      <Building className="w-4 h-4 mr-2" />
                      {exp.company}
                    </div>
                    {exp.description && (
                      <p className="text-gray-400 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {currentResume.education && currentResume.education.length > 0 && (
            <div className="card p-6 mb-8">
              <div className="flex items-center mb-6">
                <GraduationCap className="w-6 h-6 text-neon-400 mr-3" />
                <h2 className="text-xl font-semibold text-white">Education</h2>
              </div>
              <div className="space-y-6">
                {currentResume.education.map((edu, index) => (
                  <div key={index} className={`${index !== 0 ? 'border-t border-dark-700 pt-6' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{edu.degree}</h3>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {edu.startDate} - {edu.endDate || 'Present'}
                      </div>
                    </div>
                    <div className="text-gray-300 mb-2">{edu.field}</div>
                    <div className="flex items-center text-gray-400 mb-3">
                      <Building className="w-4 h-4 mr-2" />
                      {edu.institution}
                    </div>
                    {edu.description && (
                      <p className="text-gray-400 leading-relaxed">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {currentResume.certifications && currentResume.certifications.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <Award className="w-6 h-6 text-neon-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white">Certifications</h2>
                </div>
                <div className="space-y-3">
                  {currentResume.certifications.map((cert, index) => (
                    <div key={index} className="p-3 bg-dark-800 rounded-lg">
                      <div className="font-medium text-white">{cert.name}</div>
                      <div className="text-gray-400 text-sm">{cert.issuer}</div>
                      {cert.date && (
                        <div className="text-gray-500 text-xs mt-1">{cert.date}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleReset}
              className="btn-secondary flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Parse Another Resume
            </button>
            <button 
              onClick={() => {
                // Save current resume to localStorage before navigation
                localStorage.setItem('currentResume', JSON.stringify(currentResume));
                navigate('/job-match');
              }}
              className="btn-primary flex items-center justify-center"
            >
              Continue to Job Matching
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Upload form state
  return (
    <div className="page-container">
      <div className="content-container">
        <div className="mb-8">
          <ProcessStepper activeStep={0} />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Upload Your <span className="text-gradient">Resume</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Upload your resume and let our AI extract key information to optimize your job applications
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Upload Area */}
          <div 
            className={`file-upload-zone ${dragActive ? 'border-neon-500 bg-dark-900' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="hidden"
              id="file-upload"
            />
            
            <Upload className={`w-16 h-16 mx-auto mb-4 ${dragActive ? 'text-neon-400' : 'text-gray-400'}`} />
            
            <h3 className="text-xl font-semibold text-white mb-2">
              {dragActive ? 'Drop your file here' : 'Choose a file or drag it here'}
            </h3>
            
            <p className="text-gray-400 mb-6">
              Supports PDF and DOCX files up to 5MB
            </p>
            
            <label 
              htmlFor="file-upload"
              className="btn-primary cursor-pointer inline-flex items-center"
            >
              <Upload className="w-5 h-5 mr-2" />
              Browse Files
            </label>
          </div>

          {/* Selected File Display */}
          {file && (
            <div className="mt-6 p-4 bg-dark-800 border border-dark-600 rounded-lg fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-neon-400" />
                  <div>
                    <div className="font-medium text-white">{file.name}</div>
                    <div className="text-sm text-gray-400">{formatFileSize(file.size)}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {(fileError || isError) && (
            <div className="mt-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-300 flex items-center">
              <AlertCircle className="w-5 h-5 mr-3 text-red-400" />
              <span>{fileError || message}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-8 text-center">
            <button 
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              <FileText className="w-5 h-5 mr-2" />
              Parse Resume
            </button>
          </div>

          {/* File Requirements */}
          <div className="mt-8 p-6 bg-dark-800 border border-dark-600 rounded-lg">
            <h4 className="font-semibold text-white mb-3">File Requirements:</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-neon-400 mr-2" />
                PDF or DOCX format only
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-neon-400 mr-2" />
                Maximum file size: 5MB
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-neon-400 mr-2" />
                Text should be searchable (not scanned images)
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-neon-400 mr-2" />
                Include all relevant sections (experience, education, skills)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeParserPage;