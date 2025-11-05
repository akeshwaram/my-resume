# AWS OIDC Setup for GitHub Actions Deployment

This document provides step-by-step instructions for configuring AWS OpenID Connect (OIDC) authentication to enable secure deployment from GitHub Actions to S3 without storing long-term AWS credentials.

## Prerequisites

- AWS account with administrative access
- GitHub repository with the deployment workflow
- AWS CLI installed and configured (optional, for verification)

## Step 1: Create OIDC Identity Provider in AWS

### 1.1 Navigate to IAM Console
1. Log into the AWS Management Console
2. Navigate to **IAM** service
3. In the left sidebar, click **Identity providers**

### 1.2 Add GitHub OIDC Provider
1. Click **Add provider**
2. Select **OpenID Connect** as the provider type
3. Configure the provider with these values:
   - **Provider URL**: `https://token.actions.githubusercontent.com`
   - **Audience**: `sts.amazonaws.com`
4. Click **Get thumbprint** to automatically retrieve the thumbprint
5. Click **Add provider** to create the identity provider

### 1.3 Verify Provider Creation
The OIDC provider should now appear in your identity providers list with the ARN format:
```
arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com
```

## Step 2: Create IAM Role for GitHub Actions

### 2.1 Create New Role
1. In the IAM console, navigate to **Roles**
2. Click **Create role**
3. Select **Web identity** as the trusted entity type
4. Choose the GitHub OIDC provider you just created
5. Set **Audience** to `sts.amazonaws.com`

### 2.2 Configure Trust Policy
Replace the default trust policy with the following (update placeholders):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

**Important**: Replace the following placeholders:
- `YOUR_ACCOUNT_ID`: Your AWS account ID (12-digit number)
- `YOUR_GITHUB_USERNAME`: Your GitHub username or organization name
- `YOUR_REPO_NAME`: Your repository name

### 2.3 Attach Permissions Policy
Create and attach a custom policy for S3 deployment permissions:

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
        "arn:aws:s3:::YOUR_S3_BUCKET_NAME",
        "arn:aws:s3:::YOUR_S3_BUCKET_NAME/*"
      ]
    }
  ]
}
```

**Important**: Replace `YOUR_S3_BUCKET_NAME` with your actual S3 bucket name.

### 2.4 Complete Role Creation
1. Give the role a descriptive name (e.g., `GitHubActionsDeployRole`)
2. Add a description explaining its purpose
3. Review the configuration and click **Create role**
4. Note the role ARN for use in GitHub Actions workflow

## Step 3: Configure S3 Bucket (if not already done)

### 3.1 Create S3 Bucket
1. Navigate to **S3** service in AWS Console
2. Click **Create bucket**
3. Choose a unique bucket name
4. Select appropriate region
5. Configure public access settings for static website hosting

### 3.2 Enable Static Website Hosting
1. Select your bucket
2. Go to **Properties** tab
3. Scroll to **Static website hosting**
4. Click **Edit** and enable static website hosting
5. Set **Index document** to `index.html`
6. Save changes

## Step 4: Test OIDC Configuration

### 4.1 Verify Role ARN
The role ARN should follow this format:
```
arn:aws:iam::YOUR_ACCOUNT_ID:role/GitHubActionsDeployRole
```

### 4.2 Test Authentication (Optional)
You can test the OIDC configuration by running a simple GitHub Actions workflow that assumes the role and lists S3 buckets:

```yaml
name: Test OIDC
on: workflow_dispatch
permissions:
  id-token: write
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_ROLE_ARN }}
          aws-region: ${{ vars.AWS_REGION }}
      - name: Test S3 access
        run: aws s3 ls s3://${{ vars.S3_BUCKET_NAME }}
```

## Security Best Practices

### Trust Policy Security
- **Repository Restriction**: The trust policy limits access to a specific GitHub repository
- **Branch Restriction**: Only the `main` branch can assume the role
- **No Wildcards**: Avoid using wildcards in the subject condition for security

### IAM Role Permissions
- **Least Privilege**: Grant only the minimum S3 permissions required
- **Resource Restriction**: Limit permissions to specific S3 bucket only
- **Regular Review**: Periodically review and audit role permissions

### Monitoring and Auditing
- **CloudTrail**: Enable AWS CloudTrail to log all API calls
- **Role Usage**: Monitor role assumption events in CloudTrail
- **Access Patterns**: Review deployment frequency and patterns

## Troubleshooting Common Issues

### Authentication Failures
- **Trust Policy**: Verify repository and branch names are correct
- **OIDC Provider**: Ensure the provider URL and audience are exact matches
- **Role ARN**: Double-check the role ARN in GitHub repository variables

### Permission Errors
- **S3 Permissions**: Verify the role has required S3 permissions
- **Bucket Policy**: Check if bucket policy conflicts with IAM permissions
- **Resource ARNs**: Ensure S3 resource ARNs match actual bucket name

### Workflow Issues
- **Token Permissions**: Ensure workflow has `id-token: write` permission
- **Environment Variables**: Verify all required variables are set in GitHub
- **AWS Region**: Confirm AWS region matches S3 bucket region

## Next Steps

After completing this setup:
1. Configure GitHub repository secrets and variables (see repository configuration documentation)
2. Test the deployment workflow with a sample commit
3. Monitor the first few deployments for any issues
4. Set up notifications for deployment failures (optional)

## Reference Links

- [AWS OIDC Documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [GitHub OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [AWS Configure Credentials Action](https://github.com/aws-actions/configure-aws-credentials)