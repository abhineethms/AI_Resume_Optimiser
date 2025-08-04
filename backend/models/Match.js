const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

module.exports = mongoose.model('Match', MatchSchema);
