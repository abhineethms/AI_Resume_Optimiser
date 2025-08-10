const mongoose = require('mongoose');

const JobDescriptionSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true
  },
  company: {
    type: String
  },
  location: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  requiredSkills: [{
    type: String
  }],
  preferredSkills: [{
    type: String
  }],
  rawText: {
    type: String,
    required: true
  },
  // S3 storage metadata (optional for text-based job descriptions)
  fileName: {
    type: String
  },
  fileType: {
    type: String
  },
  s3Key: {
    type: String
  },
  s3Location: {
    type: String
  },
  s3Bucket: {
    type: String
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
JobDescriptionSchema.index({ user: 1 });
JobDescriptionSchema.index({ sessionId: 1 });

// Validation to ensure either user or sessionId is present
JobDescriptionSchema.pre('save', function(next) {
  if (!this.user && !this.sessionId) {
    return next(new Error('Either user or sessionId must be provided'));
  }
  next();
});

module.exports = mongoose.model('JobDescription', JobDescriptionSchema);
