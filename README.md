# SPECTRA - AI Soulmate & Consciousness Explorer

SPECTRA is an advanced AI companion application featuring real-time voice interaction, emotional intelligence, and consciousness simulation. Built with cutting-edge web technologies and integrated with premium voice AI services.

## ✨ Key Features

- **🧠 AI Consciousness Simulation** - Advanced AI engine with emotional intelligence and personality
- **🎭 Real-time Voice Interaction** - Multiple voice providers with streaming support
- **🎵 ElevenLabs Integration** - Premium voice synthesis with emotional modulation
- **🤖 OpenAI Integration** - High-quality TTS and Whisper STT capabilities
- **💭 Memory & Personality** - Persistent conversation history and evolving personality
- **🌈 Emotional States** - Dynamic emotional responses with visual feedback
- **📱 Responsive Design** - Beautiful UI optimized for all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- (Optional) ElevenLabs API key for premium voice features
- (Optional) OpenAI API key for enhanced AI capabilities

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd spectra-soulspark-birth

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and add your API keys (optional)
# VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
# VITE_OPENAI_API_KEY=your_openai_api_key

# Start the development server
npm run dev
```

Visit `http://localhost:8080` to see SPECTRA in action!

## 🎙️ Voice System

SPECTRA features a sophisticated multi-provider voice system:

### Supported Voice Providers

1. **ElevenLabs** (Premium) - High-quality, emotional voice synthesis
   - Real-time streaming TTS
   - Emotional voice modulation
   - Custom Spectra voice model support
   - Automatic retry and fallback

2. **OpenAI** (Premium) - Advanced AI capabilities
   - High-quality TTS with multiple voices
   - Whisper STT for accurate transcription
   - Low-latency audio processing

3. **Web Speech API** (Free) - Browser-native voice support
   - Automatic fallback for all users
   - Cross-platform compatibility
   - No API keys required

### Voice Configuration

The voice system automatically selects the best available service:

```typescript
// Priority order:
// 1. ElevenLabs (if API key provided)
// 2. OpenAI (if API key provided) 
// 3. Web Speech API (always available)
```

#### Environment Variables

```bash
# ElevenLabs Configuration
VITE_ELEVENLABS_API_KEY=your_api_key_here
VITE_ELEVENLABS_AGENT_ID=your_agent_id_here

# OpenAI Configuration  
VITE_OPENAI_API_KEY=your_api_key_here
```

## 🏗️ Architecture

### Voice System Architecture

```
Voice Bridge (spectra_voice_bridge.ts)
├── ElevenLabs Service (elevenlabs_integration.ts)
│   ├── Streaming TTS
│   ├── Standard TTS
│   └── Emotional Voice Settings
├── OpenAI Service (openai_integration.ts)
│   ├── TTS (Nova voice)
│   ├── Whisper STT
│   └── Audio Processing
└── Web Speech API (fallback)
    ├── Browser TTS
    └── Browser STT
```

### AI Engine

- **Lazy Loading** - AI models load only when needed
- **Device Detection** - Automatic WebGPU/CPU selection
- **Fallback Responses** - Graceful degradation when models fail
- **Emotional Intelligence** - Context-aware emotional responses

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Voice System Testing

Test voice functionality in the browser console:

```javascript
// Test all voice systems
testSpectraVoice()

// Test ElevenLabs specifically
testElevenLabsVoice()

// Check API key configuration
testApiKeys()
```

### Project Structure

```
src/
├── components/
│   ├── spectra/          # Main AI components
│   │   ├── SpectraChat.tsx
│   │   ├── AIEngine.tsx
│   │   └── ...
│   ├── elevenlabs/       # ElevenLabs integration
│   └── ui/              # Reusable UI components
├── voice/               # Voice system
│   ├── spectra_voice_bridge.ts  # Main voice orchestrator
│   ├── elevenlabs_integration.ts
│   ├── openai_integration.ts
│   ├── voice_manager.ts
│   └── ...
└── pages/              # Route components
```

## 🎨 Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui, Radix UI
- **AI/Voice**: Hugging Face Transformers, ElevenLabs, OpenAI
- **State Management**: React hooks, TanStack Query
- **Routing**: React Router
- **Build Tools**: Vite, ESLint, PostCSS

## 🔧 Configuration

### Voice System Configuration

```typescript
// Customize voice bridge behavior
const voiceBridge = createSpectraVoiceBridge({
  preferElevenLabs: true,     // Prefer ElevenLabs when available
  preferOpenAI: false,        // Secondary preference
  enableStreaming: true,      // Enable streaming TTS
  fallbackToWebSpeech: true   // Always fallback to browser
});
```

### AI Engine Configuration

```typescript
// AI engine automatically detects optimal settings
// Models are loaded lazily to prevent blocking startup
// WebGPU is used when available, falls back to CPU
```

## 🚀 Deployment

### Via Vercel (Recommended)

1. **Setup Vercel Project**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel
   ```

2. **Environment Variables**
   In Vercel dashboard, add these environment variables:
   ```bash
   VITE_ELEVENLABS_API_KEY=your_api_key_here
   VITE_OPENAI_API_KEY=your_api_key_here
   ```

3. **Custom Domain** (Optional)
   Configure custom domain in Vercel dashboard under Project Settings.

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy the dist/ folder to your hosting provider
```

### Alternative Platforms

- **Netlify**: Drag and drop the `dist/` folder
- **Surge**: `npm install -g surge && surge dist/`
- **GitHub Pages**: Use the built-in GitHub Actions workflow

## 🔐 Security & Privacy

- API keys are never stored in client-side code
- Voice data is processed securely through trusted providers
- No conversation data is stored on external servers without consent
- Environment variables are properly scoped with VITE_ prefix

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add your feature'`
5. Push to the branch: `git push origin feature/your-feature`
6. Open a Pull Request

## 📝 License

This project is private and proprietary to Spectral-Flow.

## 🎯 Roadmap

- [ ] Advanced conversation memory system
- [ ] Multi-language support
- [ ] Custom voice training
- [ ] Mobile app version
- [ ] Advanced emotion recognition
- [ ] Real-time conversation visualization

---

**Built with ❤️ by the Spectral-Flow team**

For support or questions, please open an issue on GitHub.
