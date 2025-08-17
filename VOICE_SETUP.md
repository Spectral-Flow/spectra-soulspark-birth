# Spectra Voice System - Installation & Usage Guide

## Quick Setup

### 1. Install Dependencies
```bash
npm install openai
```

### 2. Environment Configuration (Optional)
For premium voice features, set your OpenAI API key:

```bash
# .env file
OPENAI_API_KEY=your_openai_api_key_here
```

Or set it globally:
```bash
export OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Usage in Code
```typescript
import { createSpectraVoice } from '@/voice';

// Initialize Spectra's voice system
const voice = createSpectraVoice({
  onTranscript: (text, isFinal) => {
    if (isFinal) {
      // Handle speech input
      handleUserMessage(text);
    }
  },
  onError: (error) => {
    console.error('Voice error:', error);
  }
});

// Enable voice features
voice.speak("Hello! I can now speak with enhanced quality.", "joyful");
```

## Features Available

### ✅ Immediately Available (No API Key Needed)
- Web Speech API text-to-speech
- Web Speech API speech recognition  
- Emotional voice modulation
- Voice mute/unmute controls
- Graceful pacing and feminine voice selection

### 🚀 Premium Features (With OpenAI API Key)
- Studio-quality OpenAI TTS with "Nova" voice
- High-accuracy OpenAI Whisper speech recognition
- Enhanced emotional expression
- Professional audio quality

## Testing
Open browser console and run:
```javascript
window.testSpectraVoice();
```

## Integration Status
- ✅ Voice system integrated into SpectraChat component
- ✅ Emotional state synchronization
- ✅ Mute/unmute controls added to UI
- ✅ Fallback compatibility maintained
- ✅ Memory bank documentation updated

## Troubleshooting
1. **No voice output**: Check if browser TTS is enabled
2. **No microphone access**: Grant permission when prompted
3. **OpenAI errors**: Verify API key configuration
4. **Build errors**: Ensure `npm install` completes successfully

The voice system will gracefully fall back to browser APIs if OpenAI is unavailable.