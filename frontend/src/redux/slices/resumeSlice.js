import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import resumeService from '../../services/resumeService';

const initialState = {
  resumes: [],
  currentResume: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Parse resume
export const parseResume = createAsyncThunk(
  'resume/parse',
  async (resumeData, thunkAPI) => {
    try {
      return await resumeService.parseResume(resumeData);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user resumes
export const getUserResumes = createAsyncThunk(
  'resume/getUserResumes',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await resumeService.getUserResumes(token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get resume by ID
export const getResumeById = createAsyncThunk(
  'resume/getResumeById',
  async (resumeId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await resumeService.getResumeById(resumeId, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentResume: (state) => {
      state.currentResume = null;
    },
    setCurrentResume: (state, action) => {
      state.currentResume = action.payload;
      state.isSuccess = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(parseResume.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(parseResume.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Properly structure the response data
        const response = action.payload;
        
        // Extract the data from the nested structure
        const resumeData = response.data || response;
        
        // Create a properly structured currentResume object
        state.currentResume = {
          resumeId: resumeData.resumeId || '',
          name: resumeData.name || '',
          email: resumeData.email || '',
          phone: resumeData.phone || '',
          location: resumeData.location || '',
          skills: resumeData.skills || [],
          experience: resumeData.experience || [],
          education: resumeData.education || [],
          languages: resumeData.languages || [],
          urls: resumeData.urls || [],
          certifications: resumeData.certifications || [],
          achievements: resumeData.achievements || [],
          projects: resumeData.projects || [],
          publications: resumeData.publications || [],
        };
        
        console.log('Current resume in Redux:', state.currentResume);
      })
      .addCase(parseResume.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getUserResumes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserResumes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.resumes = action.payload;
      })
      .addCase(getUserResumes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getResumeById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getResumeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentResume = action.payload;
      })
      .addCase(getResumeById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearCurrentResume, setCurrentResume } = resumeSlice.actions;
export default resumeSlice.reducer;
