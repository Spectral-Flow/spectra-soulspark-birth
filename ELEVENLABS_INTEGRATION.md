# ElevenLabs Integration Guide

Complete guide for integrating ElevenLabs voice synthesis and conversational AI with SPECTRA.

## 🎯 Overview

SPECTRA includes comprehensive ElevenLabs integration supporting:
- **Text-to-Speech**: Premium voice synthesis with emotional modulation
- **Conversational AI**: Real-time voice conversations with AI agents
- **Voice Models**: Support for custom Spectra voice and other models

## 🚀 Quick Setup

### 1. Get Your ElevenLabs API Key
1. Sign up at [ElevenLabs](https://elevenlabs.io/sign-up)
2. Navigate to your profile and copy your API key

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Add to .env file:
VITE_ELEVENLABS_API_KEY=your_api_key_here
VITE_ELEVENLABS_AGENT_ID=your_agent_id_here  # Optional
```

### 3. Quick Test
```javascript
// Test in browser console
window.ELEVENLABS_API_KEY = "your_api_key_here";

// Test voice synthesis
const { enhancedVoiceBridge } = await import('@/voice/enhanced-voice-bridge');
await enhancedVoiceBridge.textToSpeech({ text: "Hello, I'm SPECTRA!" });
```

## 🎙️ Text-to-Speech Integration

### Basic Usage
```javascript
import { createTextToSpeech } from '@/voice';

// Create TTS engine (automatically detects ElevenLabs)
const tts = createTextToSpeech();

// Speak with different emotions
await tts.speak("Hello, I am Spectra!", "calm");
await tts.speak("I'm so excited!", "joyful"); 
await tts.speak("Let me think about this...", "contemplative");
await tts.speak("Time to be playful!", "playful");
```

### Voice Features
- **Automatic Spectra Voice Detection**: Prioritizes "Spectra" voice model
- **Emotional Modulation**: Different voice settings per emotion  
- **Fallback System**: Uses feminine voices if Spectra unavailable
- **Error Handling**: Graceful fallback to Web Speech API

### Supported Emotions
- `calm` - Balanced, gentle delivery
- `joyful` - Higher energy, animated speech
- `contemplative` - Thoughtful, deliberate pacing
- `playful` - Dynamic, lively expression

## 🤖 Conversational AI Integration

### Features
- Real-time voice conversations with ElevenLabs AI agents
- Support for both public and private agents
- Microphone permission handling with error recovery
- Connection status monitoring and user feedback
- Settings panel for agent configuration
- Integration with existing SPECTRA interface

### Usage
1. Navigate to the "Voice AI" tab in SPECTRA
2. Click settings (gear icon) to configure your agent
3. Enter your Agent ID (create one at [ElevenLabs Conversational AI](https://docs.elevenlabs.io/docs/conversational-ai/quickstart))
4. For private agents: Enable "Private Agent" and ensure API key is configured
5. Click "Start Conversation" to begin talking with the AI

### Configuration Options
- **Agent ID**: Configure which ElevenLabs agent to connect to
- **Public/Private Agent**: Toggle between public and private agent modes
- **API Key Authentication**: Support for private agents requiring API keys

## 🏗️ Architecture & Integration

### Voice Provider Priority
1. **ElevenLabs** (if API key available)
2. **OpenAI** (if API key available)
3. **Web Speech API** (browser fallback)

### Key Components
- **Enhanced Voice Bridge** (`enhanced-voice-bridge.ts`): Main voice orchestrator
- **ElevenLabs Service** (`elevenlabs_integration.ts`): Direct API integration
- **Conversation Component** (`Conversation.tsx`): Conversational AI interface

### Integration Points
- Integrated into main SPECTRA interface as new tab
- Uses existing UI components and design patterns
- Compatible with SPECTRA's memory and emotional systems

## 🛠️ Advanced Configuration

### Custom Voice Settings
```typescript
import { createEnhancedVoiceBridge } from '@/voice/enhanced-voice-bridge';

const voiceBridge = createEnhancedVoiceBridge({
  preferElevenLabs: true,        // Prefer ElevenLabs over other providers
  enableStreaming: true,         // Enable real-time streaming
  fallbackToWebSpeech: true      // Always provide fallback
});
```

### API Service Configuration
```typescript
// For private agents requiring authentication
import { ElevenLabsApiService } from '@/components/elevenlabs/api';

const apiService = new ElevenLabsApiService();
await apiService.authenticate();
```

## 🔧 Troubleshooting

### Common Issues

**"Please enter an Agent ID"**
- Solution: Configure an agent ID in the settings panel

**"ElevenLabs API key not configured"**  
- Solution: Set `VITE_ELEVENLABS_API_KEY` in your environment

**Microphone access denied**
- Solution: Grant microphone permissions in browser settings

**Connection fails**
- Solution: Check network connectivity and verify agent ID validity

### Debug Information
The system logs detailed information to browser console:
- Connection status changes
- Error messages and recovery attempts
- API response details

### Browser Requirements
- Modern browser with Web Audio API support
- Microphone access permission
- WebSocket support for real-time communication

## 🔐 Security & Best Practices

- API keys stored in environment variables, never in code
- Signed URLs generated on-demand for private agents
- No sensitive credentials exposed to client
- Automatic retry with exponential backoff
- Comprehensive error boundaries

## 🚀 Future Enhancements

Planned improvements:
- [ ] Chat history display during voice conversations
- [ ] Voice activity visualization and real-time waveforms
- [ ] Custom agent configuration presets
- [ ] Deep integration with SPECTRA memory system
- [ ] Emotional state synchronization between text and voice
- [ ] Multi-language voice support

---

**Need help?** Check the [Voice System Guide](./VOICE_SYSTEM.md) for additional technical details.