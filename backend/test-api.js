const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000';

// Test the base endpoint
async function testBaseEndpoint() {
  try {
    console.log('\n--- Testing Base Endpoint ---');
    const response = await axios.get(API_URL);
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('Error testing base endpoint:', error.message);
    return false;
  }
}

// Test job description text parsing
async function testJobTextParsing() {
  try {
    console.log('\n--- Testing Job Description Text Parsing ---');
    const jobData = {
      text: `
        Software Engineer
        
        Company: Tech Innovations Inc.
        Location: Remote
        
        Job Description:
        We are looking for a skilled Software Engineer to join our team. The ideal candidate will have experience in developing web applications using modern technologies.
        
        Requirements:
        - 3+ years of experience in software development
        - Proficiency in JavaScript, React, and Node.js
        - Experience with RESTful APIs
        - Knowledge of database systems (MongoDB, PostgreSQL)
        - Strong problem-solving skills
        
        Preferred Skills:
        - Experience with TypeScript
        - Knowledge of AWS services
        - Understanding of CI/CD pipelines
        - Experience with Docker and Kubernetes
      `
    };
    
    const response = await axios.post(`${API_URL}/api/job/parse/text`, jobData);
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error testing job text parsing:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Main function to run tests
async function runTests() {
  console.log('Starting API tests...');
  
  // Test base endpoint
  const baseEndpointWorking = await testBaseEndpoint();
  if (!baseEndpointWorking) {
    console.error('Base endpoint test failed. Make sure your server is running.');
    return;
  }
  
  // Test job text parsing
  const jobData = await testJobTextParsing();
  
  console.log('\nTests completed!');
}

// Run the tests
runTests();
