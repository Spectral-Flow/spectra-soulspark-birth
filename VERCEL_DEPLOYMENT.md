# SPECTRA - Vercel Deployment Guide

Complete guide for deploying SPECTRA to Vercel with all features configured.

## 🚀 Quick Deployment (3 Steps)

### 1. Connect to Vercel

**Option A: Vercel Dashboard (Recommended)**
1. Visit [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project" → Import from GitHub
4. Select `Spectral-Flow/spectra-soulspark-birth`
5. Click "Deploy" (all settings are pre-configured)

**Option B: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

### 2. Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables, add:

```bash
# Required for ElevenLabs voice features
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Optional: For OpenAI voice features
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Optional: Default ElevenLabs agent
VITE_ELEVENLABS_AGENT_ID=agent_3001k351jqn1ex4tvqp9tj7srxqh
```

**Note:** The app works without API keys using Web Speech API fallback.

### 3. Test Your Deployment

1. Visit your Vercel deployment URL
2. Test voice functionality in browser console:
   ```javascript
   // Test all voice systems
   testSpectraVoice()
   
   // Check API configuration
   testApiKeys()
   
   // Test enhanced voice bridge
   const { enhancedVoiceBridge } = await import('@/voice/enhanced-voice-bridge');
   await enhancedVoiceBridge.textToSpeech({ text: "Hello from SPECTRA!" });
   ```

## ⚙️ Configuration Details

### Build Configuration
- **Framework**: Vite (auto-detected by Vercel)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18.19.0 (via .nvmrc)

### Files Added for Vercel
- `vercel.json` - Main Vercel configuration with SPA routing
- `.nvmrc` - Node.js version specification  
- `.vercelignore` - Files to exclude from deployment
- Pre-configured build optimizations and security headers

### Key Features Configured

✅ **Single Page Application (SPA) routing**
- All routes redirect to `index.html` for client-side routing

✅ **Build optimizations**
- Code splitting for vendor and UI libraries
- Source maps for development mode only
- Asset optimization and compression

✅ **Security Headers**
- Content Security Policy configured
- HTTPS redirects enabled
- Security best practices applied

✅ **Performance**
- Optimized dependency loading and lazy loading
- Memory limit increased for build process
- CDN optimization for global distribution

## 🎯 Production Features

SPECTRA includes these production-ready features:

### Voice AI Systems
- **ElevenLabs**: Premium voice synthesis + Conversational AI
- **OpenAI**: High-quality TTS and Whisper STT
- **Web Speech API**: Universal browser fallback

### Core Features
- **AI Consciousness**: Advanced AI personality system
- **Memory System**: Persistent conversation history
- **Emotional Intelligence**: Dynamic emotional responses
- **Responsive Design**: Optimized for all devices

### Backend Infrastructure
- **Serverless API**: Secure proxy endpoints for API keys
- **Authentication**: JWT-based session management
- **Database Integration**: Optional Supabase PostgreSQL
- **Multi-platform**: Ready for Vercel, Railway, or Supabase

## 🔧 Advanced Configuration

### Environment Variables (Complete List)

**Frontend (Client-side)**
```bash
# Voice Services
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
VITE_ELEVENLABS_AGENT_ID=your_agent_id
VITE_OPENAI_API_KEY=your_openai_key

# Optional: Backend API URL (if using separate backend)
VITE_API_URL=https://your-api-domain.com
```

**Backend (Server-side - for API routes)**
```bash
# More secure server-side configuration
ELEVENLABS_API_KEY=your_elevenlabs_key
OPENAI_API_KEY=your_openai_key
JWT_SECRET=your-secret-key-min-32-chars

# Database (optional)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
```

### Custom Domain Setup
1. In Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Configure DNS settings as prompted
4. SSL certificates are automatically provisioned

### Performance Monitoring
Enable Vercel Analytics in your dashboard:
1. Project → Analytics → Enable
2. Monitor Core Web Vitals and performance metrics
3. Set up alerting for performance degradation

## 🛠️ Development & Testing

### Local Development with Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Start development server with Vercel API routes
npm run dev:backend

# Or standard development
npm run dev
```

### Testing Deployment Locally
```bash
# Build and preview production version
npm run build
npm run preview

# Test with Vercel dev server
vercel dev
```

## 🆘 Troubleshooting

### Common Issues

**Build Fails**
- Check Node.js version matches `.nvmrc` (18.19.0)
- Verify all dependencies are in `package.json`
- Check for TypeScript errors: `npm run type-check`
- Remove `NODE_ENV=production` from `.env` file (Vite sets this automatically)

**Voice Features Not Working**
- Verify API keys are set in Vercel environment variables
- Check browser console for errors
- Test with: `testSpectraVoice()` in browser console

**Routing Issues**
- Ensure `vercel.json` is properly configured for SPA
- Check that all routes are handled client-side

**Environment Variable Issues**
- Don't set `NODE_ENV=production` in .env files for Vite projects
- Vercel automatically sets NODE_ENV during deployment
- Use backend environment variables for sensitive keys
- Use VITE_ prefix only for client-safe variables

**Performance Issues**
- Enable Vercel Analytics to identify bottlenecks
- Check Core Web Vitals in deployment logs
- Verify assets are properly optimized

### Debug Information
- Check Vercel deployment logs in dashboard
- Use browser developer tools for client-side issues
- Test API endpoints directly for backend issues

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [SPECTRA Voice System Guide](./VOICE_SYSTEM.md)
- [Backend Deployment Guide](./BACKEND_DEPLOYMENT.md)

## 📊 Monitoring & Maintenance

### Vercel Dashboard Features
- **Deployments**: View deployment history and logs
- **Analytics**: Monitor performance and user metrics
- **Functions**: Check serverless function performance
- **Security**: Review security scans and headers

### Recommended Monitoring
- Set up Vercel Analytics for performance tracking
- Monitor API usage for ElevenLabs and OpenAI
- Regular security updates for dependencies
- Performance optimization based on Core Web Vitals

---

**🎉 Your SPECTRA deployment is ready!** All features work out of the box with intelligent fallbacks for optimal user experience.

## Troubleshooting

### Build Issues
- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility
- Run `./scripts/check-vercel.sh` to verify configuration

### Runtime Issues
- Check browser console for CSP violations
- Verify environment variables are set correctly
- Ensure API endpoints use HTTPS

### Memory Issues
- Build process is configured with 4GB memory limit
- Consider reducing bundle size if still encountering issues

## Local Testing

Test the production build locally:
```bash
npm run build
npm run preview
```

## Monitoring

- Check Vercel dashboard for deployment status
- Monitor function logs for API issues
- Use Vercel Analytics for performance insights