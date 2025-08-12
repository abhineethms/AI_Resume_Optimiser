const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const Match = require('../models/Match');
const User = require('../models/User');
const openai = require('../config/openai');

/**
 * Compare a resume with a job description and calculate match score
 * @route POST /api/match/compare
 * @access Public
 */
const compareResumeWithJob = async (req, res) => {
  try {
    const { resumeId, jobId } = req.body;

    // Validate input
    if (!resumeId || !jobId) {
      return res.status(400).json({
        success: false,
        message: 'Resume ID and Job ID are required'
      });
    }

    // Fetch resume and job description from database
    const resume = await Resume.findById(resumeId);
    const jobDescription = await JobDescription.findById(jobId);

    if (!resume || !jobDescription) {
      return res.status(404).json({
        success: false,
        message: 'Resume or Job Description not found'
      });
    }

    // Use OpenAI to compare resume with job description
    const comparisonResult = await compareWithAI(resume, jobDescription);

    // Create a new match document in the database
    const match = new Match({
      user: req.user?._id || null,
      sessionId: req.sessionId || null,
      resume: resumeId,
      jobDescription: jobId,
      matchPercentage: comparisonResult.matchPercentage,
      matchedSkills: comparisonResult.matchedSkills,
      missingSkills: comparisonResult.missingSkills,
      summary: comparisonResult.summary
    });

    // Save the match to the database
    await match.save();

    // Update user's matches array if user is authenticated
    if (req.user?._id) {
      await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { matches: match._id } }
      );
    }

    // Return the comparison results
    res.status(200).json({
      success: true,
      message: 'Resume and job description compared successfully',
      data: {
        matchId: match._id,
        ...comparisonResult
      }
    });
  } catch (error) {
    console.error('Error comparing resume with job description:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing resume with job description',
      error: error.message
    });
  }
};

/**
 * Generate a cover letter based on resume and job description
 * @route POST /api/match/letter/generate
 * @access Public
 */
const generateCoverLetter = async (req, res) => {
  try {
    const { resumeId, jobId, matchId, customInstructions } = req.body;

    // Validate input
    if ((!resumeId || !jobId) && !matchId) {
      return res.status(400).json({
        success: false,
        message: 'Either Match ID or both Resume ID and Job ID are required'
      });
    }

    let resume, jobDescription, match;

    if (matchId) {
      // Fetch match from database
      match = await Match.findById(matchId).populate('resume').populate('jobDescription');
      
      if (!match) {
        return res.status(404).json({
          success: false,
          message: 'Match not found'
        });
      }
      
      resume = match.resume;
      jobDescription = match.jobDescription;
    } else {
      // Fetch resume and job description from database
      resume = await Resume.findById(resumeId);
      jobDescription = await JobDescription.findById(jobId);

      if (!resume || !jobDescription) {
        return res.status(404).json({
          success: false,
          message: 'Resume or Job Description not found'
        });
      }
    }

    // Use OpenAI to generate cover letter
    const coverLetter = await generateCoverLetterWithAI(resume, jobDescription, customInstructions);

    // If match exists, update it with the cover letter
    if (match) {
      match.coverLetter = coverLetter;
      await match.save();
    }

    // Return the generated cover letter
    res.status(200).json({
      success: true,
      message: 'Cover letter generated successfully',
      data: {
        coverLetter
      }
    });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating cover letter',
      error: error.message
    });
  }
};

/**
 * Analyze resume for feedback
 * @route POST /api/match/feedback/analyze
 * @access Public
 */
const analyzeFeedback = async (req, res) => {
  try {
    const { resumeId, jobId } = req.body;

    // Validate input
    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: 'Resume ID is required'
      });
    }

    // Fetch resume from database
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Fetch job description if provided
    let jobDescription = null;
    if (jobId) {
      jobDescription = await JobDescription.findById(jobId);
      if (!jobDescription) {
        return res.status(404).json({
          success: false,
          message: 'Job Description not found'
        });
      }
    }

    // Use OpenAI to analyze resume and provide feedback
    const feedback = await analyzeFeedbackWithAI(resume, jobDescription);

    // Return the feedback
    res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error analyzing resume for feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing resume for feedback',
      error: error.message
    });
  }
};

/**
 * Use OpenAI to compare resume with job description
 * @param {object} resume - Resume document
 * @param {object} jobDescription - Job Description document
 * @returns {object} - Comparison results
 */
const compareWithAI = async (resume, jobDescription) => {
  try {
    const prompt = `
      Compare this resume with the job description and provide:
      1. Match percentage (0-100%)
      2. List of matched skills found in both resume and job description
      3. List of missing skills that are in the job description but not in the resume
      4. A summary of the match (2-3 paragraphs)

      Format the output as a valid JSON object with the following structure:
      {
        "matchPercentage": 85,
        "matchedSkills": ["Skill 1", "Skill 2", ...],
        "missingSkills": ["Skill 1", "Skill 2", ...],
        "summary": "Summary text here..."
      }

      Resume:
      ${JSON.stringify({
        name: resume.name,
        skills: resume.skills,
        experience: resume.experience,
        education: resume.education,
        rawText: resume.rawText
      })}

      Job Description:
      ${JSON.stringify({
        title: jobDescription.title,
        company: jobDescription.company,
        requiredSkills: jobDescription.requiredSkills,
        preferredSkills: jobDescription.preferredSkills,
        description: jobDescription.description,
        rawText: jobDescription.rawText
      })}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a resume matching assistant. Compare resumes with job descriptions accurately." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    // Parse the response from OpenAI
    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to extract comparison results');
    }
  } catch (error) {
    console.error('Error comparing resume with job description using OpenAI:', error);
    throw error;
  }
};

/**
 * Use OpenAI to generate a cover letter
 * @param {object} resume - Resume document
 * @param {object} jobDescription - Job Description document
 * @param {string} customInstructions - Optional custom instructions
 * @returns {string} - Generated cover letter
 */
const generateCoverLetterWithAI = async (resume, jobDescription, customInstructions = '') => {
  try {
    const prompt = `
      Generate a professional cover letter based on this resume and job description.
      The cover letter should highlight the candidate's relevant skills and experiences that match the job requirements.
      
      ${customInstructions ? `Additional instructions: ${customInstructions}` : ''}

      Resume:
      ${JSON.stringify({
        name: resume.name,
        skills: resume.skills,
        experience: resume.experience,
        education: resume.education
      })}

      Job Description:
      ${JSON.stringify({
        title: jobDescription.title,
        company: jobDescription.company,
        requiredSkills: jobDescription.requiredSkills,
        preferredSkills: jobDescription.preferredSkills,
        description: jobDescription.description
      })}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a professional cover letter writer. Generate personalized and compelling cover letters." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating cover letter with OpenAI:', error);
    throw error;
  }
};

/**
 * Use OpenAI to analyze resume and provide feedback
 * @param {object} resume - Resume document
 * @param {object} jobDescription - Optional Job Description document
 * @returns {object} - Feedback with strengths, weaknesses, and tips
 */
const analyzeFeedbackWithAI = async (resume, jobDescription = null) => {
  try {
    let prompt = `
      Analyze this resume and provide feedback:
      1. Three strengths of the resume
      2. Three weaknesses or areas for improvement
      3. Three specific tips to improve the resume

      Format the output as a valid JSON object with the following structure:
      {
        "strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
        "tips": ["Tip 1", "Tip 2", "Tip 3"]
      }

      Resume:
      ${JSON.stringify({
        name: resume.name,
        skills: resume.skills,
        experience: resume.experience,
        education: resume.education,
        rawText: resume.rawText
      })}
    `;

    if (jobDescription) {
      prompt += `
        Job Description:
        ${JSON.stringify({
          title: jobDescription.title,
          company: jobDescription.company,
          requiredSkills: jobDescription.requiredSkills,
          preferredSkills: jobDescription.preferredSkills,
          description: jobDescription.description
        })}

        Please tailor the feedback to how well the resume matches this specific job description.
      `;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a professional resume reviewer. Provide constructive and actionable feedback on resumes." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.5,
      max_tokens: 1500
    });

    // Parse the response from OpenAI
    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to extract feedback results');
    }
  } catch (error) {
    console.error('Error analyzing resume for feedback with OpenAI:', error);
    throw error;
  }
};

module.exports = {
  compareResumeWithJob,
  generateCoverLetter,
  analyzeFeedback
};
