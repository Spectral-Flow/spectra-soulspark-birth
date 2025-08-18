# ElevenLabs Conversational AI Integration

This document describes the integration of ElevenLabs Conversational AI into the SPECTRA voice system.

## Overview

The SPECTRA application now includes a complete ElevenLabs Conversational AI integration that allows users to have real-time voice conversations with AI agents. This integration follows the tutorial structure but has been adapted for the Vite React architecture.

## Features

### ✅ Implemented Features
- Real-time voice conversations with ElevenLabs AI agents
- Support for both public and private agents
- Microphone permission handling
- Connection status monitoring
- Error handling and user feedback
- Settings panel for agent configuration
- Authentication support for private agents
- Integration with existing SPECTRA interface

### 🔧 Configuration Options
- **Agent ID**: Configure which ElevenLabs agent to connect to
- **Public/Private Agent**: Toggle between public and private agent modes
- **API Key Authentication**: Support for private agents requiring API keys

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Configure the following variables in your `.env` file:

```bash
# Required for private agents
VITE_ELEVENLABS_API_KEY=your-api-key-here

# Optional: Default agent ID
VITE_ELEVENLABS_AGENT_ID=your-agent-id-here
```

### 2. Getting Your ElevenLabs Credentials

1. **API Key**: Sign up at [ElevenLabs](https://www.elevenlabs.io/sign-up) and get your API key
2. **Agent ID**: Create an agent following the [ElevenLabs Conversational AI quickstart](https://docs.elevenlabs.io/docs/conversational-ai/quickstart)

### 3. Usage

1. Navigate to the "Voice AI" tab in the SPECTRA interface
2. Click the settings button (gear icon) to configure your agent
3. Enter your Agent ID
4. For private agents: Enable "Private Agent" and ensure your API key is configured
5. Click "Start Conversation" to begin talking with the AI agent

## Architecture

### Components

- **`Conversation`** (`src/components/elevenlabs/Conversation.tsx`): Main conversation interface
- **`ElevenLabsApiService`** (`src/components/elevenlabs/api.ts`): API service for authentication

### Integration Points

- Integrated into the main SPECTRA interface as a new tab
- Uses existing UI components (Button, Card, Badge, etc.)
- Follows the existing design patterns and styling

### Key Adaptations from Tutorial

1. **Framework**: Adapted from Next.js to Vite React
2. **Environment Variables**: Uses `import.meta.env` instead of `process.env`
3. **API Routes**: Client-side API service instead of Next.js API routes
4. **Integration**: Embedded within existing SPECTRA interface

## Error Handling

The integration includes comprehensive error handling:

- Microphone permission errors
- Network connectivity issues
- Authentication failures
- Invalid agent IDs
- API rate limiting

## Browser Compatibility

- Requires modern browser with Web Audio API support
- Microphone access permission required
- WebSocket support needed for real-time communication

## Troubleshooting

### Common Issues

1. **"Please enter an Agent ID"**: Configure an agent ID in the settings panel
2. **"ElevenLabs API key not configured"**: Set `VITE_ELEVENLABS_API_KEY` for private agents
3. **Microphone access denied**: Grant microphone permissions in browser settings
4. **Connection fails**: Check network connectivity and agent ID validity

### Debug Information

The component logs detailed information to the browser console:
- Connection status changes
- Error messages
- API responses

## Security Considerations

- API keys are stored in environment variables, not in code
- Signed URLs are generated on-demand for private agents
- No sensitive credentials are exposed to the client

## Future Enhancements

Potential improvements for the integration:

- [ ] Chat history display during voice conversations
- [ ] Voice activity visualization
- [ ] Custom agent configuration presets
- [ ] Integration with SPECTRA memory system
- [ ] Emotional state synchronization with conversations