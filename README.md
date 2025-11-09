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
3. Lambda invokes AWS Bedrock Agent for AI analysis
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

Create a `.env.local` file with:

```
VITE_API_URL=your-lambda-function-url
```

Get the Lambda Function URL by deploying the backend (see below).

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

The AI Resume Matcher requires a serverless backend deployed to AWS Lambda using AWS SAM.

### Prerequisites

1. **Install AWS SAM CLI**
   - Windows: `choco install aws-sam-cli`
   - Mac: `brew install aws-sam-cli`
   - Linux: See [SAM installation guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

2. **AWS CLI configured**: `aws configure`

3. **Create Bedrock Agent** in AWS Console (see deployment guide for instructions)

### Deploy (3 Commands)

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

See [lambda/SAM_DEPLOYMENT.md](lambda/SAM_DEPLOYMENT.md) for detailed deployment guide.

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
│   ├── scripts/             # Deployment scripts
│   ├── DEPLOYMENT_GUIDE.md  # Detailed deployment guide
│   └── QUICK_START.md       # Quick deployment guide
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

### CORS Errors
- Verify `ALLOWED_ORIGIN` environment variable in Lambda matches your frontend URL
- Include protocol (http:// or https://)

### Lambda Timeout
- Check CloudWatch logs: `aws logs tail /aws/lambda/resume-matcher-lambda --follow`
- Verify Bedrock Agent is responding
- Increase Lambda timeout if needed

### "Agent not found" Error
- Verify `BEDROCK_AGENT_ID` and `BEDROCK_AGENT_ALIAS_ID` are correct
- Ensure agent is published and in the same region

## Contributing

This is a personal resume website. Feel free to fork and customize for your own use!

## License

MIT
