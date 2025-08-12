const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const JobDescription = require('../models/JobDescription');
const User = require('../models/User');
const openai = require('../config/openai');
const { uploadToS3 } = require('../utils/s3Utils');

/**
 * Parse a job description file or text and extract structured information
 * @route POST /api/job/parse
 * @access Public
 */
const parseJobDescription = async (req, res) => {
  try {
    let text = '';
    let s3Result = null;
    let fileInfo = null;
    
    // Check if job description was uploaded as a file or text
    if (req.file) {
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      const userId = req.user?.uid || 'anonymous';
      
      // Upload file to S3
      console.log('[Job Parser] Uploading file to S3');
      s3Result = await uploadToS3(
        req.file.buffer, 
        req.file.originalname, 
        userId, 
        'job'
      );
      
      fileInfo = {
        fileName: req.file.originalname,
        fileType: fileExtension,
        fileSize: req.file.size
      };
      
      // Extract text from file buffer based on file type
      if (fileExtension === '.pdf') {
        const pdfData = await pdfParse(req.file.buffer);
        text = pdfData.text;
      } else if (fileExtension === '.docx') {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        text = result.value;
      } else if (fileExtension === '.txt') {
        text = req.file.buffer.toString('utf8');
      } else {
        return res.status(400).json({
          success: false,
          message: 'Unsupported file format. Please upload a PDF, DOCX, or TXT file.'
        });
      }
    } else if (req.body.text) {
      // Use text directly from request body
      // Handle both string and object formats
      const textContent = typeof req.body.text === 'string' ? req.body.text : 
                         (req.body.text.text ? req.body.text.text : JSON.stringify(req.body.text));
      
      // Normalize text to handle various formatting issues
      text = textContent
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\n{3,}/g, '\n\n') // Replace excessive line breaks with double line breaks
        .trim(); // Remove leading/trailing whitespace
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide a job description as a file or text'
      });
    }

    // Use OpenAI to extract structured information from the job description
    const structuredData = await extractJobData(text);

    // Create a new job description document in the database
    const jobDescription = new JobDescription({
      user: req.user?._id || null,
      sessionId: req.sessionId || null,
      title: structuredData.title,
      company: structuredData.company,
      location: structuredData.location,
      description: structuredData.description,
      requiredSkills: structuredData.requiredSkills,
      preferredSkills: structuredData.preferredSkills,
      rawText: text,
      // S3 metadata (only if file was uploaded)
      ...(fileInfo && {
        fileName: fileInfo.fileName,
        fileType: fileInfo.fileType,
        fileSize: fileInfo.fileSize
      }),
      ...(s3Result && {
        s3Key: s3Result.key,
        s3Location: s3Result.location,
        s3Bucket: s3Result.bucket
      }),
      uploadDate: new Date(),
      lastAccessed: new Date()
    });

    // Save the job description to the database
    await jobDescription.save();

    // Update user's jobs array if user is authenticated
    if (req.user?._id) {
      await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { jobs: jobDescription._id } }
      );
    }

    // Return the structured job description data
    res.status(200).json({
      success: true,
      message: 'Job description parsed successfully',
      data: {
        jobId: jobDescription._id,
        ...structuredData
      }
    });
  } catch (error) {
    console.error('Error parsing job description:', error);
    res.status(500).json({
      success: false,
      message: 'Error parsing job description',
      error: error.message
    });
  }
};

/**
 * Use OpenAI to extract structured information from job description text
 * @param {string} text - Raw text extracted from job description
 * @returns {object} - Structured job description data
 */
const extractJobData = async (text) => {
  try {
    const prompt = `
      Extract the following information from this job description:
      1. Job Title
      2. Company Name
      3. Location
      4. Job Description (summary)
      5. Required Skills (as a list)
      6. Preferred/Nice-to-have Skills (as a list)

      Format the output as a valid JSON object with the following structure:
      {
        "title": "Job Title",
        "company": "Company Name",
        "location": "Location",
        "description": "Job description summary",
        "requiredSkills": ["Skill 1", "Skill 2", ...],
        "preferredSkills": ["Skill 1", "Skill 2", ...]
      }
      
      Important guidelines:
      - Handle text with irregular formatting, spacing, or line breaks
      - If company name is not explicitly mentioned, use "Not specified"
      - If location is not specified, use "Not specified" or "Remote" if mentioned
      - Extract all technical skills, tools, frameworks, and languages as required skills
      - Extract any skills mentioned as "preferred", "nice-to-have", or "plus" as preferred skills
      - If no preferred skills are mentioned, provide an empty array

      Job Description text:
      ${text}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a job description parsing assistant. Extract structured information from job descriptions accurately." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    });

    // Parse the response from OpenAI
    const content = response.choices[0].message.content;
    
    try {
      // First try to parse the entire content as JSON
      return JSON.parse(content);
    } catch (e) {
      // If that fails, try to extract JSON from the content
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (jsonError) {
        console.error('Error parsing JSON from OpenAI response:', jsonError);
        // Provide a fallback structure with error information
        return {
          title: 'Parsing Error',
          company: 'Not specified',
          location: 'Not specified',
          description: 'Failed to parse job description. Please try again with clearer text.',
          requiredSkills: [],
          preferredSkills: [],
          parsingError: true
        };
      }
    }
  } catch (error) {
    console.error('Error extracting job data with OpenAI:', error);
    throw error;
  }
};

/**
 * Get all job descriptions for a user or session
 * @route GET /api/job/
 * @access Public (with session support)
 */
const getUserJobs = async (req, res) => {
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
    
    const jobs = await JobDescription.find(query)
      .sort({ createdAt: -1 })
      .select('title company location jobType skills requirements responsibilities benefits createdAt s3Key s3Url');
    
    res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error getting user jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving job descriptions',
      error: error.message
    });
  }
};

/**
 * Get a specific job description by ID
 * @route GET /api/job/:id
 * @access Public (with session support)
 */
const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    let query = { _id: jobId };
    
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
    
    const job = await JobDescription.findOne(query);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found or access denied'
      });
    }
    
    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error getting job by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving job description',
      error: error.message
    });
  }
};

module.exports = {
  parseJobDescription,
  getUserJobs,
  getJobById
};
