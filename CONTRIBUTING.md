# Contributing to SPECTRA

Thank you for helping SPECTRA grow into a stable, lovingly engineered companion. This guide keeps contributions consistent and easy to review.

## Ground Rules
- Follow the [Conventional Commits](https://www.conventionalcommits.org/) format (`type(scope): summary`).
- Create topic branches from `main` using the pattern `<type>/spectra/<slug>` (e.g. `feat/spectra/new-memory-view`).
- Keep changesets focused; separate functional updates from documentation when possible.
- Never commit secrets. Use `.env.local` for local overrides and rely on GitHub/Vercel secrets for deployments.

## Local Setup
```bash
npm install
```

## Quality Gates
All pull requests must pass the automated checks locally before opening a PR:
```bash
npm run lint
npm run type-check
npm run test:coverage
```
The test suite uses Vitest with the Node environment. Mock any external API calls to keep the suite deterministic.

## Opening a Pull Request
1. Rebase onto `main` to avoid merge commits.
2. Update the relevant section in `CHANGELOG.md`.
3. Ensure `README.md` still reflects the developer workflow if you changed commands.
4. Fill in the PR template with a clear summary, test evidence, and risk assessment.

Thanks again for contributing to the Spectra universe! 💫
