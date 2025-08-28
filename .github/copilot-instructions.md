# SPECTRA - GitHub Copilot Instructions

**ALWAYS follow these instructions first** and fallback to additional search and context gathering only if the information here is incomplete or found to be in error.

## Project Overview

SPECTRA is a React 18 + TypeScript AI soulmate application with advanced voice integration, built with Vite and deployed on Vercel. Features multi-provider voice systems (ElevenLabs, OpenAI, Azure OpenAI, Local LLMs), real-time conversation streaming, emotional intelligence, and mobile app support via Capacitor.

## Working Effectively

### Bootstrap and Build (Verified Commands)

**CRITICAL**: Always run these commands in sequence for a clean setup:

```bash
# 1. Install dependencies
npm install
# Takes: ~25 seconds. NEVER CANCEL. Set timeout to 60+ seconds.

# 2. Type checking
npm run type-check  
# Takes: ~7 seconds. NEVER CANCEL. Set timeout to 30+ seconds.

# 3. Fast build (development/testing)
npm run build:fast
# Takes: ~6 seconds. NEVER CANCEL. Set timeout to 30+ seconds.

# 4. Full production build
npm run build
# Takes: ~15 seconds (includes type-check). NEVER CANCEL. Set timeout to 60+ seconds.
```

### Development Workflow

**Start development server:**
```bash
npm run dev
# Takes: <1 second to start. NEVER CANCEL. Set timeout to 30+ seconds.
# Server: http://localhost:8080 (port 8080, NOT 3000)
```

**Preview production build:**
```bash
npm run preview
# Server: http://localhost:4173
# Takes: <1 second to start. NEVER CANCEL. Set timeout to 30+ seconds.
```

### Validation Commands

**ALWAYS run before committing changes:**

```bash
# 1. Lint check (currently has 8 errors in tutorial files - this is expected)
npm run lint
# Takes: ~3 seconds. NEVER CANCEL. Set timeout to 30+ seconds.

# 2. Fix lint issues automatically where possible
npm run lint:fix
# Takes: ~3 seconds. NEVER CANCEL. Set timeout to 30+ seconds.

# 3. Comprehensive health check
npm run health-check
# Takes: ~15 seconds (type-check + lint + build). NEVER CANCEL. Set timeout to 60+ seconds.
# NOTE: Currently fails due to lint errors - fix lint issues first

# 4. API security validation
npm run test:api-security
# Takes: <1 second. NEVER CANCEL. Set timeout to 30+ seconds.

# 5. GitHub secrets validation
npm run test:github-secrets
# Takes: <1 second. NEVER CANCEL. Set timeout to 30+ seconds.
```

### Mobile App Build

**Prerequisites for mobile builds:**
- Android Studio installed
- ANDROID_HOME environment variable set
- Java 17+ installed

```bash
# 1. Use guided setup (recommended)
scripts/build-mobile.sh    # Linux/Mac
scripts/build-mobile.bat   # Windows

# 2. Quick mobile build
npm run mobile:build
# Takes: ~30 seconds. NEVER CANCEL. Set timeout to 120+ seconds.

# 3. Build APK
npm run apk:build
# Takes: 2-5 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

## Manual Validation Scenarios

**CRITICAL**: After making changes, ALWAYS test these scenarios:

### 1. Application Startup Validation
```bash
npm run dev
# Navigate to http://localhost:8080
# Verify: Landing page loads with SPECTRA interface
# Verify: No console errors in browser DevTools
# Verify: Application responds to user interaction
```

### 2. Voice System Testing
**Test in browser console:**
```javascript
// Test voice synthesis availability
const { enhancedVoiceBridge } = await import('@/voice/enhanced-voice-bridge');

// Check service status (should show webspeech: true, others false without API keys)
const status = await enhancedVoiceBridge.getServiceStatus();
console.log('Available services:', status.services);

// Expected output: { elevenlabs: false, openai: false, webspeech: true }
```

**Test voice interaction:**
- Click voice input button - should attempt microphone access
- Verify error handling when microphone denied (expected in CI)
- Test text input field - should accept user input
- Check browser console for no critical errors during interaction

### 3. Build Artifact Validation
```bash
npm run build
# Verify: dist/ directory created
# Verify: All chunks generated without errors
# Check: Build output shows reasonable file sizes (<1MB each)
```

### 4. API Endpoint Testing
```bash
npm run test:api
# NOTE: Will show network errors if no server running - this is expected
# Verify: Script completes without crashing
```

## Environment Configuration

### Development Setup
```bash
# Copy environment template
cp .env.example .env

# For local development with APIs (optional):
# Edit .env and add your API keys:
# VITE_ELEVENLABS_API_KEY=your_key_here
# VITE_OPENAI_API_KEY=your_key_here
```

### Production Deployment
- **GitHub Secrets**: Use for secure API key management
- **Vercel**: Automatic deployment from main/Prism branches
- **Environment Variables**: Set in platform dashboard
- See: `docs/GITHUB_SECRETS_SETUP.md` for complete setup

## Project Structure Knowledge

### Key Directories
```
src/
├── components/          # React components
├── voice/              # Voice integration system
├── lib/                # Utilities and helpers
├── pages/              # Page components
└── examples/           # Usage examples and tutorials

api/                    # Serverless API endpoints
├── elevenlabs/         # ElevenLabs integration
├── openai/             # OpenAI integration
├── azure-openai/       # Azure OpenAI integration
└── utils/              # API utilities

docs/                   # Documentation
scripts/                # Build and test scripts
android/                # Mobile app files
```

### Critical Files to Monitor
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration
- `.env.example` - Environment variable template
- `src/voice/enhanced-voice-bridge.ts` - Core voice integration
- `api/utils/common.ts` - API utilities

### After Changing Voice Integration
**Always check these files:**
- `src/voice/enhanced-voice-bridge.ts`
- `src/voice/spectra_voice_bridge.ts`
- `src/examples/backend-usage.ts`

### After Changing API Endpoints
**Always validate:**
```bash
npm run test:api-security
npm run test:github-secrets
```

## Common Tasks

### Adding New Dependencies
```bash
npm install <package-name>
npm run health-check  # Verify no breaking changes
```

### Updating Dependencies
```bash
npm update
npm run health-check  # Verify compatibility
```

### Debugging Build Issues
1. Clear build cache: `npm run clean`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run type-check`
4. Run incremental build: `npm run build:fast`

### Performance Optimization
- Monitor chunk sizes in build output (should be <1MB each)
- Keep voice-related imports lazy-loaded
- Bundle analyzer not currently installed - use build output for size analysis

## Known Limitations

1. **Lint errors exist** in tutorial files - these are non-blocking for builds
2. **Mobile builds require** Android development environment
3. **API tests fail** without running server - this is expected behavior
4. **Voice features require** API keys for full functionality (graceful fallback to Web Speech API)

## Time Expectations

- **Dependencies**: 25 seconds
- **Type checking**: 7 seconds
- **Linting**: 3 seconds
- **Fast build**: 6 seconds
- **Full build**: 15 seconds
- **Dev server start**: <1 second
- **Mobile build**: 30 seconds - 5 minutes
- **Health check**: 15 seconds (if lint passes)

**NEVER CANCEL** any build or test command. Builds are optimized and complete quickly.