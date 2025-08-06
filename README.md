# AI Resume Optimizer

An intelligent resume optimization platform that leverages AI to help job seekers improve their resumes, match them with relevant job descriptions, and generate tailored cover letters.

## 🚀 Features

- **Resume Parsing & Analysis**: Upload and parse PDF/Word resumes with intelligent content extraction
- **AI-Powered Optimization**: Get suggestions to improve your resume using OpenAI GPT
- **Job Matching**: Match your resume against job descriptions with compatibility scores
- **Keyword Insights**: Identify missing keywords and skills for specific job roles
- **Cover Letter Generation**: Create tailored cover letters based on job requirements
- **User Dashboard**: Track optimization history and manage multiple resumes
- **Firebase Authentication**: Secure user registration and login system

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Material-UI (MUI)** - Component library and styling
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Firebase Auth** - Authentication
- **Axios** - HTTP client
- **Chart.js** - Data visualization

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database and ODM
- **Firebase Admin SDK** - Authentication verification
- **OpenAI API** - AI-powered content analysis
- **Multer** - File upload handling
- **PDF-Parse & Mammoth** - Document parsing
- **JWT** - Token-based authentication

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Firebase Project** with Authentication enabled
- **OpenAI API Key**

## 📦 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AI_Resume_Optimiser
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create `.env` file in the backend directory with the following variables:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ai-resume-optimizer
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-resume-optimizer

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
```

Create `.env` file in the frontend directory with the following variables:
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id

# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Start the Backend Server

From the backend directory:
```bash
# Development mode with auto-restart
npm run dev

# OR production mode
npm start
```

The backend server will start on `http://localhost:5000`

### Start the Frontend Application

From the frontend directory:
```bash
npm start
```

The frontend application will start on `http://localhost:3000`

### Access the Application

Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
AI_Resume_Optimiser/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   ├── firebase-config.js    # Firebase Admin setup
│   │   └── openai.js            # OpenAI configuration
│   ├── controllers/             # Route controllers
│   ├── middlewares/             # Authentication & error handling
│   ├── models/                  # MongoDB schemas
│   ├── routes/                  # API routes
│   ├── services/               # Business logic
│   ├── utils/                  # Utility functions
│   ├── app.js                  # Express app configuration
│   ├── server.js               # Server entry point
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── features/           # Redux feature slices
│   │   ├── firebase/           # Firebase configuration
│   │   ├── pages/              # Page components
│   │   ├── redux/              # Redux store and slices
│   │   ├── services/           # API service functions
│   │   ├── utils/              # Utility functions
│   │   ├── App.jsx             # Main App component
│   │   └── index.js            # React entry point
│   └── package.json
├── vercel.json                 # Vercel deployment config
└── README.md
```

## 🔧 Development Commands

### Backend Commands
```bash
cd backend

# Start development server with auto-restart
npm run dev

# Start production server
npm start

# Run tests
npm test
```

### Frontend Commands
```bash
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (not recommended)
npm run eject
```

## 🌐 API Endpoints

The backend provides the following main API endpoints:

- **Authentication**: `/api/auth/*`
- **Resume Management**: `/api/resumes/*`
- **Job Matching**: `/api/jobs/*`
- **Keyword Analysis**: `/api/keywords/*`
- **Match Results**: `/api/matches/*`
- **User History**: `/api/history/*`

## 🔐 Environment Variables Guide

### Required Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google providers
3. Generate a service account key for the backend
4. Get the web app configuration for the frontend

### Required OpenAI Setup
1. Create an account at [OpenAI](https://platform.openai.com/)
2. Generate an API key from the API section
3. Ensure you have sufficient credits for API usage

### Required MongoDB Setup
1. Install MongoDB locally OR use [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database named `ai-resume-optimizer`
3. Update the connection string in your backend `.env` file

## 🚦 Usage

1. **Register/Login**: Create an account or sign in with Google
2. **Upload Resume**: Upload your resume in PDF or Word format
3. **Parse Resume**: The system will extract and analyze your resume content
4. **Add Job Description**: Enter a job description you're interested in
5. **Get Matching Results**: View compatibility scores and recommendations
6. **Optimize Resume**: Get AI-powered suggestions for improvement
7. **Generate Cover Letter**: Create a tailored cover letter for the position
8. **View History**: Track all your optimization sessions in the dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Important Notes

- Ensure both frontend and backend servers are running for full functionality
- The frontend is configured to proxy API requests to the backend on port 5000
- Make sure your MongoDB database is running and accessible
- Keep your API keys secure and never commit them to version control
- The application requires internet connectivity for OpenAI and Firebase services

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend CORS configuration allows requests from the frontend origin
2. **Database Connection**: Verify MongoDB is running and the connection string is correct
3. **Firebase Auth**: Check that Firebase configuration is correct in both frontend and backend
4. **OpenAI API**: Verify your OpenAI API key is valid and has sufficient credits
5. **Port Conflicts**: Ensure ports 3000 and 5000 are available on your system

### Getting Help

If you encounter issues:
1. Check the browser console for frontend errors
2. Check the backend server logs for API errors
3. Verify all environment variables are set correctly
4. Ensure all services (MongoDB, Firebase, OpenAI) are properly configured

---

Happy optimizing! 🎯