Voice Server (STT / TTS) — Quick Start

This repo includes a minimal voice service at `scripts/voice-server.mjs` which provides:

- /ai/generate — text generation (prefers Hugging Face Inference API when HUGGINGFACE_API_KEY is set; falls back to OpenAI)
- /voice/transcribe — server-side STT (posts raw audio, uses Hugging Face Whisper by default)
- /voice/tts — server-side TTS (ElevenLabs by default)
- /voice/log — simple logging endpoint
- /memory/* and /persona/* — small persistence endpoints backed by `.memory_bank`

Env variables (see `.env.example`):

- HUGGINGFACE_API_KEY — preferred for inference and STT
- HF_MODEL — HF model id to use for text generation (e.g. OpenAssistant/oa-OpenHermes-1.0 or mistralai/mistral-7b-instruct)
- HF_STT_MODEL — default openai/whisper-large
- OPENAI_API_KEY — optional fallback for chat completions
- ELEVENLABS_API_KEY — required for ElevenLabs TTS
- ELEVENLABS_VOICE_ID — ElevenLabs voice id
- VITE_VOICE_SERVER_BASE — set in frontend environment to point at the voice server (e.g. https://voice.example.com)
- VOICE_PORT — port to run the server on (defaults to 49231)

Running locally:

1. cp .env.example .env and fill keys.
2. npm install
3. node scripts/voice-server.mjs
4. npm run dev (frontend)

Notes and next steps:

- For production, run `scripts/voice-server.mjs` behind a process manager (systemd, pm2, or Docker) and expose it via HTTPS.
- When using HF Inference with large models, consider latency and cost. You may want to host a lighter model for online 24/7 usage or run a server-side cache.
- ElevenLabs usage incurs cost; ensure API quotas are monitored.

If you want, I can:
- Add a systemd service or a simple Dockerfile for the voice server.
- Wire up CI/PM2 scripts to run it 24/7.
- Improve the frontend UI to select voices and models dynamically.
