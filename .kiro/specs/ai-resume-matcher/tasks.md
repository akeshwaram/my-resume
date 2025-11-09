# Implementation Plan

- [x] 1. Set up Lambda project structure and dependencies





  - Create `lambda/` directory in project root
  - Initialize Node.js project with `package.json` in lambda directory
  - Install dependencies: @aws-sdk/client-bedrock-agent-runtime
  - Create directory structure: `lambda/src/services/`, `lambda/src/utils/`
  - Create `lambda/.env.example` file with required environment variables (AWS_REGION, BEDROCK_AGENT_ID, BEDROCK_AGENT_ALIAS_ID, ALLOWED_ORIGIN)
  - _Requirements: 7.1, 7.3_

- [ ] 2. Implement resume data formatter utility
  - Create `lambda/src/utils/ResumeFormatter.js`
  - Implement `formatResumeData(resumeData)` static method that converts JSON to readable text
  - Format sections: about (name, location, content), skills (as bullet points), experience (with role, company, period, highlights), education, certifications
  - Add validation to ensure all required fields are present
  - Return formatted string suitable for AI analysis
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3. Implement Bedrock AgentCore analysis service
  - Create `lambda/src/services/BedrockService.js`
  - Import BedrockAgentRuntimeClient and InvokeAgentCommand from `@aws-sdk/client-bedrock-agent-runtime`
  - Implement `analyzeJobMatch(jobDescription, formattedResume)` async method
  - Configure BedrockAgentRuntimeClient with region from environment
  - Generate unique sessionId for each request (use uuid or timestamp-based ID)
  - Build structured prompt that includes job description and formatted resume text
  - Request JSON response format with score, strengths, gaps, and recommendations
  - Use InvokeAgentCommand with agentId, agentAliasId, sessionId, and inputText parameters
  - Parse Bedrock Agent response stream and extract structured data
  - Add timeout handling (30 seconds) and error recovery with meaningful error messages
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Create Lambda handler function
  - Create `lambda/src/index.js` as Lambda handler entry point
  - Implement `handler(event)` async function that processes Lambda Function URL requests
  - Parse JSON body from event.body
  - Add request validation for jobDescription (50-5000 characters) and resumeData structure
  - Validate resumeData has required fields: about, skills, experience, education, certifications
  - Use ResumeFormatter.formatResumeData() to convert resume data to text
  - Call BedrockService.analyzeJobMatch() with job description and formatted resume
  - Return Lambda response with statusCode, headers (CORS), and JSON body: { score, strengths, gaps, recommendations }
  - Add comprehensive error handling with appropriate HTTP status codes (400 for validation, 500 for server errors)
  - Set CORS headers to allow requests from ALLOWED_ORIGIN environment variable
  - _Requirements: 1.3, 3.5, 7.3, 7.4, 7.5, 7.6_

- [ ] 5. Create frontend LoadingSpinner component
  - Create `src/components/LoadingSpinner.jsx`
  - Accept optional message prop for customizable loading text (default: "Analyzing...")
  - Implement animated CSS spinner
  - Create `src/components/LoadingSpinner.css` with spinner animation
  - Style consistently with existing design (use existing color scheme)
  - _Requirements: 1.5_

- [ ] 6. Create frontend AnalysisResults display component
  - Create `src/components/AnalysisResults.jsx`
  - Accept props: score, strengths, gaps, recommendations, onNewAnalysis callback
  - Display suitability score with large, prominent formatting
  - Implement color-coded score indicator (0-40: red, 41-70: yellow, 71-100: green)
  - Render strengths section with bullet points
  - Render gaps section with bullet points
  - Render recommendations section with bullet points
  - Add "New Analysis" button that calls onNewAnalysis callback
  - Create `src/components/AnalysisResults.css` with responsive styling
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 1.5_

- [ ] 7. Create frontend ResumeMatcherSection component
  - Create `src/components/ResumeMatcherSection.jsx`
  - Accept resumeData as prop from parent App component
  - Add state: jobDescription, isAnalyzing, result, error
  - Implement job description textarea with character count display (shows X/5000)
  - Add form validation (50-5000 characters) with inline error messages
  - Implement submit button with disabled state during analysis
  - Create API call function to POST to `${VITE_API_URL}` with jobDescription and resumeData
  - Handle loading state: show LoadingSpinner component
  - Handle success state: show AnalysisResults component
  - Handle error state: display error message with retry option
  - Implement "New Analysis" handler to reset state
  - Create `src/components/ResumeMatcherSection.css` with responsive styling
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1_

- [ ] 8. Integrate ResumeMatcherSection into main App
  - Import ResumeMatcherSection in `src/App.jsx`
  - Add ResumeMatcherSection component after About section
  - Pass resumeData prop to ResumeMatcherSection component
  - Add section with id "resume-matcher"
  - Update Sidebar links array to include { href: "#resume-matcher", label: "AI Job Match" }
  - Position link prominently in navigation (after About, before Skills)
  - _Requirements: 6.1, 6.4_

- [ ] 9. Create Lambda deployment package and deploy
  - Create deployment script or use AWS CLI to package Lambda function
  - Zip lambda/src/ directory contents (index.js, services/, utils/, node_modules/)
  - Deploy Lambda function to AWS with Node.js 20.x runtime
  - Configure Lambda environment variables (AWS_REGION, BEDROCK_AGENT_ID, BEDROCK_AGENT_ALIAS_ID, ALLOWED_ORIGIN)
  - Create Lambda Function URL with CORS configuration
  - Set Function URL auth type to NONE (public access)
  - Configure CORS: allowed origins, methods (POST), headers
  - Test Lambda Function URL with sample request
  - Update frontend .env with Lambda Function URL as VITE_API_URL
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 10. Create AWS deployment documentation and update README
  - Create `lambda/AWS_DEPLOYMENT.md` documentation file
  - Document IAM role/policy requirements for Lambda (bedrock:InvokeAgent permission)
  - Document Bedrock Agent setup steps:
    - Creating agent in AWS Bedrock console
    - Configuring agent instructions for resume analysis
    - Creating and publishing agent alias
    - Obtaining agent ID and alias ID
  - Document Lambda function deployment process (packaging, uploading, configuration)
  - Document Lambda Function URL setup (creating URL, CORS configuration)
  - Add environment variable configuration for Lambda
  - Include troubleshooting section for common deployment issues
  - Update root README.md with AI Resume Matcher feature description
  - Add Lambda setup and deployment instructions to README
  - Document all environment variables (frontend and Lambda)
  - _Requirements: 3.1, 6.1, 7.1, 7.3_

- [ ]* 11. Write Lambda unit tests
  - Install Jest and testing dependencies in lambda directory
  - Write tests for ResumeFormatter.formatResumeData() with various resume data structures
  - Write tests for BedrockService.analyzeJobMatch() with mocked Bedrock client
  - Write tests for Lambda handler with mocked event objects
  - Test error scenarios (invalid resume data, Bedrock timeout, validation errors)
  - Add test script to lambda package.json
  - _Requirements: 2.4, 3.4, 3.5_

- [ ]* 12. Write frontend component tests
  - Install Vitest and React Testing Library if not already present
  - Write tests for LoadingSpinner component rendering
  - Write tests for AnalysisResults component with different score ranges
  - Write tests for ResumeMatcherSection component rendering and state management
  - Write tests for form validation logic
  - Mock API calls and test success/error handling
  - Test loading, success, and error states
  - _Requirements: 1.3, 4.3, 5.5_
