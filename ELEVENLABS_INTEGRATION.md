# ElevenLabs Conversational AI Integration

This implementation follows the [ElevenLabs Vite (Javascript) tutorial](https://elevenlabs.io/docs/conversational-ai/guides/quickstarts/javascript) to create a web application that enables voice conversations with ElevenLabs AI agents.

## Features Implemented

### ✅ Core Tutorial Requirements
- [x] **Real-time voice conversations** with ElevenLabs AI agents
- [x] **Start/Stop conversation controls** with visual feedback
- [x] **Connection status monitoring** (disconnected/connecting/connected)
- [x] **Agent status display** (listening/speaking mode)
- [x] **Agent ID configuration** for connecting to specific agents
- [x] **Signed URL authentication** support for private agents
- [x] **Error handling and user feedback**
- [x] **Microphone permission handling**

### 🚀 Enhanced Features
- [x] **React integration** within existing Spectra interface
- [x] **Graceful fallback** when ElevenLabs client not available
- [x] **Settings panel** for easy configuration
- [x] **Usage instructions** built into the interface
- [x] **Responsive design** with modern UI components
- [x] **Type-safe implementation** with TypeScript

## File Structure

```
src/
├── components/spectra/
│   └── ElevenLabsConversationalAI.tsx    # Main React component
├── voice/
│   ├── elevenlabs_conversation.ts        # ElevenLabs integration module
│   └── index.ts                          # Updated exports
├── pages/
│   └── Index.tsx                         # Added Voice AI tab
backend/
└── server.js                            # Backend for signed URLs
public/
├── index.html                           # Tutorial-style HTML
└── script.js                           # Tutorial-style JavaScript
elevenlabs-demo.html                     # Standalone demo page
.env.example                             # Environment variables template
```

## Installation & Setup

### 1. Install Dependencies

```bash
npm install @elevenlabs/client express cors dotenv
```

### 2. Configuration

#### For Public Agents (Simplest)
1. Get your agent ID from ElevenLabs dashboard
2. Replace `YOUR_AGENT_ID` in the interface with your actual agent ID
3. Start conversation directly

#### For Private Agents (With Authentication)
1. Create `.env` file based on `.env.example`:
   ```env
   ELEVENLABS_API_KEY=your-elevenlabs-api-key
   AGENT_ID=your-agent-id
   ```

2. Start the backend server:
   ```bash
   npm run dev:backend
   ```

3. Enable "Use Signed URL" in the interface settings

### 3. Run the Application

#### Option A: Full React Application
```bash
npm run dev:frontend
```
Navigate to the "Voice AI" tab in the main interface.

#### Option B: Simple Tutorial Version
```bash
# Start any HTTP server, e.g.:
python3 -m http.server 8080
```
Navigate to `http://localhost:8080/public/index.html`

#### Option C: Standalone Demo
Navigate to `http://localhost:8080/elevenlabs-demo.html`

## Usage Instructions

1. **Configure Agent ID**: Enter your ElevenLabs agent ID in the settings
2. **Start Conversation**: Click "Start Conversation" to begin
3. **Allow Microphone**: Grant microphone permissions when prompted
4. **Speak Naturally**: The AI will listen and respond with voice
5. **Monitor Status**: Watch connection and agent status indicators
6. **Stop When Done**: Click "Stop Conversation" to end

## Implementation Details

### React Component (`ElevenLabsConversationalAI.tsx`)
- **Tabbed interface** with conversation and settings panels
- **Real-time status indicators** with color-coded states
- **Error handling** with user-friendly messages
- **Configuration options** for agent ID and signed URLs
- **Responsive design** using shadcn/ui components

### Integration Module (`elevenlabs_conversation.ts`)
- **Type-safe wrapper** around ElevenLabs client
- **Dynamic import** for graceful degradation
- **Session management** with proper cleanup
- **Error handling** with detailed logging
- **Factory functions** for easy initialization

### Backend Server (`backend/server.js`)
- **Express.js server** for signed URL generation
- **CORS enabled** for cross-origin requests
- **Environment variable** configuration
- **Error handling** with proper HTTP status codes

## Integration with Existing Spectra System

The ElevenLabs Conversational AI is seamlessly integrated into the existing Spectra interface:

- **New "Voice AI" tab** added to main interface
- **Consistent styling** with existing components
- **No breaking changes** to existing functionality
- **Modular design** for easy maintenance

## Troubleshooting

### Common Issues

1. **"ElevenLabs client not available"**
   - Ensure `@elevenlabs/client` is installed: `npm install @elevenlabs/client`

2. **"Failed to start conversation"**
   - Check agent ID is valid
   - Ensure microphone permissions are granted
   - Verify network connectivity

3. **"Failed to get signed URL"**
   - Check backend server is running (`npm run dev:backend`)
   - Verify environment variables are set correctly
   - Ensure ElevenLabs API key has proper permissions

### Dependencies

- `@elevenlabs/client`: Core ElevenLabs client library
- `express`: Backend server (for signed URLs)
- `cors`: Cross-origin request handling
- `dotenv`: Environment variable management

## Next Steps

The implementation provides a solid foundation for voice conversations. Potential enhancements:

1. **Visual feedback** for voice activity detection
2. **Conversation history** display
3. **Advanced error recovery** and retry logic
4. **Custom voice settings** integration
5. **Analytics and usage tracking**

## Tutorial Compliance

This implementation fully complies with the [ElevenLabs Vite tutorial](https://elevenlabs.io/docs/conversational-ai/guides/quickstarts/javascript) requirements:

- ✅ Vite-based web application
- ✅ Real-time voice conversations
- ✅ Start/stop conversation controls
- ✅ Status indicators for connection and agent state
- ✅ Agent ID configuration
- ✅ Optional signed URL authentication
- ✅ Proper error handling
- ✅ Microphone permission handling
- ✅ Clean, maintainable code structure