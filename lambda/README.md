# Resume Matcher Lambda Function

AWS Lambda function that provides AI-powered resume matching using AWS Bedrock.

## Quick Start

```bash
sam build
sam deploy --guided
```

See [SAM_DEPLOYMENT.md](SAM_DEPLOYMENT.md) for detailed deployment guide.

## Documentation

- **[SAM_DEPLOYMENT.md](SAM_DEPLOYMENT.md)** - Complete deployment guide
- **[template.yaml](template.yaml)** - SAM infrastructure template
- **[samconfig.toml](samconfig.toml)** - Deployment configuration

## Architecture

```
Frontend (React)
    ↓ HTTPS POST
Lambda Function URL
    ↓
Lambda Function (Node.js 20)
    ↓
AWS Bedrock Agent
    ↓
AI Model (Claude 3)
    ↓
Analysis Results (JSON)
```

## Features

- **AI-Powered Analysis**: Uses AWS Bedrock for intelligent resume matching
- **Serverless**: No servers to manage, scales automatically
- **CORS Enabled**: Secure cross-origin requests from your frontend
- **Function URL**: Public HTTPS endpoint (no API Gateway needed)
- **Fast**: Typically responds in 5-10 seconds

## Environment Variables

- `AWS_REGION` - AWS region (e.g., us-east-1)
- `BEDROCK_AGENT_ID` - Your Bedrock Agent ID
- `BEDROCK_AGENT_ALIAS_ID` - Your Bedrock Agent Alias ID
- `ALLOWED_ORIGIN` - CORS allowed origin (your frontend URL)

## API

### POST /

**Request:**
```json
{
  "jobDescription": "Senior Full Stack Developer with React and AWS...",
  "resumeData": {
    "about": { "name": "...", "location": "...", "content": "..." },
    "skills": { "list": ["React", "AWS", "..."] },
    "experience": { "list": [...] },
    "education": { "list": [...] },
    "certifications": { "list": [...] }
  }
}
```

**Response:**
```json
{
  "score": 85,
  "strengths": [
    "Strong React and AWS experience",
    "Relevant certifications",
    "..."
  ],
  "gaps": [
    "Limited backend experience mentioned",
    "..."
  ],
  "recommendations": [
    "Discuss AWS projects in detail",
    "..."
  ]
}
```

## Testing

```bash
# Get Function URL
sam list stack-outputs --stack-name resume-matcher-stack

# Test with curl
curl -X POST <FUNCTION_URL> -H "Content-Type: application/json" -d '{...}'

# View logs
sam logs -n ResumeMatcherFunction --tail
```

## Monitoring

```bash
# View logs
sam logs -n ResumeMatcherFunction --tail

# Or with AWS CLI
aws logs tail /aws/lambda/resume-matcher-lambda --follow
```

## Cost

- Lambda: ~$0.01/month for 100 requests
- Bedrock: ~$1-5/month for 100 analyses
- **Total: ~$1-5/month**

## Tech Stack

- **Runtime**: Node.js 20.x
- **AWS Services**: Lambda, Bedrock, CloudWatch
- **Dependencies**: @aws-sdk/client-bedrock-agent-runtime

## Project Structure

```
lambda/
├── src/
│   ├── index.js              # Lambda handler
│   ├── services/
│   │   └── bedrockService.js # Bedrock integration
│   └── utils/
│       └── resumeFormatter.js # Resume formatting
├── template.yaml              # SAM template (IaC)
├── samconfig.toml            # SAM configuration
├── .samignore                # Files to exclude from package
└── package.json              # Dependencies
```

## Support

- See [SAM_DEPLOYMENT.md](SAM_DEPLOYMENT.md) for deployment help
- Review CloudWatch logs: `sam logs -n ResumeMatcherFunction --tail`
- Verify Bedrock Agent configuration in AWS Console
- Check [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)

## License

MIT
