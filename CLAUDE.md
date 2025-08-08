# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend Development
```bash
# In /backend directory
npm run dev          # Start development server with nodemon on port 5000
npm start           # Start production server 
node test-db.js     # Test MongoDB connection
node test-api.js    # Test API endpoints with sample data
```

### Frontend Development  
```bash
# In /frontend directory
npm start           # Start React development server on port 3000
npm run build       # Create production build
npm test            # Run Jest tests (note: limited test coverage exists)
```

### Full Stack Development
- Backend runs on port 5000, frontend on port 3000
- Frontend proxy configuration automatically routes `/api/*` to backend
- Both servers must be running for full functionality

## Architecture Overview

### Authentication Flow
This application uses a **hybrid Firebase-MongoDB authentication system**:

1. **Frontend**: Firebase Auth handles user authentication (Google OAuth + email/password)
2. **Token Management**: Axios interceptors automatically attach Firebase ID tokens to requests
3. **Backend Verification**: Firebase Admin SDK verifies tokens and creates/syncs MongoDB user records
4. **State Management**: User state synchronized between Firebase Auth and Redux store

**Key Pattern**: Authentication state flows from Firebase → Redux → API requests → MongoDB user lookup/creation

### File Processing Pipeline
The core feature follows this workflow:
```
File Upload (Multer Memory) → S3 Storage → Text Extraction (pdf-parse/mammoth) → AI Analysis (OpenAI) → Structured Storage (MongoDB + S3 metadata)
```

**Cloud Storage**: 
- Files uploaded to AWS S3 for persistent storage
- Multer memory storage for serverless compatibility
- S3 metadata stored in MongoDB for user history/dashboard

**Text Extraction**: 
- PDFs use `pdf-parse` library with file buffers
- DOCX files use `mammoth` for raw text extraction from buffers
- 5MB file size limit enforced

**AI Processing**:
- OpenAI GPT-4 converts raw text to structured JSON
- Defensive JSON parsing with regex extraction from AI responses
- Comprehensive fallback handling for malformed AI responses

### Data Architecture
**MongoDB Collections**:
- `User`: Firebase UID linking to user documents
- `Resume`: Parsed resume data with embedded skills/experience arrays
- `JobDescription`: Processed job posting data
- `Match`: Relationships between resumes/jobs with AI-generated analysis
- `KeywordInsight`: Skills gap analysis results

**Key Relationship Pattern**: Users can have multiple resumes/jobs, matches link these with AI analysis results.

### Redux State Management
Uses Redux Toolkit with normalized slice pattern:
```javascript
// Main slices: auth, resume, job, match, keyword, ui
// All API calls wrapped in createAsyncThunk for consistent loading states
// Defensive data extraction with fallbacks throughout reducers
```

### API Design Patterns
**RESTful Structure**:
- `/api/auth/*` - Authentication endpoints
- `/api/resume/*` - Resume parsing and management  
- `/api/job/*` - Job description processing
- `/api/match/*` - AI-powered matching and analysis
- `/api/history/*` - User document history
- `/api/keywords/*` - Skills analysis

**Response Format**: All endpoints return `{ success, message, data, error? }` structure

**Error Handling**: Centralized middleware with environment-aware stack traces

### AI Integration Patterns
**OpenAI Processing**:
- Structured prompts for different analysis types (parsing, matching, feedback)
- JSON response parsing with regex fallback extraction
- Rate limiting considerations built into service layer

**Prompt Engineering**: Located in `/backend/utils/promptUtils.js` - handles different analysis types with specialized prompts

### Environment Configuration
**Backend (.env)**:
- `MONGODB_URI` - Database connection
- `OPENAI_API_KEY` - AI processing
- `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` - Firebase Admin
- `JWT_SECRET` - Token signing
- `AWS_ACCESS_KEY_ID` - AWS S3 access key
- `AWS_SECRET_ACCESS_KEY` - AWS S3 secret key
- `AWS_REGION` - AWS region (default: us-east-1)
- `AWS_S3_BUCKET` - S3 bucket name for file storage

**Frontend (.env)**:
- `REACT_APP_FIREBASE_*` - Firebase client config
- `REACT_APP_API_URL` - Backend API endpoint (defaults to localhost:5000)

### Error Handling Patterns
1. **Frontend**: Axios interceptors handle token refresh and 401 redirects
2. **Redux**: Loading/error states in all async thunks  
3. **Backend**: Express error middleware with detailed logging
4. **AI Processing**: Graceful degradation when OpenAI responses are malformed

### Development Workflow
1. Ensure MongoDB is running locally or use MongoDB Atlas connection string
2. Configure Firebase project with Authentication enabled
3. Set up OpenAI API key with sufficient credits
4. Start backend first (`npm run dev`), then frontend (`npm start`)
5. Access application at `http://localhost:3000`

### Testing Infrastructure
- Basic API testing available via `test-api.js` 
- Database connectivity testing via `test-db.js`
- Frontend uses Create React App testing setup (limited coverage)
- No comprehensive test suite currently implemented

### Deployment Considerations
- Vercel configuration for serverless deployment included
- Stateless architecture suitable for horizontal scaling
- AWS S3 cloud storage eliminates filesystem dependencies
- Environment-aware configurations throughout codebase
- S3 integration enables user file history and dashboard features