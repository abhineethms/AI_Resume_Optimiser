const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Import controllers
const { parseJobDescription } = require('../controllers/jobController');
const { protect } = require('../middlewares/auth');
const JobDescription = require('../models/JobDescription');

// Configure multer for S3 upload (memory storage)
const storage = multer.memoryStorage();

// Filter for PDF, DOCX, and TXT files
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['.pdf', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, and TXT files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes to parse job description
router.post('/parse/file', upload.single('jobDescription'), parseJobDescription);
router.post('/parse/text', parseJobDescription);

// Get all user job descriptions
router.get('/all', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const jobs = await JobDescription.find({ userId })
      .sort({ createdAt: -1 })
      .select('title company description requirements responsibilities benefits location salaryRange createdAt updatedAt');
    
    res.json({
      success: true,
      message: 'Job descriptions retrieved successfully',
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job descriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get single job description by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.id;
    
    const job = await JobDescription.findOne({ _id: jobId, userId });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Job description retrieved successfully',
      data: job
    });
  } catch (error) {
    console.error('Error fetching job description:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job description',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete job description by ID
router.delete('/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.id;
    
    const job = await JobDescription.findOneAndDelete({ _id: jobId, userId });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Job description deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job description:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job description',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
