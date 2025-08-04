const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  analyzeKeywords,
  getKeywordHistory
} = require('../controllers/keywordController');

// POST /api/keywords/analyze - Analyze keywords from resume and job description
// Temporarily removed protect middleware for testing
router.post('/analyze', analyzeKeywords);

// GET /api/keywords/history/:resumeId/:jobId - Get stored keyword analysis
// Temporarily removed protect middleware for testing
router.get('/history/:resumeId/:jobId', getKeywordHistory);

module.exports = router;
