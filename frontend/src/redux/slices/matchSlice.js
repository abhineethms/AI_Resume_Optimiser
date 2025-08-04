import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { matchService } from '../../services/api';

// Helper functions to calculate category scores from match data
const calculateSkillScore = (matchData) => {
  if (!matchData || !matchData.matchedSkills || !matchData.missingSkills) return 0;
  const totalSkills = matchData.matchedSkills.length + matchData.missingSkills.length;
  return totalSkills > 0 ? Math.round((matchData.matchedSkills.length / totalSkills) * 100) : 0;
};

const calculateExperienceScore = (matchData) => {
  // This is a placeholder - in a real implementation, this would analyze experience match
  // For now, we'll use the overall match percentage with a slight variation
  return matchData && matchData.matchPercentage 
    ? Math.min(100, Math.max(0, matchData.matchPercentage + Math.floor(Math.random() * 10) - 5))
    : 0;
};

const calculateEducationScore = (matchData) => {
  // This is a placeholder - in a real implementation, this would analyze education match
  // For now, we'll use the overall match percentage with a slight variation
  return matchData && matchData.matchPercentage 
    ? Math.min(100, Math.max(0, matchData.matchPercentage + Math.floor(Math.random() * 10) - 5))
    : 0;
};

// Async thunk for comparing resume and job
export const compareResumeJob = createAsyncThunk(
  'match/compare',
  async ({ resumeId, jobId }, { rejectWithValue }) => {
    try {
      return await matchService.compareResumeJob(resumeId, jobId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to compare resume and job');
    }
  }
);

// Async thunk for generating cover letter
export const generateCoverLetter = createAsyncThunk(
  'match/coverLetter',
  async (params, { rejectWithValue }) => {
    try {
      console.log('Sending cover letter generation request with params:', params);
      return await matchService.generateCoverLetter(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate cover letter');
    }
  }
);

// Async thunk for getting resume feedback
export const getResumeFeedback = createAsyncThunk(
  'match/feedback',
  async (matchId, { rejectWithValue }) => {
    try {
      return await matchService.getResumeFeedback(matchId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get resume feedback');
    }
  }
);

// Async thunk for fetching match history
export const getMatchHistory = createAsyncThunk(
  'match/getHistory',
  async (_, { rejectWithValue }) => {
    try {
      return await matchService.getMatches();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch match history');
    }
  }
);

const initialState = {
  currentMatch: null,
  coverLetter: null,
  feedback: null,
  matchHistory: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentMatch: (state) => {
      state.currentMatch = null;
      state.coverLetter = null;
      state.feedback = null;
    },
    setCurrentMatch: (state, action) => {
      state.currentMatch = action.payload;
      state.isSuccess = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Compare resume and job cases
      .addCase(compareResumeJob.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(compareResumeJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Log the actual response structure for debugging
        console.log('Match API Response:', action.payload);
        
        // Safely access the data with fallbacks
        const matchData = action.payload.data || action.payload;
        
        // Create categoryScores with defensive checks
        const categoryScores = [];
        
        // Only add categories if we have the required data
        if (matchData) {
          // Add Skills category if we can calculate it
          if (matchData.matchedSkills || matchData.missingSkills) {
            categoryScores.push({ 
              category: 'Skills', 
              score: calculateSkillScore(matchData) 
            });
          }
          
          // Add Experience category if we have matchPercentage
          if (matchData.matchPercentage !== undefined) {
            categoryScores.push({ 
              category: 'Experience', 
              score: calculateExperienceScore(matchData) 
            });
          }
          
          // Add Education category if we have matchPercentage
          if (matchData.matchPercentage !== undefined) {
            categoryScores.push({ 
              category: 'Education', 
              score: calculateEducationScore(matchData) 
            });
          }
          
          // Add Overall Fit category if we have matchPercentage
          if (matchData.matchPercentage !== undefined) {
            categoryScores.push({ 
              category: 'Overall Fit', 
              score: matchData.matchPercentage 
            });
          }
        }
        
        // Set the currentMatch with safe fallbacks
        state.currentMatch = {
          ...matchData,
          overallScore: matchData?.matchPercentage || 0,
          categoryScores: categoryScores,
          // Add default empty arrays for strengths and improvement areas
          strengths: matchData?.strengths || [],
          improvementAreas: matchData?.improvementAreas || []
        };
      })
      .addCase(compareResumeJob.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Generate cover letter cases
      .addCase(generateCoverLetter.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(generateCoverLetter.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        console.log('Cover letter response:', action.payload);
        // Correctly access the coverLetter from the response structure
        state.coverLetter = action.payload.data?.coverLetter || action.payload.coverLetter;
      })
      .addCase(generateCoverLetter.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get resume feedback cases
      .addCase(getResumeFeedback.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getResumeFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedback = action.payload.feedback;
      })
      .addCase(getResumeFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get match history cases
      .addCase(getMatchHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMatchHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.matchHistory = action.payload.matches;
      })
      .addCase(getMatchHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearCurrentMatch, setCurrentMatch } = matchSlice.actions;
export default matchSlice.reducer;
