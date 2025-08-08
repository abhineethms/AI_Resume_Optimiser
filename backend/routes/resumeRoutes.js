const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Import controllers
const { parseResume } = require('../controllers/resumeController');
const { protect } = require('../middlewares/auth');
const Resume = require('../models/Resume');

// Configure multer for S3 upload (memory storage)
const storage = multer.memoryStorage();

// Filter for PDF and DOCX files only
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Route to parse resume
router.post('/parse', upload.single('resume'), parseResume);

// Get all user resumes
router.get('/all', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const resumes = await Resume.find({ userId })
      .sort({ createdAt: -1 })
      .select('fileName personalInfo skills experience education projects createdAt updatedAt fileUrl s3Key');
    
    res.json({
      success: true,
      message: 'Resumes retrieved successfully',
      data: resumes
    });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resumes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get single resume by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const resumeId = req.params.id;
    
    const resume = await Resume.findOne({ _id: resumeId, userId });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Resume retrieved successfully',
      data: resume
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete resume by ID
router.delete('/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const resumeId = req.params.id;
    
    const resume = await Resume.findOneAndDelete({ _id: resumeId, userId });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
