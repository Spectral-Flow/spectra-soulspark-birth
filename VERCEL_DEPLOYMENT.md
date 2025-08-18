# Vercel Deployment Guide

## Quick Deployment Steps

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import this repository

2. **Configuration**
   - Vercel will auto-detect this as a Vite project
   - All configuration is handled by `vercel.json`
   - No additional setup required

3. **Environment Variables (Optional)**
   If using OpenAI features, add in Vercel dashboard:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Files Added for Vercel

- `vercel.json` - Main Vercel configuration
- `.nvmrc` - Node.js version specification  
- `.vercelignore` - Files to exclude from deployment
- `scripts/check-vercel.sh` - Deployment readiness checker

## Build Configuration

- **Framework**: Vite (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18.19.0 (via .nvmrc)

## Key Features Configured

✅ **Single Page Application (SPA) routing**
- All routes redirect to `index.html`

✅ **Build optimizations**
- Code splitting for vendor and UI libraries
- Source maps for development mode only

✅ **Security**
- Updated Content Security Policy
- Proper HTTPS redirects

✅ **Performance**
- Optimized dependency loading
- Memory limit increased for build process

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