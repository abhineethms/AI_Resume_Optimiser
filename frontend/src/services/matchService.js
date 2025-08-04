import axios from 'axios';

const API_URL = '/api/match/';

// Compare resume with job description
const compareResumeWithJob = async (matchData) => {
  const config = {};
  
  // Add auth token if available
  if (matchData.token) {
    config.headers = {
      Authorization: `Bearer ${matchData.token}`,
    };
  }

  const response = await axios.post(
    API_URL + 'compare', 
    {
      resumeId: matchData.resumeId,
      jobId: matchData.jobId
    }, 
    config
  );
  
  return response.data;
};

// Generate cover letter
const generateCoverLetter = async (coverLetterData) => {
  const config = {};
  
  // Add auth token if available
  if (coverLetterData.token) {
    config.headers = {
      Authorization: `Bearer ${coverLetterData.token}`,
    };
  }

  const response = await axios.post(
    API_URL + 'cover-letter', 
    {
      matchId: coverLetterData.matchId,
      customInstructions: coverLetterData.customInstructions || ''
    }, 
    config
  );
  
  return response.data;
};

// Analyze resume for feedback
const analyzeFeedback = async (feedbackData) => {
  const config = {};
  
  // Add auth token if available
  if (feedbackData.token) {
    config.headers = {
      Authorization: `Bearer ${feedbackData.token}`,
    };
  }

  const response = await axios.post(
    API_URL + 'feedback', 
    {
      matchId: feedbackData.matchId,
      customInstructions: feedbackData.customInstructions || ''
    }, 
    config
  );
  
  return response.data;
};

// Get user matches
const getUserMatches = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);
  return response.data;
};

// Get match by ID
const getMatchById = async (matchId, token) => {
  const config = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};

  const response = await axios.get(API_URL + matchId, config);
  return response.data;
};

const matchService = {
  compareResumeWithJob,
  generateCoverLetter,
  analyzeFeedback,
  getUserMatches,
  getMatchById,
};

export default matchService;
