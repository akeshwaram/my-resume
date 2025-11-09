# Bedrock Runtime Migration Summary

This document summarizes the migration from Bedrock Agents to Bedrock Runtime (direct model invocation).

## What Changed?

### Before: Bedrock Agents
- Required manual agent creation in AWS Console
- Agent configuration stored in AWS
- Needed Agent ID and Alias ID
- IAM permission: `bedrock:InvokeAgent`
- SDK: `@aws-sdk/client-bedrock-agent-runtime`

### After: Bedrock Runtime
- No manual agent creation needed
- All configuration in code
- Only need Model ID
- IAM permission: `bedrock:InvokeModel`
- SDK: `@aws-sdk/client-bedrock-runtime`

## Files Modified

### 1. `package.json`
- **Removed**: `@aws-sdk/client-bedrock-agent-runtime`
- **Added**: `@aws-sdk/client-bedrock-runtime`

### 2. `src/services/bedrockService.js`
- Complete rewrite to use Bedrock Runtime SDK
- Uses Converse API for model invocation
- System prompts sent with each request
- Simplified error handling

### 3. `template.yaml`
- **Removed parameters**: `BedrockAgentId`, `BedrockAgentAliasId`
- **Added parameter**: `BedrockModelId`
- **Changed IAM permission**: `bedrock:InvokeAgent` → `bedrock:InvokeModel`
- **Updated environment variables**: Agent IDs → Model ID

### 4. `samconfig.toml`
- Updated parameter overrides to use `BedrockModelId`
- Removed agent-related parameters

### 5. Documentation
- `SAM_DEPLOYMENT.md` - Updated to remove agent creation steps
- `AWS_DEPLOYMENT.md` - Updated to remove agent creation steps
- `README.md` (root) - Updated environment variables and setup
- `README.md` (lambda) - Updated architecture and features

## Deployment Changes

### Old Process
1. Enable model access in Bedrock Console
2. Create Bedrock Agent in Console
3. Configure agent instructions
4. Create and publish agent alias
5. Copy Agent ID and Alias ID
6. Deploy Lambda with `sam deploy`
7. Provide Agent ID and Alias ID as parameters

### New Process
1. Enable model access in Bedrock Console (one-time)
2. Deploy Lambda with `sam deploy`
3. Provide Model ID as parameter (has default)

## Benefits

✅ **Faster deployment**: 5-10 minutes vs 30-45 minutes
✅ **Fully automated**: No manual Console steps (except one-time model access)
✅ **Version controlled**: All agent logic in code
✅ **Easier updates**: Change code and redeploy
✅ **Better testing**: Can test agent logic locally
✅ **More flexible**: Easy to add tools, memory, or custom logic

## Migration Steps for Existing Deployments

If you have an existing deployment with Bedrock Agents:

1. **Update dependencies**:
   ```bash
   cd lambda
   npm install @aws/agent-core
   npm uninstall @aws-sdk/client-bedrock-agent-runtime
   ```

2. **Deploy updated Lambda**:
   ```bash
   sam build
   sam deploy --guided
   ```
   - When prompted for `BedrockModelId`, enter: `anthropic.claude-3-sonnet-20240229-v1:0`
   - When prompted for `AllowedOrigin`, enter your frontend URL

3. **Clean up old resources** (optional):
   - Delete the old Bedrock Agent in AWS Console
   - Remove the old IAM policy for `bedrock:InvokeAgent`

4. **Test the integration**:
   - Frontend should work exactly the same
   - Check CloudWatch logs for any errors

## Available Models

Common Bedrock model IDs you can use:

- `anthropic.claude-3-5-sonnet-20240620-v1:0` - Claude 3.5 Sonnet (recommended)
- `anthropic.claude-3-sonnet-20240229-v1:0` - Claude 3 Sonnet (default)
- `anthropic.claude-3-haiku-20240307-v1:0` - Claude 3 Haiku (faster, cheaper)
- `anthropic.claude-3-opus-20240229-v1:0` - Claude 3 Opus (most capable)

## Troubleshooting

### Issue: "Module not found: @aws/agent-core"
**Solution**: Run `npm install` in the lambda directory before building

### Issue: "Access Denied" to Bedrock
**Solution**: 
1. Verify model access is enabled in Bedrock Console
2. Check IAM role has `bedrock:InvokeModel` permission
3. Ensure you're in a region where the model is available

### Issue: Different response format
**Solution**: Agent Core should produce identical responses. Check CloudWatch logs for details.

## Rollback Plan

If you need to rollback to Bedrock Agents:

1. Restore old `package.json` with `@aws-sdk/client-bedrock-agent-runtime`
2. Restore old `bedrockService.js` from git history
3. Restore old `template.yaml` with agent parameters
4. Recreate Bedrock Agent in Console
5. Deploy with agent IDs

## Support

- [AWS Bedrock Agent Core Documentation](https://aws.amazon.com/bedrock/agentcore/)
- [Agent Core GitHub Repository](https://github.com/awslabs/agent-core)
- Check CloudWatch logs for detailed error messages

