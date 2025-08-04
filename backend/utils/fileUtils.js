const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from a file based on its extension
 * @param {string} filePath - Path to the file
 * @param {string} fileExtension - File extension (.pdf, .docx, .txt)
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromFile = async (filePath, fileExtension) => {
  try {
    let text = '';
    
    if (fileExtension === '.pdf') {
      // Parse PDF
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else if (fileExtension === '.docx') {
      // Parse DOCX
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (fileExtension === '.txt') {
      // Read text file
      text = fs.readFileSync(filePath, 'utf8');
    } else {
      throw new Error('Unsupported file format');
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
};

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Path to directory
 */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Delete file if it exists
 * @param {string} filePath - Path to file
 */
const deleteFileIfExists = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  extractTextFromFile,
  ensureDirectoryExists,
  deleteFileIfExists
};
