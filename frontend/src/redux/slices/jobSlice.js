import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobService } from '../../services/api';

// Async thunk for parsing job description from file
export const parseJobFile = createAsyncThunk(
  'job/parseFile',
  async (formData, { rejectWithValue }) => {
    try {
      return await jobService.parseJobFile(formData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to parse job description');
    }
  }
);

// Async thunk for parsing job description from text
export const parseJobText = createAsyncThunk(
  'job/parseText',
  async (text, { rejectWithValue }) => {
    try {
      return await jobService.parseJobText(text);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to parse job description');
    }
  }
);

// Async thunk for fetching job history
export const getJobHistory = createAsyncThunk(
  'job/getHistory',
  async (_, { rejectWithValue }) => {
    try {
      return await jobService.getJobs();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch job history');
    }
  }
);

const initialState = {
  currentJob: null,
  jobHistory: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    setCurrentJob: (state, action) => {
      state.currentJob = action.payload;
      state.isSuccess = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Parse job file cases
      .addCase(parseJobFile.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(parseJobFile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentJob = action.payload.data;
      })
      .addCase(parseJobFile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Parse job text cases
      .addCase(parseJobText.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(parseJobText.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentJob = action.payload.data;
      })
      .addCase(parseJobText.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get job history cases
      .addCase(getJobHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getJobHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobHistory = action.payload.jobs;
      })
      .addCase(getJobHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearCurrentJob, setCurrentJob } = jobSlice.actions;
export default jobSlice.reducer;
