const express = require('express');
const router = express.Router();

// Import controllers
const { compareResumeWithJob, generateCoverLetter, analyzeFeedback } = require('../controllers/matchController');
const { protect } = require('../middlewares/auth');
const Match = require('../models/Match');

// Route to compare resume with job description
router.post('/compare', compareResumeWithJob);

// Route to generate cover letter
router.post('/letter/generate', generateCoverLetter);

// Route to analyze resume for feedback
router.post('/feedback/analyze', analyzeFeedback);

// Get analytics for matches (needs to be before /:id route)
router.get('/analytics', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get basic analytics
    const totalMatches = await Match.countDocuments({ userId });
    
    if (totalMatches === 0) {
      return res.json({
        success: true,
        message: 'Analytics retrieved successfully',
        data: {
          totalMatches: 0,
          averageScore: 0,
          scoreDistribution: [],
          monthlyTrends: []
        }
      });
    }
    
    // Calculate average score
    const avgResult = await Match.aggregate([
      { $match: { userId } },
      { $group: { _id: null, averageScore: { $avg: '$overallScore' } } }
    ]);
    
    const averageScore = avgResult.length > 0 ? avgResult[0].averageScore : 0;
    
    // Get score distribution
    const scoreDistribution = await Match.aggregate([
      { $match: { userId } },
      {
        $bucket: {
          groupBy: '$overallScore',
          boundaries: [0, 60, 80, 100],
          default: 'other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);
    
    res.json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: {
        totalMatches,
        averageScore: Math.round(averageScore),
        scoreDistribution,
        monthlyTrends: [] // Can be implemented later
      }
    });
  } catch (error) {
    console.error('Error fetching match analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get all user matches
router.get('/all', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const matches = await Match.find({ userId })
      .populate('resumeId', 'fileName')
      .populate('jobId', 'title company')
      .sort({ createdAt: -1 })
      .select('overallScore analysis coverLetter feedback createdAt updatedAt');
    
    res.json({
      success: true,
      message: 'Matches retrieved successfully',
      data: matches
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch matches',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get cover letter for a match
router.get('/:id/cover-letter', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const matchId = req.params.id;
    
    const match = await Match.findOne({ _id: matchId, userId }).select('coverLetter');
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }
    
    if (!match.coverLetter) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter not found for this match'
      });
    }
    
    res.json({
      success: true,
      message: 'Cover letter retrieved successfully',
      data: {
        coverLetter: match.coverLetter
      }
    });
  } catch (error) {
    console.error('Error fetching cover letter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cover letter',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get single match by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const matchId = req.params.id;
    
    const match = await Match.findOne({ _id: matchId, userId })
      .populate('resumeId', 'fileName personalInfo')
      .populate('jobId', 'title company description requirements');
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Match retrieved successfully',
      data: match
    });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch match',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete match by ID
router.delete('/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const matchId = req.params.id;
    
    const match = await Match.findOneAndDelete({ _id: matchId, userId });
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Match deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete match',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
