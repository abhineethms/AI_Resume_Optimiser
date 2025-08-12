const admin = require('../config/firebase-config');
const User = require('../models/User');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const Match = require('../models/Match');
const KeywordInsight = require('../models/KeywordInsight');

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
      .populate('matches', 'score createdAt');
    
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
    
    // Get user basic info
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get counts directly from each collection
    const [resumeCount, jobCount, matchCount, keywordCount] = await Promise.all([
      Resume.countDocuments({ user: userId }),
      JobDescription.countDocuments({ user: userId }),
      Match.countDocuments({ user: userId }),
      KeywordInsight.countDocuments({ user: userId })
    ]);
    
    // Get recent activities (5 most recent items of each type)
    const [recentResumes, recentJobs, recentMatches] = await Promise.all([
      Resume.find({ user: userId })
        .select('title createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
      JobDescription.find({ user: userId })
        .select('title company createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
      Match.find({ user: userId })
        .select('matchPercentage createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);
    
    // Prepare stats object to match frontend expectations
    const stats = {
      resumesUploaded: resumeCount,
      jobsAnalyzed: jobCount,
      matchesCreated: matchCount,
      coverLettersGenerated: 0, // TODO: Add cover letter model and count
      keywordInsights: keywordCount
    };
    
    // Prepare recent activities
    const recentActivities = [
      ...recentResumes.map(resume => ({
        type: 'resume',
        description: `Resume "${resume.title}" uploaded`,
        timestamp: resume.createdAt
      })),
      ...recentJobs.map(job => ({
        type: 'job',
        description: `Job "${job.title}" at ${job.company || 'Unknown Company'} analyzed`,
        timestamp: job.createdAt
      })),
      ...recentMatches.map(match => ({
        type: 'match',
        description: `Match analysis completed (${match.matchPercentage}% match)`,
        timestamp: match.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
    
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
        stats,
        recentActivities
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

/**
 * Migrate guest session data to authenticated user account
 * @route POST /api/auth/migrate-guest-data
 * @access Private
 */
const migrateGuestData = async (req, res) => {
  try {
    const { sessionId, userData } = req.body;
    const currentUser = req.user; // From auth middleware
    
    console.log('🔄 Starting guest data migration for session:', sessionId);
    console.log('Target user:', currentUser._id);
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required for migration'
      });
    }
    
    // Find all guest data associated with this sessionId
    const guestResumes = await Resume.find({ sessionId, user: null });
    const guestJobs = await JobDescription.find({ sessionId, user: null });
    const guestMatches = await Match.find({ sessionId, user: null });
    const guestKeywords = await KeywordInsight.find({ sessionId, user: null });
    
    console.log('Found guest data:', {
      resumes: guestResumes.length,
      jobs: guestJobs.length,
      matches: guestMatches.length,
      keywords: guestKeywords.length
    });
    
    if (guestResumes.length === 0 && guestJobs.length === 0 && 
        guestMatches.length === 0 && guestKeywords.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No guest data found to migrate',
        data: { migrated: { resumes: 0, jobs: 0, matches: 0, keywords: 0 } }
      });
    }
    
    const migrationResults = {
      resumes: 0,
      jobs: 0,
      matches: 0,
      keywords: 0
    };
    
    // Migrate resumes
    if (guestResumes.length > 0) {
      await Resume.updateMany(
        { sessionId, user: null },
        { $set: { user: currentUser._id } }
      );
      migrationResults.resumes = guestResumes.length;
      
      // Add resume references to user
      const resumeIds = guestResumes.map(r => r._id);
      await User.findByIdAndUpdate(currentUser._id, {
        $addToSet: { resumes: { $each: resumeIds } }
      });
    }
    
    // Migrate job descriptions
    if (guestJobs.length > 0) {
      await JobDescription.updateMany(
        { sessionId, user: null },
        { $set: { user: currentUser._id } }
      );
      migrationResults.jobs = guestJobs.length;
      
      // Add job references to user
      const jobIds = guestJobs.map(j => j._id);
      await User.findByIdAndUpdate(currentUser._id, {
        $addToSet: { jobs: { $each: jobIds } }
      });
    }
    
    // Migrate matches
    if (guestMatches.length > 0) {
      await Match.updateMany(
        { sessionId, user: null },
        { $set: { user: currentUser._id } }
      );
      migrationResults.matches = guestMatches.length;
      
      // Add match references to user
      const matchIds = guestMatches.map(m => m._id);
      await User.findByIdAndUpdate(currentUser._id, {
        $addToSet: { matches: { $each: matchIds } }
      });
    }
    
    // Migrate keyword insights
    if (guestKeywords.length > 0) {
      await KeywordInsight.updateMany(
        { sessionId, user: null },
        { $set: { user: currentUser._id } }
      );
      migrationResults.keywords = guestKeywords.length;
    }
    
    console.log('✅ Migration completed:', migrationResults);
    
    res.status(200).json({
      success: true,
      message: 'Guest data migrated successfully',
      data: {
        migrated: migrationResults,
        sessionId,
        userId: currentUser._id
      }
    });
    
  } catch (error) {
    console.error('❌ Error migrating guest data:', error);
    res.status(500).json({
      success: false,
      message: 'Error migrating guest data',
      error: error.message
    });
  }
};

module.exports = {
  verifyFirebaseToken,
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  migrateGuestData
};
