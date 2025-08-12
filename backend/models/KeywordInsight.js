const mongoose = require('mongoose');

const KeywordInsightSchema = new mongoose.Schema({
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
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
    required: true
  },
  keywords: [{
    word: String,
    cluster: String,
    jdCount: Number,
    resumeCount: Number,
    matchType: {
      type: String,
      enum: ['Exact', 'Partial', 'Missing'],
      default: 'Missing'
    },
    strength: {
      type: String,
      enum: ['Strong', 'Weak', 'Missing'],
      default: 'Missing'
    }
  }],
  clusters: [{
    type: String
  }],
  coverage: {
    type: Map,
    of: {
      type: String,
      enum: ['Full', 'Partial', 'None'],
      default: 'None'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add compound index for efficient queries by user or session
KeywordInsightSchema.index({ user: 1 });
KeywordInsightSchema.index({ sessionId: 1 });

// Compound index to ensure unique analysis for resume-job combination
KeywordInsightSchema.index({ resumeId: 1, jobId: 1 }, { unique: true });

// Validation to ensure either user or sessionId is present
KeywordInsightSchema.pre('save', function(next) {
  if (!this.user && !this.sessionId) {
    return next(new Error('Either user or sessionId must be provided'));
  }
  next();
});

module.exports = mongoose.model('KeywordInsight', KeywordInsightSchema);
