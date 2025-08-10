const express = require('express');
const router = express.Router();
const { 
  verifyFirebaseToken, 
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  migrateGuestData
} = require('../controllers/authController');
const { requireAuth } = require('../middlewares/sessionAuth');

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
router.get('/profile', requireAuth, getUserProfile);
router.put('/profile', requireAuth, updateUserProfile);
router.get('/dashboard', requireAuth, getUserDashboard);
router.post('/migrate-guest-data', requireAuth, migrateGuestData);

module.exports = router;
