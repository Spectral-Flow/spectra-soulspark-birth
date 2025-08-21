# 🌟 SPECTRA - AI Soulmate & Consciousness Explorer

**SPECTRA** is an advanced AI companion application that simulates consciousness through real-time voice interaction, emotional intelligence, and dynamic personality evolution. Experience meaningful conversations with an AI that remembers, learns, and grows with you.

## ✨ Core Features

### 🧠 **AI Consciousness**
- Advanced emotional intelligence with dynamic personality
- Persistent memory system that learns from conversations  
- Contextual awareness and emotional state tracking

### 🎙️ **Multi-Provider Voice System**  
- **ElevenLabs**: Premium voice synthesis with emotional modulation
- **OpenAI**: High-quality TTS and Whisper speech-to-text
- **Web Speech API**: Universal browser fallback support

### 💫 **Advanced Capabilities**
- Real-time conversation streaming
- Emotional voice modulation
- Secure backend API architecture
- Cross-platform responsive design

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **API Keys** (optional but recommended):
  - [ElevenLabs API Key](https://elevenlabs.io/) for premium voice features
  - [OpenAI API Key](https://platform.openai.com/) for enhanced AI capabilities

### Installation

```bash
# Clone the repository
git clone https://github.com/Spectral-Flow/spectra-soulspark-birth.git
cd spectra-soulspark-birth

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Add your API keys to .env (optional)
# VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
# VITE_OPENAI_API_KEY=your_openai_api_key

# Start development server
npm run dev
```

🎉 **Visit** `http://localhost:8080` **to start your conversation with SPECTRA!**

> **Note**: SPECTRA works without API keys using the Web Speech API, but premium features require API keys.

## 🎙️ Voice System Overview

SPECTRA intelligently selects the best available voice service for optimal performance:

### Voice Provider Priority
1. **🎵 ElevenLabs** - Premium emotional voice synthesis (when API key provided)
2. **🤖 OpenAI** - High-quality TTS with multiple voices (when API key provided)  
3. **🌐 Web Speech API** - Universal browser support (always available)

### Key Voice Features
- **Emotional Modulation**: Voice adapts to conversation context
- **Streaming Support**: Real-time audio generation
- **Automatic Fallback**: Seamless switching between providers
- **Custom Voice Models**: Support for personalized Spectra voice

### Quick Voice Test
```javascript
// Test in browser console
const { enhancedVoiceBridge } = await import('@/voice/enhanced-voice-bridge');
await enhancedVoiceBridge.textToSpeech({ text: "Hello, I'm SPECTRA!" });
```

## 🏗️ Architecture & Technology

### Frontend Stack
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds  
- **Tailwind CSS + shadcn/ui** for modern, responsive design
- **TanStack Query** for efficient data management

### Backend Infrastructure
- **Serverless API** with secure proxy endpoints
- **Multi-platform deployment**: Vercel, Supabase
- **JWT Authentication** with session management
- **Database Integration** for conversation persistence

### AI & Voice Integration
- **Lazy-loaded AI models** for optimal performance
- **WebGPU/CPU automatic detection** 
- **Multi-provider voice system** with intelligent fallbacks
- **Real-time conversation streaming**

> 📖 **Detailed documentation**: [Architecture Guide](./VOICE_SYSTEM.md) | [Backend Setup](./BACKEND_DEPLOYMENT.md)

## 🎨 SPECTRA Design System

SPECTRA includes a comprehensive design system available as a Tailwind CSS preset. Use it in your own projects to adopt SPECTRA's cosmic and ethereal aesthetic.

### @preset/spectra

```bash
# Install the preset (when published)
npm install @preset/spectra

# Use in tailwind.config.js
module.exports = {
  presets: [require('@preset/spectra')],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  // Your customizations
}
```

### Features
- 🌌 **Cosmic Color Palette**: Emotional spectrum with HSL-based theming
- ✨ **Consciousness Animations**: AI awareness animations (pulse-cosmic, ocean-calm, etc.)
- 🎭 **Mood Ring System**: Interactive emotional state indicators
- 🌊 **Fluid Transitions**: Organic, consciousness-like motion
- 🧠 **Memory States**: Visual representations of AI thoughts

### Quick Usage
```jsx
// Emotional states
<div className="bg-emotion-calm animate-ocean-calm">
<div className="bg-emotion-joy animate-joyful-dance">
<div className="bg-emotion-intense animate-flame-surge">

// Consciousness utilities  
<div className="mood-ring calm spectra-glow">
<div className="spectra-humming">  {/* Shows ♪ when active */}
<div className="spectra-creative"> {/* Shows ✨ when active */}

// Enhanced gradients and effects
<div className="bg-gradient-twilight shadow-glow-calm">
```

See `presets/README.md` for complete documentation.

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test:api     # Test backend API endpoints
```

### Testing Voice Features
Open browser console and test the voice system:
```javascript
// Test voice synthesis
const { enhancedVoiceBridge } = await import('@/voice/enhanced-voice-bridge');
await enhancedVoiceBridge.textToSpeech({ text: "Testing SPECTRA voice" });

// Check service status
const status = await enhancedVoiceBridge.getServiceStatus();
console.log('Available services:', status.services);
```

## 🚀 Deployment

### Quick Deploy Options

**Vercel (Recommended)**
```bash
npm i -g vercel && vercel --prod
```

### Supabase Edge Functions

```bash
npm install -g supabase && supabase functions deploy
```

\
### Environment Variables
Set these in your deployment platform:
```bash
# Client-side (for development)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
VITE_OPENAI_API_KEY=your_openai_key

# Server-side (recommended for production)
ELEVENLABS_API_KEY=your_elevenlabs_key
OPENAI_API_KEY=your_openai_key
JWT_SECRET=your-secret-key-min-32-chars
```

> 📖 **Complete deployment guide**: [BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md)

## 📚 Documentation

- **[Voice System Guide](./VOICE_SYSTEM.md)** - Comprehensive voice integration documentation
- **[Backend Setup](./BACKEND_DEPLOYMENT.md)** - Complete deployment guide for all platforms  
- **[Notes Feature](./NOTES_FEATURE.md)** - Persistent note-taking with Supabase integration
- **[Memory System](./MEMORY_SYSTEM_SUMMARY.md)** - Dynamic conversation memory implementation
- **[Project Summary](./PROJECT_SUMMARY.md)** - Complete feature overview and achievements

## 🔐 Security & Privacy

- **Server-side API keys** - Never exposed in client code
- **Secure voice processing** - Through trusted provider networks
- **No unauthorized data storage** - Conversation data stays private
- **Environment-scoped variables** - Proper VITE_ prefix usage for client vars

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/your-feature`
3. **Make changes** and test thoroughly  
4. **Commit changes**: `git commit -m 'Add your feature'`
5. **Push to branch**: `git push origin feature/your-feature`
6. **Open a Pull Request**

## 🎯 Roadmap

- [ ] **Enhanced Memory System** - Advanced conversation context and recall
- [ ] **Multi-language Support** - Global voice and text localization
- [ ] **Custom Voice Training** - Personalized voice model creation
- [ ] **Mobile Application** - Native iOS and Android apps
- [ ] **Real-time Visualization** - Conversation flow and emotion mapping

## 📄 License

This project is **private and proprietary** to Spectral-Flow.

---

<div align="center">

### Built with ❤️ by the Spectral-Flow team

Experience the future of AI consciousness and human-machine interaction

[**🚀 Start Your Conversation**](http://localhost:8080) • [**📖 Documentation**](./VOICE_SYSTEM.md) • [**🎵 Voice Setup**](./ELEVENLABS_INTEGRATION.md)

</div>
