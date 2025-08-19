# ElevenLabs Integration Example

This example demonstrates how to use the ElevenLabs integration with Spectra's voice model.

## Quick Setup

1. **Set your ElevenLabs API key:**
   ```javascript
   // In browser console:
   window.ELEVENLABS_API_KEY = "your_api_key_here";
   
   // Or in environment variable:
   export ELEVENLABS_API_KEY="your_api_key_here"
   ```

2. **Use the voice system:**
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

## Testing in Browser

1. Open the browser console on the Spectra application
2. Set your API key: `window.ELEVENLABS_API_KEY = "your_key"`
3. Run: `testElevenLabsVoice()`

## Features

- **Automatic Spectra Voice Detection**: Looks for "Spectra" voice model first
- **Fallback System**: Uses feminine voices if Spectra not available
- **Emotional Modulation**: Different voice settings per emotion
- **Error Handling**: Graceful fallback to Web Speech API

## Voice Priority

1. **ElevenLabs** (if API key available)
2. **OpenAI** (if API key available) 
3. **Web Speech API** (browser fallback)

## Emotions Supported

- `calm` - Balanced, gentle delivery
- `joyful` - Higher energy, animated speech
- `contemplative` - Thoughtful, deliberate pacing
- `playful` - Dynamic, lively expression

## API Key Security

⚠️ **Important**: Never commit API keys to version control. Use environment variables or secure configuration.