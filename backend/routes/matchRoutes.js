const express = require('express');
const router = express.Router();

// Import controllers
const { compareResumeWithJob, generateCoverLetter, analyzeFeedback } = require('../controllers/matchController');
const { optionalAuth } = require('../middlewares/sessionAuth');

// Route to compare resume with job description - supports both authenticated users and guest sessions
router.post('/compare', optionalAuth, compareResumeWithJob);

// Route to generate cover letter - supports both authenticated users and guest sessions
router.post('/letter/generate', optionalAuth, generateCoverLetter);

// Route to analyze resume for feedback - supports both authenticated users and guest sessions
router.post('/feedback/analyze', optionalAuth, analyzeFeedback);

module.exports = router;
