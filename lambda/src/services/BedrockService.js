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
    return `Analyze if this candidate is qualified for the job described below. Be realistic and accurate in your assessment.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME:
${formattedResume}

ANALYSIS REQUIREMENTS:
1. Focus primarily on: job title, responsibilities, required skills, required experience, qualifications, and technical requirements.
2. IGNORE these sections: company culture, benefits, perks, "Who are we looking for?", "What are the biggest challenges?", team dynamics, and similar soft/cultural content.
3. CRITICAL: Identify all REQUIRED skills, technologies, and programming languages explicitly mentioned in the job description.
4. Check if the candidate has EACH required skill/technology. Missing required skills = major score penalty.
5. For example: If job requires "Python" and candidate only has C#/.NET, this is a critical gap → score must be below 70.
6. If job requires "AWS" and candidate only has Azure, this is a significant gap → score must be below 70.
7. Consider seniority level and years of experience requirements.
8. Be accurate - don't give high scores when critical requirements are missing.

Provide your analysis in JSON format.`;
  }

  /**
   * Get system instructions for the AI model
   * @returns {string} System instructions
   */
  getSystemInstructions() {
    return `You are a professional technical recruiter with balanced judgment. You provide realistic assessments based on actual qualifications.

FOCUS: Evaluate the candidate based on the actual job requirements (skills, experience, responsibilities). IGNORE company culture, benefits, perks, "Who are we looking for?", "What are the biggest challenges?", team dynamics, and similar soft/cultural content.

CRITICAL RULE: If the job description explicitly requires a specific technology, programming language, or skill that the candidate does NOT have, this is a MAJOR gap that must significantly lower the score.

SCORING GUIDELINES:
- 0-20: Completely wrong field or no relevant experience
- 21-40: Wrong industry OR missing critical required skills (e.g., job requires Python but candidate has no Python)
- 41-55: Some relevant experience but missing multiple key requirements
- 56-70: Decent match with some gaps in requirements
- 71-80: Good match, has most required skills and experience
- 81-90: Strong match, has all or nearly all required skills with solid experience
- 91-100: Exceptional match, significantly exceeds all requirements

EVALUATION APPROACH: 
1. First, identify REQUIRED skills/technologies explicitly mentioned in the job description
2. Check if candidate has each required skill - missing required skills = major penalty
3. Then evaluate experience level, responsibilities, and overall fit
4. Give credit for relevant experience that matches requirements
5. Consider transferable skills only for non-critical requirements

MANDATORY CHECKS (each failure significantly reduces score):
1. Does candidate have ALL explicitly required technologies/programming languages? (Missing any → score below 70)
2. Does candidate's field/industry align with this job? (If no → score below 40)
3. Does candidate have appropriate years of experience? (If no → reduce by 15-20)
4. Does candidate have relevant responsibilities/achievements? (If no → reduce by 10-15)
5. Does seniority level match (Senior/Lead/Junior)? (If no → reduce by 10-15)

EXAMPLES OF CRITICAL GAPS:
- Job requires "Python development" but candidate only has C#/.NET → score below 70
- Job requires "AWS experience" but candidate only has Azure → score below 70
- Job requires "React" but candidate only has Angular → score below 70
- Job requires "5+ years" but candidate has 2 years → score below 65

OUTPUT FORMAT (JSON only, no explanation):
{
  "score": <number 0-100>,
  "strengths": ["<specific strength matching job requirement>", "<specific strength matching job requirement>", "<specific strength matching job requirement>"]
}

Strengths should reference SPECIFIC requirements from the job description that the candidate meets. Be honest about gaps.`;
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
