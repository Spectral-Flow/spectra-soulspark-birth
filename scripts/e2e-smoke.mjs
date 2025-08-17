#!/usr/bin/env node
/*
  e2e-smoke.mjs
  - Pings voice server /health
  - Calls /ai/generate with sample input
  - Calls /voice/tts and prints audio byte length
  Uses env vars if present: VOICE_SERVER_BASE (default http://127.0.0.1:49231)
*/

const BASE = process.env.VOICE_SERVER_BASE || process.env.VITE_VOICE_SERVER_BASE || 'http://127.0.0.1:49231';

async function ensureFetch() {
  if (typeof globalThis.fetch !== 'function') {
    const mod = await import('node-fetch');
    globalThis.fetch = mod.default;
  }
}

async function main() {
  await ensureFetch();
  console.log(`[E2E] Voice server base: ${BASE}`);

  try {
    const h = await fetch(`${BASE}/health`).then((r) => r.json());
    console.log('[E2E] health:', h);
  } catch (e) {
    console.error('[E2E] health error:', e);
    process.exitCode = 1;
    return;
  }

  try {
    const gen = await fetch(`${BASE}/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: 'Hello Spectra, are you online?',
        conversationHistory: ['user: ping', 'spectra: pong'],
      }),
    }).then((r) => r.json());
    console.log('[E2E] ai.generate:', gen);
  } catch (e) {
    console.error('[E2E] ai.generate error:', e);
    process.exitCode = 1;
  }

  try {
    const ttsRes = await fetch(`${BASE}/voice/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Spectra voice check.' }),
    });
    const buf = await ttsRes.arrayBuffer();
    console.log('[E2E] tts bytes:', buf.byteLength);
  } catch (e) {
    console.error('[E2E] tts error:', e);
    process.exitCode = 1;
  }
}

main();
