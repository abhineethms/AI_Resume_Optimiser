import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Helper to save to localStorage
const saveToLocalStorage = (key, value) => {
  try {
    if (value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Helper to load from localStorage
const loadFromLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

// Async thunk for fetching keyword insights
export const fetchKeywordInsights = createAsyncThunk(
  'keyword/fetchKeywordInsights',
  async ({ resumeId, jobId }, { rejectWithValue }) => {
    // Validate parameters
    if (!resumeId) {
      console.error('fetchKeywordInsights: Missing resumeId parameter');
      return rejectWithValue('Resume ID is required');
    }
    
    if (!jobId) {
      console.error('fetchKeywordInsights: Missing jobId parameter');
      return rejectWithValue('Job ID is required');
    }
    
    try {
      console.log(`Fetching keyword insights with resumeId: ${resumeId} and jobId: ${jobId}`);
      
      const response = await axios.post('/keywords/analyze', {
        resumeId,
        jobId
      });
      
      return response.data.data;
    } catch (error) {
      console.error('API Error in fetchKeywordInsights:', error);
      
      if (error.response?.status === 404) {
        return rejectWithValue('Resume or job not found. Please resubmit your resume and job description.');
      }
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to analyze keywords'
      );
    }
  }
);

// Async thunk for fetching saved keyword insights history
export const fetchKeywordHistory = createAsyncThunk(
  'keyword/fetchKeywordHistory',
  async ({ resumeId, jobId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/keywords/history/${resumeId}/${jobId}`);
      
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to retrieve keyword history'
      );
    }
  }
);

const initialState = {
  currentKeywordInsights: loadFromLocalStorage('currentKeywordInsights') || null,
  loading: false,
  error: null,
  success: false,
};

const keywordSlice = createSlice({
  name: 'keyword',
  initialState,
  reducers: {
    setCurrentKeywordInsights: (state, action) => {
      state.currentKeywordInsights = action.payload;
      saveToLocalStorage('currentKeywordInsights', action.payload);
    },
    clearKeywordInsights: (state) => {
      state.currentKeywordInsights = null;
      localStorage.removeItem('currentKeywordInsights');
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchKeywordInsights
      .addCase(fetchKeywordInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKeywordInsights.fulfilled, (state, action) => {
        state.currentKeywordInsights = action.payload;
        state.loading = false;
        state.success = true;
        saveToLocalStorage('currentKeywordInsights', action.payload);
      })
      .addCase(fetchKeywordInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Handle fetchKeywordHistory
      .addCase(fetchKeywordHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKeywordHistory.fulfilled, (state, action) => {
        state.currentKeywordInsights = action.payload;
        state.loading = false;
        state.success = true;
        saveToLocalStorage('currentKeywordInsights', action.payload);
      })
      .addCase(fetchKeywordHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentKeywordInsights, clearKeywordInsights } = keywordSlice.actions;

export default keywordSlice.reducer;
