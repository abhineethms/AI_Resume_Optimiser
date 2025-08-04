const mongoose = require('mongoose');

const JobDescriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Not required initially to allow non-authenticated users to use basic features
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('JobDescription', JobDescriptionSchema);
