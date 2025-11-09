import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";

class BedrockService {
  constructor() {
    this.client = new BedrockAgentRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.agentId = process.env.BEDROCK_AGENT_ID;
    this.agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID;
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Generate a unique session ID for each request
   * @returns {string} Unique session identifier
   */
  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Build structured prompt for Bedrock Agent
   * @param {string} jobDescription - The job description to analyze against
   * @param {string} formattedResume - The formatted resume text
   * @returns {string} Structured prompt for AI analysis
   */
  buildPrompt(jobDescription, formattedResume) {
    return `You are an expert technical recruiter analyzing a candidate's resume against a job description.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME:
${formattedResume}

Analyze the candidate's suitability for this role and provide:
1. A numerical score from 0-100 indicating overall fit
2. Key strengths (3-5 points where the candidate excels)
3. Gaps (2-4 areas where the candidate may not meet requirements)
4. Recommendations (3-5 suggestions for interview focus or role adjustments)

Respond in JSON format:
{
  "score": <number>,
  "strengths": [<string>],
  "gaps": [<string>],
  "recommendations": [<string>]
}`;
  }

  /**
   * Parse Bedrock Agent response stream and extract structured data
   * @param {AsyncIterable} responseStream - The response stream from Bedrock Agent
   * @returns {Promise<Object>} Parsed analysis result
   */
  async parseResponse(responseStream) {
    let fullResponse = '';
    
    try {
      for await (const event of responseStream) {
        if (event.chunk && event.chunk.bytes) {
          const chunk = new TextDecoder().decode(event.chunk.bytes);
          fullResponse += chunk;
        }
      }

      // Extract JSON from the response
      // The response might contain additional text, so we need to find the JSON object
      const jsonMatch = fullResponse.match(/\{[\s\S]*"score"[\s\S]*"strengths"[\s\S]*"gaps"[\s\S]*"recommendations"[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Unable to parse structured response from Bedrock Agent');
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      // Validate response structure
      if (typeof parsedData.score !== 'number' || 
          !Array.isArray(parsedData.strengths) || 
          !Array.isArray(parsedData.gaps) || 
          !Array.isArray(parsedData.recommendations)) {
        throw new Error('Invalid response structure from Bedrock Agent');
      }

      // Ensure score is within valid range and rounded
      parsedData.score = Math.round(Math.max(0, Math.min(100, parsedData.score)));

      return parsedData;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Failed to parse JSON response from Bedrock Agent');
      }
      throw error;
    }
  }

  /**
   * Analyze job match using Bedrock Agent
   * @param {string} jobDescription - The job description to analyze
   * @param {string} formattedResume - The formatted resume text
   * @returns {Promise<Object>} Analysis result with score, strengths, gaps, and recommendations
   */
  async analyzeJobMatch(jobDescription, formattedResume) {
    if (!this.agentId || !this.agentAliasId) {
      throw new Error('Bedrock Agent configuration missing. Please set BEDROCK_AGENT_ID and BEDROCK_AGENT_ALIAS_ID environment variables.');
    }

    const sessionId = this.generateSessionId();
    const inputText = this.buildPrompt(jobDescription, formattedResume);

    const command = new InvokeAgentCommand({
      agentId: this.agentId,
      agentAliasId: this.agentAliasId,
      sessionId: sessionId,
      inputText: inputText
    });

    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Bedrock Agent request timed out after 30 seconds. Please try again.'));
        }, this.timeout);
      });

      // Race between the actual request and timeout
      const response = await Promise.race([
        this.client.send(command),
        timeoutPromise
      ]);

      if (!response.completion) {
        throw new Error('No response received from Bedrock Agent');
      }

      // Parse the response stream
      const analysisResult = await this.parseResponse(response.completion);

      return analysisResult;
    } catch (error) {
      // Handle specific error types with meaningful messages
      if (error.name === 'ResourceNotFoundException') {
        throw new Error('Bedrock Agent not found. Please verify agent configuration.');
      } else if (error.name === 'AccessDeniedException') {
        throw new Error('Access denied to Bedrock Agent. Please check IAM permissions.');
      } else if (error.name === 'ThrottlingException') {
        throw new Error('Too many requests to Bedrock Agent. Please try again in a moment.');
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
