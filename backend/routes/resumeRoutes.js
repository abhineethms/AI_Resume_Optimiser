const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Import controllers
const { parseResume, getUserResumes, getResumeById } = require('../controllers/resumeController');
const { optionalAuth } = require('../middlewares/sessionAuth');

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

// Route to parse resume - supports both authenticated users and guest sessions
router.post('/parse', optionalAuth, upload.single('resume'), parseResume);

// Route to get all user resumes - supports both authenticated users and guest sessions
router.get('/', optionalAuth, getUserResumes);

// Route to get specific resume by ID - supports both authenticated users and guest sessions
router.get('/:id', optionalAuth, getResumeById);

module.exports = router;
