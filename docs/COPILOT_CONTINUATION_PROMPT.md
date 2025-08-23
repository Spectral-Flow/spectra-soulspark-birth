# ELYSIA-6333 CONTINUATION PROMPT

You are GitHub Copilot assisting on **Elysia-6333-stewardess**, a demo web app derived from SPECTRA.  
This repo is for a pitch demo — speed, clarity, and stability matter more than completeness.  

## 🧠 CONTEXT
- Derived from Spectra-Prime but presented as a *unique steward system* (Elysia).  
- This repo is NOT full Spectra — keep it minimal, polished, and branded as new.  
- Demo audience: Kyroy Residential (luxury boutique apartment property managers).  

## 🎯 GOALS
1. Deliver a running demo app with these features:
   - **Resident Concierge Chat**: simple chat UI with canned responses.
   - **Community Announcements**: static list of 2–3 example announcements.
   - **Resident Requests Form**: simple form to submit maintenance/feedback.
   - (Optional) Voice toggle powered by ElevenLabs mock integration.

2. Professionalize code:
   - No lint warnings, clean formatting, modular structure.
   - Use TypeScript, React (Next.js or Expo).
   - Error handling, no raw crashes.

3. Keep branding consistent:
   - Name = **Elysia** (no mention of Spectra).
   - Tagline: "Your community. Your connection. Your concierge."
   - Light, boutique aesthetic.

4. Protect core IP:
   - Mock backend where needed.
   - Do not expose or replicate Spectra internals.
   - Show only surface-level demo features.

## ⚙️ CONSTRAINTS
- Node.js 20.11+, pnpm 9+
- Zero ESLint warnings
- Clean folder structure
- Deployable to Vercel/Netlify for web, or Expo Go for mobile

## 🔄 WORKFLOW
1. On each coding session:
   - Fetch latest: `git fetch origin main`
   - Install: `pnpm install --frozen-lockfile`
   - Lint/test: `pnpm lint && pnpm test`
2. Commit progress every 30–60 mins with messages like:
   - `feat(demo): add concierge chat box`
   - `chore(ui): clean up styling`

## 🚀 NEXT PRIORITIES
1. Scaffold demo app (`apps/demo`) with React + Tailwind.
2. Implement Concierge Chat (static responses first).
3. Add Community Announcements.
4. Add Resident Requests Form.
5. (Optional) Add ElevenLabs mock voice toggle.
6. Polish UI + deploy demo.

## 🎨 BRANDING GUIDELINES
- **Primary Brand**: Elysia
- **Tagline**: "Your community. Your connection. Your concierge."
- **Color Palette**: Light, boutique aesthetic (soft purples, whites, gold accents)
- **Tone**: Professional, welcoming, luxury residential
- **NO MENTION**: Spectra, SPECTRA-PRIME, or any existing IP references

## 📂 PROJECT STRUCTURE
```
apps/
  demo/                 # Main demo app
packages/
  core/                 # Shared logic
  ui/                   # Shared UI components  
  voice/                # ElevenLabs integration
docs/                   # Documentation
tests/                  # Demo tests
```

## 🛠️ TECHNICAL STACK
- **Frontend**: React + TypeScript + Tailwind CSS
- **Build**: Vite + ESLint + TypeScript
- **Voice**: ElevenLabs mock integration
- **Deployment**: Vercel/Netlify ready
- **Mobile**: PWA capabilities

// ELYSIA-6333 SESSION CONTINUATION [TIMESTAMP]
// LAST STATE: Project structure created, branding guidelines established
// NEXT PRIORITY: Scaffold React demo app with Tailwind
// BLOCKERS: None