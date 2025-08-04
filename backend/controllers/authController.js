const admin = require('../config/firebase-config');
const User = require('../models/User');

/**
 * Verify Firebase token and create/update user in MongoDB
 * @route POST /api/auth/verify-token
 * @access Public
 */
const verifyFirebaseToken = async (req, res) => {
  try {
    console.log('🔍 verifyFirebaseToken called');
    console.log('Request headers:', JSON.stringify(req.headers));
    
    // Extract token from Authorization header instead of request body
    const authHeader = req.headers.authorization;
    
    console.log('Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found in Authorization header');
      return res.status(400).json({
        success: false,
        message: 'No token provided or invalid format. Authorization header must use Bearer scheme.'
      });
    }
    
    // Extract the token (remove 'Bearer ' prefix)
    const idToken = authHeader.split(' ')[1];
    
    console.log('Token extracted (first 10 chars):', idToken.substring(0, 10) + '...');
    
    if (!idToken) {
      console.log('❌ No token extracted from Authorization header');
      return res.status(400).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify the token with Firebase Admin
    console.log('⚙️ Attempting to verify token with Firebase Admin...');
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('✅ Token verified successfully!');
      console.log('Decoded token:', JSON.stringify({
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        provider: decodedToken.firebase?.sign_in_provider
      }));
      
      // Find or create user
      let user = await User.findOne({ firebaseUid: decodedToken.uid });
      
      if (!user) {
        console.log('👤 Creating new user in MongoDB...');
        // Create new user with Firebase data
        user = await User.create({
          name: decodedToken.name || 'Anonymous User',
          email: decodedToken.email,
          firebaseUid: decodedToken.uid,
          authProvider: decodedToken.firebase.sign_in_provider
        });
        console.log('✅ New user created!');
      } else {
        console.log('👤 User found in MongoDB:', user._id);
        // Update user info if needed
        if (user.email !== decodedToken.email || 
            (decodedToken.name && user.name !== decodedToken.name)) {
          
          console.log('🔄 Updating user info...');
          user.email = decodedToken.email;
          if (decodedToken.name) {
            user.name = decodedToken.name;
          }
          await user.save();
          console.log('✅ User info updated!');
        }
      }

      // Return user data
      console.log('📦 Returning user data...');
      res.status(200).json({
        success: true,
        message: 'User authenticated successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          firebaseUid: user.firebaseUid,
          authProvider: user.authProvider,
          jobTitle: user.jobTitle,
          phone: user.phone,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('❌ Error verifying Firebase token:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid token or authentication failed',
        error: error.message
      });
    }
  } catch (error) {
    console.error('❌ Error in verifyFirebaseToken:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get user profile
 * @route GET /api/auth/profile
 * @access Private
 */
const getUserProfile = async (req, res) => {
  try {
    // req.user is attached by the auth middleware
    const user = await User.findById(req.user._id)
      .populate('resumes', 'title createdAt')
      .populate('jobs', 'title company createdAt')
      .populate('matches', 'score createdAt')
      .populate('coverLetters', 'title createdAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user profile',
      error: error.message
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const { name, jobTitle, phone } = req.body;
    const userId = req.user._id;
    
    // Only update fields that were sent
    const updateData = {};
    if (name) updateData.name = name;
    if (jobTitle) updateData.jobTitle = jobTitle;
    if (phone) updateData.phone = phone;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message
    });
  }
};

/**
 * Get user dashboard data
 * @route GET /api/auth/dashboard
 * @access Private
 */
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user with all related documents
    const user = await User.findById(userId)
      .populate('resumes', 'title createdAt')
      .populate('jobs', 'title company createdAt')
      .populate('matches', 'score resumeId jobId createdAt')
      .populate('coverLetters', 'title createdAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get counts
    const counts = {
      resumes: user.resumes ? user.resumes.length : 0,
      jobs: user.jobs ? user.jobs.length : 0,
      matches: user.matches ? user.matches.length : 0,
      coverLetters: user.coverLetters ? user.coverLetters.length : 0
    };
    
    // Get recent activity (5 most recent items of each type)
    const activity = {
      resumes: user.resumes ? user.resumes.slice(0, 5) : [],
      jobs: user.jobs ? user.jobs.slice(0, 5) : [],
      matches: user.matches ? user.matches.slice(0, 5) : [],
      coverLetters: user.coverLetters ? user.coverLetters.slice(0, 5) : []
    };
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          jobTitle: user.jobTitle,
          phone: user.phone,
          authProvider: user.authProvider,
          createdAt: user.createdAt
        },
        counts,
        activity
      }
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting dashboard data',
      error: error.message
    });
  }
};

module.exports = {
  verifyFirebaseToken,
  getUserProfile,
  updateUserProfile,
  getUserDashboard
};
