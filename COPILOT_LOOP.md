## Copilot Development Loop

This document contains the standing instructions for the automated Copilot development loop implemented in this repository.

Overview
- Purpose: Automate a Plan → Act → Debug → Test → Update Memory → Commit cycle and make it re-triggerable from the editor and after commits.
- Do not push automatically; commits are local by design to avoid accidental remote pushes.

Main components
- `scripts/copilot-loop.mjs` — orchestrates the loop: lint --fix, typecheck, tests, append to `/.memory_bank/memory-bank.md`, and commit changes locally.
- `scripts/append-memory.mjs` — appends timestamped entries under `## RECENT_CHANGES` in `/.memory_bank/memory-bank.md`.
- `.vscode/tasks.json` — includes a `copilot-dev-loop` task that runs `npm run copilot:loop`.
- `hooks/copilot-post-commit.sh` — post-commit git hook that runs the loop after commits. Use `scripts/setup-hooks.sh` to install hooks into `.git/hooks`.

How it works (standing instructions)
1. Plan — the loop runs `git status --porcelain` to see workspace changes.
2. Act — it runs `npm run lint -- --fix` to auto-fix issues where possible.
3. Debug — it runs `npx tsc --noEmit` to typecheck.
4. Test — it runs `npm test` (Vitest) to run unit tests.
5. Update Memory Bank — it appends a short entry about the run into `/.memory_bank/memory-bank.md`.
6. Commit — it stages and commits any changes created by the loop; pushing is left manual.

How to run manually
- From the terminal:
```bash
npm run copilot:loop
```

How to enable automatic post-commit runs
1. Make sure this repo is a git repository.
2. Run the hook installer:
```bash
sh ./scripts/setup-hooks.sh
```
This copies `hooks/*` into `.git/hooks` and makes them executable.

Notes and safety
- The loop intentionally avoids auto-pushing to remote.
- If you want CI integration, add a GitHub Actions workflow that runs `npm run copilot:loop` on PRs.

Contact
- This file is maintained by the development assistant (Copilot). Changes to the loop should update this document.
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
