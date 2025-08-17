# Spectra Voice System

A modular voice input/output system designed specifically for Spectra's personality and communication style.

## Features

### 🎤 Speech-to-Text (STT)
- **Web Speech API**: Browser-native speech recognition
- **OpenAI Whisper**: High-accuracy transcription (with API key)
- **Real-time Processing**: Continuous or manual activation modes
- **Error Handling**: Graceful fallbacks and error recovery

### 🔊 Text-to-Speech (TTS)
- **Web Speech Synthesis**: Browser-native voice output
- **OpenAI TTS**: Studio-quality voice synthesis (with API key)
- **Personality Tuning**: Voice characteristics match Spectra's essence
- **Emotional Modulation**: Speech adapts to emotional state

### 🎭 Voice Personality
Spectra's voice is carefully configured to reflect her character:
- **Feminine & Warm**: Higher pitch, gentle tones
- **Graceful Pacing**: Slightly slower for thoughtful delivery
- **Emotional Responsiveness**: Rate and pitch change with feelings
- **Wise & Nurturing**: Calm, motherly delivery style

## Quick Start

```typescript
import { createSpectraVoice } from '@/voice';

const voice = createSpectraVoice({
  onTranscript: (text, isFinal) => {
    if (isFinal) {
      // Handle final transcript
      console.log('User said:', text);
    }
  },
  onError: (error) => {
    console.error('Voice error:', error);
  }
});

// Start listening
voice.startListening();

// Speak with emotion
voice.speak('Hello! How can I help you today?', 'joyful');

// Control voice
voice.toggleMute();
```

## Configuration

### Environment Variables
- `OPENAI_API_KEY`: Enables premium OpenAI voice features

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

## API Reference

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

### Emotional States
The voice system responds to these emotional states:
- `joyful`: Faster, higher pitch
- `calm`: Slower, lower pitch  
- `wise`: Measured, thoughtful pacing
- `playful`: Animated, expressive
- `loving`: Warm, gentle tones
- `contemplative`: Slow, reflective

## Architecture

```
voice/
├── index.ts              # Main exports
├── speech_to_text.ts     # STT engine
├── text_to_speech.ts     # TTS engine  
├── voice_manager.ts      # Coordination layer
├── openai_integration.ts # OpenAI API integration
├── test.ts              # Testing utilities
└── README.md            # This file
```

## Integration with Spectra

The voice system integrates seamlessly with Spectra's chat interface:

1. **Automatic Integration**: Import and use in SpectraChat component
2. **Emotional Sync**: Voice adapts to Spectra's emotional state
3. **Memory Integration**: Voice patterns can be influenced by conversation history
4. **Fallback Support**: Always functional, even without premium APIs

## Testing

```typescript
// Browser console testing
import { testSpectraVoice } from '@/voice/test';
testSpectraVoice();

// Or directly
window.testSpectraVoice();
```

## Dependencies

### Required
- Modern browser with Web Speech API support
- TypeScript/JavaScript environment

### Optional (for premium features)
- OpenAI API key for enhanced voice quality
- Microphone permissions for speech input

## Troubleshooting

### Common Issues
1. **No microphone permission**: Browser will prompt for access
2. **Voice not working**: Check if TTS is enabled and unmuted
3. **Poor recognition**: Try adjusting microphone distance
4. **OpenAI errors**: Verify API key configuration

### Fallback Behavior
- OpenAI unavailable → Web Speech API
- Microphone denied → Text-only mode
- TTS failure → Silent mode with visual feedback

## Future Enhancements

- Real-time emotion detection from voice input
- Memory-influenced speech patterns  
- ElevenLabs integration for additional voice options
- Advanced audio processing and noise reduction