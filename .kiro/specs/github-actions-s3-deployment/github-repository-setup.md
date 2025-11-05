# GitHub Repository Configuration Guide

## Repository Secrets Setup

### Required Repository Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions, then add the following repository secrets:

#### AWS Configuration Secrets

1. **AWS_REGION**
   - **Value**: Your AWS region (e.g., `us-east-1`, `eu-west-1`)
   - **Purpose**: Specifies the AWS region where your S3 bucket is located

2. **S3_BUCKET_NAME**
   - **Value**: Your S3 bucket name (e.g., `my-resume-website-bucket`)
   - **Purpose**: Target bucket for deployment artifacts

3. **AWS_ROLE_ARN**
   - **Value**: ARN of the IAM role for GitHub Actions (e.g., `arn:aws:iam::123456789012:role/GitHubActionsDeployRole`)
   - **Purpose**: IAM role that GitHub Actions will assume via OIDC

### Setting Up Repository Secrets

1. Go to your repository on GitHub
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Enter the secret name and value
6. Click **Add secret**
7. Repeat for all required secrets

## Workflow Usage

### Automatic Deployment

The deployment workflow automatically triggers when:
- Code is pushed to the `main` branch
- Pull requests are merged into `main`

### Manual Deployment

To manually trigger a deployment:
1. Go to **Actions** tab in your repository
2. Select **Deploy to S3** workflow
3. Click **Run workflow**
4. Select the `main` branch
5. Click **Run workflow** button

### Monitoring Deployments

1. **View Workflow Runs**: Go to Actions tab to see all workflow executions
2. **Check Status**: Green checkmark = success, red X = failure
3. **View Logs**: Click on any workflow run to see detailed logs
4. **Build Artifacts**: Check if `dist/` directory was created successfully

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Authentication Failures

**Error**: `Error: Could not assume role with OIDC`

**Causes & Solutions**:
- **Incorrect Role ARN**: Verify `AWS_ROLE_ARN` secret matches your IAM role
- **Trust Policy Issues**: Ensure IAM role trust policy includes your repository
- **Branch Restrictions**: Check trust policy allows `main` branch access

**Fix Steps**:
1. Verify IAM role ARN in AWS console
2. Check trust policy conditions match your repository
3. Ensure OIDC provider is properly configured

#### 2. Build Failures

**Error**: `npm run build failed with exit code 1`

**Causes & Solutions**:
- **Dependency Issues**: Check if all dependencies install correctly
- **Code Errors**: Review build logs for syntax or compilation errors
- **Node Version**: Ensure workflow uses compatible Node.js version

**Fix Steps**:
1. Run `npm run build` locally to reproduce the issue
2. Check package.json for correct dependencies
3. Review build logs in GitHub Actions for specific errors

#### 3. S3 Deployment Failures

**Error**: `S3 sync failed` or `Access Denied`

**Causes & Solutions**:
- **Bucket Permissions**: IAM role lacks S3 permissions
- **Bucket Name**: Incorrect bucket name in secrets
- **Region Mismatch**: Wrong AWS region specified

**Fix Steps**:
1. Verify S3 bucket exists and is accessible
2. Check IAM role has required S3 permissions
3. Confirm `S3_BUCKET_NAME` and `AWS_REGION` secrets are correct

#### 4. Missing Build Artifacts

**Error**: `dist/ directory not found`

**Causes & Solutions**:
- **Build Command Failed**: Build process didn't complete successfully
- **Output Directory**: Vite configured to output to different directory

**Fix Steps**:
1. Check build step completed without errors
2. Verify Vite configuration outputs to `dist/` directory
3. Review build logs for any warnings or errors

### Debugging Steps

#### 1. Check Workflow Logs
```
1. Go to Actions tab
2. Click on failed workflow run
3. Expand each step to view detailed logs
4. Look for error messages and stack traces
```

#### 2. Verify AWS Configuration
```
1. Check AWS console for IAM role existence
2. Verify trust policy includes GitHub OIDC provider
3. Confirm S3 bucket permissions and region
```

#### 3. Test Locally
```bash
# Test build process
npm install
npm run build

# Verify build output
ls -la dist/

# Test AWS CLI access (if configured locally)
aws s3 ls s3://your-bucket-name --region your-region
```

#### 4. Validate Secrets
```
1. Go to repository Settings → Secrets and variables → Actions
2. Verify all required secrets are present
3. Check secret names match exactly (case-sensitive)
4. Ensure no extra spaces in secret values
```

### Workflow Status Indicators

- **🟢 Success**: Deployment completed successfully
- **🔴 Failure**: Deployment failed, check logs for details
- **🟡 In Progress**: Deployment currently running
- **⚪ Queued**: Deployment waiting to start

### Getting Help

If you continue experiencing issues:

1. **Check GitHub Actions Documentation**: [GitHub Actions Docs](https://docs.github.com/en/actions)
2. **AWS OIDC Guide**: [Configuring OpenID Connect in AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
3. **Review Workflow File**: Check `.github/workflows/deploy.yml` for configuration issues
4. **Community Support**: Search GitHub Community or Stack Overflow for similar issues

### Security Best Practices

- **Never commit AWS credentials** to your repository
- **Use repository secrets** for all sensitive configuration
- **Regularly rotate IAM roles** and update trust policies
- **Monitor workflow runs** for unauthorized access attempts
- **Limit IAM permissions** to minimum required for deployment