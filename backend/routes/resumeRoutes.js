const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Import controllers
const { parseResume } = require('../controllers/resumeController');

// Configure multer for file uploads
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use /tmp directory in production (Vercel), uploads/ in development
    const uploadPath = process.env.NODE_ENV === 'production' ? '/tmp' : 'uploads/';
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

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

// Create uploads directory if it doesn't exist
// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadPath = process.env.NODE_ENV === 'production' ? '/tmp' : 'uploads/';
if (!fs.existsSync(uploadPath) && process.env.NODE_ENV !== 'production') {
  // No need to create /tmp in production as it already exists in Vercel
  fs.mkdirSync(uploadPath);
}

// Route to parse resume
router.post('/parse', upload.single('resume'), parseResume);

module.exports = router;
