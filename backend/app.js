const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[SERVER] ${req.method} ${req.originalUrl} - Request started`);
  
  // Log request body for debugging, but don't log file uploads
  if (req.method !== 'GET' && !req.originalUrl.includes('/parse')) {
    console.log(`[SERVER] Request body:`, req.body);
  } else if (req.originalUrl.includes('/parse')) {
    console.log(`[SERVER] File upload request received`);
  }
  
  // Capture response data
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - start;
    console.log(`[SERVER] ${req.method} ${req.originalUrl} - Response: ${res.statusCode} (${duration}ms)`);
    return originalSend.call(this, body);
  };
  
  // Handle connection close/error
  req.on('close', () => {
    if (!res.writableEnded) {
      console.error(`[SERVER] ${req.method} ${req.originalUrl} - Connection closed by client before response was completed`);
    }
  });
  
  next();
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-optimizer', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Import Routes
const resumeRoutes = require('./routes/resumeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const matchRoutes = require('./routes/matchRoutes');
const authRoutes = require('./routes/authRoutes');
const historyRoutes = require('./routes/historyRoutes');
const keywordRoutes = require('./routes/keywordRoutes');

// Use Routes
app.use('/api/resume', resumeRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/keywords', keywordRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'AI Resume Optimizer API is running' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;