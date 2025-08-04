const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Import controllers
const { parseJobDescription } = require('../controllers/jobController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Filter for PDF and DOCX files only
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

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Routes to parse job description
router.post('/parse/file', upload.single('jobDescription'), parseJobDescription);
router.post('/parse/text', parseJobDescription);

module.exports = router;
