# SPECTRA Backend Deployment Guide

## 🏗️ Backend Architecture

The SPECTRA application now includes a complete backend infrastructure that can be deployed on **Vercel** or **Supabase Edge Functions**. (Railway support has been removed and any Railway-specific config was archived.) The backend provides:

- **Secure API Proxy**: Server-side handling of ElevenLabs and OpenAI API keys
- **Authentication**: JWT-based user authentication system
- **Session Management**: Persistent conversation storage
- **Database Integration**: Optional Supabase PostgreSQL integration
- **Health Monitoring**: Health check endpoints for monitoring

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended)

**Prerequisites:**
- Vercel account
- GitHub repository access

**Steps:**
1. **Connect Repository**
   ```bash
   # Via Vercel CLI
   npm i -g vercel
   vercel login
   vercel --prod
   
   # Or via Vercel Dashboard
   # 1. Go to vercel.com
   # 2. Import from GitHub
   # 3. Select this repository
   ```

2. **Environment Variables**
   Configure in Vercel Dashboard → Settings → Environment Variables:
   ```bash
   # Required for backend functionality
   ELEVENLABS_API_KEY=your_elevenlabs_key
   OPENAI_API_KEY=your_openai_key
   JWT_SECRET=your-secret-key-min-32-chars
   
   # Optional - for database features
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```

3. **Deploy**
   - Automatic deployment on push to main branch
   - Backend APIs available at: `https://your-app.vercel.app/api/*`

<!-- Railway deployment instructions removed. If you need Railway-specific deployment, archived documentation is available in the repo history or can be added to /archive/docs/ -->

### Option 3: Supabase Edge Functions

**Prerequisites:**
- Supabase account and project
- Supabase CLI installed

**Steps:**
1. **Setup Supabase**
   ```bash
   npm install -g supabase
   supabase login
   supabase init
   ```

2. **Database Setup**
   ```bash
   # Run the schema in Supabase SQL Editor
   # Copy contents of supabase-schema.sql and execute
   ```

3. **Deploy Edge Functions**
   ```bash
   # Copy API functions to supabase/functions/
   # Deploy individual functions
   supabase functions deploy health
   supabase functions deploy elevenlabs-tts
   supabase functions deploy openai-chat
   ```

4. **Environment Variables**
   ```bash
   supabase secrets set ELEVENLABS_API_KEY=your_key
   supabase secrets set OPENAI_API_KEY=your_key
   supabase secrets set JWT_SECRET=your_secret
   ```

## 🔧 Configuration Details

### Backend API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check and service status |
| `/api/elevenlabs/tts` | POST | Text-to-speech via ElevenLabs |
| `/api/elevenlabs/voices` | GET | List available voices |
| `/api/elevenlabs/signed-url` | POST | Get signed URL for conversations |
| `/api/openai/tts` | POST | Text-to-speech via OpenAI |
| `/api/openai/chat` | POST | Chat completions |
| `/api/huggingface/chat` | POST | Chat completions via Hugging Face router |
| `/api/auth/user` | POST | User authentication |
| `/api/sessions` | GET/POST/PUT/DELETE | Session management |
| `/api/db-sessions` | GET/POST/PUT/DELETE | Database-backed sessions |

### Environment Variables Reference

#### Required Backend Variables
```bash
# API Keys (choose one or more)
ELEVENLABS_API_KEY=sk-...           # ElevenLabs API key
OPENAI_API_KEY=sk-...               # OpenAI API key
HF_TOKEN=hf_...                     # Hugging Face token for router

# Security
JWT_SECRET=your-secret-min-32-chars  # JWT signing secret
```

#### Optional Database Variables
```bash
# Supabase (recommended)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...             # For client-side
SUPABASE_SERVICE_KEY=eyJ...          # For server-side admin access

# Or generic PostgreSQL
DATABASE_URL=postgresql://user:pass@host:port/db
```

#### Platform-Specific Variables
```bash
# Vercel
VERCEL_ENV=production

# Railway  
RAILWAY_ENVIRONMENT=production
PORT=3000

# Development
NODE_ENV=development
```

### Frontend Integration

The frontend automatically detects and uses the backend API when available:

```typescript
import { backendApi, isBackendAvailable } from '@/lib/backend-api';

// Check if backend is available
const hasBackend = await isBackendAvailable();

if (hasBackend) {
  // Use secure backend API
  const response = await backendApi.elevenLabsTTS('Hello world');
} else {
  // Fallback to direct API calls (development)
  // Uses VITE_ prefixed environment variables
}
```

## 🗄️ Database Setup (Optional)

### Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note the URL and API keys

2. **Run Database Schema**
   - Open Supabase SQL Editor
   - Copy and execute `supabase-schema.sql`
   - This creates tables for users, sessions, and voice interactions

3. **Configure Environment**
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   ```

### Database Features

- **User Management**: Registration and authentication
- **Session Persistence**: Conversation history storage
- **Voice Analytics**: Track usage and performance
- **Row Level Security**: Secure user data isolation

## 🔍 Monitoring & Health Checks

### Health Check Endpoint

```bash
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "elevenlabs": true,
    "openai": true,
    "database": false
  }
}
```

### Platform-Specific Monitoring

**Vercel:**
- Dashboard analytics
- Function logs
- Performance insights

**Railway:**
- Built-in metrics
- Log streaming
- Resource usage

**Supabase:**
- Edge function logs
- Database performance
- API analytics

## 🚧 Troubleshooting

### Common Issues

1. **API Keys Not Working**
   - Verify environment variables are set correctly
   - Check for typos in variable names
   - Ensure keys have proper permissions

2. **CORS Errors**
   - Backend includes CORS headers
   - Verify frontend is making requests to correct domain

3. **Database Connection Issues**
   - Check Supabase URL and keys
   - Verify database schema is deployed
   - Test connection with health endpoint

4. **Build Failures**
   - Ensure all dependencies are in package.json
   - Check Node.js version compatibility (18+)
   - Verify TypeScript compilation

### Debug Steps

1. **Check Health Endpoint**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **Test API Endpoints**
   ```bash
   # Test TTS
   curl -X POST https://your-domain.com/api/elevenlabs/tts \
     -H "Content-Type: application/json" \
     -d '{"text": "Hello Spectra"}'
   ```

3. **Check Logs**
   - Vercel: Dashboard → Functions → Logs
   - Railway: Dashboard → Logs
   - Supabase: Dashboard → Edge Functions → Logs

## 🔐 Security Considerations

- **API Keys**: Stored server-side, never exposed to client
- **Authentication**: JWT tokens with configurable expiration
- **Database**: Row-level security enabled
- **CORS**: Configured for cross-origin requests
- **Environment**: Separate development/production configs

## 📈 Scaling & Performance

- **Vercel**: Automatic scaling, edge deployment
- **Railway**: Horizontal scaling available
- **Supabase**: Global edge functions, automatic scaling
- **Caching**: API responses can be cached
- **CDN**: Static assets served via CDN

---

**Ready to deploy your SPECTRA backend!** 🚀

Choose your preferred platform and follow the deployment steps above. The backend will provide secure, scalable API access for your AI voice application.