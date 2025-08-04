const express = require('express');
const router = express.Router();
const { 
  verifyFirebaseToken, 
  getUserProfile, 
  updateUserProfile,
  getUserDashboard 
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

// Public routes - no authentication needed
router.post('/verify-token', verifyFirebaseToken);

// Protected routes - authentication required
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/dashboard', protect, getUserDashboard);

module.exports = router;
