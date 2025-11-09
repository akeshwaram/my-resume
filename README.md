# Personal Resume Website

A modern, interactive resume website built with React and Vite, featuring AI-powered job matching capabilities.

## Features

- **Interactive Resume Display**: Clean, professional layout with smooth navigation
- **AI Job Matcher**: Analyze job descriptions against your resume using AWS Bedrock AI
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Data-Driven**: Easy content updates through JSON configuration

## AI Resume Matcher

The AI Resume Matcher feature allows recruiters and hiring managers to:
- Input a job description (50-5000 characters)
- Get an AI-powered suitability score (0-100)
- Receive detailed feedback on strengths, gaps, and recommendations
- Make informed hiring decisions quickly

### How It Works

1. User enters a job description
2. System sends the job description and resume data to AWS Lambda
3. Lambda uses AWS Bedrock Agent Core to invoke AI model for analysis
4. Results are displayed with color-coded scoring and detailed feedback

## Setup

### Prerequisites

- Node.js 18+ and npm
- AWS account (for AI Resume Matcher feature)
- AWS CLI configured (for Lambda deployment)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

#### Frontend Environment Variables

Create a `.env.local` file in the project root:

```env
# Lambda Function URL (get this after deploying the backend)
VITE_API_URL=https://your-function-url.lambda-url.us-east-1.on.aws/
```

#### Lambda Environment Variables

The Lambda function requires these environment variables (configured during deployment):

```env
# AWS region where your Lambda and Bedrock models are deployed
AWS_REGION=us-east-1

# Bedrock Model ID (foundation model to use)
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# CORS allowed origin (your frontend URL)
ALLOWED_ORIGIN=http://localhost:5173
# For production: ALLOWED_ORIGIN=https://yourdomain.com
```

**Note:** Lambda environment variables are set during deployment via SAM parameters or AWS Console/CLI. See deployment guides for details.

## Resume Data

Update your resume content in `src/resumeData.json`:

```json
{
  "about": { "name": "Your Name", "location": "Your Location", "content": "..." },
  "skills": { "list": ["Skill 1", "Skill 2"] },
  "experience": { "list": [...] },
  "education": { "list": [...] },
  "certifications": { "list": [...] }
}
```

## AI Resume Matcher Setup

The AI Resume Matcher uses **AWS Bedrock Agent Core** for AI-powered analysis. This approach eliminates the need for manual agent creation - everything is in code!

The backend requires a serverless Lambda function deployed to AWS. You can deploy using either:

1. **AWS SAM (Recommended)** - Automated deployment with Infrastructure as Code
2. **Manual AWS Deployment** - Step-by-step manual setup via AWS Console/CLI

### Prerequisites

**For SAM Deployment:**
1. **Install AWS SAM CLI**
   - Windows: `choco install aws-sam-cli`
   - Mac: `brew install aws-sam-cli`
   - Linux: See [SAM installation guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
2. **AWS CLI configured**: `aws configure`
3. **Enable Bedrock model access** in AWS Console (one-time, see deployment guide)

**For Manual Deployment:**
1. **AWS CLI configured**: `aws configure`
2. **Node.js 18+** installed
3. **Enable Bedrock model access** in AWS Console (one-time, see deployment guide)

### Quick Deploy with SAM (Recommended)

```bash
cd lambda

# 1. Build
sam build

# 2. Deploy (first time - will prompt for Bedrock Agent ID, Alias ID, and CORS origin)
sam deploy --guided

# 3. Get Function URL from outputs and add to .env.local
```

After deployment, copy the Function URL from the outputs and add it to `.env.local`:
```
VITE_API_URL=https://your-function-url.lambda-url.us-east-1.on.aws/
```

### Update Deployment

```bash
cd lambda
sam build && sam deploy
```

### Testing

```bash
# Get Function URL
sam list stack-outputs --stack-name resume-matcher-stack

# View logs
sam logs -n ResumeMatcherFunction --tail

# Test endpoint
curl -X POST <FUNCTION_URL> -H "Content-Type: application/json" -d '{...}'
```

### Deployment Documentation

- **[lambda/SAM_DEPLOYMENT.md](lambda/SAM_DEPLOYMENT.md)** - Complete SAM deployment guide (recommended)
- **[lambda/AWS_DEPLOYMENT.md](lambda/AWS_DEPLOYMENT.md)** - Manual AWS deployment guide (alternative)

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── Sidebar.jsx
│   │   ├── Section.jsx
│   │   ├── ExperienceSection.jsx
│   │   ├── ResumeMatcherSection.jsx
│   │   ├── AnalysisResults.jsx
│   │   └── LoadingSpinner.jsx
│   ├── resumeData.json      # Resume content
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── lambda/                  # AWS Lambda backend
│   ├── src/
│   │   ├── index.js         # Lambda handler
│   │   ├── services/        # Bedrock service
│   │   └── utils/           # Resume formatter
│   ├── template.yaml        # SAM infrastructure template
│   ├── SAM_DEPLOYMENT.md    # SAM deployment guide (recommended)
│   └── AWS_DEPLOYMENT.md    # Manual AWS deployment guide
└── index.html               # HTML entry point
```

## Technology Stack

### Frontend
- **React 19.1.1** - UI framework
- **Vite** - Build tool and dev server
- **ESLint** - Code linting

### Backend (Lambda)
- **Node.js 20.x** - Runtime
- **AWS Lambda** - Serverless compute
- **AWS Bedrock** - AI/ML service
- **AWS SDK v3** - AWS service integration

## Deployment

### Frontend Deployment

Build and deploy the frontend to your hosting provider:

```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

Popular options:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Backend Deployment

The Lambda function is deployed separately. See [lambda/QUICK_START.md](lambda/QUICK_START.md).

## Cost Estimation

### Lambda + Bedrock (AI Resume Matcher)
- **Lambda**: ~$0.20 per 1M requests + compute time
- **Bedrock**: ~$0.01-0.05 per analysis (varies by model)
- **Estimated**: ~$1-5/month for 100 analyses

### Frontend Hosting
- Most static hosting providers offer free tiers
- Vercel, Netlify: Free for personal projects

## Security

- AWS credentials managed via IAM roles (never exposed to frontend)
- CORS configured to restrict API access
- HTTPS enforced via Lambda Function URL
- Input validation on both frontend and backend

## Troubleshooting

### Common Issues

#### CORS Errors
**Symptoms:** Browser console shows CORS policy errors

**Solutions:**
- Verify `ALLOWED_ORIGIN` environment variable in Lambda matches your frontend URL exactly
- Include protocol (http:// or https://)
- No trailing slash in the origin URL
- Clear browser cache and retry
- Check Lambda Function URL CORS configuration

#### Lambda Timeout
**Symptoms:** Request takes too long and fails

**Solutions:**
- Check CloudWatch logs: `aws logs tail /aws/lambda/resume-matcher-lambda --follow`
- Verify Bedrock Agent is responding (test in Bedrock Console)
- Increase Lambda timeout to 60 seconds (Configuration → General configuration)
- Check network connectivity between Lambda and Bedrock

#### "Agent not found" Error
**Symptoms:** Error message about missing or invalid agent

**Solutions:**
- Verify `BEDROCK_AGENT_ID` and `BEDROCK_AGENT_ALIAS_ID` are correct
- Ensure agent is in "Prepared" state in Bedrock Console
- Confirm agent is published with an active alias
- Verify agent is in the same AWS region as Lambda function
- Check IAM role has `bedrock:InvokeAgent` permission

#### Invalid JSON Response
**Symptoms:** Lambda returns malformed or unexpected data

**Solutions:**
- Review Bedrock Agent instructions in AWS Console
- Test agent directly in Bedrock Console with sample input
- Ensure agent instructions explicitly request JSON format
- Try a different model (Claude 3.5 Sonnet recommended)
- Check CloudWatch logs for parsing errors

#### Function URL Not Working
**Symptoms:** Cannot access Lambda Function URL

**Solutions:**
- Verify Function URL is created (Configuration → Function URL)
- Check auth type is set to NONE for public access
- Ensure public access permission is granted
- Test with curl to isolate frontend issues
- Verify HTTPS is used (not HTTP)

### Viewing Logs

**Using SAM:**
```bash
sam logs -n ResumeMatcherFunction --tail
```

**Using AWS CLI:**
```bash
aws logs tail /aws/lambda/resume-matcher-lambda --follow
```

**Using AWS Console:**
1. Navigate to CloudWatch → Log groups
2. Find `/aws/lambda/resume-matcher-lambda`
3. View log streams

### Getting Help

1. Check CloudWatch logs for detailed error messages
2. Review the deployment guides:
   - [SAM Deployment Guide](lambda/SAM_DEPLOYMENT.md)
   - [Manual AWS Deployment Guide](lambda/AWS_DEPLOYMENT.md)
3. Verify all environment variables are set correctly
4. Test Bedrock Agent independently in AWS Console
5. Check AWS service health dashboard for outages

## Contributing

This is a personal resume website. Feel free to fork and customize for your own use!

## License

MIT
