import axiosWithAuth from '../utils/axiosWithAuth';

const API_URL = '/match/';

// Compare resume with job description
const compareResumeWithJob = async (matchData) => {
  const response = await axiosWithAuth.post(
    API_URL + 'compare', 
    {
      resumeId: matchData.resumeId,
      jobId: matchData.jobId
    }
  );
  
  return response.data;
};

// Generate cover letter
const generateCoverLetter = async (coverLetterData) => {
  const response = await axiosWithAuth.post(
    API_URL + 'letter/generate', 
    {
      matchId: coverLetterData.matchId,
      customInstructions: coverLetterData.customInstructions || ''
    }
  );
  
  return response.data;
};

// Analyze resume for feedback
const analyzeFeedback = async (feedbackData) => {
  const response = await axiosWithAuth.post(
    API_URL + 'feedback/analyze', 
    {
      matchId: feedbackData.matchId,
      customInstructions: feedbackData.customInstructions || ''
    }
  );
  
  return response.data;
};

// Get user matches
const getUserMatches = async () => {
  const response = await axiosWithAuth.get(API_URL);
  return response.data;
};

// Get match by ID
const getMatchById = async (matchId) => {
  const response = await axiosWithAuth.get(API_URL + matchId);
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
