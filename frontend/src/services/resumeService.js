import axiosWithAuth from '../utils/axiosWithAuth';

const API_URL = '/resume/';

// Parse resume
const parseResume = async (resumeData) => {
  const formData = new FormData();
  formData.append('resume', resumeData.file);
  
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  // axiosWithAuth will automatically add the authentication token or session ID
  const response = await axiosWithAuth.post(API_URL + 'parse', formData, config);
  console.log('API Response:', response.data);
  return response.data;
};

// Get user resumes
const getUserResumes = async () => {
  // axiosWithAuth will automatically add the authentication token
  const response = await axiosWithAuth.get(API_URL);
  return response.data;
};

// Get resume by ID
const getResumeById = async (resumeId) => {
  // axiosWithAuth will automatically add the authentication token or session ID
  const response = await axiosWithAuth.get(API_URL + resumeId);
  return response.data;
};

const resumeService = {
  parseResume,
  getUserResumes,
  getResumeById,
};

export default resumeService;
