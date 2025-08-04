const express = require('express');
const router = express.Router();
const { 
  verifyFirebaseToken, 
  getUserProfile,
  updateUserProfile,
  getUserDashboard
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

// Firebase authentication route
router.post('/verify-token', verifyFirebaseToken);

// Legacy routes - will be deprecated once Firebase auth is fully implemented
// These will continue to work during the transition
router.post('/register', (req, res) => {
  res.status(307).json({ 
    success: false, 
    message: 'Please use Firebase authentication. Direct registration is deprecated.' 
  });
});

router.post('/login', (req, res) => {
  res.status(307).json({ 
    success: false, 
    message: 'Please use Firebase authentication. Direct login is deprecated.' 
  });
});

// Protected routes - authentication required
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/dashboard', protect, getUserDashboard);

module.exports = router;
