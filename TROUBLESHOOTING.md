# SPECTRA Troubleshooting Guide

**🚨 Having issues with SPECTRA? This comprehensive guide will help you diagnose and fix problems quickly.**

## 🔍 Quick Diagnostic Commands

Run these commands in your browser console (F12) for instant diagnostics:

```javascript
// Get complete system report
showDiagnosticReport()

// Test voice system
testSpectraVoice()

// Check API keys  
testApiKeys()

// Run startup checks
runStartupDiagnostics()

// Test backend connectivity
fetch('/api/health').then(r => r.json()).then(console.log)
```

## 📋 Quick Checklist - Most Common Issues

### ✅ Dependency Installation
```bash
# Install dependencies
npm ci

# Check versions
node -v && npm -v

# Should show Node 18+ and npm 8+
```

### ✅ Environment Variables
```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your API keys:
# VITE_ELEVENLABS_API_KEY=your_key_here  
# VITE_OPENAI_API_KEY=your_key_here
```

### ✅ Backend Server
```bash
# Start backend (required for full functionality)
npm run dev:backend

# Or start frontend only
npm run dev
```

### ✅ Browser Compatibility
- **Chrome/Edge**: Full support ✅
- **Firefox**: Partial Web Speech support ⚠️
- **Safari**: Limited Web Speech support ⚠️

## 🛠️ Detailed Troubleshooting

### 1. Voice System Not Working

**Symptoms:**
- No voice output
- Microphone not working
- "Voice synthesis failed" errors

**Diagnostic Commands:**
```javascript
testSpectraVoice()
testElevenLabsVoice()
```

**Solutions:**

1. **Check API Keys**
   ```bash
   # Set in .env file
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
   VITE_OPENAI_API_KEY=your_openai_key
   ```

2. **Browser Permissions**
   - Allow microphone access when prompted
   - Check site permissions in browser settings
   - Try in incognito mode

3. **Fallback Options**
   ```javascript
   // Test Web Speech API fallback
   if ('speechSynthesis' in window) {
     speechSynthesis.speak(new SpeechSynthesisUtterance('Test'));
   }
   ```

### 2. Backend API Issues

**Symptoms:**
- "Backend not available" messages
- API endpoint 404/500 errors
- No response from /api/* routes

**Diagnostic Commands:**
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Or in browser console
fetch('/api/health').then(r => r.json()).then(console.log)
```

**Solutions:**

1. **Start Backend Server**
   ```bash
   # Start with Vercel dev (recommended)
   npm run dev:backend
   
   # Should show: Ready! Available at http://localhost:3000
   ```

2. **Check Environment Variables**
   Backend needs server-side API keys:
   ```bash
   # In .env file (no VITE_ prefix for backend)
   ELEVENLABS_API_KEY=your_key
   OPENAI_API_KEY=your_key
   JWT_SECRET=your-secret-min-32-chars
   ```

3. **Port Conflicts**
   ```bash
   # Check if port 3000 is in use
   lsof -i :3000
   
   # Kill conflicting process if needed
   kill -9 <PID>
   ```

### 3. Build/Runtime Errors

**Symptoms:**
- TypeScript compilation errors
- "Module not found" errors
- Build process fails

**Diagnostic Commands:**
```bash
# Check TypeScript compilation
npm run type-check

# Check for dependency issues
npm audit
npm outdated
```

**Solutions:**

1. **Clear Cache and Reinstall**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Fix TypeScript Errors**
   ```bash
   # Run type checking
   npm run type-check
   
   # Fix linting issues
   npm run lint:fix
   ```

3. **Check Node Version**
   ```bash
   # SPECTRA requires Node 18+
   node -v
   
   # Use nvm to switch if needed
   nvm use 18
   ```

### 4. Environment Configuration Issues

**Symptoms:**
- "API key not configured" warnings
- Features not working despite API keys
- Environment variables not loading

**Check Current Configuration:**
```javascript
// In browser console
console.log('Environment:', import.meta.env);
showDiagnosticReport();
```

**Solutions:**

1. **Verify Environment File**
   ```bash
   # Check .env file exists and has correct format
   cat .env
   
   # Ensure no spaces around = signs
   # CORRECT: VITE_API_KEY=abc123
   # WRONG:   VITE_API_KEY = abc123
   ```

2. **Client vs Server Variables**
   - **Client-side (browser)**: Use `VITE_` prefix
   - **Server-side (backend)**: No prefix needed
   ```bash
   # For frontend features
   VITE_ELEVENLABS_API_KEY=your_key
   
   # For backend API routes  
   ELEVENLABS_API_KEY=your_key
   ```

3. **Restart After Changes**
   ```bash
   # Always restart dev server after .env changes
   npm run dev
   ```

### 5. Audio/Performance Issues

**Symptoms:**
- Choppy audio playback
- High CPU usage
- Slow response times

**Diagnostic Commands:**
```javascript
// Check memory usage
console.log('Memory:', performance.memory);

// Check audio context
console.log('Audio context state:', new AudioContext().state);
```

**Solutions:**

1. **Audio Settings**
   ```javascript
   // Reduce buffer size for lower latency
   VITE_AUDIO_BUFFER_SIZE=2048
   
   // Disable streaming if causing issues
   VITE_ENABLE_STREAMING=false
   ```

2. **Performance Optimization**
   ```javascript
   // Enable WebGPU acceleration if supported
   VITE_USE_WEBGPU=true
   
   // Lazy load AI models
   VITE_LAZY_LOAD_AI=true
   ```

3. **Browser Optimization**
   - Close unnecessary tabs
   - Clear browser cache
   - Disable browser extensions temporarily

## 🔧 Advanced Debugging

### Console Commands Reference

```javascript
// === VOICE SYSTEM ===
testSpectraVoice()           // Test complete voice system
testElevenLabsVoice()        // Test ElevenLabs specifically  
testApiKeys()                // Verify API key configuration

// === DIAGNOSTICS ===
showDiagnosticReport()       // Full system diagnostic report
runStartupDiagnostics()      // Run startup health checks
diagnostics.exportReport()   // Export diagnostic data

// === BACKEND TESTING ===
fetch('/api/health').then(r => r.json()).then(console.log)
fetch('/api/elevenlabs/voices').then(r => r.json()).then(console.log)

// === PERFORMANCE ===
console.log('Memory:', performance.memory)
console.log('Storage:', Object.keys(localStorage))

// === DEBUGGING ===
localStorage.setItem('spectra-voice-debug', 'true')  // Enable debug mode
diagnostics.errors                                   // View recent errors
```

### Log Analysis

**Key log messages to look for:**

```bash
# SUCCESS INDICATORS
✅ SPECTRA Diagnostics loaded
✅ All systems operational! SPECTRA is ready
✅ Voice system test initiated

# WARNING INDICATORS  
⚠️ API key not configured
⚠️ Backend not available, using fallback
⚠️ Web Speech API not supported

# ERROR INDICATORS
❌ Failed to initialize voice system
❌ Backend health check failed
❌ Critical issues detected
```

### Network Debugging

```bash
# Check API endpoint responses
curl -v http://localhost:3000/api/health
curl -v http://localhost:3000/api/elevenlabs/voices

# Check CORS headers
curl -H "Origin: http://localhost:8080" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:3000/api/elevenlabs/tts
```

## 📊 System Requirements

### Minimum Requirements
- **Node.js**: 18.0.0+
- **npm**: 8.0.0+
- **Browser**: Chrome 90+, Firefox 85+, Safari 14+
- **Memory**: 4GB RAM recommended
- **Storage**: 1GB free space

### Recommended Setup
- **OS**: macOS, Windows 10+, or Linux
- **Browser**: Latest Chrome/Edge for best compatibility
- **CPU**: Multi-core processor for AI model acceleration
- **Network**: Stable internet for API calls

### API Key Requirements
- **ElevenLabs**: Professional plan recommended for voice cloning
- **OpenAI**: GPT-4 access for best conversation quality
- **Supabase**: Free tier sufficient for basic note storage

## 🚨 Common Error Messages

### "Voice synthesis failed"
**Cause**: API key issues or service unavailable  
**Fix**: Check API keys and test with `testApiKeys()`

### "Backend not available"
**Cause**: Backend server not running  
**Fix**: Start with `npm run dev:backend`

### "Microphone access denied"
**Cause**: Browser permissions  
**Fix**: Allow microphone in browser settings

### "Module not found"
**Cause**: Dependency installation issue  
**Fix**: `npm ci` to reinstall dependencies

### "Type error" during build
**Cause**: TypeScript compilation issue  
**Fix**: `npm run type-check` and fix reported errors

## 📞 Getting Additional Help

### 1. Generate Diagnostic Report
```javascript
// Copy this complete report when asking for help
showDiagnosticReport()
```

### 2. Check Documentation
- [Voice System Guide](./VOICE_SYSTEM.md)
- [Backend Deployment](./BACKEND_DEPLOYMENT.md)  
- [Project Summary](./PROJECT_SUMMARY.md)

### 3. Debug Information to Include
When reporting issues, please include:
- Full diagnostic report (from `showDiagnosticReport()`)
- Browser console errors (F12 → Console)
- Steps to reproduce the issue
- Operating system and browser version
- Which features were working/not working

### 4. Development Commands
```bash
# Health check - run all these and report results
npm run type-check    # TypeScript compilation
npm run lint         # Code quality check  
npm run build        # Production build test
npm run test:api     # Backend API test
```

## 🎯 Quick Fixes for Specific Scenarios

### "Just want voice to work"
```bash
# Minimal setup for voice features
npm install
cp .env.example .env
# Add at least one API key to .env:
# VITE_ELEVENLABS_API_KEY=your_key OR VITE_OPENAI_API_KEY=your_key
npm run dev
```

### "Backend features needed"  
```bash
# Full setup including backend
npm install
cp .env.example .env
# Add backend API keys to .env:
# ELEVENLABS_API_KEY=your_key
# OPENAI_API_KEY=your_key  
# JWT_SECRET=your-secret-min-32-chars
npm run dev:backend
```

### "Running in production"
```bash
# Production build and serve
npm run build
npm run preview
# Or deploy built files from dist/ folder
```

---

**🎉 Still having issues?** Run `showDiagnosticReport()` in the browser console and check the recommendations section for personalized troubleshooting steps.