# SPECTRA Deployment Guide

This guide covers deploying SPECTRA to various platforms with proper configuration for voice services and AI capabilities.

## 🚀 Quick Deploy (Recommended)

### Via Lovable Platform

1. **Automatic Deployment**
   ```bash
   # No manual steps needed!
   # Changes pushed to main branch auto-deploy
   ```

2. **Manual Deployment via Lovable**
   - Visit [Lovable Project](https://lovable.dev/projects/d65c0cd2-5774-48b2-b3f3-efacfc8e7fdb)
   - Click **Share** → **Publish**
   - Configure custom domain if needed

3. **Environment Variables**
   - Set in Lovable dashboard under Project Settings
   - Required for voice services (see Environment Variables section)

## 🌍 Platform-Specific Deployments

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_ELEVENLABS_API_KEY
vercel env add VITE_OPENAI_API_KEY
```

### Netlify

```bash
# Build for production
npm run build

# Deploy dist/ folder via Netlify CLI or drag-and-drop
netlify deploy --prod --dir=dist
```

### Cloudflare Pages

```bash
# Connect GitHub repository to Cloudflare Pages
# Build settings:
# Build command: npm run build
# Build output directory: dist
# Node.js version: 18+
```

### AWS S3 + CloudFront

```bash
# Build the project
npm run build

# Upload to S3 bucket
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## 🔧 Environment Variables

### Required for Voice Services

```bash
# ElevenLabs Configuration (Recommended)
VITE_ELEVENLABS_API_KEY=sk-xxx...    # Get from elevenlabs.io
VITE_ELEVENLABS_AGENT_ID=xxx...      # Optional: for conversational AI

# OpenAI Configuration (Optional)
VITE_OPENAI_API_KEY=sk-xxx...        # Get from platform.openai.com

# Production Settings
VITE_NODE_ENV=production
VITE_API_BASE_URL=https://your-domain.com
```

### Security Notes

- **Never commit API keys to version control**
- Use platform-specific environment variable systems
- Consider using secret management services for production
- API keys are VITE_ prefixed for client-side access

## 🏗️ Build Configuration

### Production Build

```bash
# Standard production build
npm run build

# Build with specific mode
npm run build -- --mode production

# Build for development (with source maps)
npm run build:dev
```

### Build Optimizations

The project includes several optimizations:

- **Code Splitting**: Vendor and UI libraries are separated
- **Lazy Loading**: AI models load only when needed
- **Tree Shaking**: Unused code is removed
- **Asset Optimization**: Images and fonts are optimized

### Vite Configuration

```typescript
// vite.config.ts highlights
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-popover'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
```

## 🔒 Security Considerations

### API Key Management

```bash
# Development (.env.local)
VITE_ELEVENLABS_API_KEY=your_dev_key
VITE_OPENAI_API_KEY=your_dev_key

# Production (Platform Environment Variables)
# Set via platform dashboard, never in code
```

### Content Security Policy

Add CSP headers for enhanced security:

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  connect-src 'self' 
    https://api.elevenlabs.io 
    https://api.openai.com 
    https://cdn.jsdelivr.net;
  media-src 'self' blob: data:;
```

### HTTPS Requirements

- Voice APIs require HTTPS in production
- Ensure SSL/TLS certificates are properly configured
- Use HTTP/2 for better performance with streaming APIs

## 📊 Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer

# Or use webpack-bundle-analyzer
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer dist/static/js/*.js
```

### AI Model Optimization

```typescript
// Optimize AI model loading
const aiEngine = new SpectraAIEngine({
  device: 'webgpu',      // Use WebGPU when available
  lazyLoading: true,     // Load models on-demand
  useWorker: true        // Offload to Web Worker
});
```

### Voice Service Optimization

- **ElevenLabs Streaming**: Reduces latency for TTS
- **OpenAI Caching**: Cache common responses
- **Web Speech Fallback**: Always available, no API calls

## 🔍 Monitoring & Analytics

### Error Tracking

```typescript
// Add error tracking service
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_NODE_ENV,
});
```

### Performance Monitoring

```typescript
// Web Vitals tracking
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP(console.log);
onINP(console.log);
onCLS(console.log);
```

### Voice Service Monitoring

Monitor API usage and performance:

- **ElevenLabs**: Track character usage and API quotas
- **OpenAI**: Monitor token usage and rate limits
- **Web Speech**: Track browser compatibility issues

## 🧪 Testing in Production

### Health Checks

```bash
# Test deployment health
curl https://your-domain.com/health

# Test voice services
curl -X POST https://your-domain.com/api/voice/test \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello Spectra"}'
```

### E2E Testing

```bash
# Run production tests
npm run test:e2e

# Test voice functionality
npm run test:voice
```

### Load Testing

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

## 🔧 Troubleshooting

### Common Deployment Issues

**Build Failures**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**Environment Variable Issues**
```bash
# Check environment variables are set
echo $VITE_ELEVENLABS_API_KEY
echo $VITE_OPENAI_API_KEY

# Verify in browser console
console.log(import.meta.env.VITE_ELEVENLABS_API_KEY);
```

**Voice Service Failures**
- Verify API keys are correctly set
- Check network connectivity to voice APIs
- Ensure HTTPS is enabled for production
- Verify CORS settings for voice APIs

**Performance Issues**
- Enable compression (gzip/brotli)
- Configure CDN for static assets
- Optimize images and fonts
- Enable HTTP/2

### Debug Mode

Enable debug mode in production:

```bash
# Set debug environment variable
VITE_DEBUG=true

# Or via localStorage in browser
localStorage.setItem('spectra-debug', 'true');
```

## 📋 Pre-Deployment Checklist

- [ ] **Environment Variables**: All required API keys set
- [ ] **Build**: Successful production build
- [ ] **Testing**: All tests passing
- [ ] **Performance**: Bundle size optimized
- [ ] **Security**: HTTPS enabled, CSP configured
- [ ] **Monitoring**: Error tracking and analytics set up
- [ ] **Voice Services**: API keys valid and quotas sufficient
- [ ] **Fallbacks**: Web Speech API working without API keys
- [ ] **Documentation**: README and deployment docs updated

## 🚀 Production Optimization

### CDN Configuration

```bash
# Cache static assets aggressively
Cache-Control: public, max-age=31536000, immutable  # JS/CSS
Cache-Control: public, max-age=86400                # HTML
Cache-Control: public, max-age=604800               # Images
```

### Service Worker

Consider adding a service worker for:
- Offline functionality
- Caching voice responses
- Background AI model loading

### Database Integration

For production deployments with user data:
- Configure secure database connections
- Implement proper data encryption
- Set up backup and recovery procedures

## 📞 Support

For deployment issues:

1. **Check Documentation**: README.md and VOICE_SYSTEM.md
2. **Community Support**: GitHub Issues
3. **Professional Support**: Contact Spectral-Flow team

---

**Deploy Spectra with confidence! 🚀**