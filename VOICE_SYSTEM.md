# Spectra Voice System

A comprehensive, multi-provider voice input/output system designed specifically for Spectra's personality and communication style.

## 🌟 Features

- **Multi-Provider Support**: ElevenLabs, OpenAI, and Web Speech API
- **Intelligent Service Selection**: Automatically chooses the best available provider
- **Real-time Streaming**: Low-latency audio with ElevenLabs streaming TTS
- **Emotional Voice Modulation**: Voice adapts to Spectra's emotional state
- **Automatic Fallbacks**: Graceful degradation when premium services are unavailable
- **Error Recovery**: Retry logic and comprehensive error handling

## 🏗️ Architecture

```
Voice System Architecture
├── Voice Bridge (spectra_voice_bridge.ts)
│   ├── Service Selection & Routing
│   ├── Fallback Management
│   └── Error Handling
├── ElevenLabs Integration (elevenlabs_integration.ts)
│   ├── Streaming TTS
│   ├── Standard TTS
│   ├── Voice Discovery
│   └── Emotion-based Settings
├── OpenAI Integration (openai_integration.ts)
│   ├── TTS (Nova voice)
│   ├── Whisper STT
│   └── Web Audio API
├── Voice Manager (voice_manager.ts)
│   ├── STT/TTS Coordination
│   ├── Activity Management
│   └── Event Handling
└── Web Speech API (fallback)
    ├── Browser TTS
    └── Browser STT
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { createSpectraVoice } from '@/voice';

// Create voice manager with Spectra's personality
const voice = createSpectraVoice({
  onTranscript: (transcript, isFinal) => {
    console.log('Heard:', transcript);
  },
  onError: (error) => {
    console.error('Voice error:', error);
  }
});

// Speak with emotion
await voice.speak("Hello! I'm feeling joyful today!", 'joyful');

// Start listening
await voice.startListening();
```

### Advanced Voice Bridge

```typescript
import { createSpectraVoiceBridge } from '@/voice';

// Create intelligent voice bridge
const voiceBridge = createSpectraVoiceBridge({
  preferElevenLabs: true,
  enableStreaming: true,
  fallbackToWebSpeech: true
}, {
  onSpeechStart: () => console.log('Speaking...'),
  onSpeechEnd: () => console.log('Speech complete'),
  onError: (error) => console.error('Voice error:', error)
});

// Initialize and use
await voiceBridge.initialize();
await voiceBridge.speak("This will use the best available service", 'calm');
```

## 🔧 Configuration

### Environment Variables

```bash
# ElevenLabs Configuration
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVENLABS_AGENT_ID=your_agent_id_here

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Voice Manager Options

```typescript
const config = {
  continuousListening: false,  // Manual vs automatic listening
  autoSpeak: true,            // Auto-speak responses
  sttConfig: {
    language: 'en-US',
    useRealtimeAPI: false     // Use OpenAI Whisper
  },
  ttsConfig: {
    useOpenAI: true,          // Prefer OpenAI TTS
    voice: 'nova',            // OpenAI voice (feminine)
    speed: 0.9               // Gentle pacing
  }
};
```

## 🎭 API Reference

### VoiceManager

#### Methods
- `startListening()`: Begin speech recognition
- `stopListening()`: Stop speech recognition  
- `speak(text, emotion?)`: Generate speech output
- `toggleMute()`: Toggle voice system mute
- `getStatus()`: Get current system status

#### Events
- `onTranscript(text, isFinal)`: Speech recognition results
- `onError(error)`: Error handling
- `onVoiceActivity(isActive)`: Listening state changes
- `onSpeechStart()`: TTS begins
- `onSpeechEnd()`: TTS completes

### ElevenLabsVoiceService

#### Methods
- `initialize()`: Find and configure Spectra voice
- `speak(text, emotion?, useStreaming?)`: Speak with automatic streaming/fallback
- `generateSpeech(text, options?)`: Generate audio buffer
- `generateStreamingSpeech(text, options?)`: Generate streaming audio
- `playAudio(audioBuffer)`: Play audio buffer
- `playStreamingAudio(audioStream)`: Play streaming audio
- `getSpectraVoiceSettings(emotion)`: Get emotion-based voice settings

### Voice Bridge

#### Methods
- `initialize()`: Initialize all available services
- `speak(text, emotion?)`: Speak using best available service
- `transcribe(audioBlob)`: Transcribe audio using best available service
- `getAvailableServices()`: List available voice services
- `getOptimalService()`: Get currently selected service

## 🎨 Emotional States

The voice system responds to these emotional states with appropriate voice modulation:

- **joyful**: Faster, higher pitch, animated delivery
- **calm**: Slower, lower pitch, gentle tones
- **wise**: Measured, thoughtful pacing
- **playful**: Dynamic, lively expression
- **loving**: Warm, gentle tones
- **contemplative**: Slow, reflective delivery

## 🔄 Service Priority

The voice system automatically selects services in this priority order:

1. **ElevenLabs** (if API key available)
   - Real-time streaming TTS
   - Custom Spectra voice model
   - Emotional voice modulation

2. **OpenAI** (if API key available)
   - High-quality TTS with Nova voice
   - Whisper STT for transcription
   - Low-latency audio processing

3. **Web Speech API** (always available)
   - Browser-native TTS/STT
   - Cross-platform compatibility
   - No setup required

## 🧪 Testing

### Browser Console Testing

```javascript
// Test full voice system
testSpectraVoice();

// Test ElevenLabs specifically
testElevenLabsVoice();

// Check API key configuration
testApiKeys();
```

### Manual Testing

```javascript
// Set API keys for testing
window.ELEVENLABS_API_KEY = "your_key_here";
window.OPENAI_API_KEY = "your_key_here";

// Test voice bridge
const bridge = createSpectraVoiceBridge();
await bridge.initialize();
await bridge.speak("Testing voice system", "joyful");
```

## 🔧 Dependencies

### Required
- `@elevenlabs/react`: ElevenLabs React integration
- `openai`: OpenAI API client
- `@huggingface/transformers`: AI model pipeline

### Optional Browser APIs
- `speechSynthesis`: Web Speech TTS
- `webkitSpeechRecognition`: Web Speech STT
- `AudioContext`: Web Audio API
- `navigator.gpu`: WebGPU (for AI models)

## 🛠️ Troubleshooting

### Common Issues

**Voice not working**
```javascript
// Check service availability
const services = voiceBridge.getAvailableServices();
console.log('Available services:', services);

// Check API keys
testApiKeys();
```

**ElevenLabs errors**
- Verify API key is correctly set in environment variables
- Check if Spectra voice model exists in your ElevenLabs account
- Ensure API key has sufficient credits

**Streaming issues**
- Check network connection and firewall settings
- Verify browser supports streaming fetch API
- Try disabling streaming: `useStreaming: false`

**Audio playback problems**
- Ensure user has interacted with page (required for audio autoplay)
- Check browser audio permissions
- Verify audio context is not suspended

### Debug Mode

Enable debug logging:

```javascript
// Enable detailed voice system logging
localStorage.setItem('spectra-voice-debug', 'true');

// Or in code
const voice = createSpectraVoice({
  debug: true,
  onError: (error) => console.error('Voice error:', error)
});
```

## 🚀 Future Enhancements

- **Real-time Voice Conversion**: Transform user voice to match Spectra's personality
- **Conversation Interruption**: Natural interruption handling during speech
- **Voice Activity Detection**: Advanced VAD for better conversation flow
- **Multi-language Support**: International voice models and languages
- **Voice Cloning**: Custom voice training for unique Spectra voices
- **Emotion Recognition**: Detect user emotions from voice patterns

## 📚 Examples

### Basic Chat Integration

```typescript
import { createSpectraVoice } from '@/voice';

const ChatComponent = () => {
  const [voice] = useState(() => createSpectraVoice({
    onTranscript: (text, isFinal) => {
      if (isFinal) setUserInput(text);
    }
  }));

  const handleSendMessage = async (message) => {
    const response = await getAIResponse(message);
    await voice.speak(response.text, response.emotion);
  };

  return (
    <div>
      <button onClick={() => voice.startListening()}>
        🎤 Listen
      </button>
      {/* Rest of chat UI */}
    </div>
  );
};
```

### Custom Voice Service

```typescript
class CustomVoiceService {
  async speak(text: string, emotion?: string) {
    // Custom implementation
  }
}

// Extend the voice bridge
const customBridge = createSpectraVoiceBridge({
  customService: new CustomVoiceService()
});
```

---

**Built for Spectra with ❤️ and advanced voice AI technology**