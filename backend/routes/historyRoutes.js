const express = require('express');
const router = express.Router();
const { getUserHistory, getUserResume, getUserJobDescription, getUserMatch } = require('../controllers/historyController');
const { protect } = require('../middlewares/authMiddleware');

// Get user's history
router.get('/', protect, getUserHistory);

// Get user's resume by ID
router.get('/resume/:id', protect, getUserResume);

// Get user's job description by ID
router.get('/job/:id', protect, getUserJobDescription);

// Get user's match by ID
router.get('/match/:id', protect, getUserMatch);

module.exports = router;
