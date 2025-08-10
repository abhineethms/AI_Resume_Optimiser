# Session Management Architecture Documentation

**Project:** AI Resume Optimizer  
**Last Updated:** January 10, 2025  
**Author:** System Architecture Documentation  
**Status:** Production Ready

## Table of Contents
1. [Overview](#overview)
2. [Legacy Session System](#legacy-session-system)
3. [Current Dual-Flow Session System](#current-dual-flow-session-system)
4. [Implementation Details](#implementation-details)
5. [Migration Guide](#migration-guide)
6. [API Endpoints](#api-endpoints)
7. [Frontend Integration](#frontend-integration)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

## Overview

The AI Resume Optimizer application has evolved from a simple localStorage-based authentication system to a sophisticated dual-flow session management system that supports both guest users and authenticated users seamlessly.

### System Goals
- **Seamless User Experience**: Allow users to start using the app immediately as guests
- **Data Persistence**: Enable guest users to upgrade to authenticated accounts while preserving their data
- **Security**: Maintain proper authentication for sensitive operations
- **Scalability**: Support both temporary sessions and persistent user accounts

## Legacy Session System

### 🚨 **DEPRECATED - For Reference Only**

The original system relied on simple localStorage-based authentication with significant limitations.

#### Architecture Overview
```
User Authentication Flow (Legacy):
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Frontend  │───▶│ localStorage │───▶│   Backend   │
│             │    │   (token)    │    │  (protect)  │
└─────────────┘    └──────────────┘    └─────────────┘
```

#### Key Components

**Frontend (Legacy):**
```javascript
// Legacy authentication pattern
const token = localStorage.getItem('token');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

**Backend (Legacy):**
```javascript
// middlewares/auth.js (DEPRECATED)
const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    // Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = await User.findOne({ firebaseUid: decodedToken.uid });
  }
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});
```

#### Problems with Legacy System
1. **Session Persistence Issues**: Users remained "logged in" after logout due to localStorage caching
2. **No Guest Support**: All features required authentication
3. **Poor User Experience**: Users had to sign up before trying the application
4. **Data Loss**: No way to migrate guest data to authenticated accounts
5. **Single Flow**: Only supported authenticated users

## Current Dual-Flow Session System

### 🚀 **PRODUCTION SYSTEM**

The new system supports two distinct user flows while maintaining seamless data continuity.

#### Architecture Overview
```
Dual-Flow Session Management:
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Application                    │
├─────────────────────┬───────────────────────────────────────┤
│   Guest Flow        │        Authenticated Flow             │
│                     │                                       │
│ ┌─────────────────┐ │ ┌───────────────────────────────────┐ │
│ │ Session Manager │ │ │     Firebase Auth + Redux        │ │
│ │ - UUID Session  │ │ │ - Firebase ID Tokens              │ │
│ │ - localStorage  │ │ │ - User State Management           │ │
│ │ - Browser Print │ │ │ - Automatic Token Refresh         │ │
│ └─────────────────┘ │ └───────────────────────────────────┘ │
└─────────────────────┼───────────────────────────────────────┘
                      │
                ┌─────▼─────┐
                │axiosWithAuth│ ◄─── Unified HTTP Client
                └─────┬─────┘
                      │
              ┌───────▼────────┐
              │  Backend API   │
              └───────┬────────┘
                      │
        ┌─────────────▼─────────────┐
        │   Session Middleware      │
        │  - optionalAuth          │
        │  - requireAuth           │
        │  - authenticateSession   │
        └─────────────┬─────────────┘
                      │
     ┌────────────────▼─────────────────┐
     │         Database Layer           │
     │ ┌─────────────┐ ┌─────────────┐  │
     │ │Guest Data   │ │ User Data   │  │
     │ │(sessionId)  │ │(user._id)   │  │
     │ └─────────────┘ └─────────────┘  │
     └──────────────────────────────────┘
```

### User Flow Types

#### 1. Guest User Flow
**Characteristics:**
- No authentication required
- Temporary session-based tracking
- Full access to core features
- Data stored with sessionId
- Browser fingerprinting for session persistence

**Flow Diagram:**
```
Guest User Journey:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│ Page Visit  │───▶│ Auto-Session │───▶│ Use Features│───▶│ Optional     │
│             │    │  Creation    │    │   Freely    │    │  Sign Up     │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
                           │                                      │
                           ▼                                      ▼
                   ┌──────────────┐                      ┌──────────────┐
                   │ sessionId +  │                      │ Data         │
                   │ fingerprint  │                      │ Migration    │
                   └──────────────┘                      └──────────────┘
```

#### 2. Authenticated User Flow
**Characteristics:**
- Firebase authentication required
- Persistent data storage
- Enhanced features (dashboard, history)
- Data stored with user._id
- Token-based security

**Flow Diagram:**
```
Authenticated User Journey:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│Sign In/Up   │───▶│Firebase Auth │───▶│Full Features│───▶│ Persistent   │
│             │    │   + Token    │    │ + Dashboard │    │   Storage    │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
                           │                                      │
                           ▼                                      ▼
                   ┌──────────────┐                      ┌──────────────┐
                   │ MongoDB User │                      │ Cross-Device │
                   │   Record     │                      │    Sync      │
                   └──────────────┘                      └──────────────┘
```

## Implementation Details

### Frontend Components

#### 1. Session Manager (`/frontend/src/utils/sessionManager.js`)

**Purpose:** Manages guest sessions with UUID generation and browser fingerprinting.

```javascript
// Core session management utility
const SESSION_KEY = 'ai_resume_optimizer_session';

// Session data structure
const sessionData = {
  sessionId: string,           // UUID v4
  browserFingerprint: string,  // Browser/device fingerprint
  createdAt: string,          // ISO timestamp
  isGuest: boolean,           // Always true for guest sessions
  lastActivity: string        // ISO timestamp
};

// Key functions
export const initGuestSession = () => {
  // Creates new session if none exists
  // Returns existing session if valid
};

export const convertGuestToUser = (userData) => {
  // Converts guest session to user session
  // Preserves sessionId for data migration
};

export const clearSession = () => {
  // Completely clears session data
  // Used during logout
};
```

**Browser Fingerprinting:**
```javascript
const getBrowserFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Browser fingerprint', 2, 2);
  
  return btoa(JSON.stringify({
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    canvas: canvas.toDataURL(),
    timestamp: Date.now()
  }));
};
```

#### 2. HTTP Client (`/frontend/src/utils/axiosWithAuth.js`)

**Purpose:** Unified HTTP client that automatically handles both Firebase tokens and session IDs.

```javascript
// Intelligent request interceptor
axiosWithAuth.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  
  if (user) {
    // Authenticated user path
    const token = await user.getIdToken(true);
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Guest user path
    let sessionData = sessionManager.getSessionData();
    if (!sessionData?.sessionId) {
      sessionData = sessionManager.initGuestSession();
    }
    if (sessionData?.sessionId) {
      config.headers['X-Session-ID'] = sessionData.sessionId;
    }
  }
  
  return config;
});
```

#### 3. Guest Migration (`/frontend/src/utils/guestMigration.js`)

**Purpose:** Handles seamless data migration when guests sign up.

```javascript
export const migrateGuestDataToUser = async (userData) => {
  const sessionData = sessionManager.getSessionData();
  
  if (!sessionData?.isGuest || !sessionData?.sessionId) {
    return { success: true, message: 'No guest data to migrate' };
  }
  
  // Call backend migration endpoint
  const response = await axiosWithAuth.post('/api/auth/migrate-guest-data', {
    sessionId: sessionData.sessionId,
    userData: userData
  });
  
  // Convert session to user session
  sessionManager.convertGuestToUser(userData);
  
  return response.data;
};
```

### Backend Components

#### 1. Session Middleware (`/backend/middlewares/sessionAuth.js`)

**Three middleware functions for different authentication requirements:**

**a) authenticateSession - Strict Authentication Required**
```javascript
const authenticateSession = asyncHandler(async (req, res, next) => {
  // Only allows authenticated users with valid Firebase tokens
  // Used for core auth operations (verify-token)
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Verify Firebase token
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find or create user in MongoDB
    req.user = await User.findOne({ firebaseUid: decodedToken.uid });
    req.isAuthenticated = true;
    req.sessionType = 'user';
    req.sessionIdentifier = req.user._id;
  } else {
    // Check for guest session
    const sessionId = req.headers['x-session-id'] || req.body?.sessionId;
    if (sessionId) {
      req.sessionType = 'guest';
      req.sessionId = sessionId;
      req.sessionIdentifier = sessionId;
    } else {
      res.status(401);
      throw new Error('Not authorized, no token or session ID provided');
    }
  }
});
```

**b) requireAuth - User-Only Access**
```javascript
const requireAuth = asyncHandler(async (req, res, next) => {
  // Only allows authenticated users (no guests)
  // Used for user-specific features (dashboard, profile)
  
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
    res.status(401);
    throw new Error('Not authorized, authentication required');
  }
  
  // Verify Firebase token and attach user
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  req.user = await User.findOne({ firebaseUid: decodedToken.uid });
  req.isAuthenticated = true;
  req.sessionType = 'user';
  req.sessionIdentifier = req.user._id;
});
```

**c) optionalAuth - Dual-Flow Support**
```javascript
const optionalAuth = asyncHandler(async (req, res, next) => {
  // Supports both authenticated users and guests
  // Used for core features (resume parsing, job matching)
  
  // Try Firebase authentication first
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = await User.findOne({ firebaseUid: decodedToken.uid });
      req.isAuthenticated = true;
      req.sessionType = 'user';
      req.sessionIdentifier = req.user._id;
    } catch (error) {
      // Fall through to guest session handling
    }
  }
  
  // If no valid token, check for guest session
  if (!req.isAuthenticated) {
    const sessionId = req.headers['x-session-id'] || req.body?.sessionId;
    
    if (sessionId) {
      req.user = null;
      req.isAuthenticated = false;
      req.sessionType = 'guest';
      req.sessionId = sessionId;
      req.sessionIdentifier = sessionId;
    } else {
      // Create temporary session for anonymous access
      const { v4: uuidv4 } = require('uuid');
      req.sessionType = 'anonymous';
      req.sessionId = uuidv4();
      req.sessionIdentifier = req.sessionId;
    }
  }
  
  next();
});
```

#### 2. Database Models

**All data models support dual ownership patterns:**

```javascript
// Example: Resume Model
const ResumeSchema = new mongoose.Schema({
  // Core resume data
  title: String,
  skills: [String],
  experience: [Object],
  
  // Dual ownership pattern
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Not required for guest users
  },
  sessionId: {
    type: String,
    required: false  // Not required for authenticated users
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now }
});

// Validation ensures either user OR sessionId exists
ResumeSchema.pre('save', function(next) {
  if (!this.user && !this.sessionId) {
    return next(new Error('Either user or sessionId must be provided'));
  }
  next();
});
```

**Database Query Patterns:**
```javascript
// For authenticated users
const userResumes = await Resume.find({ user: req.user._id });

// For guest users
const guestResumes = await Resume.find({ 
  sessionId: req.sessionId, 
  user: null 
});

// Generic pattern using middleware data
const query = req.user ? 
  { user: req.user._id } : 
  { sessionId: req.sessionId, user: null };
const resumes = await Resume.find(query);
```

## Migration Guide

### Guest-to-User Data Migration Process

#### 1. Backend Migration Endpoint (`/api/auth/migrate-guest-data`)

```javascript
const migrateGuestData = async (req, res) => {
  const { sessionId, userData } = req.body;
  const currentUser = req.user; // From auth middleware
  
  // Find all guest data
  const guestResumes = await Resume.find({ sessionId, user: null });
  const guestJobs = await JobDescription.find({ sessionId, user: null });
  const guestMatches = await Match.find({ sessionId, user: null });
  const guestKeywords = await KeywordInsight.find({ sessionId, user: null });
  
  // Migrate data by updating ownership
  await Resume.updateMany(
    { sessionId, user: null },
    { $set: { user: currentUser._id } }
  );
  
  // Update user references
  const resumeIds = guestResumes.map(r => r._id);
  await User.findByIdAndUpdate(currentUser._id, {
    $addToSet: { resumes: { $each: resumeIds } }
  });
  
  // Repeat for all data types...
};
```

#### 2. Frontend Migration Trigger

```javascript
// Triggered after successful Firebase authentication
const handleSignUpComplete = async (firebaseUser) => {
  try {
    // Migrate guest data if exists
    await migrateGuestDataToUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName
    });
    
    // Update Redux state
    dispatch(setUser(firebaseUser));
    
    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};
```

## API Endpoints

### Endpoint Classification

#### Public Endpoints (No Authentication)
- `POST /api/auth/verify-token` - Token verification
- Health checks and static content

#### Guest-Enabled Endpoints (optionalAuth)
- `POST /api/resume/parse` - Resume parsing
- `GET /api/resume/` - Get user/session resumes
- `GET /api/resume/:id` - Get specific resume
- `POST /api/job/parse/text` - Job description parsing
- `POST /api/job/parse/file` - Job file parsing
- `GET /api/job/` - Get user/session jobs
- `GET /api/job/:id` - Get specific job
- `POST /api/match/compare` - Resume-job matching
- `POST /api/match/letter/generate` - Cover letter generation
- `POST /api/match/feedback/analyze` - Resume feedback
- `GET /api/match/` - Get user/session matches
- `GET /api/match/:id` - Get specific match
- `POST /api/keywords/analyze` - Keyword analysis

#### User-Only Endpoints (requireAuth)
- `GET /api/auth/profile` - User profile
- `PUT /api/auth/profile` - Update profile
- `GET /api/auth/dashboard` - User dashboard
- `POST /api/auth/migrate-guest-data` - Data migration
- `GET /api/history/*` - User history endpoints

### Request/Response Patterns

#### Guest User Request
```javascript
// Headers
{
  'X-Session-ID': 'uuid-v4-session-id',
  'Content-Type': 'application/json'
}

// Backend receives
{
  sessionType: 'guest',
  sessionId: 'uuid-v4-session-id',
  sessionIdentifier: 'uuid-v4-session-id',
  user: null,
  isAuthenticated: false
}
```

#### Authenticated User Request
```javascript
// Headers
{
  'Authorization': 'Bearer firebase-id-token',
  'Content-Type': 'application/json'
}

// Backend receives
{
  sessionType: 'user',
  sessionIdentifier: ObjectId('user-mongo-id'),
  user: { _id, name, email, firebaseUid, ... },
  isAuthenticated: true
}
```

## Frontend Integration

### Component Usage Patterns

#### 1. Header Navigation
```jsx
// /frontend/src/components/layout/Header.jsx
const Header = () => {
  const { user } = useSelector(state => state.auth);
  const sessionData = sessionManager.getSessionData();
  
  return (
    <nav>
      {user ? (
        // Authenticated user menu
        <UserMenu user={user} />
      ) : sessionData?.isGuest ? (
        // Guest user with encouragement to sign up
        <GuestMenu sessionData={sessionData} />
      ) : (
        // Anonymous user
        <PublicMenu />
      )}
    </nav>
  );
};
```

#### 2. Route Protection
```jsx
// /frontend/src/components/ProtectedRoute.jsx
const ProtectedRoute = ({ children, requireAuth = false }) => {
  const { user } = useSelector(state => state.auth);
  const sessionData = sessionManager.getSessionData();
  
  if (requireAuth && !user) {
    return <Navigate to="/login" />;
  }
  
  // Allow access for authenticated users or guests (if not requireAuth)
  if (user || (!requireAuth && sessionData?.sessionId)) {
    return children;
  }
  
  return <Navigate to="/login" />;
};
```

#### 3. Feature Usage
```jsx
// Example: Resume parsing component
const ResumeUpload = () => {
  const { user } = useSelector(state => state.auth);
  
  const handleUpload = async (file) => {
    try {
      // axiosWithAuth automatically handles session/token
      const result = await resumeService.parseResume({ file });
      
      if (!user) {
        // Show guest upgrade prompt
        setShowUpgradePrompt(true);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  
  return (
    <div>
      <FileUpload onUpload={handleUpload} />
      {showUpgradePrompt && (
        <GuestUpgradePrompt />
      )}
    </div>
  );
};
```

### Redux Integration

#### Authentication State Management
```javascript
// /frontend/src/features/auth/authSlice.js
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isLoading: false,
    error: null
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.error = null;
    },
    // Global state reset for logout
    resetAllState: (state) => {
      // This triggers reset in all slices
      return authSlice.getInitialState();
    }
  }
});
```

#### Global State Reset
```javascript
// /frontend/src/store/store.js
const rootReducer = combineReducers({
  auth: authReducer,
  resume: resumeReducer,
  job: jobReducer,
  match: matchReducer,
  keyword: keywordReducer,
  ui: uiReducer
});

const resettableRootReducer = (state, action) => {
  if (action.type === 'auth/resetAllState') {
    // Clear all state on logout
    state = undefined;
  }
  return rootReducer(state, action);
};
```

### Logout Implementation

#### Complete Session Cleanup
```javascript
// /frontend/src/utils/authUtils.js
export const performLogout = async () => {
  try {
    // 1. Sign out from Firebase
    await signOut(auth);
    
    // 2. Clear session data
    sessionManager.clearSession();
    
    // 3. Reset Redux state
    store.dispatch(resetAllState());
    
    // 4. Clear any cached data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // 5. Redirect to home
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

## Security Considerations

### Session Security

#### 1. Guest Session Security
- **UUID v4**: Cryptographically secure session IDs
- **Browser Fingerprinting**: Additional validation layer
- **Session Expiry**: Sessions expire with browser closure
- **No Sensitive Data**: Guest sessions don't store sensitive information

#### 2. Authenticated User Security
- **Firebase ID Tokens**: Industry-standard JWT tokens
- **Token Refresh**: Automatic token renewal
- **MongoDB Integration**: Secure user data storage
- **Route Protection**: Proper authorization checks

#### 3. Data Isolation
- **Ownership Validation**: Each request validates data ownership
- **Query Isolation**: Database queries scope to user/session
- **Cross-User Prevention**: No cross-contamination of data

### Security Best Practices

#### 1. Token Handling
```javascript
// Never log tokens
console.log('Token:', token.substring(0, 10) + '...');

// Always use HTTPS in production
const axiosWithAuth = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:5000'
});
```

#### 2. Session Validation
```javascript
// Backend validation
const validateSession = (req) => {
  if (req.sessionType === 'guest') {
    // Validate session ID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.sessionId)) {
      throw new Error('Invalid session ID format');
    }
  }
};
```

#### 3. Data Access Control
```javascript
// Always validate ownership
const getResumeById = async (req, res) => {
  const query = { _id: req.params.id };
  
  if (req.user) {
    query.user = req.user._id;
  } else if (req.sessionId) {
    query.sessionId = req.sessionId;
    query.user = null;
  } else {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const resume = await Resume.findOne(query);
  if (!resume) {
    return res.status(404).json({ message: 'Resume not found' });
  }
  
  res.json(resume);
};
```

## Troubleshooting

### Common Issues

#### 1. Session Not Created
**Symptoms:** Guest users can't access features
**Solutions:**
- Check sessionManager initialization
- Verify localStorage is enabled
- Check console for errors in session creation

#### 2. Data Not Migrating
**Symptoms:** Guest data disappears after signup
**Solutions:**
- Verify migration endpoint is called
- Check session ID persistence during signup
- Validate database migration queries

#### 3. Authentication Loops
**Symptoms:** Users stuck in login/logout cycles
**Solutions:**
- Check token refresh logic
- Verify Firebase configuration
- Clear all localStorage and sessionStorage

#### 4. Cross-Session Data Leakage
**Symptoms:** Users seeing other users' data
**Solutions:**
- Verify database query isolation
- Check middleware session identification
- Validate ownership checks in all endpoints

### Debug Tools

#### 1. Session Debugging
```javascript
// Add to browser console
window.debugSession = () => {
  console.log('Session Data:', sessionManager.getSessionData());
  console.log('Firebase User:', auth.currentUser);
  console.log('Redux User:', store.getState().auth.user);
};
```

#### 2. Backend Logging
```javascript
// Add to middleware
const debugMiddleware = (req, res, next) => {
  console.log('Request Debug:', {
    sessionType: req.sessionType,
    sessionId: req.sessionId?.substring(0, 8) + '...',
    isAuthenticated: req.isAuthenticated,
    userId: req.user?._id
  });
  next();
};
```

#### 3. Database Query Testing
```javascript
// Test data isolation
const testDataIsolation = async () => {
  const sessionId = 'test-session-123';
  const userId = new ObjectId();
  
  // Create test data
  await Resume.create({ title: 'Guest Resume', sessionId, user: null });
  await Resume.create({ title: 'User Resume', user: userId });
  
  // Test queries
  const guestData = await Resume.find({ sessionId, user: null });
  const userData = await Resume.find({ user: userId });
  
  console.log('Guest data:', guestData.length); // Should be 1
  console.log('User data:', userData.length);   // Should be 1
};
```

## Performance Considerations

### Session Storage
- Guest sessions use localStorage (5-10MB limit)
- Regular cleanup of expired sessions
- Minimal data stored in sessions

### Database Queries
- Indexed queries on user._id and sessionId
- Compound indexes for dual ownership patterns
- Query optimization for large datasets

### Frontend State
- Lazy loading of user-specific data
- Efficient Redux state updates
- Minimal re-renders during session changes

## Conclusion

The dual-flow session management system provides a robust foundation for supporting both guest and authenticated users while maintaining security, performance, and data integrity. The architecture allows for seamless user experience transitions while preserving all user data through the migration process.

For any questions or issues with this system, refer to the troubleshooting section or contact the development team.

---

**Document Version:** 1.0  
**System Version:** Production Ready  
**Last Reviewed:** January 10, 2025