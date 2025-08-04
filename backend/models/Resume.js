const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Not required initially to allow non-authenticated users to use basic features
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resume', ResumeSchema);
