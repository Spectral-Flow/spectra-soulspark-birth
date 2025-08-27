# 🔐 GitHub Secrets Configuration Guide

This guide explains how to set up GitHub secrets for secure API key management in the SPECTRA project.

## 🎯 Overview

GitHub secrets provide a secure way to store sensitive information like API keys that your GitHub Actions workflows need. This eliminates the need to hardcode sensitive values in your repository.

## 🚀 Quick Setup

### 1. Access GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** (repository settings, not profile settings)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### 2. Required Secrets

Add the following secrets to your GitHub repository:

#### 🤖 AI Service API Keys

```bash
# ElevenLabs (Required for voice features)
ELEVENLABS_API_KEY=sk-your_elevenlabs_api_key_here

# OpenAI (Required for chat and additional TTS)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Hugging Face (Optional - for alternative AI models)
HUGGINGFACE_API_KEY=hf_your_huggingface_api_key_here
HF_TOKEN=hf_your_huggingface_token_here

# OpenRouter (Optional - for alternative LLM routing)
OPENROUTER_API_KEY=sk-your_openrouter_api_key_here
```

#### ☁️ Azure OpenAI Configuration (Optional)

```bash
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

#### 📱 Local LLM Configuration (Optional)

```bash
LOCAL_LLM_ENDPOINT=http://192.168.1.100:11434
LOCAL_LLM_MODEL=llama2
LOCAL_LLM_API_TYPE=ollama
LOCAL_LLM_API_KEY=your_local_llm_api_key_if_required
```

#### 🔒 Security & Authentication

```bash
# JWT Secret (Required - minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

#### 🗄️ Database Configuration

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Generic Database (Alternative)
DATABASE_URL=postgresql://username:password@host:port/database
```

#### 🌐 Frontend Configuration (Client-Safe)

```bash
# Supabase (for Notes feature)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ElevenLabs Agent ID (safe to expose)
VITE_ELEVENLABS_AGENT_ID=agent_3001k351jqn1ex4tvqp9tj7srxqh
```

#### 🚀 Deployment Configuration

```bash
# Vercel Token (for automatic deployments)
VERCEL_TOKEN=your_vercel_deployment_token
```

### 3. Set GitHub Variables (Optional)

For non-sensitive configuration, use GitHub Variables instead of Secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click the **Variables** tab
3. Click **New repository variable**

```bash
# Debug Configuration (non-sensitive)
VITE_DEBUG=false
VITE_LOG_LEVEL=info
```

## 🔧 How It Works

### GitHub Actions Integration

The GitHub Actions workflows automatically:

1. **Build Process**: Use secrets as environment variables during build
2. **Vercel Deployment**: Sync secrets to Vercel environment variables
3. **Security Scanning**: Check for accidentally committed secrets

### Environment Variable Priority

The system uses this priority order:

1. **GitHub Secrets** → **Vercel Environment Variables** (Production)
2. **Local `.env` file** (Development)
3. **System Environment Variables** (Fallback)

### Security Features

- ✅ **Encrypted Storage**: GitHub encrypts secrets at rest
- ✅ **Limited Access**: Only workflows and authorized users can access
- ✅ **Audit Trail**: GitHub logs when secrets are accessed
- ✅ **No Logs**: Secret values are masked in workflow logs

## 📋 Setting Up Secrets - Step by Step

### Method 1: GitHub Web Interface

1. **Navigate to Repository**
   ```
   https://github.com/Spectral-Flow/spectra-soulspark-birth
   ```

2. **Access Settings**
   - Click **Settings** tab
   - Click **Secrets and variables** → **Actions**

3. **Add Each Secret**
   - Click **New repository secret**
   - Enter **Name** (e.g., `ELEVENLABS_API_KEY`)
   - Enter **Value** (your actual API key)
   - Click **Add secret**

### Method 2: GitHub CLI (Advanced)

```bash
# Install GitHub CLI if not already installed
gh auth login

# Add secrets via CLI
gh secret set ELEVENLABS_API_KEY --body "your_actual_api_key"
gh secret set OPENAI_API_KEY --body "your_actual_api_key"
gh secret set JWT_SECRET --body "your-super-secret-jwt-key-min-32-chars"

# Verify secrets are set
gh secret list
```

## 🔍 Verification

### 1. Check GitHub Actions

After setting up secrets, check that your GitHub Actions workflows can access them:

1. Go to **Actions** tab in your repository
2. Trigger a workflow (push to main branch or manually)
3. Check the workflow logs - secret values should appear as `***`

### 2. Verify Vercel Deployment

1. Check Vercel dashboard → Your Project → Settings → Environment Variables
2. Confirm that variables are populated after GitHub Actions deployment
3. Test your deployed application's functionality

### 3. Test API Endpoints

```bash
# Test backend health endpoint
curl https://your-vercel-app.vercel.app/api/health

# Test ElevenLabs integration
curl -X POST https://your-vercel-app.vercel.app/api/elevenlabs/voices
```

## 🚨 Security Best Practices

### ✅ Do's

- **Use unique secrets** for each environment (development, staging, production)
- **Rotate API keys** regularly
- **Use minimum required permissions** for each API key
- **Monitor API usage** for unusual activity
- **Review secret access** regularly

### ❌ Don'ts

- **Never commit secrets** to your repository
- **Don't share secrets** in chat/email
- **Don't use production secrets** in development
- **Don't log secret values** in your application
- **Don't hardcode fallback secrets** in your code

## 🔧 Troubleshooting

### Common Issues

1. **Secret Not Found**
   ```
   Error: Secret ELEVENLABS_API_KEY not found
   ```
   **Solution**: Verify secret name spelling and that it's set in repository settings

2. **Permission Denied**
   ```
   Error: API key authentication failed
   ```
   **Solution**: Verify API key is valid and has required permissions

3. **Build Fails**
   ```
   Error: Environment variable not available during build
   ```
   **Solution**: Check that secret is properly mapped in GitHub Actions workflow

### Debug Steps

1. **Check Secret Names**
   ```bash
   # In your workflow, add a debug step:
   - name: Debug environment
     run: |
       echo "Checking environment variables..."
       env | grep -E "(ELEVENLABS|OPENAI|HUGGINGFACE)" | sed 's/=.*/=***/'
   ```

2. **Verify Workflow Permissions**
   ```yaml
   permissions:
     contents: read
     actions: read
     secrets: read
   ```

3. **Test Individual Services**
   - Use the test endpoints in your application
   - Check browser console for errors
   - Review Vercel function logs

## 🎉 Success!

Once configured correctly, you'll have:

- ✅ **Secure API Key Management**: No secrets in your code
- ✅ **Automated Deployments**: GitHub Actions deploy to Vercel automatically  
- ✅ **Environment Separation**: Different secrets for different environments
- ✅ **Security Scanning**: Automatic checks for leaked secrets

Your SPECTRA application will now securely use GitHub secrets for all API integrations! 🚀

---

**Need Help?** Check the [troubleshooting section](#🔧-troubleshooting) or create an issue in the repository.