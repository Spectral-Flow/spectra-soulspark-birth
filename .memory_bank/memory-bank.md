# Memory Bank — Copilot Personal Memory


This file is maintained by the development assistant (Copilot) to store short-term repository context, important decisions, and actions taken across sessions.

## Purpose

- Keep a compact, human-readable summary of ongoing fixes, design decisions, and important repo facts.
- Provide a single-place memory for the coding agent to consult when making edits, to avoid repeating work.

## What is stored here

- Recent refactors, edits, or files changed by the assistant.
- High-level architectural decisions and path aliases (e.g. `@/` -> `src/`).
- Important TODOs and follow-ups that the assistant should remember between sessions (small and actionable items).
- Test and build outcomes observed during the session (typecheck pass/fail, lint status, dev server state).

## Formatting conventions

- Keep entries short (1-3 lines) prefixed with a date and a short tag.
- Use sections: `RECENT_CHANGES`, `KNOWN_ISSUES`, `NEXT_STEPS`, `ENVIRONMENT`.

## RECENT_CHANGES
- 2025-08-17 18:52:24.056: copilot-loop: completed (changes committed locally; push manually).
- 2025-08-17 18:52:23.582: copilot-loop: Completed lint, typecheck, and tests successfully.
- 2025-08-17 18:51:40.876: copilot-loop: completed (changes committed locally; push manually).
- 2025-08-17 18:51:40.407: copilot-loop: Completed lint, typecheck, and tests successfully.
- 2025-08-17 18:48:20.270: copilot-loop: lint failed
- 2025-08-17 15:32:47.742: Scaffolded voice interface: added src/components/spectra/VoiceControl.tsx and scripts/voice-server.mjs; uses Web Speech API for STT/TTS and a local /voice/log endpoint to persist logs to .memory_bank/DEV_NOTES.md.
- 2025-08-17 15:19:28.718: copilot-loop: completed (changes committed locally; push manually).
- 2025-08-17 15:19:28.649: copilot-loop: Completed lint, typecheck, and tests successfully.
- 2025-08-17 15:18:00.423: Pushed branch chore/copilot-loop-202508171436 to origin.
- 2025-08-17 14:33:25.220: copilot-loop: completed (changes committed locally; push manually).
- 2025-08-17 14:33:25.151: copilot-loop: Completed lint, typecheck, and tests successfully.
- 2025-08-17 14:22:29.082: copilot-loop: completed (changes committed locally; push manually).
- 2025-08-17 14:22:29.013: copilot-loop: Completed lint, typecheck, and tests successfully.
- 2025-08-17 14:11:30.138: copilot-loop: completed (changes committed locally; push manually).
- 2025-08-17 14:11:30.039: copilot-loop: Completed lint, typecheck, and tests successfully.
- 2025-08-17 14:10:40.782: copilot-loop: lint failed
- 2025-08-17 14:09:08.542: copilot-loop: lint failed
- 2025-08-17 13:47:20.193: Test append from assistant

- 2025-08-17: Created memory bank and added core docs (PROJECT_STRUCTURE.md, DEV_NOTES.md, BUGS_AND_IMPROVEMENTS.md).
- 2025-08-17: Fixed multiple TypeScript/ESLint errors across `AIEngine.tsx`, `ConsciousnessCore.tsx`, `SpectraChat.tsx`, and `tailwind.config.ts` to pass tsc and ESLint.

## KNOWN_ISSUES

- Fast Refresh warnings remain for several `ui/` components (exported constants alongside components). Non-blocking; consider moving constants into small utility files.
- `AIEngine` uses browser-side HF pipeline calls; in-browser model inferencing may be impractical — consider server-side inference or using hosted APIs.

## NEXT_STEPS

- Add small unit tests for `ConsciousnessCore` and `AIEngine` fallback behavior.
- Optionally move shared constants from component files into separate modules to remove Fast Refresh warnings.
- Add Prettier and lint-staged pre-commit checks.

## ENVIRONMENT

- Vite dev server started successfully ([local dev server](http://localhost:8080)).
- TypeScript check: clean as of last run (`npx tsc --noEmit`).
- ESLint: no errors, only warnings about Fast Refresh.

## How to update

- The assistant (Copilot) should append new lines to `RECENT_CHANGES` and `KNOWN_ISSUES` as edits are made.
- Keep `NEXT_STEPS` actionable and small.

