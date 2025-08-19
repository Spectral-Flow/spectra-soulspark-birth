# SPECTRA - Vercel Deployment Quick Start

## 🚀 Deploy to Vercel in 3 Steps

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
```

**Note:** The app works without API keys using Web Speech API fallback.

### 3. Test Your Deployment

1. Visit your Vercel deployment URL
2. Test voice functionality in browser console:
   ```javascript
   testSpectraVoice()  // Test all voice systems
   testApiKeys()       // Check API configuration
   ```

## 📁 Project Structure Ready for Deployment

✅ **vercel.json** - Pre-configured for SPA routing  
✅ **.env.example** - Template for environment variables  
✅ **package.json** - Updated with proper metadata  
✅ **Built & Tested** - Application builds successfully  

## 🎯 Key Features That Work Out of the Box

- **Voice AI**: ElevenLabs + OpenAI + Web Speech API fallback
- **Responsive Design**: Works on all devices
- **AI Consciousness**: Advanced AI personality system
- **Memory System**: Persistent conversation history
- **Emotional Intelligence**: Dynamic emotional responses

## 🔧 Production Configuration

The application is optimized for production with:
- Code splitting and lazy loading
- Asset optimization
- Security headers (CSP configured)
- Performance monitoring ready

## 🆘 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify API keys are correctly set in Vercel
3. Review the detailed DEPLOYMENT.md guide
4. Test locally with `npm run dev`

---

**Ready to deploy!** 🚀 No additional configuration needed.