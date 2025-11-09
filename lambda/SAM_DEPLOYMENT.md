# SAM Deployment Guide

This guide shows you how to deploy the Resume Matcher Lambda using AWS SAM (Serverless Application Model).

## Why SAM?

SAM provides:
- ✅ Infrastructure as Code (IaC)
- ✅ Automatic IAM role creation
- ✅ Built-in Function URL support
- ✅ Easy updates and rollbacks
- ✅ Local testing capabilities
- ✅ No manual script management

## Prerequisites

1. **Install AWS SAM CLI**
   
   **Windows (PowerShell):**
   ```powershell
   # Using Chocolatey
   choco install aws-sam-cli
   
   # Or download MSI installer from:
   # https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
   ```
   
   **Mac:**
   ```bash
   brew install aws-sam-cli
   ```
   
   **Linux:**
   ```bash
   # Download and install
   wget https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
   unzip aws-sam-cli-linux-x86_64.zip -d sam-installation
   sudo ./sam-installation/install
   ```

2. **AWS CLI configured**
   ```bash
   aws configure
   ```

3. **Docker installed** (for local testing - optional)

## Quick Deployment (3 Commands)

### Step 1: Set Up Bedrock Agent

Before deploying, create your Bedrock Agent:

1. Go to AWS Bedrock Console → Agents → Create Agent
2. Name: `resume-matcher-agent`
3. Choose model (e.g., Claude 3 Sonnet)
4. Add instructions:

```
You are an expert technical recruiter analyzing a candidate's resume against a job description.

When given a job description and resume, you must:
1. Analyze the candidate's suitability for the role
2. Provide a numerical score from 0-100 indicating overall fit
3. Identify 3-5 key strengths where the candidate excels
4. Identify 2-4 gaps where the candidate may not meet requirements
5. Provide 3-5 recommendations for interview focus or role adjustments

Always respond in valid JSON format with this structure:
{
  "score": <number between 0-100>,
  "strengths": [<array of strings>],
  "gaps": [<array of strings>],
  "recommendations": [<array of strings>]
}

Be objective, thorough, and constructive in your analysis.
```

5. Create and publish an alias
6. Copy the **Agent ID** and **Agent Alias ID**

### Step 2: Build

```bash
cd lambda
sam build
```

### Step 3: Deploy

**First deployment (guided):**
```bash
sam deploy --guided
```

You'll be prompted for:
- **Stack Name**: `resume-matcher-stack` (press Enter for default)
- **AWS Region**: `us-east-1` (or your preferred region)
- **Parameter BedrockAgentId**: Paste your Agent ID
- **Parameter BedrockAgentAliasId**: Paste your Agent Alias ID
- **Parameter AllowedOrigin**: `http://localhost:5173` (for dev) or `https://yourdomain.com` (for prod)
- **Confirm changes before deploy**: Y
- **Allow SAM CLI IAM role creation**: Y
- **Disable rollback**: N
- **ResumeMatcherFunction has no authorization defined, Is this okay?**: Y (we want public access)
- **Save arguments to configuration file**: Y
- **SAM configuration file**: `samconfig.toml` (press Enter)
- **SAM configuration environment**: `default` (press Enter)

**Subsequent deployments:**
```bash
sam build && sam deploy
```

### Step 4: Get Function URL

After deployment, SAM will output the Function URL:

```
Outputs
-------
Key                 FunctionUrl
Description         Lambda Function URL endpoint
Value               https://abc123xyz.lambda-url.us-east-1.on.aws/
```

Copy this URL!

### Step 5: Update Frontend

Create `.env.local` in your project root:

```
VITE_API_URL=https://abc123xyz.lambda-url.us-east-1.on.aws/
```

## Testing

### Test Locally (Optional)

```bash
# Start local API
sam local start-api

# In another terminal, test
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "We need a React developer",
    "resumeData": {...}
  }'
```

### Test Deployed Function

```bash
# Get the Function URL from outputs
sam list stack-outputs --stack-name resume-matcher-stack

# Test with curl
curl -X POST <FUNCTION_URL> \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Senior Full Stack Developer with React and AWS experience",
    "resumeData": {
      "about": {"name": "John Doe", "location": "SF", "content": "Developer"},
      "skills": {"list": ["React", "AWS", "Node.js"]},
      "experience": {"list": []},
      "education": {"list": []},
      "certifications": {"list": []}
    }
  }'
```

## Updating the Function

### Update Code

```bash
# Make your code changes, then:
sam build && sam deploy
```

### Update Environment Variables

Edit `samconfig.toml` and update the `parameter_overrides` line:

```toml
parameter_overrides = "BedrockAgentId=\"NEW_ID\" BedrockAgentAliasId=\"NEW_ALIAS\" AllowedOrigin=\"https://newdomain.com\""
```

Then deploy:
```bash
sam deploy
```

Or use parameters directly:
```bash
sam deploy \
  --parameter-overrides \
    BedrockAgentId=NEW_ID \
    BedrockAgentAliasId=NEW_ALIAS \
    AllowedOrigin=https://newdomain.com
```

## Useful Commands

```bash
# Build the application
sam build

# Deploy with guided prompts
sam deploy --guided

# Deploy with saved config
sam deploy

# View CloudWatch logs
sam logs -n ResumeMatcherFunction --tail

# View stack outputs (including Function URL)
sam list stack-outputs --stack-name resume-matcher-stack

# View stack resources
sam list resources --stack-name resume-matcher-stack

# Delete the stack (cleanup)
sam delete --stack-name resume-matcher-stack

# Validate template
sam validate

# Local testing
sam local start-api
sam local invoke ResumeMatcherFunction -e events/test-event.json
```

## Configuration Files

### template.yaml
Defines your Lambda function, IAM permissions, Function URL, and CORS configuration.

### samconfig.toml
Stores deployment configuration so you don't need to enter parameters every time.

## Monitoring

### View Logs
```bash
# Tail logs in real-time
sam logs -n ResumeMatcherFunction --tail

# View logs from last 10 minutes
sam logs -n ResumeMatcherFunction --start-time '10min ago'

# Filter logs
sam logs -n ResumeMatcherFunction --filter 'ERROR'
```

### CloudWatch Console
```bash
# Open CloudWatch logs in browser
aws logs tail /aws/lambda/resume-matcher-lambda --follow
```

## Troubleshooting

### Issue: "Unable to upload artifact ... Access Denied"
**Solution:** SAM needs an S3 bucket. Use `--guided` to create one automatically, or specify:
```bash
sam deploy --guided --s3-bucket your-bucket-name
```

### Issue: CORS errors
**Solution:** Update the `AllowedOrigin` parameter:
```bash
sam deploy --parameter-overrides AllowedOrigin=https://yourdomain.com
```

### Issue: "Agent not found"
**Solution:** Verify your Bedrock Agent ID and Alias ID are correct:
```bash
sam deploy --parameter-overrides \
  BedrockAgentId=CORRECT_ID \
  BedrockAgentAliasId=CORRECT_ALIAS
```

### Issue: Build fails
**Solution:** Ensure dependencies are installed:
```bash
cd lambda
npm install --production
sam build
```

## Multiple Environments

Deploy to different environments:

```bash
# Development
sam deploy --config-env dev \
  --parameter-overrides AllowedOrigin=http://localhost:5173

# Production
sam deploy --config-env prod \
  --parameter-overrides AllowedOrigin=https://myresume.com
```

Add to `samconfig.toml`:
```toml
[dev]
[dev.deploy.parameters]
stack_name = "resume-matcher-dev"
parameter_overrides = "AllowedOrigin=\"http://localhost:5173\""

[prod]
[prod.deploy.parameters]
stack_name = "resume-matcher-prod"
parameter_overrides = "AllowedOrigin=\"https://myresume.com\""
```

## Cost Estimation

Same as manual deployment:
- Lambda: ~$0.01/month for 100 requests
- Bedrock: ~$1-5/month for 100 analyses
- S3 (SAM artifacts): ~$0.01/month

## Cleanup

To delete everything:
```bash
sam delete --stack-name resume-matcher-stack
```

This removes:
- Lambda function
- IAM role
- Function URL
- CloudWatch log groups

## Advantages Over Manual Scripts

| Feature | Manual Scripts | SAM |
|---------|---------------|-----|
| IAM Role Creation | Manual | Automatic |
| Function URL Setup | Manual | Automatic |
| CORS Configuration | Manual | Declarative |
| Updates | Re-zip and upload | `sam deploy` |
| Rollback | Manual | Automatic |
| Multiple Environments | Complex | Built-in |
| Local Testing | Not possible | `sam local` |
| Infrastructure as Code | No | Yes |
| Version Control | Scripts only | Full stack |

## Next Steps

1. ✅ Install SAM CLI
2. ✅ Create Bedrock Agent
3. ✅ Run `sam build`
4. ✅ Run `sam deploy --guided`
5. ✅ Copy Function URL
6. ✅ Update frontend `.env.local`
7. ✅ Test the integration
8. 🚀 Deploy frontend

## Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [SAM CLI Reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)
- [SAM Template Specification](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification.html)
