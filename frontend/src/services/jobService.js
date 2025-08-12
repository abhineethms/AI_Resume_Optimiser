import axiosWithAuth from '../utils/axiosWithAuth';

const API_URL = '/job/';

// Parse job description
const parseJobDescription = async (jobData) => {
  let response;
  
  // If job description is a file
  if (jobData.file) {
    const formData = new FormData();
    formData.append('jobDescription', jobData.file);
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    response = await axiosWithAuth.post(API_URL + 'parse/file', formData, config);
  } 
  // If job description is text
  else if (jobData.text) {
    response = await axiosWithAuth.post(API_URL + 'parse/text', { text: jobData.text });
  }
  
  return response.data;
};

// Get user job descriptions
const getUserJobs = async () => {
  const response = await axiosWithAuth.get(API_URL);
  return response.data;
};

// Get job description by ID
const getJobById = async (jobId) => {
  const response = await axiosWithAuth.get(API_URL + jobId);
  return response.data;
};

const jobService = {
  parseJobDescription,
  getUserJobs,
  getJobById,
};

export default jobService;
