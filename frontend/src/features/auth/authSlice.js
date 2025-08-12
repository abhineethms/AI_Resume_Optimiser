import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import axiosWithAuth from '../../utils/axiosWithAuth';
import sessionManager from '../../utils/sessionManager';
import { migrateGuestDataToUser } from '../../utils/guestMigration';

// Register user with email and password
export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with name
      await updateProfile(userCredential.user, { displayName: name });
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Get ID token for verification
      await userCredential.user.getIdToken();
      
      // Verify token with backend
      await axiosWithAuth.post('/auth/verify-token');
      
      // Prepare user data
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified
      };
      
      // Attempt to migrate guest data
      try {
        const migrationResult = await migrateGuestDataToUser(userData);
        console.log('Migration result:', migrationResult);
      } catch (migrationError) {
        console.log('Migration failed, but registration succeeded:', migrationError);
        // Don't fail registration if migration fails
      }
      
      // Return user data
      return userData;
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      switch(error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already in use';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        default:
          errorMessage = error.message || 'Registration failed';
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Login user with email and password
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get ID token for verification
      await userCredential.user.getIdToken();
      
      // Verify token with backend
      await axiosWithAuth.post('/auth/verify-token');
      
      // Prepare user data
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified
      };
      
      // Attempt to migrate guest data if user is logging in
      try {
        const migrationResult = await migrateGuestDataToUser(userData);
        console.log('Login migration result:', migrationResult);
      } catch (migrationError) {
        console.log('Migration failed, but login succeeded:', migrationError);
        // Don't fail login if migration fails
      }
      
      return userData;
    } catch (error) {
      let errorMessage = 'Login failed';
      
      switch(error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        default:
          errorMessage = error.message || 'Login failed';
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Login with Google
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, { rejectWithValue }) => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Get ID token for verification
      await userCredential.user.getIdToken();
      
      // Verify token with backend
      await axiosWithAuth.post('/auth/verify-token');
      
      // Prepare user data
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified
      };
      
      // Attempt to migrate guest data if user is logging in
      try {
        const migrationResult = await migrateGuestDataToUser(userData);
        console.log('Google login migration result:', migrationResult);
      } catch (migrationError) {
        console.log('Migration failed, but Google login succeeded:', migrationError);
        // Don't fail login if migration fails
      }
      
      return userData;
    } catch (error) {
      return rejectWithValue(error.message || 'Google sign-in failed');
    }
  }
);

// Fetch user details from backend
export const fetchUserDetails = createAsyncThunk(
  'auth/fetchUserDetails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosWithAuth.get('/auth/profile');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user details');
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email, { rejectWithValue }) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return email;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send password reset email');
    }
  }
);

// Logout user - comprehensive cleanup
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear all session data (localStorage, etc.)
      sessionManager.clearSession();
      
      // Dispatch action to clear all Redux state
      dispatch(clearAllAppData());
      
      return null;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to logout');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    userDetails: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    passwordResetSent: false
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    clearPasswordResetStatus(state) {
      state.passwordResetSent = false;
      state.error = null;
    },
    clearAllAppData(state) {
      // Reset auth state to initial values
      state.user = null;
      state.userDetails = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.passwordResetSent = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch User Details
      .addCase(fetchUserDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userDetails = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state) => {
        state.isLoading = false;
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.passwordResetSent = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.passwordResetSent = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.userDetails = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { setUser, clearError, clearPasswordResetStatus, clearAllAppData } = authSlice.actions;

export default authSlice.reducer;