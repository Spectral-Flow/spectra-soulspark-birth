# Backend Consolidation & LLM Integration (Spectra)

This file documents the backend cleanup performed and the lightweight LLM integration layer.

What changed
- Removed Railway deployment config and references (Railway-specific files removed)
- Consolidated LLM integration into `/llm_integrations/llm_client.js`
- Updated `.env` and `.env.example` to remove Railway env variables
- Updated `.gitignore` to remove `.railway`

Why
- Project will focus on Vercel + Supabase for deployment
- Centralized LLM wrapper simplifies switching providers (Hugging Face / OpenAI)

How to use `llm_client.js`

```js
import { queryLLM } from './llm_integrations/llm_client.js';

(async () => {
  const r = await queryLLM('Hello Spectra', 'huggingface', { model: 'gpt2' });
  console.log('LLM response:', r);
})();
```

Environment variables (server-side)

- `HUGGINGFACE_API_KEY` - Hugging Face inference key
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `HUGGINGFACE_MODEL` - default model for Hugging Face calls

Notes
- This client is intentionally minimal and safe for server-side usage only.
- Do not expose server-side keys to the browser; use backend proxy endpoints.

Archive
- If you want Railway docs preserved, they are available in the commit history and can be moved to `/archive/docs/` on request.
