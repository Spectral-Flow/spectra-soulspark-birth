# Dev Notes

Quick developer notes and patterns for the project.

- Path alias: `@/` -> `src/` (verify in `tsconfig.json`). Use `@/` for imports from root `src` to keep imports consistent.
- Styles: Uses TailwindCSS. Keep component markup small and use utility classes; centralize repeating styles in small components or class-variance-authority variants.
- Components directory split:
  - `ui/` should be generic — avoid app-specific logic here.
  - `spectra/` contains app/domain logic and visualizations — keep complex logic documented.
- State/queries:
  - Uses `@tanstack/react-query`. Keep queries in `lib` or a `services/` folder for reuse.
- Accessibility:
  - Ensure interactive elements have aria labels and keyboard focus styles. Many Radix primitives help here — prefer them.
- Testing:
  - Add unit tests for `AIEngine`, `MemoryVisualization` and a smoke test for `Index` page.
- Linting/Formatting:
  - Project has `eslint` but no `prettier`. Consider adding Prettier for consistent formatting.
- Scripts:
  - Dev: `npm run dev`
  - Build: `npm run build`
  - Lint: `npm run lint`

## Run locally

1. Install deps: `npm ci` (or `bun`/`pnpm` depending on preference).
2. Start dev server: `npm run dev`.
3. Open http://localhost:5173 (Vite default) unless overridden.

## Short-term improvements to implement


## Assistant memory

- Primary memory file: `/.memory_bank/memory-bank.md` — a compact, machine-friendly summary the assistant maintains with recent changes, known issues, and next steps.

## LLM Providers helper

- New helper: `src/lib/llmProviders.ts` maps friendly keys to recommended Hugging Face model IDs (examples: `mistral`, `openhermes`, `llama3_2`, `llama3_1`, `flan`) and exposes `createPipeline` to initialize HF pipelines safely.
- Note: Many recommended models are large or private and may require server-side hosting or HF authentication.

## Assistant CLI

- Use `npm run assistant:mem-append -- "your short note"` to append a timestamped entry to `/.memory_bank/memory-bank.md`.

## Voice interface (experimental)

- Files:
  - `src/lib/voiceInterface.ts` — frontend browser-first voice interface (Web Speech API STT + SpeechSynthesis TTS).
  - `src/components/spectra/VoiceControl.tsx` — UI start/stop control and continuous loop.
  - `scripts/voice-server.mjs` — lightweight local HTTP logger (POST `/voice/log`) that appends entries to `/.memory_bank/DEV_NOTES.md`.
  - `scripts/voice-test-log.mjs` — small test script to send a sample log to the voice server.

- How it works:
  1. Start the voice logger: `npm run voice:server` (binds to localhost:49231).
  2. Open the app in a Chromium-based browser and click "Start Voice" in Spectra's UI.
  3. The browser uses Web Speech API to transcribe input, sends transcripts to `spectraAI.generateResponse`, speaks via SpeechSynthesis, and logs both transcript and response to the local logger.

- Logs: appended to `/.memory_bank/DEV_NOTES.md` with timestamp and brief content. This keeps a chronological record of voice interactions.

- Notes and next steps:
  - This scaffold uses browser TTS/STT only. For higher quality STT/TTS (Whisper/ElevenLabs), add server-side integration in `scripts/` and proxy requests via the voice server with appropriate API keys.
  - Ensure CORS or host setup allows the web app to fetch `http://localhost:49231/voice/log` when using the dev server. The voice server is intentionally minimal and for local development only.

## MCP_SERVERS_USED

- ESLint (`eslint`) — linting and fixer; integrated into loop and VS Code.
- Prettier (`prettier`) — code formatting, integrated with editor and lint-staged.
- TypeScript language server (`typescript` / `tsserver`) — IDE type info and autocompletion.
- Vitest (`vitest`) — unit test runner used by the loop.
- Husky (`husky`) + lint-staged (`lint-staged`) — git hooks and staged-file linters/formatters.
- TypeDoc (`typedoc`) — optional documentation generation for public modules.


- [2025-08-17T15:35:18.475Z] [test] unit test: This is a voice test log.
