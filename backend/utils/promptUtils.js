/**
 * Generate prompt for resume parsing
 * @param {string} text - Raw text from resume
 * @returns {string} - Formatted prompt
 */
const generateResumeParsingPrompt = (text) => {
  return `
    Extract the following information from this resume:
    1. Full Name
    2. Email Address
    3. Phone Number
    4. Skills (as a list)
    5. Work Experience (for each position: title, company, location, dates, description)
    6. Education (for each institution: name, degree, field, dates, GPA if available)

    Format the output as a valid JSON object with the following structure:
    {
      "name": "Full Name",
      "email": "email@example.com",
      "phone": "123-456-7890",
      "skills": ["Skill 1", "Skill 2", ...],
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
      ]
    }

    Resume text:
    ${text}
  `;
};

/**
 * Generate prompt for job description parsing
 * @param {string} text - Raw text from job description
 * @returns {string} - Formatted prompt
 */
const generateJobParsingPrompt = (text) => {
  return `
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

    Job Description text:
    ${text}
  `;
};

/**
 * Generate prompt for resume and job comparison
 * @param {object} resume - Resume object
 * @param {object} jobDescription - Job description object
 * @returns {string} - Formatted prompt
 */
const generateComparisonPrompt = (resume, jobDescription) => {
  return `
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
};

/**
 * Generate prompt for cover letter generation
 * @param {object} resume - Resume object
 * @param {object} jobDescription - Job description object
 * @param {string} customInstructions - Optional custom instructions
 * @returns {string} - Formatted prompt
 */
const generateCoverLetterPrompt = (resume, jobDescription, customInstructions = '') => {
  return `
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
};

/**
 * Generate prompt for resume feedback
 * @param {object} resume - Resume object
 * @param {object} jobDescription - Optional job description object
 * @returns {string} - Formatted prompt
 */
const generateFeedbackPrompt = (resume, jobDescription = null) => {
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

  return prompt;
};

module.exports = {
  generateResumeParsingPrompt,
  generateJobParsingPrompt,
  generateComparisonPrompt,
  generateCoverLetterPrompt,
  generateFeedbackPrompt
};
