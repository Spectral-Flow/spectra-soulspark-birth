# Next.js Tutorial Implementation for ElevenLabs Conversational AI

This document describes the implementation of the ElevenLabs Conversational AI tutorial adapted for the Vite React environment.

## Overview

The tutorial demonstrates how to create a web application that enables voice conversations with ElevenLabs AI agents. This implementation follows the exact structure and patterns from the Next.js tutorial but adapts them for Vite React.

## Tutorial Structure Comparison

### Original Next.js Tutorial
```
my-conversational-agent/
├── app/
│   ├── components/
│   │   └── conversation.tsx
│   ├── page.tsx
│   └── api/
│       └── get-signed-url/
│           └── route.ts
├── .env.local
└── package.json
```

### Vite React Implementation
```
spectra-soulspark-birth/
├── src/
│   ├── components/
│   │   └── tutorial-examples/
│   │       ├── SimpleConversation.tsx
│   │       ├── SignedUrlConversation.tsx
│   │       └── index.ts
│   └── pages/
│       └── Tutorial.tsx
├── api/
│   └── elevenlabs/
│       └── signed-url.ts
├── .env
└── package.json
```

## Implementation Details

### 1. Simple Conversation Component

**Next.js Tutorial Version:**
```tsx
// app/components/conversation.tsx
'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback } from 'react';

export function Conversation() {
  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error),
  });

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: 'YOUR_AGENT_ID',
        user_id: 'YOUR_CUSTOMER_USER_ID'
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected'}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Start Conversation
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Stop Conversation
        </button>
      </div>
      <div className="flex flex-col items-center">
        <p>Status: {conversation.status}</p>
        <p>Agent is {conversation.isSpeaking ? 'speaking' : 'listening'}</p>
      </div>
    </div>
  );
}
```

**Vite React Implementation:**
```tsx
// src/components/tutorial-examples/SimpleConversation.tsx
// [Same implementation with props support for agent ID]
```

### 2. Signed URL Authentication

**Next.js Tutorial API Route:**
```tsx
// app/api/get-signed-url/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${process.env.NEXT_PUBLIC_AGENT_ID}`,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get signed URL');
    }

    const data = await response.json();
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    );
  }
}
```

**Vite React Implementation:**
```tsx
// api/elevenlabs/signed-url.ts
// [Vercel API function with POST method and agentId in body]
```

### 3. Environment Variables

**Next.js Tutorial:**
```bash
# .env.local
ELEVENLABS_API_KEY=your-api-key-here
NEXT_PUBLIC_AGENT_ID=your-agent-id-here
```

**Vite React Implementation:**
```bash
# .env
VITE_ELEVENLABS_API_KEY=your-api-key-here
VITE_ELEVENLABS_AGENT_ID=your-agent-id-here
ELEVENLABS_API_KEY=your-api-key-here
```

### 4. Page Structure

**Next.js Tutorial:**
```tsx
// app/page.tsx
import { Conversation } from './components/conversation';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          ElevenLabs Conversational AI
        </h1>
        <Conversation />
      </div>
    </main>
  );
}
```

**Vite React Implementation:**
```tsx
// src/pages/Tutorial.tsx
// [Enhanced version with tabs, configuration, and documentation]
```

## Key Adaptations

### 1. Framework Differences
- **Routing**: React Router instead of Next.js App Router
- **API Routes**: Vercel API functions instead of Next.js API routes
- **Environment Variables**: `import.meta.env` instead of `process.env`
- **Bundle**: Vite instead of Next.js webpack

### 2. Enhanced Features
- **Configuration UI**: Interactive agent ID configuration
- **Multiple Examples**: Both basic and signed URL versions
- **Documentation**: Comprehensive tutorial page with explanations
- **Integration**: Embedded within existing SPECTRA interface

### 3. Security Considerations
- Server-side API key handling for signed URLs
- CORS configuration for cross-origin requests
- Environment variable separation (client vs server)

## Usage Instructions

### 1. Setup
```bash
# Clone the repository
git clone https://github.com/Spectral-Flow/spectra-soulspark-birth.git

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Configure your ElevenLabs credentials
# Edit .env and add your API key and agent ID
```

### 2. Development
```bash
# Start development server
npm run dev

# Navigate to tutorial page
open http://localhost:8080/tutorial
```

### 3. Testing
1. Configure your agent ID in the tutorial page
2. Test the basic conversation example
3. Test the signed URL authentication example
4. Check browser console for detailed logs

## Deployment

The implementation works with any hosting platform that supports:
- Static site hosting (for the frontend)
- Serverless functions (for the API routes)
- Environment variable configuration

Tested platforms:
- ✅ Vercel (recommended)
- ✅ Netlify
- ✅ Railway
- ✅ GitHub Pages (with API proxy)

## Troubleshooting

### Common Issues

1. **"Agent ID is required"**
   - Configure agent ID in the tutorial page
   - Check environment variable `VITE_ELEVENLABS_AGENT_ID`

2. **"ElevenLabs API key not configured"**
   - Set `VITE_ELEVENLABS_API_KEY` for client-side features
   - Set `ELEVENLABS_API_KEY` for server-side API routes

3. **Microphone permission denied**
   - Grant microphone access in browser settings
   - Use HTTPS in production (required for microphone access)

4. **Connection fails**
   - Check network connectivity
   - Verify agent ID is valid and accessible
   - Check browser console for detailed error messages

### Debug Information

Enable debug logging by checking the browser console:
- Connection status changes
- API responses
- Error messages with details
- Voice activity events

## Tutorial Compliance Checklist

- [x] ✅ Basic conversation setup with `useConversation` hook
- [x] ✅ Microphone permission handling
- [x] ✅ Simple start/stop conversation controls
- [x] ✅ Connection status monitoring
- [x] ✅ Voice activity indication (speaking/listening)
- [x] ✅ Signed URL authentication for private agents
- [x] ✅ Server-side API integration
- [x] ✅ Error handling and user feedback
- [x] ✅ Environment variable configuration
- [x] ✅ Production-ready deployment structure

## Next Steps

Potential enhancements following the tutorial patterns:

1. **Chat History Display**: Add conversation transcript
2. **Voice Activity Visualization**: Visual feedback for voice activity
3. **Custom Agent Configuration**: Multiple agent presets
4. **Error Recovery**: Automatic reconnection on failures
5. **Performance Monitoring**: Connection quality metrics

## Resources

- [ElevenLabs Conversational AI Documentation](https://docs.elevenlabs.io/docs/conversational-ai/quickstart)
- [@elevenlabs/react Package](https://www.npmjs.com/package/@elevenlabs/react)
- [Tutorial Examples Source Code](./src/components/tutorial-examples/)
- [Live Demo](/tutorial)