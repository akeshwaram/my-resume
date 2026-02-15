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
    return `Analyze if this candidate is qualified for the job described below. Be HIGHLY CRITICAL and realistic.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME:
${formattedResume}

ANALYSIS REQUIREMENTS:
1. IGNORE company descriptions, company culture, benefits, perks, and other company-specific information.
2. FOCUS ONLY on: job title, responsibilities, required skills, required experience, qualifications, and technical requirements.
3. Extract the key role requirements from the job description.
4. Check if the candidate's experience and skills match the requirements. If completely unrelated field, score must be below 30.
5. Consider if the candidate has the specific skills, technologies, and experience mentioned in the job requirements.
6. Consider seniority level implied by the job description (e.g., "Senior" vs "Junior" vs no prefix).
7. Be skeptical - default to lower scores unless there's clear evidence of strong fit.
8. Focus on concrete matches between the job requirements and candidate's actual experience.

Provide your analysis in JSON format.`;
  }

  /**
   * Get system instructions for the AI model
   * @returns {string} System instructions
   */
  getSystemInstructions() {
    return `You are a HIGHLY CRITICAL technical recruiter. Your reputation depends on accurate, realistic assessments. You tend to be skeptical and only give high scores when truly warranted.

IMPORTANT: IGNORE all company descriptions, company culture information, benefits, perks, office locations, and company history. ONLY evaluate based on the actual job role requirements.

STRICT SCORING RULES:
- 0-10: Completely wrong field (e.g., chef resume for software engineer role)
- 11-30: Wrong industry/field or missing ALL key requirements from job description
- 31-50: Some relevant experience but missing most requirements listed in job description
- 51-65: Decent match with several gaps in requirements
- 66-75: Good match, has most skills and experience from job description
- 76-85: Strong match, clearly qualified with solid relevant experience matching requirements
- 86-100: RARE - Exceptional match, significantly exceeds requirements in job description

DEFAULT BEHAVIOR: Start at 50 and adjust down for each mismatch. Only adjust up if there's exceptional fit.

MANDATORY CHECKS (each failure reduces score by 15-20 points):
1. Does candidate's field/industry match this job? (If no → score below 30)
2. Does candidate have the specific technologies/tools mentioned? (If no → reduce by 15 per major gap)
3. Does candidate have experience level matching requirements? (If no → reduce by 20)
4. Does candidate have the key responsibilities mentioned in job description? (If no → reduce by 15 per major gap)
5. Does seniority match requirements (Senior/Lead/Junior)? (If no → reduce by 15)

OUTPUT FORMAT (JSON only, no explanation):
{
  "score": <number 0-100>,
  "strengths": ["<specific strength matching job requirement>", "<specific strength matching job requirement>", "<specific strength matching job requirement>"]
}

Strengths should reference SPECIFIC requirements from the job description that the candidate meets. Do NOT mention company culture fit or company-specific attributes.`;
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
