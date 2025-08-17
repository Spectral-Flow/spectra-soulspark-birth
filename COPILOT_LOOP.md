# Copilot Development Loop

This file describes the automated development loop the assistant (Copilot) uses to keep the repository healthy.

Loop steps (Plan → Act → Debug → Test → Update Memory → Push)

1. Plan
   - Analyze the repository structure and identify files changed since last run.
   - Summarize issues and actionable next steps.

2. Act
   - Apply low-risk refactors, move constants, and add small helper modules.
   - Update documentation in `/.memory_bank/`.

3. Debug
   - Run linters and type-checks (`eslint`, `tsc`) and auto-fix where safe.

4. Test
   - Run unit and integration tests (Vitest) and basic runtime smoke checks (Vite dev build).

5. Update Memory
   - Append a short summary to `/.memory_bank/memory-bank.md` describing what changed and outcome.

6. Push
   - Commit and push changes to the `main` branch (or a feature branch) if CI checks pass.

Automation
- Entry point script: `node ./scripts/copilot-loop.mjs`
- Git hook: `hooks/copilot-post-commit.sh` (install with `npm run copilot:setup-hooks`)
- VS Code task: `.vscode/tasks.json` — runs `npm run copilot:loop` on demand.

Notes
- The loop is intentionally conservative: only small, safe edits are automated. Major refactors require manual review.
- LLM calls are not invoked by default. If model-backed updates are needed, they will be done in a separate, reviewable branch.
