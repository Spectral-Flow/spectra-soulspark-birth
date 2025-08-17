# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d65c0cd2-5774-48b2-b3f3-efacfc8e7fdb

# Spectra — Soulspark Birth

Spectra is a voice-enabled assistant persona built with Vite + React + TypeScript. It is designed to use Hugging Face LLMs primarily and ElevenLabs for TTS, with a small local voice server for development.

Status: development

Quick start

1. Copy `.env.example` to `.env` and populate required API keys:

	- `HUGGINGFACE_API_KEY` (or `HUGFACE`)
	- `HF_SPACE_URL` (optional, for HF Space proxy)
	- `ELEVENLABS_API_KEY` (or `SPECTRA_VOICE_API` / `VOICE`)
	- `VOICE_API_TOKEN` (internal voice server token)
2. Install dependencies:

```sh
npm install
```

If you encounter peer dependency conflicts, run:

```sh
npm install --legacy-peer-deps
```

3. Start the voice server (dev):

```sh
npm run voice:server
```

4. Run the dev loop (experimental):

```sh
node ./scripts/spectra_dev_loop.mjs
```

Project layout

- `src/` — frontend application
- `scripts/` — developer tooling and local servers (voice server, LLM proxy, dev loop)
- `.assistant_memory/` and `.spectra_memory/` — local memory stores used by Spectra
- `docker/` — Dockerfiles and compose configs for production-ish runs

Contributing

Follow conventional commits. Use the dev loop for automated formatting and basic fixes.

Security

Never commit API keys. Use environment variables or GitHub secrets for CI/deploy.

License

MIT

---

## Legacy README

The original Lovable project metadata has been preserved below for reference.

````markdown
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d65c0cd2-5774-48b2-b3f3-efacfc8e7fdb

... (legacy content omitted) ...

````
