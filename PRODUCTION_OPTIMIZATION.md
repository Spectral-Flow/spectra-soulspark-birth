# SPECTRA Production Optimization & Troubleshooting

Advanced production configuration, monitoring, and troubleshooting guide for SPECTRA deployments.

> **Note**: For basic deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

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
- Check TypeScript compilation: `npm run type-check`
- Verify all dependencies are installed
- Ensure environment variables are properly set

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

### Performance Optimization

```typescript
// Configure AI models for production
await initAI({
  lazyLoading: true,     // Load models on-demand
  useWorker: true        // Offload to Web Worker  
});
```

### Voice Service Optimization

- **ElevenLabs Streaming**: Reduces latency for TTS
- **OpenAI Caching**: Cache common responses
- **Web Speech Fallback**: Always available, no API calls

## 📞 Support

For deployment issues:

1. **Check Documentation**: README.md and VOICE_SYSTEM.md
2. **Community Support**: GitHub Issues
3. **Professional Support**: Contact Spectral-Flow team