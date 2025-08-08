const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const Match = require('../models/Match');
const KeywordInsight = require('../models/KeywordInsight');
const { protect } = require('../middlewares/auth');

// Get dashboard statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate statistics from all collections
    const [resumeCount, jobCount, matchCount, keywordCount] = await Promise.all([
      Resume.countDocuments({ userId }),
      JobDescription.countDocuments({ userId }),
      Match.countDocuments({ userId }),
      KeywordInsight.countDocuments({ userId })
    ]);

    // Get matches with cover letters
    const matchesWithCoverLetters = await Match.countDocuments({ 
      userId, 
      coverLetter: { $exists: true, $ne: null, $ne: '' }
    });

    // Calculate average match score
    const matchAggregation = await Match.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$overallScore' },
          maxScore: { $max: '$overallScore' },
          minScore: { $min: '$overallScore' }
        }
      }
    ]);

    const matchStats = matchAggregation.length > 0 ? matchAggregation[0] : {
      averageScore: 0,
      maxScore: 0,
      minScore: 0
    };

    const stats = {
      resumesUploaded: resumeCount,
      jobsAnalyzed: jobCount,
      matchesCreated: matchCount,
      coverLettersGenerated: matchesWithCoverLetters,
      keywordAnalyses: keywordCount,
      averageMatchScore: Math.round(matchStats.averageScore || 0),
      bestMatchScore: matchStats.maxScore || 0,
      totalProcessingTime: 0, // Can be calculated based on processing logs
      successfulUploads: resumeCount + jobCount
    };

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get recent activities
router.get('/activities', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    // Get recent activities from different collections
    const [recentResumes, recentJobs, recentMatches] = await Promise.all([
      Resume.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('fileName createdAt')
        .lean(),
      
      JobDescription.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('title company createdAt')
        .lean(),
      
      Match.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('resumeId', 'fileName')
        .populate('jobId', 'title company')
        .select('overallScore createdAt resumeId jobId')
        .lean()
    ]);

    // Combine and format activities
    const activities = [];

    recentResumes.forEach(resume => {
      activities.push({
        type: 'resume',
        description: `Uploaded resume: ${resume.fileName}`,
        timestamp: resume.createdAt,
        data: resume
      });
    });

    recentJobs.forEach(job => {
      activities.push({
        type: 'job',
        description: `Added job: ${job.title} at ${job.company}`,
        timestamp: job.createdAt,
        data: job
      });
    });

    recentMatches.forEach(match => {
      const resumeName = match.resumeId?.fileName || 'Resume';
      const jobTitle = match.jobId?.title || 'Job';
      const company = match.jobId?.company || 'Company';
      
      activities.push({
        type: 'match',
        description: `Created match: ${resumeName} vs ${jobTitle} at ${company} (${match.overallScore}%)`,
        timestamp: match.createdAt,
        data: match
      });
    });

    // Sort all activities by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, limit);

    res.json({
      success: true,
      message: 'Recent activities retrieved successfully',
      data: limitedActivities
    });

  } catch (error) {
    console.error('Dashboard activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent activities',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get recent documents summary
router.get('/recent-documents', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;

    const [recentResumes, recentJobs, recentMatches] = await Promise.all([
      Resume.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('fileName personalInfo.name skills.technical createdAt fileUrl')
        .lean(),
      
      JobDescription.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('title company location requirements.technical createdAt')
        .lean(),
      
      Match.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('resumeId', 'fileName')
        .populate('jobId', 'title company')
        .select('overallScore analysis createdAt')
        .lean()
    ]);

    res.json({
      success: true,
      message: 'Recent documents retrieved successfully',
      data: {
        resumes: recentResumes,
        jobs: recentJobs,
        matches: recentMatches
      }
    });

  } catch (error) {
    console.error('Dashboard recent documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent documents',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get analytics data
router.get('/analytics', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get match score distribution
    const scoreDistribution = await Match.aggregate([
      { $match: { userId } },
      {
        $bucket: {
          groupBy: '$overallScore',
          boundaries: [0, 40, 60, 80, 100],
          default: 'other',
          output: {
            count: { $sum: 1 },
            averageScore: { $avg: '$overallScore' }
          }
        }
      }
    ]);

    // Get skills analysis
    const skillsAnalysis = await Resume.aggregate([
      { $match: { userId } },
      { $unwind: '$skills.technical' },
      {
        $group: {
          _id: '$skills.technical',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get monthly activity trends
    const monthlyTrends = await Match.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          matchesCount: { $sum: 1 },
          averageScore: { $avg: '$overallScore' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Get top performing resume
    const topResume = await Match.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$resumeId',
          averageScore: { $avg: '$overallScore' },
          matchCount: { $sum: 1 }
        }
      },
      { $sort: { averageScore: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'resumes',
          localField: '_id',
          foreignField: '_id',
          as: 'resumeData'
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Analytics data retrieved successfully',
      data: {
        scoreDistribution,
        skillsAnalysis,
        monthlyTrends,
        topResume: topResume.length > 0 ? topResume[0] : null
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get user insights and recommendations
router.get('/insights', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's match history for insights
    const matches = await Match.find({ userId })
      .populate('resumeId', 'skills')
      .populate('jobId', 'requirements')
      .select('overallScore analysis')
      .lean();

    const insights = {
      totalMatches: matches.length,
      averageScore: 0,
      commonStrengths: [],
      commonGaps: [],
      recommendations: []
    };

    if (matches.length > 0) {
      // Calculate average score
      insights.averageScore = Math.round(
        matches.reduce((sum, match) => sum + match.overallScore, 0) / matches.length
      );

      // Aggregate common strengths and gaps
      const strengthsMap = new Map();
      const gapsMap = new Map();

      matches.forEach(match => {
        if (match.analysis) {
          match.analysis.strengths?.forEach(strength => {
            strengthsMap.set(strength, (strengthsMap.get(strength) || 0) + 1);
          });

          match.analysis.gaps?.forEach(gap => {
            gapsMap.set(gap, (gapsMap.get(gap) || 0) + 1);
          });
        }
      });

      // Get top 5 most common strengths and gaps
      insights.commonStrengths = Array.from(strengthsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([strength, count]) => ({ strength, count }));

      insights.commonGaps = Array.from(gapsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([gap, count]) => ({ gap, count }));

      // Generate recommendations based on performance
      if (insights.averageScore < 60) {
        insights.recommendations.push('Consider updating your resume with more relevant keywords');
        insights.recommendations.push('Focus on highlighting technical skills that match job requirements');
      } else if (insights.averageScore < 80) {
        insights.recommendations.push('Your resumes are performing well, consider fine-tuning for specific roles');
        insights.recommendations.push('Add more quantifiable achievements to your experience section');
      } else {
        insights.recommendations.push('Excellent performance! Your resumes are well-optimized');
        insights.recommendations.push('Consider creating specialized versions for different industries');
      }
    }

    res.json({
      success: true,
      message: 'User insights retrieved successfully',
      data: insights
    });

  } catch (error) {
    console.error('Dashboard insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user insights',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;