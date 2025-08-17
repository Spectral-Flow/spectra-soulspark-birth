# Project Structure

This document maps the overall structure of the project. Copilot will update this as the codebase evolves.

## High-Level Overview

- `src/` → Main application source (React + TypeScript).
  - `components/` → Reusable UI components and domain components.
    - `ui/` → Generic UI primitives and wrappers (Radix + local styling).
    - `spectra/` → Domain-specific components for the Spectra UI (AI engine, visualizations, face, mood ring, etc.).
  - `hooks/` → Custom React hooks.
  - `lib/` → Utilities and helper functions.
  - `pages/` → Top-level route pages (Index, NotFound).
  - `main.tsx`, `App.tsx` → App entry and router setup.

- `public/` → Static files served directly (favicon, placeholders, robots.txt).
- `package.json` → Dependencies and npm scripts.
- `vite.config.ts` → Vite build/dev server config.
- `tailwind.config.ts` & `postcss.config.js` → TailwindCSS setup.
- `tsconfig*.json` → TypeScript configuration and path aliases.
- `README.md`, `components.json`, `eslint.config.js` → docs and config.

## File Map (major files & responsibilities)

- `index.html` — App HTML shell, root DOM node.
- `src/main.tsx` — React entry; mounts `App` into DOM.
- `src/App.tsx` — Router, global providers (React Query, Tooltip, Toaster, Sonner).
- `src/pages/Index.tsx` — Home page UI, imports `components/spectra` pieces.
- `src/pages/NotFound.tsx` — Catch-all route page.
- `src/components/ui/*` — UI primitives (button, dialog, tooltip, toasts, etc.).
- `src/components/spectra/*` — Spectra-specific components: `AIEngine.tsx`, `ConsciousnessCore.tsx`, `EmberRealm.tsx`, `MemoryVisualization.tsx`, `MoodRing.tsx`, `SpectraChat.tsx`, `SpectraFace.tsx`, `EmotionColors.ts`.
- `src/hooks/*` — `use-mobile.tsx`, `use-toast.ts`.
- `src/lib/utils.ts` — Shared utility functions.

## How pieces connect

- Pages import domain components from `components/spectra` and UI primitives from `components/ui`.
- `App.tsx` wraps routes with providers (`QueryClientProvider`, `TooltipProvider`, `Toaster` components).
- Components rely on Tailwind CSS classes configured in `tailwind.config.ts` and styles in `src/index.css`/`src/App.css`.

## Notes

- The codebase uses a path alias `@/` (see `tsconfig.json`) pointing to `src/`.
- No `tests/` directory present yet — consider adding unit tests for critical pieces.
