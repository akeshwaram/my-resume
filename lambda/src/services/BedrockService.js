import { Agent } from '@aws/agent-core';

class BedrockService {
  constructor() {
    this.modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.timeout = 30000; // 30 seconds
    
    // Initialize Agent Core agent
    this.agent = null;
  }

  /**
   * Initialize the Agent Core agent with system instructions
   * @returns {Agent} Configured Agent Core instance
   */
  initializeAgent() {
    if (this.agent) {
      return this.agent;
    }

    const systemInstructions = `You are an expert technical recruiter analyzing a candidate's resume against a job description.

Your task is to:
1. Analyze the candidate's suitability for the role
2. Provide a numerical score from 0-100 indicating overall fit
3. Identify 3-5 key strengths where the candidate excels
4. Identify 2-4 gaps where the candidate may not meet requirements
5. Provide 3-5 recommendations for interview focus or role adjustments

IMPORTANT: You must respond in valid JSON format with this exact structure:
{
  "score": <number between 0-100>,
  "strengths": ["<string>", "<string>", ...],
  "gaps": ["<string>", "<string>", ...],
  "recommendations": ["<string>", "<string>", ...]
}

Be objective, thorough, and constructive in your analysis. Focus on technical skills, experience relevance, and qualification alignment.`;

    this.agent = new Agent({
      name: 'ResumeMatcherAgent',
      description: 'AI agent for analyzing resume suitability against job descriptions',
      modelId: this.modelId,
      region: this.region,
      systemPrompt: systemInstructions,
      inferenceConfig: {
        maxTokens: 2000,
        temperature: 0.7,
        topP: 0.9
      }
    });

    return this.agent;
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
   * Parse and validate Agent Core response
   * @param {string} responseText - The response text from Agent Core
   * @returns {Object} Parsed analysis result
   */
  parseResponse(responseText) {
    try {
      // Extract JSON from the response
      // The response might contain additional text, so we need to find the JSON object
      const jsonMatch = responseText.match(/\{[\s\S]*?"score"[\s\S]*?"strengths"[\s\S]*?"gaps"[\s\S]*?"recommendations"[\s\S]*?\}/);
      
      if (!jsonMatch) {
        throw new Error('Unable to parse structured response from AI agent');
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      // Validate response structure
      if (typeof parsedData.score !== 'number' || 
          !Array.isArray(parsedData.strengths) || 
          !Array.isArray(parsedData.gaps) || 
          !Array.isArray(parsedData.recommendations)) {
        throw new Error('Invalid response structure from AI agent');
      }

      // Ensure score is within valid range and rounded
      parsedData.score = Math.round(Math.max(0, Math.min(100, parsedData.score)));

      return parsedData;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Failed to parse JSON response from AI agent');
      }
      throw error;
    }
  }

  /**
   * Analyze job match using Agent Core
   * @param {string} jobDescription - The job description to analyze
   * @param {string} formattedResume - The formatted resume text
   * @returns {Promise<Object>} Analysis result with score, strengths, gaps, and recommendations
   */
  async analyzeJobMatch(jobDescription, formattedResume) {
    try {
      // Initialize agent
      const agent = this.initializeAgent();

      // Build the analysis prompt
      const prompt = this.buildPrompt(jobDescription, formattedResume);

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('AI agent request timed out after 30 seconds. Please try again.'));
        }, this.timeout);
      });

      // Invoke the agent with the prompt
      const responsePromise = agent.invoke({
        input: prompt
      });

      // Race between the actual request and timeout
      const response = await Promise.race([
        responsePromise,
        timeoutPromise
      ]);

      if (!response || !response.output) {
        throw new Error('No response received from AI agent');
      }

      // Parse the response
      const analysisResult = this.parseResponse(response.output);

      return analysisResult;
    } catch (error) {
      // Handle specific error types with meaningful messages
      if (error.name === 'ResourceNotFoundException') {
        throw new Error('AI model not found. Please verify model configuration.');
      } else if (error.name === 'AccessDeniedException') {
        throw new Error('Access denied to AI model. Please check IAM permissions.');
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
