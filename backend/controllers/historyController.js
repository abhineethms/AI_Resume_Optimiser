const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const Match = require('../models/Match');

/**
 * Get user's history of resumes, job descriptions, and matches
 * @route GET /api/history
 * @access Private
 */
const getUserHistory = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user._id;

    // Get user's resumes
    const resumes = await Resume.find({ user: userId }).sort({ createdAt: -1 });

    // Get user's job descriptions
    const jobDescriptions = await JobDescription.find({ user: userId }).sort({ createdAt: -1 });

    // Get user's matches
    const matches = await Match.find({ user: userId })
      .populate('resume', 'name')
      .populate('jobDescription', 'title company')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        resumes,
        jobDescriptions,
        matches
      }
    });
  } catch (error) {
    console.error('Error getting user history:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user history',
      error: error.message
    });
  }
};

/**
 * Get user's resume by ID
 * @route GET /api/history/resume/:id
 * @access Private
 */
const getUserResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Error getting user resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user resume',
      error: error.message
    });
  }
};

/**
 * Get user's job description by ID
 * @route GET /api/history/job/:id
 * @access Private
 */
const getUserJobDescription = async (req, res) => {
  try {
    const jobDescription = await JobDescription.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!jobDescription) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found'
      });
    }

    res.status(200).json({
      success: true,
      data: jobDescription
    });
  } catch (error) {
    console.error('Error getting user job description:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user job description',
      error: error.message
    });
  }
};

/**
 * Get user's match by ID
 * @route GET /api/history/match/:id
 * @access Private
 */
const getUserMatch = async (req, res) => {
  try {
    const match = await Match.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('resume')
      .populate('jobDescription');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    res.status(200).json({
      success: true,
      data: match
    });
  } catch (error) {
    console.error('Error getting user match:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user match',
      error: error.message
    });
  }
};

module.exports = {
  getUserHistory,
  getUserResume,
  getUserJobDescription,
  getUserMatch
};
