import { configureStore, combineReducers } from '@reduxjs/toolkit';
import resumeReducer from './slices/resumeSlice';
import jobReducer from './slices/jobSlice';
import matchReducer from './slices/matchSlice';
import authReducer from '../features/auth/authSlice';
import keywordReducer from './slices/keywordSlice';

// Define the root reducer with global reset capability
const appReducer = combineReducers({
  resume: resumeReducer,
  job: jobReducer,
  match: matchReducer,
  auth: authReducer,
  keyword: keywordReducer,
});

const rootReducer = (state, action) => {
  // When clearAllAppData action is dispatched, reset all state
  if (action.type === 'auth/clearAllAppData') {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allows non-serializable values like File objects
    }),
});

export default store;
