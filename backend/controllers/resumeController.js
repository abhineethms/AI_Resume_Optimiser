const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Resume = require('../models/Resume');
const User = require('../models/User');
const openai = require('../config/openai');
const { uploadToS3, downloadAndExtractText } = require('../utils/s3Utils');

/**
 * Parse a resume file (PDF or DOCX) and extract structured information
 * @route POST /api/resume/parse
 * @access Public
 */
const parseResume = async (req, res) => {
  console.log('[Resume Parser] Starting resume parsing process');
  try {
    // Check if file was uploaded
    if (!req.file) {
      console.log('[Resume Parser] No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file'
      });
    }

    console.log(`[Resume Parser] File received: ${req.file.originalname}, Size: ${req.file.size} bytes`);
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    // Generate identifier for S3 upload (user ID or session ID)
    const uploadIdentifier = req.user?.firebaseUid || req.sessionId || 'anonymous';
    
    // Upload file to S3
    console.log('[Resume Parser] Uploading file to S3');
    const s3Result = await uploadToS3(
      req.file.buffer, 
      req.file.originalname, 
      uploadIdentifier, 
      'resume'
    );
    
    // Extract text from file buffer based on file type
    let text = '';
    
    if (fileExtension === '.pdf') {
      console.log('[Resume Parser] Processing PDF file');
      try {
        const pdfData = await pdfParse(req.file.buffer);
        text = pdfData.text;
        console.log(`[Resume Parser] PDF parsed successfully, extracted ${text.length} characters`);
      } catch (pdfError) {
        console.error('[Resume Parser] PDF parsing error:', pdfError);
        throw pdfError;
      }
    } else if (fileExtension === '.docx') {
      console.log('[Resume Parser] Processing DOCX file');
      try {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        text = result.value;
        console.log(`[Resume Parser] DOCX parsed successfully, extracted ${text.length} characters`);
      } catch (docxError) {
        console.error('[Resume Parser] DOCX parsing error:', docxError);
        throw docxError;
      }
    } else {
      console.log(`[Resume Parser] Unsupported file format: ${fileExtension}`);
      return res.status(400).json({
        success: false,
        message: 'Unsupported file format. Please upload a PDF or DOCX file.'
      });
    }

    console.log('[Resume Parser] Starting OpenAI extraction');
    // Use OpenAI to extract structured information from the resume text
    try {
      const structuredData = await extractResumeData(text);
      console.log('[Resume Parser] OpenAI extraction completed successfully');

      // Create a new resume document in the database
      console.log('[Resume Parser] Creating resume document in database');
      console.log('[Resume Parser] Session type:', req.sessionType, 'Session identifier:', req.sessionIdentifier);
      
      const resume = new Resume({
        user: req.user?._id || null,
        sessionId: req.sessionId || null,
        name: structuredData.name,
        email: structuredData.email,
        phone: structuredData.phone,
        location: structuredData.location,
        skills: structuredData.skills,
        languages: structuredData.languages || [],
        urls: structuredData.urls || [],
        experience: structuredData.experience,
        education: structuredData.education,
        certifications: structuredData.certifications || [],
        achievements: structuredData.achievements || [],
        projects: structuredData.projects || [],
        publications: structuredData.publications || [],
        rawText: text,
        fileName: req.file.originalname,
        fileType: fileExtension,
        // S3 metadata
        s3Key: s3Result.key,
        s3Location: s3Result.location,
        s3Bucket: s3Result.bucket,
        fileSize: req.file.size,
        uploadDate: new Date(),
        lastAccessed: new Date()
      });

      // Save the resume to the database
      console.log('[Resume Parser] Saving resume to database');
      await resume.save();
      console.log(`[Resume Parser] Resume saved with ID: ${resume._id}`);

      // Update user's resumes array if user is authenticated
      if (req.user?._id) {
        console.log('[Resume Parser] Updating user resumes array');
        await User.findByIdAndUpdate(
          req.user._id,
          { $addToSet: { resumes: resume._id } }
        );
        console.log('[Resume Parser] User resumes array updated');
      }

      // Return the structured resume data
      console.log('[Resume Parser] Sending successful response to client');
      res.status(200).json({
        success: true,
        message: 'Resume parsed successfully',
        data: {
          resumeId: resume._id,
          ...structuredData
        }
      });
    } catch (aiError) {
      console.error('[Resume Parser] AI extraction error:', aiError);
      throw aiError;
    }
  } catch (error) {
    console.error('[Resume Parser] Error parsing resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error parsing resume',
      error: error.message
    });
  }
};

/**
 * Use OpenAI to extract structured information from resume text
 * @param {string} text - Raw text extracted from resume
 * @returns {object} - Structured resume data
 */
const extractResumeData = async (text) => {
  console.log('[Resume Parser] Starting OpenAI extraction');
  try {
    const prompt = `
      Extract the following information from this resume:
      1. Full Name
      2. Email Address
      3. Phone Number
      4. Location/Address
      5. Skills (as a list)
      6. Languages (with proficiency levels if available)
      7. Online Profiles (LinkedIn, GitHub, Portfolio, etc.)
      8. Work Experience (for each position: title, company, location, dates, description)
      9. Education (for each institution: name, degree, field, dates, GPA if available)
      10. Certifications (name, issuer, date, URL if available)
      11. Achievements (title, date, description)
      12. Projects (name, role, dates, description, URL if available)
      13. Publications (title, publisher, date, description, URL if available)

      Format the output as a valid JSON object with the following structure:
      {
        "name": "Full Name",
        "email": "email@example.com",
        "phone": "123-456-7890",
        "location": "City, State, Country",
        "skills": ["Skill 1", "Skill 2", ...],
        "languages": [
          {
            "name": "Language Name",
            "proficiency": "Proficiency Level (e.g., Fluent, Native, Intermediate, etc.)"
          },
          ...
        ],
        "urls": [
          {
            "urlType": "LinkedIn/GitHub/Portfolio/etc.",
            "url": "https://example.com"
          },
          ...
        ],
        "experience": [
          {
            "title": "Job Title",
            "company": "Company Name",
            "location": "City, State",
            "startDate": "Month Year",
            "endDate": "Month Year or Present",
            "description": "Job description"
          },
          ...
        ],
        "education": [
          {
            "institution": "University Name",
            "degree": "Degree Type",
            "field": "Field of Study",
            "startDate": "Month Year",
            "endDate": "Month Year",
            "gpa": "GPA if available"
          },
          ...
        ],
        "certifications": [
          {
            "name": "Certification Name",
            "issuer": "Issuing Organization",
            "date": "Month Year",
            "url": "URL to certificate if available"
          },
          ...
        ],
        "achievements": [
          {
            "title": "Achievement Title",
            "date": "Month Year",
            "description": "Description of the achievement"
          },
          ...
        ],
        "projects": [
          {
            "name": "Project Name",
            "role": "Your Role",
            "startDate": "Month Year",
            "endDate": "Month Year or Present",
            "description": "Project description",
            "url": "Project URL if available"
          },
          ...
        ],
        "publications": [
          {
            "title": "Publication Title",
            "publisher": "Publisher Name",
            "date": "Month Year",
            "description": "Brief description",
            "url": "URL to publication if available"
          },
          ...
        ]
      }

      Resume text:
      ${text}
    `;

    console.log('[Resume Parser] Sending request to OpenAI');
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a resume parsing assistant. Extract structured information from resumes accurately. Be thorough and look for all sections including skills, experience, education, certifications, projects, publications, and achievements." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.2,
      max_tokens: 3000
    });

    console.log('[Resume Parser] Received response from OpenAI');
    // Parse the response from OpenAI
    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      console.log('[Resume Parser] Successfully extracted structured data from OpenAI response');
      return JSON.parse(jsonMatch[0]);
    } else {
      console.error('[Resume Parser] Failed to extract structured data from OpenAI response');
      throw new Error('Failed to extract structured data from resume');
    }
  } catch (error) {
    console.error('[Resume Parser] Error extracting resume data with OpenAI:', error);
    throw error;
  }
};

/**
 * Get all resumes for a user or session
 * @route GET /api/resume/
 * @access Public (with session support)
 */
const getUserResumes = async (req, res) => {
  try {
    let query = {};
    
    if (req.user) {
      // Authenticated user
      query.user = req.user._id;
    } else if (req.sessionId) {
      // Guest session
      query.sessionId = req.sessionId;
      query.user = null;
    } else {
      // No user or session
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    const resumes = await Resume.find(query)
      .sort({ createdAt: -1 })
      .select('title fileName skills experience education summary createdAt s3Key s3Url');
    
    res.status(200).json({
      success: true,
      data: resumes
    });
  } catch (error) {
    console.error('Error getting user resumes:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving resumes',
      error: error.message
    });
  }
};

/**
 * Get a specific resume by ID
 * @route GET /api/resume/:id
 * @access Public (with session support)
 */
const getResumeById = async (req, res) => {
  try {
    const resumeId = req.params.id;
    let query = { _id: resumeId };
    
    if (req.user) {
      // Authenticated user - check ownership
      query.user = req.user._id;
    } else if (req.sessionId) {
      // Guest session - check session ownership
      query.sessionId = req.sessionId;
      query.user = null;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied - no session or authentication'
      });
    }
    
    const resume = await Resume.findOne(query);
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or access denied'
      });
    }
    
    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Error getting resume by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving resume',
      error: error.message
    });
  }
};

module.exports = {
  parseResume,
  getUserResumes,
  getResumeById
};
