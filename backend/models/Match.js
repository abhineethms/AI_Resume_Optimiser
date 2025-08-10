const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  sessionId: {
    type: String,
    // Used for guest users to track their data across browser sessions
    // Either user or sessionId must be present
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  jobDescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
    required: true
  },
  matchPercentage: {
    type: Number,
    required: true
  },
  matchedSkills: [{
    type: String
  }],
  missingSkills: [{
    type: String
  }],
  summary: {
    type: String,
    required: true
  },
  coverLetter: {
    type: String
  },
  feedback: {
    strengths: [String],
    weaknesses: [String],
    tips: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add compound index for efficient queries by user or session
MatchSchema.index({ user: 1 });
MatchSchema.index({ sessionId: 1 });

// Validation to ensure either user or sessionId is present
MatchSchema.pre('save', function(next) {
  if (!this.user && !this.sessionId) {
    return next(new Error('Either user or sessionId must be provided'));
  }
  next();
});

module.exports = mongoose.model('Match', MatchSchema);
