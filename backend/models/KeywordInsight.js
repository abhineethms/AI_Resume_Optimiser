const mongoose = require('mongoose');

const KeywordInsightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Not required initially to allow non-authenticated users to use basic features
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

// Compound index to ensure unique analysis for resume-job combination
KeywordInsightSchema.index({ resumeId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('KeywordInsight', KeywordInsightSchema);
