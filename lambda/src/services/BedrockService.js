import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

class BedrockService {
  constructor() {
    this.modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';
    this.timeout = 30000; // 30 seconds
    
    // Initialize Bedrock Runtime client
    // AWS_REGION is automatically provided by Lambda runtime
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION
    });
  }

  /**
   * Build structured prompt for resume analysis
   * @param {string} jobDescription - The job description to analyze against
   * @param {string} formattedResume - The formatted resume text
   * @returns {string} Structured prompt for AI analysis
   */
  buildPrompt(jobDescription, formattedResume) {
    return `Please analyze the following candidate's resume against the job description and provide your assessment in JSON format.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME:
${formattedResume}

Provide your analysis in the required JSON format with score, strengths, gaps, and recommendations.`;
  }

  /**
   * Get system instructions for the AI model
   * @returns {string} System instructions
   */
  getSystemInstructions() {
    return `You are an expert technical recruiter analyzing a candidate's resume against a job description.

SCORING GUIDELINES - Be strict and realistic:
- 0-20: Poor fit - Missing most required qualifications or job description is invalid/unclear
- 21-40: Weak fit - Missing several key requirements
- 41-60: Moderate fit - Has some relevant experience but significant gaps
- 61-75: Good fit - Meets most requirements with minor gaps
- 76-85: Strong fit - Meets all key requirements with relevant experience
- 86-100: Excellent fit - Exceeds requirements with exceptional qualifications

CRITICAL RULES:
1. If the job description is gibberish, unclear, or invalid, assign a score of 0-10
2. Be critical and realistic - most candidates should score 40-70
3. Only exceptional matches should score above 85
4. Focus on actual job requirements vs candidate qualifications
5. Consider years of experience, specific technologies, and role level

Your task is to:
1. First validate the job description is legitimate and clear
2. Analyze the candidate's suitability for the role
3. Provide a numerical score from 0-100 indicating overall fit
4. Identify 3-5 key strengths where the candidate excels

IMPORTANT: You must respond in valid JSON format with this exact structure:
{
  "score": <number between 0-100>,
  "strengths": ["<string>", "<string>", ...]
}

Be objective and focus on technical skills, experience relevance, and qualification alignment.`;
  }

  /**
   * Parse and validate Bedrock response
   * @param {string} responseText - The response text from Bedrock
   * @returns {Object} Parsed analysis result
   */
  parseResponse(responseText) {
    try {
      // Extract JSON from the response
      // The response might contain additional text, so we need to find the JSON object
      const jsonMatch = responseText.match(/\{[\s\S]*?"score"[\s\S]*?"strengths"[\s\S]*?\}/);
      
      if (!jsonMatch) {
        throw new Error('Unable to parse structured response from AI model');
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      // Validate response structure
      if (typeof parsedData.score !== 'number' || 
          !Array.isArray(parsedData.strengths)) {
        throw new Error('Invalid response structure from AI model');
      }

      // Ensure score is within valid range and rounded
      parsedData.score = Math.round(Math.max(0, Math.min(100, parsedData.score)));

      return parsedData;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Failed to parse JSON response from AI model');
      }
      throw error;
    }
  }

  /**
   * Analyze job match using Bedrock Runtime
   * @param {string} jobDescription - The job description to analyze
   * @param {string} formattedResume - The formatted resume text
   * @returns {Promise<Object>} Analysis result with score, strengths, gaps, and recommendations
   */
  async analyzeJobMatch(jobDescription, formattedResume) {
    try {
      // Build the analysis prompt
      const prompt = this.buildPrompt(jobDescription, formattedResume);
      const systemInstructions = this.getSystemInstructions();

      // Create the Converse command
      const command = new ConverseCommand({
        modelId: this.modelId,
        messages: [
          {
            role: 'user',
            content: [
              {
                text: prompt
              }
            ]
          }
        ],
        system: [
          {
            text: systemInstructions
          }
        ],
        inferenceConfig: {
          maxTokens: 500,
          temperature: 0.7,
          topP: 0.9
        }
      });

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('AI model request timed out after 30 seconds. Please try again.'));
        }, this.timeout);
      });

      // Invoke the model with timeout
      const responsePromise = this.client.send(command);

      // Race between the actual request and timeout
      const response = await Promise.race([
        responsePromise,
        timeoutPromise
      ]);

      // Extract text from response
      if (!response.output || !response.output.message || !response.output.message.content) {
        throw new Error('No response received from AI model');
      }

      const responseText = response.output.message.content
        .map(item => item.text)
        .join('');

      // Parse the response
      const analysisResult = this.parseResponse(responseText);

      return analysisResult;
    } catch (error) {
      // Handle specific error types with meaningful messages
      if (error.name === 'ResourceNotFoundException') {
        throw new Error('AI model not found. Please verify model configuration and ensure model access is enabled in Bedrock Console.');
      } else if (error.name === 'AccessDeniedException') {
        throw new Error('Access denied to AI model. Please check IAM permissions and ensure model access is enabled in Bedrock Console.');
      } else if (error.name === 'ThrottlingException') {
        throw new Error('Too many requests to AI service. Please try again in a moment.');
      } else if (error.message.includes('timed out')) {
        throw error; // Re-throw timeout errors as-is
      } else {
        // Generic error with original message
        throw new Error(`Analysis service error: ${error.message}`);
      }
    }
  }
}

export default BedrockService;
