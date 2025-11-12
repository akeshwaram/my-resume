import BedrockService from './services/BedrockService.js';
import ResumeFormatter from './utils/ResumeFormatter.js';

/**
 * Validates the job title input
 * @param {string} jobTitle - The job title to validate
 * @throws {Error} If validation fails
 */
function validateJobTitle(jobTitle) {
  if (!jobTitle || typeof jobTitle !== 'string') {
    throw new Error('Job title is required and must be a string');
  }

  const trimmedTitle = jobTitle.trim();
  
  if (trimmedTitle.length < 2) {
    throw new Error('Job title must be at least 2 characters long');
  }

  if (trimmedTitle.length > 100) {
    throw new Error('Job title must not exceed 100 characters');
  }

  return trimmedTitle;
}

/**
 * Validates the resume data structure
 * @param {Object} resumeData - The resume data to validate
 * @throws {Error} If validation fails
 */
function validateResumeData(resumeData) {
  if (!resumeData || typeof resumeData !== 'object') {
    throw new Error('Resume data is required and must be an object');
  }

  // Check for required top-level fields
  const requiredFields = ['about', 'skills', 'experience', 'education', 'certifications'];
  const missingFields = requiredFields.filter(field => !resumeData[field]);

  if (missingFields.length > 0) {
    throw new Error(`Resume data is missing required fields: ${missingFields.join(', ')}`);
  }

  // ResumeFormatter will perform deeper validation
  ResumeFormatter.validateResumeData(resumeData);
}

/**
 * Creates a Lambda response object
 * @param {number} statusCode - HTTP status code
 * @param {Object} body - Response body object
 * @returns {Object} Lambda response object
 */
function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}

/**
 * Lambda handler function for processing job match analysis requests
 * @param {Object} event - Lambda event object from Function URL
 * @returns {Promise<Object>} Lambda response object
 */
export async function handler(event) {
  // Handle OPTIONS request for CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return createResponse(200, { message: 'OK' });
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body || '{}');
    } catch (error) {
      return createResponse(400, {
        error: 'Invalid JSON in request body'
      });
    }

    const { jobTitle, resumeData } = requestBody;

    // Validate inputs
    try {
      const validatedJobTitle = validateJobTitle(jobTitle);
      validateResumeData(resumeData);

      // Format resume data to readable text
      const formattedResume = ResumeFormatter.formatResumeData(resumeData);

      // Initialize Bedrock service and analyze job match
      const bedrockService = new BedrockService();
      const analysisResult = await bedrockService.analyzeJobMatch(
        validatedJobTitle,
        formattedResume
      );

      // Return successful response
      return createResponse(200, {
        score: analysisResult.score,
        strengths: analysisResult.strengths
      });

    } catch (validationError) {
      // Return validation errors as 400 Bad Request
      return createResponse(400, {
        error: validationError.message
      });
    }

  } catch (error) {
    // Log error for CloudWatch
    console.error('Lambda handler error:', {
      message: error.message,
      stack: error.stack,
      requestId: event.requestContext?.requestId
    });

    // Return server errors as 500 Internal Server Error
    return createResponse(500, {
      error: 'Analysis service temporarily unavailable. Please try again.'
    });
  }
}
