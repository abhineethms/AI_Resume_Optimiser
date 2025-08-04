import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: false,
  darkMode: localStorage.getItem('darkMode') === 'true',
  alert: {
    show: false,
    type: '',
    message: '',
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      const newMode = !state.darkMode;
      localStorage.setItem('darkMode', newMode);
      state.darkMode = newMode;
    },
    setDarkMode: (state, action) => {
      localStorage.setItem('darkMode', action.payload);
      state.darkMode = action.payload;
    },
    showAlert: (state, action) => {
      state.alert = {
        show: true,
        type: action.payload.type,
        message: action.payload.message,
      };
    },
    hideAlert: (state) => {
      state.alert = {
        show: false,
        type: '',
        message: '',
      };
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  showAlert,
  hideAlert,
} = uiSlice.actions;
export default uiSlice.reducer;
