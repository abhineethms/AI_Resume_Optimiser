import { configureStore } from '@reduxjs/toolkit';
import resumeReducer from './slices/resumeSlice';
import jobReducer from './slices/jobSlice';
import matchReducer from './slices/matchSlice';
import authReducer from './slices/authSlice';
import keywordReducer from './slices/keywordSlice';

export const store = configureStore({
  reducer: {
    resume: resumeReducer,
    job: jobReducer,
    match: matchReducer,
    auth: authReducer,
    keyword: keywordReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allows non-serializable values like File objects
    }),
});

export default store;
