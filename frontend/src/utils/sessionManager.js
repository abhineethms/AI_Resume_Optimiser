import { v4 as uuidv4 } from 'uuid';

/**
 * Session Manager for handling guest user sessions and authenticated user sessions
 * Provides seamless experience between guest and authenticated states
 */

const SESSION_KEY = 'ai_resume_optimizer_session';
const USER_DATA_KEY = 'ai_resume_optimizer_user_data';

/**
 * Generate a unique session ID for guest users
 * Uses UUID v4 for uniqueness
 */
const generateSessionId = () => {
  return uuidv4();
};

/**
 * Get browser fingerprint for additional session tracking
 * Simple fingerprint based on available browser properties
 */
const getBrowserFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Browser fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    window.screen.width + 'x' + window.screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

/**
 * Initialize session for guest user
 * Creates a new session ID if one doesn't exist
 */
export const initGuestSession = () => {
  let sessionData = getSessionData();
  
  if (!sessionData || !sessionData.sessionId) {
    sessionData = {
      sessionId: generateSessionId(),
      browserFingerprint: getBrowserFingerprint(),
      createdAt: new Date().toISOString(),
      isGuest: true,
      lastActivity: new Date().toISOString()
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    console.log('Created new guest session:', sessionData.sessionId);
  } else {
    // Update last activity
    sessionData.lastActivity = new Date().toISOString();
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }
  
  return sessionData;
};

/**
 * Get current session data
 */
export const getSessionData = () => {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error('Error parsing session data:', error);
    return null;
  }
};

/**
 * Get current session ID (for guest users) or user ID (for authenticated users)
 */
export const getCurrentSessionId = () => {
  const sessionData = getSessionData();
  return sessionData?.sessionId || null;
};

/**
 * Check if current session is a guest session
 */
export const isGuestSession = () => {
  const sessionData = getSessionData();
  return sessionData?.isGuest === true;
};

/**
 * Convert guest session to authenticated user session
 * Used when guest user signs up or logs in
 */
export const convertGuestToUser = (userData) => {
  const guestSessionData = getSessionData();
  
  const userSessionData = {
    sessionId: guestSessionData?.sessionId, // Keep session ID for data migration
    userId: userData.uid || userData.firebaseUid,
    email: userData.email,
    displayName: userData.displayName || userData.name,
    isGuest: false,
    convertedAt: new Date().toISOString(),
    originalGuestSession: guestSessionData,
    lastActivity: new Date().toISOString()
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(userSessionData));
  
  // Store user data separately for easy access
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  
  console.log('Converted guest session to user session:', userSessionData.userId);
  return userSessionData;
};

/**
 * Initialize authenticated user session
 * Called when user logs in
 */
export const initUserSession = (userData) => {
  const userSessionData = {
    userId: userData.uid || userData.firebaseUid,
    email: userData.email,
    displayName: userData.displayName || userData.name,
    isGuest: false,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(userSessionData));
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  
  console.log('Created user session:', userSessionData.userId);
  return userSessionData;
};

/**
 * Clear all session data
 * Used on logout
 */
export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  
  // Clear any other app-related localStorage keys
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('ai_resume_optimizer_')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log('Cleared all session data');
};

/**
 * Get user data from localStorage
 */
export const getUserData = () => {
  try {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Update session activity timestamp
 */
export const updateSessionActivity = () => {
  const sessionData = getSessionData();
  if (sessionData) {
    sessionData.lastActivity = new Date().toISOString();
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }
};

/**
 * Check if session should be considered expired
 * Returns true if session is older than specified hours
 */
export const isSessionExpired = (maxHours = 24) => {
  const sessionData = getSessionData();
  if (!sessionData || !sessionData.lastActivity) {
    return true;
  }
  
  const lastActivity = new Date(sessionData.lastActivity);
  const now = new Date();
  const hoursDiff = (now - lastActivity) / (1000 * 60 * 60);
  
  return hoursDiff > maxHours;
};

/**
 * Get session identifier for API calls
 * Returns userId for authenticated users, sessionId for guests
 */
export const getSessionIdentifier = () => {
  const sessionData = getSessionData();
  if (!sessionData) return null;
  
  return sessionData.isGuest ? sessionData.sessionId : sessionData.userId;
};

/**
 * Get session type for API calls
 */
export const getSessionType = () => {
  const sessionData = getSessionData();
  return sessionData?.isGuest ? 'guest' : 'user';
};

// Initialize session when module loads
if (typeof window !== 'undefined') {
  // Only initialize if we're in the browser
  const sessionData = getSessionData();
  if (!sessionData) {
    initGuestSession();
  }
}

const sessionManager = {
  initGuestSession,
  getSessionData,
  getCurrentSessionId,
  isGuestSession,
  convertGuestToUser,
  initUserSession,
  clearSession,
  getUserData,
  updateSessionActivity,
  isSessionExpired,
  getSessionIdentifier,
  getSessionType
};

export default sessionManager;