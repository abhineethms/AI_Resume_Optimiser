const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Not required initially to allow non-authenticated users to use basic features
  },
  sessionId: {
    type: String,
    // Used for guest users to track their data across browser sessions
    // Either user or sessionId must be present
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  location: {
    type: String
  },
  skills: [{
    type: String
  }],
  languages: [{
    name: String,
    proficiency: String
  }],
  urls: [{
    urlType: String,
    url: String
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    description: String
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: String,
    endDate: String,
    gpa: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    url: String
  }],
  achievements: [{
    title: String,
    date: String,
    description: String
  }],
  projects: [{
    name: String,
    role: String,
    startDate: String,
    endDate: String,
    description: String,
    url: String
  }],
  publications: [{
    title: String,
    publisher: String,
    date: String,
    description: String,
    url: String
  }],
  rawText: {
    type: String,
    required: true
  },
  fileName: {
    type: String
  },
  fileType: {
    type: String
  },
  // S3 storage metadata
  s3Key: {
    type: String,
    required: true
  },
  s3Location: {
    type: String,
    required: true
  },
  s3Bucket: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add compound index for efficient queries by user or session
ResumeSchema.index({ user: 1 });
ResumeSchema.index({ sessionId: 1 });

// Validation to ensure either user or sessionId is present
ResumeSchema.pre('save', function(next) {
  if (!this.user && !this.sessionId) {
    return next(new Error('Either user or sessionId must be provided'));
  }
  next();
});

module.exports = mongoose.model('Resume', ResumeSchema);
