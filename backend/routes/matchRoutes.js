const express = require('express');
const router = express.Router();

// Import controllers
const { compareResumeWithJob, generateCoverLetter, analyzeFeedback } = require('../controllers/matchController');

// Route to compare resume with job description
router.post('/compare', compareResumeWithJob);

// Route to generate cover letter
router.post('/letter/generate', generateCoverLetter);

// Route to analyze resume for feedback
router.post('/feedback/analyze', analyzeFeedback);

module.exports = router;
