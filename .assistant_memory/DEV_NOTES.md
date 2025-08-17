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
3. Open <http://localhost:5173> (Vite default) unless overridden.

## Short-term improvements to implement

## Assistant memory

- Primary memory file: `/.assistant_memory/memory-bank.md` — a compact, machine-friendly summary the assistant maintains with recent changes, known issues, and next steps.

## LLM Providers helper

- New helper: `src/lib/llmProviders.ts` maps friendly keys to recommended Hugging Face model IDs (examples: `mistral`, `openhermes`, `llama3_2`, `llama3_1`, `flan`) and exposes `createPipeline` to initialize HF pipelines safely.
- Note: Many recommended models are large or private and may require server-side hosting or HF authentication.

## Assistant CLI

- Use `npm run assistant:mem-append -- "your short note"` to append a timestamped entry to `/.assistant_memory/memory-bank.md`.

## Voice interface (experimental)

- Files:
  - `src/lib/voiceInterface.ts` — frontend browser-first voice interface (Web Speech API STT + SpeechSynthesis TTS).
  - `src/components/spectra/VoiceControl.tsx` — UI start/stop control and continuous loop.
  - `scripts/voice-server.mjs` — lightweight local HTTP logger (POST `/voice/log`) that appends entries to `/.assistant_memory/DEV_NOTES.md`.
  - `scripts/voice-test-log.mjs` — small test script to send a sample log to the voice server.

- How it works:
  1. Start the voice logger: `npm run voice:server` (binds to localhost:49231).
  2. Open the app in a Chromium-based browser and click "Start Voice" in Spectra's UI.
  3. The browser uses Web Speech API to transcribe input, sends transcripts to `spectraAI.generateResponse`, speaks via SpeechSynthesis, and logs both transcript and response to the local logger.

- Logs: appended to `/.assistant_memory/DEV_NOTES.md` with timestamp and brief content. This keeps a chronological record of voice interactions.

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

### Installed (automated)

- Prettier + Prettier plugin for Tailwind (`prettier`, `prettier-plugin-tailwindcss`) for consistent formatting of Tailwind classes.
- ESLint + typescript plugins (`@typescript-eslint/*`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`) with lint: and lint:fix scripts.
- VS Code workspace recommendations (`.vscode/extensions.json`) for Prettier, ESLint, TypeScript next and utilities.
- VS Code settings (`.vscode/settings.json`) configured to run ESLint fixes and format on save.

Timestamp: 2025-08-17T20:40:00Z

- [2025-08-17T15:35:18.475Z] [test] unit test: This is a voice test log.
- [2025-08-17T20:11:21.267Z] [memory:add] test memory from curl
- [2025-08-17T20:11:26.438Z] [test] curl log: hello
- [2025-08-17T20:28:28.515Z] [SPECTRA_LOG] Spectra voice interface started.
- [2025-08-17T20:28:28.519Z] [SPECTRA_LOG] REASON: I hear you, and I will reflect upon your words: "Hello Spectra, test message.".
- [2025-08-17T20:28:28.578Z] [SPECTRA_LOG] AI error: TypeError: fetch failed
- [2025-08-17T20:29:13.727Z] [SPECTRA_LOG] Spectra voice interface started.
- [2025-08-17T20:29:13.730Z] [SPECTRA_LOG] REASON: I hear you, and I will reflect upon your words: "Another quick check.".
- [2025-08-17T20:29:14.522Z] [SPECTRA_LOG] AI error: Error: AI generate failed: Internal Server Error

## Debug Sweep 2025-08-17T21:31:00Z

- In Spectra's careful voice: I listened to the code and ran the checks.
- Results:
  - Prettier formatting completed across `src/` with no changes required.
  - Unit tests (`vitest`) passed: 1 test (AIEngine) ok.
  - ESLint configuration caused conflicts: the repository had multiple ESLint configs (flat `eslint.config.js` and classic `.eslintrc.cjs`) and the runtime environment picked a flat-config mode causing CLI flags to be rejected. I removed `eslint.config.js` and adjusted `.eslintrc.cjs`, but the installed ESLint still reports flat-config behavior from the runtime environment. Resolving this fully needs either:
    1. Convert all configs to the flat config format (recommended modern approach), or
    2. Ensure a compatible ESLint version and remove any flat-config files / conflicting plugins, then re-run npm install and lint.

Next steps I propose (pick one):

- Convert to flat ESLint config (I can do this: convert rules/plugins to `eslint.config.js` array format).
- Keep classic `.eslintrc.cjs` and pin ESLint + plugin versions to fully compatible versions and re-generate `package-lock.json`.

I will wait for your pick and then proceed to implement the chosen fix and re-run the loop.
