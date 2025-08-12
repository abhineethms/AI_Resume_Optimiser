const admin = require('../config/firebase-config');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Enhanced authentication middleware that handles both guest sessions and authenticated users
 * This middleware will:
 * - For authenticated users: verify Firebase token and attach user data
 * - For guest users: validate and attach session data
 * - Provide session identifier (userId or sessionId) for API operations
 */
const authenticateSession = asyncHandler(async (req, res, next) => {
  let token;
  let sessionId;
  
  // Check if authorization header exists and has the Bearer format
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (remove "Bearer " prefix)
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token with Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Get Firebase UID from decoded token
      const firebaseUid = decodedToken.uid;
      
      // Find the corresponding user in our MongoDB database
      const user = await User.findOne({ firebaseUid }).select('-password');
      
      if (!user) {
        // If user exists in Firebase but not in our database, create a new user
        const newUser = await User.create({
          name: decodedToken.name || 'Anonymous User',
          email: decodedToken.email,
          firebaseUid,
          authProvider: decodedToken.firebase.sign_in_provider
        });
        
        req.user = newUser;
      } else {
        // User exists in our database
        req.user = user;
      }
      
      // Store the Firebase UID and decoded token on the request
      req.firebaseUid = firebaseUid;
      req.decodedToken = decodedToken;
      req.isAuthenticated = true;
      req.sessionType = 'user';
      req.sessionIdentifier = user?._id || newUser?._id;
      
      next();
    } catch (error) {
      console.error('Authentication error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token verification failed');
    }
  } else {
    // No token provided - check for guest session in headers or body
    sessionId = req.headers['x-session-id'] || req.body?.sessionId;
    
    if (sessionId) {
      // Guest user with session ID
      req.user = null;
      req.isAuthenticated = false;
      req.sessionType = 'guest';
      req.sessionId = sessionId;
      req.sessionIdentifier = sessionId;
      
      console.log('Guest session identified:', sessionId);
      next();
    } else {
      // No authentication and no session ID
      res.status(401);
      throw new Error('Not authorized, no token or session ID provided');
    }
  }
});

/**
 * Middleware for routes that require authentication (user only, no guests)
 * This is for user-specific features like dashboard
 */
const requireAuth = asyncHandler(async (req, res, next) => {
  let token;
  
  // Check if authorization header exists and has the Bearer format
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (remove "Bearer " prefix)
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token with Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Get Firebase UID from decoded token
      const firebaseUid = decodedToken.uid;
      
      // Find the corresponding user in our MongoDB database
      const user = await User.findOne({ firebaseUid }).select('-password');
      
      if (!user) {
        // If user exists in Firebase but not in our database, create a new user
        const newUser = await User.create({
          name: decodedToken.name || 'Anonymous User',
          email: decodedToken.email,
          firebaseUid,
          authProvider: decodedToken.firebase.sign_in_provider
        });
        
        req.user = newUser;
      } else {
        // User exists in our database
        req.user = user;
      }
      
      // Store the Firebase UID and decoded token on the request
      req.firebaseUid = firebaseUid;
      req.decodedToken = decodedToken;
      req.isAuthenticated = true;
      req.sessionType = 'user';
      req.sessionIdentifier = user?._id || newUser?._id;
      
      next();
    } catch (error) {
      console.error('Authentication error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token verification failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, authentication required');
  }
});

/**
 * Middleware for optional authentication
 * Works for both authenticated users and guest users
 * Used for routes that can work with either user type
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  let sessionId;
  
  // Check if authorization header exists and has the Bearer format
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (remove "Bearer " prefix)
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token with Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Get Firebase UID from decoded token
      const firebaseUid = decodedToken.uid;
      
      // Find the corresponding user in our MongoDB database
      const user = await User.findOne({ firebaseUid }).select('-password');
      
      if (!user) {
        // If user exists in Firebase but not in our database, create a new user
        const newUser = await User.create({
          name: decodedToken.name || 'Anonymous User',
          email: decodedToken.email,
          firebaseUid,
          authProvider: decodedToken.firebase.sign_in_provider
        });
        
        req.user = newUser;
      } else {
        // User exists in our database
        req.user = user;
      }
      
      // Store the Firebase UID and decoded token on the request
      req.firebaseUid = firebaseUid;
      req.decodedToken = decodedToken;
      req.isAuthenticated = true;
      req.sessionType = 'user';
      req.sessionIdentifier = user?._id || newUser?._id;
      
      return next(); // Return early for authenticated users
      
    } catch (error) {
      console.error('Token verification failed, falling back to guest session:', error.message);
      // Fall through to guest session handling
    }
  }
  
  // If no valid token, check for guest session
  if (!req.isAuthenticated) {
    sessionId = req.headers['x-session-id'] || req.body?.sessionId;
    
    if (sessionId) {
      // Guest user with session ID
      req.user = null;
      req.isAuthenticated = false;
      req.sessionType = 'guest';
      req.sessionId = sessionId;
      req.sessionIdentifier = sessionId;
      
      console.log('Guest session identified:', sessionId);
    } else {
      // No authentication and no session ID - create temporary session for this request
      const { v4: uuidv4 } = require('uuid');
      const tempSessionId = uuidv4();
      
      req.user = null;
      req.isAuthenticated = false;
      req.sessionType = 'anonymous';
      req.sessionId = tempSessionId;
      req.sessionIdentifier = tempSessionId;
      
      console.log('Anonymous access - created temporary session:', tempSessionId.substring(0, 10) + '...');
    }
  }
  
  next();
});

module.exports = { authenticateSession, requireAuth, optionalAuth };