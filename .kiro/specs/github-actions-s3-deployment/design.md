# Design Document

## Overview

The GitHub Actions CI/CD pipeline will automate the build and deployment process for the React resume website. The workflow will use OIDC authentication to securely connect to AWS and deploy built assets to an S3 bucket configured for static website hosting.

## Architecture

### Workflow Trigger
- **Event**: Push to main branch
- **Location**: `.github/workflows/deploy.yml`
- **Runner**: Ubuntu latest (GitHub-hosted)

### Authentication Flow
```
GitHub Actions → OIDC Token → AWS STS → Assume IAM Role → S3 Access
```

### Deployment Pipeline Stages
1. **Setup**: Checkout code, setup Node.js, cache dependencies
2. **Build**: Install dependencies, run Vite build process
3. **Deploy**: Authenticate with AWS via OIDC, sync assets to S3

## Components and Interfaces

### GitHub Actions Workflow File
- **File**: `.github/workflows/deploy.yml`
- **Trigger**: `push` event on `main` branch
- **Jobs**: Single job with multiple steps
- **Permissions**: Required `id-token: write` for OIDC

### AWS OIDC Configuration
- **Identity Provider**: GitHub OIDC provider in AWS IAM
- **Audience**: `sts.amazonaws.com`
- **Thumbprint**: GitHub's OIDC thumbprint
- **Trust Policy**: Restricts access to specific repository and branch

### IAM Role Configuration
- **Role Name**: `GitHubActionsDeployRole` (configurable)
- **Trust Policy**: Allows GitHub Actions OIDC provider
- **Permissions Policy**: S3 bucket access for deployment
- **Condition**: Repository and branch restrictions

### Environment Variables
- `AWS_REGION`: AWS region for S3 bucket
- `S3_BUCKET_NAME`: Target S3 bucket name
- `AWS_ROLE_ARN`: ARN of the IAM role to assume

## Data Models

### Workflow Configuration
```yaml
name: Deploy to S3
on:
  push:
    branches: [main]
permissions:
  id-token: write
  contents: read
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps: [setup, build, deploy]
```

### AWS IAM Trust Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:OWNER/REPO:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

### S3 Permissions Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::BUCKET_NAME",
        "arn:aws:s3:::BUCKET_NAME/*"
      ]
    }
  ]
}
```

## Error Handling

### Build Failures
- **Detection**: Non-zero exit code from `npm run build`
- **Response**: Stop workflow execution, display build logs
- **Notification**: GitHub Actions status check failure

### Authentication Failures
- **Detection**: OIDC token exchange or role assumption failure
- **Response**: Stop workflow, log authentication error
- **Common Causes**: Misconfigured trust policy, incorrect role ARN

### Deployment Failures
- **Detection**: AWS CLI sync command failure
- **Response**: Stop workflow, display S3 sync logs
- **Retry Logic**: No automatic retry (manual re-run required)

### Validation Steps
- Verify build artifacts exist in `dist/` directory
- Confirm AWS credentials are properly configured
- Validate S3 bucket accessibility before sync

## Testing Strategy

### Workflow Testing
- **Local Testing**: Use `act` tool to test workflow locally
- **Branch Testing**: Test on feature branches before merging
- **Dry Run**: Use `--dry-run` flag for S3 sync during testing

### AWS Configuration Testing
- **Role Assumption**: Test OIDC authentication manually
- **Permissions**: Verify S3 access with assumed role
- **Trust Policy**: Validate repository and branch restrictions

### Integration Testing
- **End-to-End**: Full workflow execution on test branch
- **Rollback**: Verify ability to revert deployments if needed
- **Monitoring**: Check deployment status and S3 bucket contents

## Security Considerations

### OIDC Security
- **Token Scope**: Limited to specific repository and branch
- **Time-Limited**: Tokens expire automatically
- **No Long-Term Credentials**: No stored AWS access keys

### IAM Role Security
- **Least Privilege**: Minimal S3 permissions required
- **Resource Restrictions**: Limited to specific S3 bucket
- **Condition-Based Access**: Repository and branch validation

### Workflow Security
- **Permissions**: Minimal GitHub token permissions
- **Environment Isolation**: No cross-repository access
- **Audit Trail**: All actions logged in GitHub Actions