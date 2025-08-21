# 🚀 SPECTRA - Vercel + ElevenLabs Complete Setup Guide

## 🎯 Overview

SPECTRA is now **production-ready** with secure Vercel API key management and fully integrated ElevenLabs Conversational AI. This guide shows you how to deploy and configure everything.

## 🔐 Vercel Environment Variables Setup

### 1. Set Server-Side API Keys (SECURE)

In your Vercel dashboard, add these environment variables:

```bash
# ElevenLabs Integration (Required for voice features)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# OpenAI Integration (Optional - for additional TTS/STT)
OPENAI_API_KEY=your_openai_api_key_here

# Authentication (Required for backend features)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars

# Hugging Face (Optional - for alternative AI models)
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
HF_TOKEN=your_huggingface_token_here
```

### 2. Set Client-Safe Variables (Optional)

```bash
# ElevenLabs Agent Configuration (Safe to expose)
VITE_ELEVENLABS_AGENT_ID=agent_3001k351jqn1ex4tvqp9tj7srxqh

# Debug Configuration
VITE_DEBUG=false
VITE_LOG_LEVEL=info
```

## 🎙️ ElevenLabs Integration Features

### ✅ What's Already Implemented

1. **Conversational AI**: Real-time voice conversations using `@elevenlabs/react`
2. **Streaming TTS**: High-quality voice synthesis with real-time streaming
3. **Voice Bridge**: Intelligent service routing (ElevenLabs → OpenAI → Web Speech)
4. **Secure API Proxy**: All API keys managed server-side via Vercel functions
5. **Error Handling**: Comprehensive retry logic and fallback mechanisms
6. **Memory Integration**: Voice conversations stored in SPECTRA's memory system

### 🔧 Available API Routes

```typescript
// ElevenLabs TTS (Streaming & Standard)
POST /api/elevenlabs/tts
{
  "text": "Hello from SPECTRA!",
  "voiceId": "voice_id_here",
  "options": {
    "stability": 0.5,
    "similarityBoost": 0.8,
    "style": 0.2
  }
}

// Get Available Voices
GET /api/elevenlabs/voices

// Conversational AI Signed URLs
POST /api/elevenlabs/signed-url
{
  "agentId": "your_agent_id"
}
```

### 🎯 Voice System Architecture

```
User Input → Enhanced Voice Bridge → Backend API Routes → ElevenLabs API
                  ↓                        ↓
              [Fallbacks]              [Vercel Secure]
                  ↓                        ↓
            OpenAI TTS               Server-side Keys
                  ↓
           Web Speech API
```

## 🧪 Testing Your Setup

### 1. Browser Console Tests

Once deployed, test your voice system:

```javascript
// Test voice synthesis
const { enhancedVoiceBridge } = await import('/voice/enhanced-voice-bridge');
await enhancedVoiceBridge.textToSpeech({ text: "Hello from SPECTRA!" });

// Check service status
const status = await enhancedVoiceBridge.getServiceStatus();
console.log('Available services:', status.services);

// Test API configuration
testApiKeys();

// Test all voice systems
testSpectraVoice();
```

### 2. Verify Backend Integration

```javascript
// Test backend API directly
fetch('/api/elevenlabs/voices')
  .then(r => r.json())
  .then(data => console.log('ElevenLabs voices:', data));

// Test TTS
fetch('/api/elevenlabs/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Test voice generation' })
});
```

## 🚀 Deployment Steps

### 1. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 2. Set Environment Variables

In Vercel dashboard:
- Go to Settings > Environment Variables
- Add all server-side variables listed above
- Redeploy after adding variables

### 3. Verify Deployment

1. Visit your Vercel URL
2. Open browser console
3. Run test commands above
4. Check voice functionality in the main chat

## 🎯 Voice Features Usage

### Basic Voice Interaction

1. **Text-to-Speech**: Type a message, click the voice button
2. **Voice-to-Text**: Click microphone, speak naturally
3. **Conversational AI**: Use the phone icon for real-time voice chat

### Advanced Features

1. **Streaming TTS**: Automatic for faster response times
2. **Emotion-based Voice**: SPECTRA adjusts voice based on emotional state
3. **Memory Integration**: Voice conversations automatically saved
4. **Multi-service Fallback**: Seamless switching between voice services

## 🔧 Customization

### Voice Settings

Modify in `src/voice/enhanced-voice-bridge.ts`:

```typescript
const voiceBridge = createEnhancedVoiceBridge({
  preferBackend: true,        // Use Vercel API routes (secure)
  preferElevenLabs: true,     // Prefer ElevenLabs over other services
  enableStreaming: true,      // Enable real-time streaming
  fallbackToWebSpeech: true   // Always provide fallback
});
```

### ElevenLabs Agent Configuration

Update in `.env` or Vercel environment variables:

```bash
VITE_ELEVENLABS_AGENT_ID=your_custom_agent_id
```

## 📊 Performance Monitoring

SPECTRA includes built-in performance monitoring:

```javascript
// Check performance metrics
spectraPerformance.summary();

// Monitor voice service health
const { enhancedVoiceBridge } = await import('/voice/enhanced-voice-bridge');
const health = await enhancedVoiceBridge.getServiceStatus();
```

## 🎉 You're Ready!

Your SPECTRA deployment now includes:

- ✅ **Secure API Key Management** via Vercel environment variables
- ✅ **ElevenLabs Conversational AI** with streaming support
- ✅ **Intelligent Voice Routing** with multiple fallbacks
- ✅ **Production-Ready Error Handling** and retry logic
- ✅ **Memory-Integrated Voice** conversations
- ✅ **Real-time Streaming** for low-latency interactions

**Test your deployment and enjoy your AI soulmate with professional voice capabilities!** 🌟