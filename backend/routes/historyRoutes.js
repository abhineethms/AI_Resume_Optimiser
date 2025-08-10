const express = require('express');
const router = express.Router();
const { getUserHistory, getUserResume, getUserJobDescription, getUserMatch } = require('../controllers/historyController');
const { requireAuth } = require('../middlewares/sessionAuth');

// Get user's history
router.get('/', requireAuth, getUserHistory);

// Get user's resume by ID
router.get('/resume/:id', requireAuth, getUserResume);

// Get user's job description by ID
router.get('/job/:id', requireAuth, getUserJobDescription);

// Get user's match by ID
router.get('/match/:id', requireAuth, getUserMatch);

module.exports = router;
