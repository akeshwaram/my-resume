# AWS Deployment Guide (Manual)

This guide covers manual deployment of the Resume Matcher Lambda function using the AWS Console and CLI. For automated deployment using AWS SAM, see [SAM_DEPLOYMENT.md](SAM_DEPLOYMENT.md).

## Overview

The Resume Matcher Lambda function requires:
1. AWS Bedrock Agent setup
2. IAM role with appropriate permissions
3. Lambda function deployment
4. Lambda Function URL configuration
5. Environment variable configuration

## Prerequisites

- AWS account with appropriate permissions
- AWS CLI installed and configured (`aws configure`)
- Node.js 18+ installed locally
- Basic understanding of AWS Lambda and IAM

## Step 1: Create Bedrock Agent

### 1.1 Navigate to Bedrock Console

1. Open AWS Console
2. Navigate to **Amazon Bedrock** service
3. Select **Agents** from the left sidebar
4. Click **Create Agent**

### 1.2 Configure Agent

**Basic Information:**
- **Agent name**: `resume-matcher-agent`
- **Description**: `AI agent for analyzing resume suitability against job descriptions`
- **User input**: Enable

**Model Selection:**
- Choose a model (recommended: **Claude 3 Sonnet** or **Claude 3.5 Sonnet**)
- Region: Same as your Lambda function region

### 1.3 Add Agent Instructions

In the **Instructions** section, add:

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

Be objective, thorough, and constructive in your analysis. Focus on technical skills, experience relevance, and qualification alignment.
```

### 1.4 Create and Publish Agent

1. Click **Create Agent**
2. Wait for agent creation to complete
3. Click **Prepare** to prepare the agent
4. Once prepared, click **Create Alias**
   - **Alias name**: `production` (or `v1`)
   - **Description**: `Production alias for resume matcher`
5. Click **Create Alias**

### 1.5 Note Agent Details

Copy and save these values (you'll need them later):
- **Agent ID**: Found in agent details (format: `ABCDEFGHIJ`)
- **Agent Alias ID**: Found in alias details (format: `TSTALIASID`)

## Step 2: Create IAM Role for Lambda

### 2.1 Create IAM Policy for Bedrock Access

1. Navigate to **IAM** → **Policies** → **Create Policy**
2. Select **JSON** tab
3. Paste the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeAgent"
      ],
      "Resource": [
        "arn:aws:bedrock:*:*:agent/*",
        "arn:aws:bedrock:*:*:agent-alias/*"
      ]
    }
  ]
}
```

4. Click **Next**
5. **Policy name**: `BedrockAgentInvokePolicy`
6. **Description**: `Allows Lambda to invoke Bedrock agents`
7. Click **Create Policy**

### 2.2 Create Lambda Execution Role

1. Navigate to **IAM** → **Roles** → **Create Role**
2. **Trusted entity type**: AWS service
3. **Use case**: Lambda
4. Click **Next**

**Attach Permissions:**
- Search and select: `AWSLambdaBasicExecutionRole` (for CloudWatch logs)
- Search and select: `BedrockAgentInvokePolicy` (created in step 2.1)

5. Click **Next**
6. **Role name**: `ResumeMatcherLambdaRole`
7. **Description**: `Execution role for Resume Matcher Lambda function`
8. Click **Create Role**

### 2.3 Note Role ARN

Copy the **Role ARN** (format: `arn:aws:iam::123456789012:role/ResumeMatcherLambdaRole`)

## Step 3: Package Lambda Function

### 3.1 Install Dependencies

```bash
cd lambda
npm install --production
```

### 3.2 Create Deployment Package

**Windows (PowerShell):**
```powershell
# Create deployment directory
New-Item -ItemType Directory -Force -Path deploy

# Copy source files
Copy-Item -Recurse src deploy/
Copy-Item -Recurse node_modules deploy/
Copy-Item package.json deploy/

# Create ZIP file
Compress-Archive -Path deploy/* -DestinationPath resume-matcher-lambda.zip -Force

# Cleanup
Remove-Item -Recurse -Force deploy
```

**Mac/Linux:**
```bash
# Create deployment directory
mkdir -p deploy

# Copy source files
cp -r src deploy/
cp -r node_modules deploy/
cp package.json deploy/

# Create ZIP file
cd deploy
zip -r ../resume-matcher-lambda.zip .
cd ..

# Cleanup
rm -rf deploy
```

You should now have `resume-matcher-lambda.zip` in the lambda directory.

## Step 4: Create Lambda Function

### 4.1 Using AWS Console

1. Navigate to **AWS Lambda** → **Functions** → **Create Function**
2. Select **Author from scratch**
3. **Function name**: `resume-matcher-lambda`
4. **Runtime**: Node.js 20.x
5. **Architecture**: x86_64
6. **Permissions**: 
   - Select **Use an existing role**
   - Choose `ResumeMatcherLambdaRole` (created in Step 2.2)
7. Click **Create Function**

### 4.2 Upload Code

1. In the function page, scroll to **Code source**
2. Click **Upload from** → **.zip file**
3. Click **Upload** and select `resume-matcher-lambda.zip`
4. Click **Save**

### 4.3 Configure Function Settings

**General Configuration:**
1. Click **Configuration** tab → **General configuration** → **Edit**
2. **Memory**: 512 MB
3. **Timeout**: 60 seconds
4. **Handler**: `src/index.handler`
5. Click **Save**

**Environment Variables:**
1. Click **Configuration** tab → **Environment variables** → **Edit**
2. Add the following variables:
   - `AWS_REGION`: Your AWS region (e.g., `us-east-1`)
   - `BEDROCK_AGENT_ID`: Your Agent ID from Step 1.5
   - `BEDROCK_AGENT_ALIAS_ID`: Your Agent Alias ID from Step 1.5
   - `ALLOWED_ORIGIN`: Your frontend URL (e.g., `http://localhost:5173` for dev or `https://yourdomain.com` for prod)
3. Click **Save**

### 4.4 Using AWS CLI

Alternatively, create the function using CLI:

```bash
# Create function
aws lambda create-function \
  --function-name resume-matcher-lambda \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/ResumeMatcherLambdaRole \
  --handler src/index.handler \
  --zip-file fileb://resume-matcher-lambda.zip \
  --timeout 60 \
  --memory-size 512 \
  --environment Variables="{
    AWS_REGION=us-east-1,
    BEDROCK_AGENT_ID=YOUR_AGENT_ID,
    BEDROCK_AGENT_ALIAS_ID=YOUR_ALIAS_ID,
    ALLOWED_ORIGIN=http://localhost:5173
  }"
```

## Step 5: Create Lambda Function URL

### 5.1 Using AWS Console

1. In your Lambda function page, click **Configuration** tab
2. Select **Function URL** from left sidebar
3. Click **Create function URL**
4. **Auth type**: NONE (public access)
5. **Configure cross-origin resource sharing (CORS)**: Check this box
6. **CORS Configuration**:
   - **Allow origin**: Your frontend URL (e.g., `http://localhost:5173` or `https://yourdomain.com`)
   - **Allow methods**: POST
   - **Allow headers**: content-type
   - **Max age**: 86400
7. Click **Save**

### 5.2 Using AWS CLI

```bash
# Create Function URL
aws lambda create-function-url-config \
  --function-name resume-matcher-lambda \
  --auth-type NONE \
  --cors '{
    "AllowOrigins": ["http://localhost:5173"],
    "AllowMethods": ["POST"],
    "AllowHeaders": ["content-type"],
    "MaxAge": 86400
  }'

# Add permission for public access
aws lambda add-permission \
  --function-name resume-matcher-lambda \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --function-url-auth-type NONE
```

### 5.3 Note Function URL

Copy the **Function URL** (format: `https://abc123xyz.lambda-url.us-east-1.on.aws/`)

## Step 6: Configure Frontend

### 6.1 Update Environment Variables

In your project root, create or update `.env.local`:

```
VITE_API_URL=https://abc123xyz.lambda-url.us-east-1.on.aws/
```

Replace with your actual Function URL from Step 5.3.

### 6.2 Test Integration

```bash
# Start frontend dev server
npm run dev
```

Navigate to the AI Job Match section and test with a job description.

## Step 7: Test Lambda Function

### 7.1 Test in AWS Console

1. In Lambda function page, click **Test** tab
2. Click **Create new event**
3. **Event name**: `test-resume-match`
4. **Event JSON**:

```json
{
  "body": "{\"jobDescription\":\"Senior Full Stack Developer with React and AWS experience. Must have 5+ years of experience.\",\"resumeData\":{\"about\":{\"name\":\"John Doe\",\"location\":\"San Francisco, CA\",\"content\":\"Experienced software engineer\"},\"skills\":{\"list\":[\"React\",\"AWS\",\"Node.js\",\"TypeScript\"]},\"experience\":{\"list\":[{\"role\":\"Senior Developer\",\"company\":\"Tech Corp\",\"period\":\"2018-Present\",\"location\":\"SF\",\"highlights\":[\"Built React apps\",\"Deployed to AWS\"]}]},\"education\":{\"list\":[{\"degree\":\"BS Computer Science\",\"college\":\"State University\",\"location\":\"CA\"}]},\"certifications\":{\"list\":[{\"name\":\"AWS Certified Developer\"}]}}}"
}
```

5. Click **Save**
6. Click **Test**
7. Check the response in **Execution results**

### 7.2 Test with curl

```bash
curl -X POST https://your-function-url.lambda-url.us-east-1.on.aws/ \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{
    "jobDescription": "Senior Full Stack Developer with React and AWS experience",
    "resumeData": {
      "about": {
        "name": "John Doe",
        "location": "San Francisco, CA",
        "content": "Experienced software engineer"
      },
      "skills": {
        "list": ["React", "AWS", "Node.js", "TypeScript"]
      },
      "experience": {
        "list": [{
          "role": "Senior Developer",
          "company": "Tech Corp",
          "period": "2018-Present",
          "location": "SF",
          "highlights": ["Built React apps", "Deployed to AWS"]
        }]
      },
      "education": {
        "list": [{
          "degree": "BS Computer Science",
          "college": "State University",
          "location": "CA"
        }]
      },
      "certifications": {
        "list": [{"name": "AWS Certified Developer"}]
      }
    }
  }'
```

Expected response:
```json
{
  "score": 85,
  "strengths": ["Strong React experience", "AWS certified", "..."],
  "gaps": ["...", "..."],
  "recommendations": ["...", "..."]
}
```

## Updating the Lambda Function

### Update Code

```bash
# Make your changes, then repackage
cd lambda
npm install --production

# Create new ZIP (see Step 3.2)

# Upload using Console or CLI
aws lambda update-function-code \
  --function-name resume-matcher-lambda \
  --zip-file fileb://resume-matcher-lambda.zip
```

### Update Environment Variables

**Console:**
1. Configuration → Environment variables → Edit
2. Update values
3. Save

**CLI:**
```bash
aws lambda update-function-configuration \
  --function-name resume-matcher-lambda \
  --environment Variables="{
    AWS_REGION=us-east-1,
    BEDROCK_AGENT_ID=NEW_AGENT_ID,
    BEDROCK_AGENT_ALIAS_ID=NEW_ALIAS_ID,
    ALLOWED_ORIGIN=https://newdomain.com
  }"
```

### Update CORS Settings

**Console:**
1. Configuration → Function URL → Edit
2. Update CORS settings
3. Save

**CLI:**
```bash
aws lambda update-function-url-config \
  --function-name resume-matcher-lambda \
  --cors '{
    "AllowOrigins": ["https://newdomain.com"],
    "AllowMethods": ["POST"],
    "AllowHeaders": ["content-type"],
    "MaxAge": 86400
  }'
```

## Monitoring and Logs

### View Logs in CloudWatch

**Console:**
1. Navigate to **CloudWatch** → **Log groups**
2. Find `/aws/lambda/resume-matcher-lambda`
3. Click to view log streams

**CLI:**
```bash
# Tail logs
aws logs tail /aws/lambda/resume-matcher-lambda --follow

# View recent logs
aws logs tail /aws/lambda/resume-matcher-lambda --since 10m

# Filter for errors
aws logs tail /aws/lambda/resume-matcher-lambda --filter-pattern "ERROR"
```

### CloudWatch Metrics

Monitor in CloudWatch:
- **Invocations**: Number of function calls
- **Duration**: Execution time
- **Errors**: Failed invocations
- **Throttles**: Rate-limited requests

## Troubleshooting

### Issue: "Access Denied" when invoking Bedrock

**Cause:** IAM role missing Bedrock permissions

**Solution:**
1. Go to IAM → Roles → ResumeMatcherLambdaRole
2. Verify `BedrockAgentInvokePolicy` is attached
3. Check policy has `bedrock:InvokeAgent` permission
4. Verify resource ARNs include your agent

### Issue: CORS errors in browser

**Cause:** CORS not configured correctly or origin mismatch

**Solution:**
1. Verify `ALLOWED_ORIGIN` environment variable matches your frontend URL exactly
2. Include protocol (http:// or https://)
3. No trailing slash in origin
4. Check Function URL CORS configuration matches
5. Clear browser cache and retry

### Issue: "Agent not found" error

**Cause:** Invalid Agent ID or Alias ID

**Solution:**
1. Go to Bedrock Console → Agents
2. Verify agent exists and is in "Prepared" state
3. Check Agent ID and Alias ID are correct
4. Ensure agent is in the same region as Lambda
5. Update Lambda environment variables with correct IDs

### Issue: Lambda timeout

**Cause:** Bedrock taking too long or network issues

**Solution:**
1. Increase Lambda timeout (Configuration → General → Edit)
2. Recommended: 60 seconds
3. Check Bedrock agent is responding (test in Bedrock console)
4. Review CloudWatch logs for specific errors

### Issue: "Handler not found"

**Cause:** Incorrect handler configuration

**Solution:**
1. Verify handler is set to `src/index.handler`
2. Check ZIP file structure includes `src/index.js`
3. Ensure `exports.handler` exists in `src/index.js`

### Issue: Module not found errors

**Cause:** Dependencies not included in ZIP

**Solution:**
1. Ensure `node_modules` is included in ZIP file
2. Run `npm install --production` before packaging
3. Verify ZIP structure:
   ```
   resume-matcher-lambda.zip
   ├── src/
   │   ├── index.js
   │   ├── services/
   │   └── utils/
   ├── node_modules/
   └── package.json
   ```

### Issue: Invalid JSON response from Bedrock

**Cause:** Agent not following instructions or model limitations

**Solution:**
1. Review agent instructions in Bedrock console
2. Test agent directly in Bedrock console with sample input
3. Ensure instructions explicitly request JSON format
4. Try a different model (Claude 3.5 Sonnet recommended)
5. Add error handling in Lambda to catch malformed responses

## Security Best Practices

### IAM Permissions

- ✅ Use least privilege principle
- ✅ Separate IAM role per Lambda function
- ✅ Regularly review and audit permissions
- ✅ Use resource-specific ARNs when possible

### Environment Variables

- ✅ Never commit `.env` files to version control
- ✅ Use AWS Secrets Manager for sensitive data (optional)
- ✅ Rotate credentials regularly
- ✅ Use different values for dev/staging/prod

### CORS Configuration

- ✅ Specify exact origins (avoid wildcards in production)
- ✅ Limit allowed methods to only what's needed (POST)
- ✅ Use HTTPS in production
- ✅ Set appropriate Max Age for caching

### Function URL

- ✅ Consider adding AWS WAF for rate limiting
- ✅ Monitor invocation patterns for abuse
- ✅ Use CloudWatch alarms for unusual activity
- ✅ Consider adding authentication for production (API Gateway + Cognito)

## Cost Estimation

### Lambda Costs

- **Requests**: $0.20 per 1M requests
- **Compute**: $0.0000166667 per GB-second
- **Example**: 100 requests/month, 512MB, 10s avg duration
  - Requests: 100 × $0.0000002 = $0.00002
  - Compute: 100 × 10s × 0.5GB × $0.0000166667 = $0.0083
  - **Total Lambda**: ~$0.01/month

### Bedrock Costs

- **Model**: Claude 3 Sonnet
- **Input tokens**: ~1,000 tokens per request
- **Output tokens**: ~500 tokens per response
- **Cost**: ~$0.01-0.05 per analysis
- **Example**: 100 analyses/month = $1-5/month

### Total Monthly Cost

- **100 analyses**: ~$1-5/month
- **1,000 analyses**: ~$10-50/month
- **10,000 analyses**: ~$100-500/month

### Free Tier

- **Lambda**: 1M requests + 400,000 GB-seconds per month (free forever)
- **Bedrock**: Varies by model and region (check AWS pricing)

## Cleanup

To remove all resources:

### Delete Lambda Function

**Console:**
1. Lambda → Functions → resume-matcher-lambda
2. Actions → Delete
3. Confirm deletion

**CLI:**
```bash
aws lambda delete-function --function-name resume-matcher-lambda
```

### Delete IAM Role

**Console:**
1. IAM → Roles → ResumeMatcherLambdaRole
2. Delete role
3. Confirm deletion

**CLI:**
```bash
# Detach policies first
aws iam detach-role-policy \
  --role-name ResumeMatcherLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam detach-role-policy \
  --role-name ResumeMatcherLambdaRole \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/BedrockAgentInvokePolicy

# Delete role
aws iam delete-role --role-name ResumeMatcherLambdaRole
```

### Delete IAM Policy

**Console:**
1. IAM → Policies → BedrockAgentInvokePolicy
2. Actions → Delete
3. Confirm deletion

**CLI:**
```bash
aws iam delete-policy \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/BedrockAgentInvokePolicy
```

### Delete Bedrock Agent

**Console:**
1. Bedrock → Agents → resume-matcher-agent
2. Delete agent
3. Confirm deletion

## Comparison: Manual vs SAM Deployment

| Aspect | Manual Deployment | SAM Deployment |
|--------|------------------|----------------|
| **Setup Time** | 30-45 minutes | 10-15 minutes |
| **IAM Role** | Manual creation | Automatic |
| **Function URL** | Manual setup | Automatic |
| **CORS** | Manual configuration | Declarative |
| **Updates** | Re-zip and upload | `sam deploy` |
| **Rollback** | Manual | Automatic |
| **Infrastructure as Code** | No | Yes (template.yaml) |
| **Version Control** | Code only | Full stack |
| **Multiple Environments** | Complex | Built-in |
| **Local Testing** | Not available | `sam local` |
| **Best For** | Learning AWS | Production use |

**Recommendation**: Use SAM deployment for production. See [SAM_DEPLOYMENT.md](SAM_DEPLOYMENT.md).

## Next Steps

1. ✅ Complete all deployment steps above
2. ✅ Test Lambda function with sample data
3. ✅ Update frontend `.env.local` with Function URL
4. ✅ Test end-to-end integration
5. ✅ Monitor CloudWatch logs for errors
6. ✅ Set up CloudWatch alarms (optional)
7. 🚀 Deploy frontend to production

## Additional Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Lambda Function URLs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/latest/reference/)

## Support

For issues or questions:
1. Check CloudWatch logs for error details
2. Review troubleshooting section above
3. Verify all environment variables are correct
4. Test Bedrock agent directly in AWS console
5. Check AWS service health dashboard

