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

