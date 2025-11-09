# Design Document: AI Resume Matcher

## Overview

The AI Resume Matcher feature extends the existing React-based resume website with an intelligent job matching capability. The system uses AWS Bedrock (via AgentCore) to analyze job descriptions against the candidate's resume stored in S3, providing recruiters with a suitability score and detailed feedback.

The architecture follows a client-server pattern where the React frontend handles user interaction and result display, while a Node.js backend API manages AWS service integration, ensuring security and proper credential management.

## Architecture

### High-Level Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  React Frontend │◄───────►│  AWS Lambda      │◄───────►│   AWS Bedrock   │
│   (Vite App)    │  HTTPS  │  (Function URL)  │         │   AgentCore     │
│                 │         │                  │         │                 │
│ resumeData.json │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

### Component Layers

1. **Presentation Layer** (React Frontend)
   - Job description input form
   - Loading states and error handling
   - Results display (score + feedback)
   - Integration with existing navigation

2. **Serverless API Layer** (AWS Lambda)
   - Lambda Function URL for HTTPS endpoint
   - Request validation
   - AWS SDK integration
   - Error handling and logging
   - CORS configuration

3. **AI Processing Layer** (AWS Bedrock + AgentCore)
   - Resume data formatting from JSON
   - Prompt engineering for job matching
   - Response parsing and structuring

## Components and Interfaces

### Frontend Components

#### 1. ResumeMatcherSection Component
**Purpose**: Main container for the job matching feature

**Props**:
```typescript
interface ResumeMatcherSectionProps {
  resumeData: ResumeData;  // Pass from App component
}
```

**State**:
```typescript
interface ResumeMatcherState {
  jobDescription: string;
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
}
```

**Responsibilities**:
- Render job description textarea
- Handle form submission
- Send both job description and resumeData to API
- Display loading states
- Show results or errors
- Provide "New Analysis" action

#### 2. AnalysisResults Component
**Purpose**: Display the suitability score and feedback

**Props**:
```typescript
interface AnalysisResultsProps {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  onNewAnalysis: () => void;
}
```

**Responsibilities**:
- Display color-coded score (0-40: red, 41-70: yellow, 71-100: green)
- Render structured feedback sections
- Provide action to start new analysis

#### 3. LoadingSpinner Component
**Purpose**: Visual feedback during analysis

**Props**:
```typescript
interface LoadingSpinnerProps {
  message?: string;
}
```

### Lambda API

#### Lambda Function URL Endpoint: POST

**Request**:
```json
{
  "jobDescription": "string (50-5000 chars)",
  "resumeData": {
    "about": {...},
    "experience": {...},
    "skills": {...},
    "education": {...},
    "certifications": {...}
  }
}
```

**Response (Success - 200)**:
```json
{
  "score": 85,
  "strengths": [
    "15+ years of software engineering experience",
    "Strong AWS expertise including Lambda, S3, and CloudFormation",
    "Full-stack development with React and Node.js"
  ],
  "gaps": [
    "No direct experience with Kubernetes mentioned",
    "Limited mobile development background"
  ],
  "recommendations": [
    "Discuss AWS architecture experience in detail",
    "Explore willingness to learn Kubernetes",
    "Focus on full-stack project examples"
  ]
}
```

**Response (Error - 400/500)**:
```json
{
  "error": "Error message describing what went wrong"
}
```

#### Lambda Handler

**Main Handler**:
```javascript
exports.handler = async (event) => {
  // Parse request body
  // Validate input
  // Format resume data
  // Call Bedrock service
  // Return response with CORS headers
}
```

**ResumeFormatter**:
```javascript
class ResumeFormatter {
  static formatResumeData(resumeData): string
  // Converts resumeData.json to formatted text for AI analysis
}
```

**BedrockService**:
```javascript
class BedrockService {
  async analyzeJobMatch(jobDescription: string, resume: string): Promise<AnalysisResult>
  // Sends prompt to Bedrock and parses response
}
```

### AWS Integration

#### Lambda Configuration
- **Runtime**: Node.js 20.x
- **Memory**: 512 MB (adjustable based on performance)
- **Timeout**: 60 seconds (to accommodate 30-second Bedrock timeout + processing)
- **Function URL**: Enabled with CORS configuration
- **Auth**: NONE (public access)

#### Bedrock AgentCore Integration
AgentCore will be used to orchestrate the Bedrock interaction:

```javascript
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";

// AgentCore configuration
const agentConfig = {
  agentId: process.env.BEDROCK_AGENT_ID,
  agentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID,
  sessionId: generateSessionId()
};
```

#### IAM Permissions
Lambda execution role requires:
- `bedrock:InvokeAgent` - To call Bedrock Agent
- `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` - For CloudWatch logging

## Data Models

### AnalysisResult
```typescript
interface AnalysisResult {
  score: number;           // 0-100
  strengths: string[];     // Array of strength points
  gaps: string[];          // Array of identified gaps
  recommendations: string[]; // Array of recommendations
}
```

### JobMatchRequest
```typescript
interface JobMatchRequest {
  jobDescription: string;  // 50-5000 characters
  resumeData: ResumeData;  // Full resume data from resumeData.json
}

interface ResumeData {
  about: {
    name: string;
    location: string;
    content: string;
  };
  experience: {
    list: Array<{
      role: string;
      company: string;
      period: string;
      location: string;
      highlights: string[];
    }>;
  };
  skills: {
    list: string[];
  };
  education: {
    list: Array<{
      degree: string;
      college: string;
      location: string;
    }>;
  };
  certifications: {
    list: Array<{
      name: string;
      date?: string;
      url?: string;
    }>;
  };
}
```

### BedrockPrompt
The prompt sent to Bedrock will follow this structure:

```
You are an expert technical recruiter analyzing a candidate's resume against a job description.

JOB DESCRIPTION:
{jobDescription}

CANDIDATE RESUME:

Name: {name}
Location: {location}

About:
{about.content}

Skills:
{skills formatted as bullet points}

Experience:
{experience entries formatted with role, company, period, and highlights}

Education:
{education entries formatted with degree, college, location}

Certifications:
{certifications formatted with name and date}

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
}
```

**Resume Formatting Logic**:
The backend will convert the JSON structure into a human-readable format:
- Skills list becomes bullet points
- Experience entries show role, company, period, and key highlights
- Education and certifications are clearly formatted
- This gives the AI structured, easy-to-parse information

## Error Handling

### Frontend Error Scenarios

1. **Validation Errors**
   - Job description too short (<50 chars)
   - Job description too long (>5000 chars)
   - Resume data not available
   - Display inline error message below textarea

2. **Network Errors**
   - API unreachable
   - Timeout (>30 seconds)
   - Display user-friendly error message with retry option

3. **API Errors**
   - 400: Invalid request (show validation message)
   - 500: Server error (show generic error with retry)
   - Display error in dedicated error component

### Lambda Error Scenarios

1. **Data Validation Errors**
   - Missing or invalid resume data structure
   - Missing required fields in resume data
   - Return 400 with message: "Invalid resume data provided"

2. **Bedrock Errors**
   - Agent invocation failure
   - Timeout (>30 seconds)
   - Invalid response format
   - Return 500 with message: "Analysis service temporarily unavailable. Please try again."

3. **Validation Errors**
   - Missing job description
   - Invalid length
   - Return 400 with specific validation message

### Error Logging
- Lambda logs all errors to CloudWatch with context (timestamp, request ID, error details)
- Use structured logging (JSON format)
- Include correlation IDs for request tracking

## Testing Strategy

### Frontend Testing

1. **Unit Tests** (React Testing Library + Vitest)
   - ResumeMatcherSection component rendering
   - Form validation logic
   - State management (input, loading, results, errors)
   - AnalysisResults component with different score ranges
   - LoadingSpinner component

2. **Integration Tests**
   - Form submission flow
   - API call mocking
   - Error handling scenarios
   - Results display after successful analysis

3. **Manual Testing**
   - Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
   - Responsive design (desktop, tablet, mobile)
   - Accessibility (keyboard navigation, screen readers)

### Lambda Testing

1. **Unit Tests** (Jest)
   - ResumeFormatter.formatResumeData()
   - BedrockService.analyzeJobMatch()
   - Lambda handler with mocked events
   - Error handling utilities

2. **Integration Tests**
   - Full Lambda handler flow with mocked AWS services
   - Bedrock invocation with mock responses
   - Error scenarios (Bedrock timeout, validation errors)

3. **Manual Testing**
   - Real AWS service integration (dev environment)
   - End-to-end flow with actual resume and job descriptions
   - Performance testing (response times, cold starts)
   - Error recovery scenarios

### Test Data

**Sample Job Descriptions**:
- Short description (50-200 chars) - edge case
- Medium description (500-1000 chars) - typical
- Long description (3000-5000 chars) - edge case
- Various tech stacks (AWS-heavy, .NET-heavy, React-heavy)

**Expected Behaviors**:
- High match (70-100): Job requiring AWS, .NET, React, full-stack
- Medium match (40-70): Job requiring some matching skills but different domain
- Low match (0-40): Job requiring completely different tech stack

## Security Considerations

### Credential Management
- AWS credentials managed by Lambda execution role (no credentials in code)
- Lambda uses IAM role for Bedrock access
- Local development uses AWS CLI profiles or environment variables
- No credentials exposed to frontend

### API Security
- CORS configuration restricts API access to resume website domain via ALLOWED_ORIGIN
- Lambda Function URL provides HTTPS endpoint automatically
- Input validation and sanitization in Lambda handler
- Consider adding AWS WAF for rate limiting if needed (optional for MVP)

### Data Privacy
- Job descriptions are not stored (processed in memory only)
- Resume stored in private S3 bucket (not publicly accessible)
- No PII logging in application logs
- Session data cleared after analysis

## Deployment Considerations

### Lambda Deployment

**Deployment Process**:
1. Package Lambda function code and dependencies into ZIP file
2. Upload to AWS Lambda via console, CLI, or IaC (CloudFormation/Terraform)
3. Configure Lambda environment variables
4. Create Lambda Function URL
5. Configure CORS on Function URL
6. Test endpoint

**Benefits**:
- Serverless, scales automatically
- Pay per request (~$0.20 per million requests)
- No server management
- Easy integration with AWS services
- Built-in HTTPS via Function URL

### Frontend Deployment
- Existing Vite build process remains unchanged
- API endpoint URL configured via environment variable
- Build-time configuration for production Lambda Function URL

### Environment Variables

**Lambda**:
```
AWS_REGION=us-east-1
BEDROCK_AGENT_ID=<agent-id>
BEDROCK_AGENT_ALIAS_ID=<alias-id>
ALLOWED_ORIGIN=https://myresume.com
```

**Frontend**:
```
VITE_API_URL=https://abc123.lambda-url.us-east-1.on.aws
```

## Integration with Existing Application

### Navigation Integration
Add new link to Sidebar component:
```javascript
{ href: "#resume-matcher", label: "AI Job Match" }
```

### Section Placement
Insert ResumeMatcherSection after "About" section or as a prominent call-to-action near the top of the page.

### Styling Consistency
- Use existing CSS variables and design tokens
- Match color scheme and typography
- Maintain responsive breakpoints
- Follow existing component patterns

### Data Flow
```
User Input (Job Description)
    ↓
Frontend Validation
    ↓
Frontend: Prepare payload (jobDescription + resumeData)
    ↓
HTTPS POST to Lambda Function URL
    ↓
Lambda: Parse request body
    ↓
Lambda: Validate input
    ↓
Lambda: Format resume data to readable text
    ↓
Lambda: Invoke Bedrock via AgentCore
    ↓
Lambda: Parse and Structure Response
    ↓
Lambda: Return JSON with CORS headers
    ↓
Frontend: Display Results
```

## Performance Optimization

### Frontend
- Debounce character count validation
- Lazy load AnalysisResults component
- Memoize expensive computations
- Optimize re-renders with React.memo

### Lambda
- Resume formatting is fast (in-memory operation)
- AWS SDK client reuse across invocations (warm starts)
- Implement request timeout (30 seconds for Bedrock)
- Lambda cold starts: 1-2 seconds (first invocation or after idle period)

### Expected Performance Metrics
- Lambda cold start: 1-2 seconds (infrequent)
- Lambda warm execution: < 10 seconds total
- Resume formatting: < 10ms
- Bedrock analysis: 5-8 seconds
- Frontend render: < 100ms

## Future Enhancements

1. **Analysis History**: Store past analyses for recruiter reference
2. **Comparison Mode**: Compare multiple job descriptions side-by-side
3. **Detailed Scoring**: Break down score by categories (skills, experience, education)
4. **Export Results**: Download analysis as PDF
5. **Email Integration**: Send results directly to recruiter's email
6. **Multi-language Support**: Analyze job descriptions in different languages
