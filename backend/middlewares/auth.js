const admin = require('../config/firebase-config');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Middleware to authenticate Firebase token and attach the user to the request
 * This protects routes that require authentication
 */
const protect = asyncHandler(async (req, res, next) => {
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
      
      next();
    } catch (error) {
      console.error('Authentication error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token verification failed');
    }
  }
  
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

/**
 * Middleware to verify if user is admin
 * Use after the protect middleware
 */
const admin_only = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as admin');
  }
});

module.exports = { protect, admin_only };