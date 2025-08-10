const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Basic authentication fields
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false // Optional when using Firebase Auth
  },
  
  // Firebase authentication fields
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  authProvider: {
    type: String,
    enum: ['email', 'google', 'google.com', 'password', 'facebook.com', 'github.com', 'twitter.com', 'apple.com'],
    required: true
  },
  
  // Profile fields (optional)
  jobTitle: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  
  // Document relations
  resumes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  }],
  jobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription'
  }],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  
  // System fields
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
