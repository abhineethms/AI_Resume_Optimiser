const nlp = require('compromise');
const { OpenAI } = require('openai');
const KeywordInsight = require('../models/KeywordInsight');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extract keyword candidates from job description text using compromise NLP
 * @param {string} jdText - Raw job description text
 * @returns {Array} - Array of potential keywords
 */
const extractKeywordsWithCompromise = (jdText) => {
  // Process the text with compromise
  const doc = nlp(jdText);
  
  // Extract nouns as potential keywords
  let nouns = doc.nouns().out('array');
  
  // Extract noun phrases (typically more valuable)
  let nounPhrases = doc.match('#Noun #Noun+').out('array');
  
  // Get technical terms - look for capitalized words that aren't at sentence start
  let technicalTerms = doc.match('(#Acronym|#ProperNoun)').not('#Person').out('array');
  
  // Extract words following "experience with", "knowledge of", "proficient in", etc.
  let skillIndicators = doc.match('(experience|knowledge|proficiency|expertise|skill|proficient) (with|in|of) [.]').out('array');
  
  // Combine all potential keywords and remove duplicates
  let allKeywords = [...new Set([...nouns, ...nounPhrases, ...technicalTerms, ...skillIndicators])];
  
  // Filter out common stopwords and very short terms
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been'];
  allKeywords = allKeywords.filter(word => 
    word.length > 2 && 
    !stopWords.includes(word.toLowerCase())
  );
  
  // Limit to top keywords (prioritize technical terms and noun phrases)
  const sortedKeywords = [
    ...technicalTerms,
    ...skillIndicators, 
    ...nounPhrases,
    ...nouns
  ].filter((item, index, self) => 
    self.indexOf(item) === index && item.length > 2
  );
  
  // Return top 50 keywords
  return sortedKeywords.slice(0, 50);
};

/**
 * Use GPT to refine, normalize and deduplicate keywords
 * @param {Array} rawKeywords - Raw keywords extracted from NLP
 * @returns {Array} - Refined keywords
 */
const refineKeywordsWithGPT = async (rawKeywords) => {
  const prompt = `
    You are an expert ATS (Applicant Tracking System) consultant who specializes in identifying important keywords
    for job applications. I'll provide you with a list of potential keywords extracted from a job description.
    
    Please analyze these keywords and:
    1. Remove duplicates and near-duplicates (e.g., "React" and "React.js")
    2. Normalize variations (choose the most common professional form)
    3. Remove generic terms that aren't specific skills or qualifications
    4. Return ONLY the cleaned list of important keywords as a JSON array of strings
    
    Raw keyword list: ${rawKeywords.join(', ')}
    
    Respond ONLY with a JSON array of strings, like this:
    ["Keyword1", "Keyword2", "Keyword3"]
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1000
    });

    // Parse the response to get the refined keywords
    const content = response.choices[0]?.message?.content || '[]';
    
    // Extract JSON array from the response (handle case where GPT might add explanatory text)
    const jsonMatch = content.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback to parsing the whole response if no clear array is found
    return JSON.parse(content);
  } catch (error) {
    console.error('Error refining keywords with GPT:', error);
    // Fallback to original keywords on error
    return rawKeywords;
  }
};

/**
 * Count keyword frequencies in resume and job description texts
 * @param {string} resumeText - Raw resume text
 * @param {string} jdText - Raw job description text
 * @param {Array} keywords - Refined keywords to count
 * @returns {Array} - Keywords with frequency counts
 */
const countKeywordFrequencies = (resumeText, jdText, keywords) => {
  const result = [];
  
  for (const keyword of keywords) {
    // Case insensitive regex for whole word or part of technical term
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w*\\b`, 'gi');
    
    // Count occurrences
    const resumeMatches = (resumeText.match(regex) || []).length;
    const jdMatches = (jdText.match(regex) || []).length;
    
    // Determine match type
    let matchType = 'Missing';
    if (resumeMatches > 0) {
      matchType = resumeMatches >= jdMatches ? 'Exact' : 'Partial';
    }
    
    result.push({
      word: keyword,
      resumeCount: resumeMatches,
      jdCount: jdMatches,
      matchType
    });
  }
  
  return result;
};

/**
 * Use GPT to rate keyword strength based on resume context
 * @param {string} resumeText - Raw resume text
 * @param {string} jdText - Raw job description text
 * @param {Array} keywordsWithFreq - Keywords with frequency data
 * @returns {Array} - Keywords with strength ratings
 */
const rateKeywordStrengthWithGPT = async (resumeText, jdText, keywordsWithFreq) => {
  // Extract just the keywords for the prompt
  const keywords = keywordsWithFreq.map(k => k.word);
  
  const prompt = `
    You are an expert ATS (Applicant Tracking System) consultant who evaluates resumes against job descriptions.
    You'll receive a resume text, job description text, and a list of important keywords.
    
    Please analyze how strongly each keyword is represented in the resume compared to the job description.
    
    Rate each keyword as:
    - "Strong": The resume demonstrates significant expertise or experience with this keyword
    - "Weak": The keyword is mentioned but with limited context or experience
    - "Missing": The keyword is not effectively present in the resume
    
    Resume Text:
    ${resumeText.substring(0, 2000)}... (truncated)
    
    Job Description Text:
    ${jdText.substring(0, 2000)}... (truncated)
    
    Keywords: ${keywords.join(', ')}
    
    Return ONLY a JSON object with keyword ratings, like this:
    {
      "Keyword1": "Strong",
      "Keyword2": "Weak",
      "Keyword3": "Missing"
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1500
    });

    // Parse the response to get the strength ratings
    const content = response.choices[0]?.message?.content || '{}';
    
    // Extract JSON object from the response
    const jsonMatch = content.match(/{.*}/s);
    if (jsonMatch) {
      const strengthRatings = JSON.parse(jsonMatch[0]);
      
      // Merge strength ratings with the keyword frequency data
      return keywordsWithFreq.map(keyword => ({
        ...keyword,
        strength: strengthRatings[keyword.word] || 'Missing'
      }));
    }
    
    // Fallback if no clear JSON is found
    return keywordsWithFreq;
  } catch (error) {
    console.error('Error rating keyword strengths with GPT:', error);
    // Return original data if GPT fails
    return keywordsWithFreq.map(keyword => ({
      ...keyword,
      strength: keyword.resumeCount > 0 ? 'Weak' : 'Missing'
    }));
  }
};

/**
 * Group keywords into semantic clusters using GPT
 * @param {Array} keywords - List of keywords
 * @returns {Object} - Clustered keywords and coverage assessment
 */
const groupKeywordsIntoClustersWithGPT = async (keywordsWithStrength) => {
  // Extract just the keywords for the prompt
  const keywords = keywordsWithStrength.map(k => k.word);
  
  const prompt = `
    You are an expert in job skills categorization. I'll provide a list of keywords from a job description.
    
    Please group these keywords into 5-8 logical skill clusters (e.g., Frontend, Backend, DevOps, Management).
    
    Keywords: ${keywords.join(', ')}
    
    Return ONLY a JSON object with:
    1. clusters: An object where keys are cluster names and values are arrays of keywords belonging to that cluster
    2. No explanations or additional text
    
    Example response format:
    {
      "clusters": {
        "Frontend": ["React", "CSS", "HTML"],
        "Backend": ["Node.js", "Express", "MongoDB"],
        "DevOps": ["AWS", "Docker", "Kubernetes"]
      }
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1000
    });

    // Parse the response to get the clusters
    const content = response.choices[0]?.message?.content || '{"clusters":{}}';
    
    // Extract JSON object from the response
    const jsonMatch = content.match(/{.*}/s);
    let clusterData = {};
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      clusterData = parsed.clusters || {};
    }
    
    // Get cluster names
    const clusterNames = Object.keys(clusterData);
    
    // Assign each keyword to its cluster
    const keywordsWithClusters = keywordsWithStrength.map(keywordObj => {
      // Find which cluster this keyword belongs to
      const cluster = Object.keys(clusterData).find(
        clusterName => clusterData[clusterName].includes(keywordObj.word)
      ) || 'Other';
      
      return {
        ...keywordObj,
        cluster
      };
    });
    
    // Calculate coverage for each cluster
    const coverage = {};
    clusterNames.forEach(cluster => {
      // Get keywords in this cluster
      const clusterKeywords = clusterData[cluster] || [];
      
      // Count keywords with non-missing strength
      const coveredKeywords = keywordsWithClusters.filter(
        k => clusterKeywords.includes(k.word) && k.strength !== 'Missing'
      ).length;
      
      // Calculate coverage
      const coverageRatio = coveredKeywords / clusterKeywords.length;
      
      // Assign coverage level
      if (coverageRatio >= 0.7) {
        coverage[cluster] = 'Full';
      } else if (coverageRatio > 0) {
        coverage[cluster] = 'Partial';
      } else {
        coverage[cluster] = 'None';
      }
    });
    
    return {
      keywordsWithClusters,
      clusters: clusterNames,
      coverage
    };
  } catch (error) {
    console.error('Error clustering keywords with GPT:', error);
    // Return original data with default clusters if GPT fails
    return {
      keywordsWithClusters: keywordsWithStrength.map(k => ({ ...k, cluster: 'General' })),
      clusters: ['General'],
      coverage: { 'General': 'Partial' }
    };
  }
};

/**
 * Analyze keywords from resume and job description
 * @param {string} resumeText - Raw resume text
 * @param {string} jdText - Raw job description text
 * @param {Object} metadata - Metadata including resumeId, jobId, userId
 * @returns {Object} - Complete keyword analysis
 */
const analyzeKeywords = async (resumeText, jdText, metadata) => {
  try {
    // Step 1: Extract keywords from job description
    const rawKeywords = extractKeywordsWithCompromise(jdText);
    
    // Step 2: Refine keywords with GPT
    const refinedKeywords = await refineKeywordsWithGPT(rawKeywords);
    
    // Step 3: Count frequencies in both resume and JD
    const keywordsWithFreq = countKeywordFrequencies(resumeText, jdText, refinedKeywords);
    
    // Step 4: Rate keyword strength with GPT
    const keywordsWithStrength = await rateKeywordStrengthWithGPT(resumeText, jdText, keywordsWithFreq);
    
    // Step 5: Group keywords into clusters and calculate coverage
    const { keywordsWithClusters, clusters, coverage } = await groupKeywordsIntoClustersWithGPT(keywordsWithStrength);
    
    // Create and save the keyword insight document
    const keywordInsight = new KeywordInsight({
      resumeId: metadata.resumeId,
      jobId: metadata.jobId,
      user: metadata.user,
      keywords: keywordsWithClusters,
      clusters,
      coverage
    });
    
    // Save to database (with upsert to handle duplicates)
    await KeywordInsight.findOneAndUpdate(
      { resumeId: metadata.resumeId, jobId: metadata.jobId },
      { 
        keywords: keywordsWithClusters,
        clusters,
        coverage
      },
      { upsert: true, new: true }
    );
    
    // Return the complete analysis
    return {
      keywords: keywordsWithClusters,
      clusters,
      coverage
    };
  } catch (error) {
    console.error('Error in keyword analysis pipeline:', error);
    throw new Error(`Failed to complete keyword analysis: ${error.message}`);
  }
};

module.exports = {
  analyzeKeywords,
  extractKeywordsWithCompromise,
  refineKeywordsWithGPT,
  countKeywordFrequencies,
  rateKeywordStrengthWithGPT,
  groupKeywordsIntoClustersWithGPT
};
