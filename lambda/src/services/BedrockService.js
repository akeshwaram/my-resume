import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

class BedrockService {
  constructor() {
    this.modelId = process.env.BEDROCK_MODEL_ID || 'meta.llama3-8b-instruct-v1:0';
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
    return `Analyze if this candidate is qualified for the job described below. Be realistic and fair in your assessment.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME:
${formattedResume}

ANALYSIS REQUIREMENTS:
1. Focus primarily on: job title, responsibilities, required skills, required experience, qualifications, and technical requirements.
2. You may skip over company culture, benefits, and perks sections - these don't affect candidate qualification.
3. Extract the key role requirements from the job description.
4. Check if the candidate's experience and skills match the requirements.
5. Consider if the candidate has the specific skills, technologies, and experience mentioned in the job requirements.
6. Consider seniority level implied by the job description (e.g., "Senior" vs "Junior" vs no prefix).
7. Be fair - give credit where the candidate clearly meets requirements.
8. Focus on concrete matches between the job requirements and candidate's actual experience.

Provide your analysis in JSON format.`;
  }

  /**
   * Get system instructions for the AI model
   * @returns {string} System instructions
   */
  getSystemInstructions() {
    return `You are a professional technical recruiter with balanced judgment. You provide realistic assessments based on actual qualifications.

FOCUS: Evaluate the candidate based on the actual job requirements (skills, experience, responsibilities). You may disregard company culture, benefits, and perks sections as they don't affect technical qualification.

SCORING GUIDELINES:
- 0-20: Completely wrong field or no relevant experience
- 21-40: Wrong industry or missing most key requirements
- 41-55: Some relevant experience but significant gaps in requirements
- 56-70: Decent match with some gaps in requirements
- 71-80: Good match, has most skills and experience from job description
- 81-90: Strong match, clearly qualified with solid relevant experience
- 91-100: Exceptional match, significantly exceeds requirements

EVALUATION APPROACH: 
- Start with a neutral baseline and adjust based on actual matches
- Give credit for relevant experience and skills that match requirements
- Only reduce score for genuine gaps in key requirements
- Consider transferable skills and related experience

MANDATORY CHECKS:
1. Does candidate's field/industry align with this job?
2. Does candidate have the core technologies/tools mentioned?
3. Does candidate have appropriate experience level?
4. Does candidate have relevant responsibilities/achievements?
5. Does seniority level match (Senior/Lead/Junior)?

OUTPUT FORMAT (JSON only, no explanation):
{
  "score": <number 0-100>,
  "strengths": ["<specific strength matching job requirement>", "<specific strength matching job requirement>", "<specific strength matching job requirement>"]
}

Strengths should reference SPECIFIC requirements from the job description that the candidate meets.`;
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
   * @returns {Promise<Object>} Analysis result with score and strengths
   */
  async analyzeJobMatch(jobDescription, formattedResume) {
    try {
      // Log which model is being used
      console.log(`Using Bedrock model: ${this.modelId}`);
      
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
          maxTokens: 1000,
          temperature: 0.3,
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
      
      console.log(`Analysis completed successfully with score: ${analysisResult.score}`);

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
