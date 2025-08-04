import axios from 'axios';

const API_URL = '/api/job/';

// Parse job description
const parseJobDescription = async (jobData) => {
  let response;
  const config = {};
  
  // Add auth token if available
  if (jobData.token) {
    config.headers = {
      Authorization: `Bearer ${jobData.token}`,
    };
  }

  // If job description is a file
  if (jobData.file) {
    const formData = new FormData();
    formData.append('jobDescription', jobData.file);
    
    config.headers = {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    };
    
    response = await axios.post(API_URL + 'parse/file', formData, config);
  } 
  // If job description is text
  else if (jobData.text) {
    response = await axios.post(API_URL + 'parse/text', { text: jobData.text }, config);
  }
  
  return response.data;
};

// Get user job descriptions
const getUserJobs = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);
  return response.data;
};

// Get job description by ID
const getJobById = async (jobId, token) => {
  const config = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};

  const response = await axios.get(API_URL + jobId, config);
  return response.data;
};

const jobService = {
  parseJobDescription,
  getUserJobs,
  getJobById,
};

export default jobService;
