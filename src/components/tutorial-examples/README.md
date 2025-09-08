# ElevenLabs Conversational AI Tutorial Examples

This directory contains simplified, tutorial-compliant examples that demonstrate how to integrate ElevenLabs Conversational AI into a web application.

## Components

### SimpleConversation
A basic conversation component that matches the Next.js tutorial structure:
- Direct agent ID usage (for public agents)
- Simple start/stop controls
- Basic status display
- Microphone permission handling

### SignedUrlConversation
An advanced conversation component with authentication:
- Signed URL generation for private agents
- Server-side API integration
- Secure authentication flow
- Production-ready setup

## Usage

Both components are demonstrated in the `/tutorial` page of the application. You can access it by:

1. Starting the development server: `npm run dev`
2. Navigating to `/tutorial` in your browser
3. Configuring your agent ID
4. Testing both examples

## Key Differences from Next.js Tutorial

| Next.js Tutorial | Vite React Implementation |
|-----------------|---------------------------|
| `app/components/conversation.tsx` | `src/components/tutorial-examples/` |
| `app/api/get-signed-url/route.ts` | `api/elevenlabs.ts` (operation: signed-url) |
| `process.env.NEXT_PUBLIC_*` | `import.meta.env.VITE_*` |
| Next.js API routes | Vercel API functions |

## Environment Setup

Configure these environment variables in your `.env` file:

```bash
# Required for signed URL authentication
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Optional: Default agent ID
VITE_ELEVENLABS_AGENT_ID=your_agent_id_here
```

## Tutorial Compliance

These examples follow the exact patterns shown in the ElevenLabs Next.js tutorial:

1. ✅ Basic conversation setup with `useConversation` hook
2. ✅ Microphone permission handling
3. ✅ Simple start/stop controls
4. ✅ Connection status monitoring
5. ✅ Voice activity indication
6. ✅ Signed URL authentication for private agents
7. ✅ Server-side API integration
8. ✅ Error handling and user feedback

The implementations are adapted for Vite React but maintain the same functionality and patterns as the Next.js tutorial examples.