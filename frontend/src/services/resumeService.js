import axios from 'axios';

const API_URL = '/api/resume/';

// Parse resume
const parseResume = async (resumeData) => {
  const formData = new FormData();
  formData.append('resume', resumeData.file);
  
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  // Add auth token if available
  if (resumeData.token) {
    config.headers.Authorization = `Bearer ${resumeData.token}`;
  }

  const response = await axios.post(API_URL + 'parse', formData, config);
  console.log('API Response:', response.data);
  return response.data;
};

// Get user resumes
const getUserResumes = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);
  return response.data;
};

// Get resume by ID
const getResumeById = async (resumeId, token) => {
  const config = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};

  const response = await axios.get(API_URL + resumeId, config);
  return response.data;
};

const resumeService = {
  parseResume,
  getUserResumes,
  getResumeById,
};

export default resumeService;
