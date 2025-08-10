const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Import controllers
const { parseJobDescription, getUserJobs, getJobById } = require('../controllers/jobController');
const { optionalAuth } = require('../middlewares/sessionAuth');

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

// Routes to parse job description - supports both authenticated users and guest sessions
router.post('/parse/file', optionalAuth, upload.single('jobDescription'), parseJobDescription);
router.post('/parse/text', optionalAuth, parseJobDescription);

// Route to get all user job descriptions - supports both authenticated users and guest sessions
router.get('/', optionalAuth, getUserJobs);

// Route to get specific job description by ID - supports both authenticated users and guest sessions
router.get('/:id', optionalAuth, getJobById);

module.exports = router;
