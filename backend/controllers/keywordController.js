const asyncHandler = require('express-async-handler');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const KeywordInsight = require('../models/KeywordInsight');
const keywordService = require('../services/keyword.service');

/**
 * @desc    Analyze keywords from resume and job description
 * @route   POST /api/keywords/analyze
 * @access  Private
 */
const analyzeKeywords = asyncHandler(async (req, res) => {
  const { resumeId, jobId } = req.body;
  
  // Input validation
  if (!resumeId || !jobId) {
    res.status(400);
    throw new Error('Resume ID and Job ID are required');
  }

  try {
    // Check if we already have an analysis for this resume-job combination
    const existingAnalysis = await KeywordInsight.findOne({
      resumeId,
      jobId
    });

    // Return existing analysis if available and not explicitly requesting a refresh
    if (existingAnalysis && !req.query.refresh) {
      return res.status(200).json({
        success: true,
        message: 'Retrieved existing keyword analysis',
        data: existingAnalysis
      });
    }

    // Fetch resume and job description data
    const resume = await Resume.findById(resumeId);
    const jobDescription = await JobDescription.findById(jobId);

    if (!resume || !jobDescription) {
      res.status(404);
      throw new Error('Resume or job description not found');
    }

    // Perform keyword analysis using the service
    const keywordInsights = await keywordService.analyzeKeywords(
      resume.rawText,
      jobDescription.rawText,
      { 
        resumeId, 
        jobId,
        user: req.userId || resume.user
      }
    );

    res.status(200).json({
      success: true,
      message: 'Keyword analysis completed successfully',
      data: keywordInsights
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to analyze keywords: ${error.message}`);
  }
});

/**
 * @desc    Get keyword analysis history for a resume-job combination
 * @route   GET /api/keywords/history/:resumeId/:jobId
 * @access  Private
 */
const getKeywordHistory = asyncHandler(async (req, res) => {
  const { resumeId, jobId } = req.params;

  try {
    const keywordHistory = await KeywordInsight.findOne({
      resumeId,
      jobId
    });

    if (!keywordHistory) {
      return res.status(404).json({
        success: false,
        message: 'No keyword analysis found for this resume-job combination'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Retrieved keyword analysis history',
      data: keywordHistory
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to fetch keyword history: ${error.message}`);
  }
});

module.exports = {
  analyzeKeywords,
  getKeywordHistory
};
