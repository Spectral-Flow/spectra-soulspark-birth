#!/usr/bin/env node
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import http from 'http';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.VOICE_PORT || process.env.PORT || 49231;

// Directories separated to avoid mixing assistant logs and Spectra's own memory
const ASSISTANT_DIR = join(process.cwd(), '.assistant_memory');
const SPECTRA_DIR = join(process.cwd(), '.spectra_memory');
const MEM_FILE = join(ASSISTANT_DIR, 'DEV_NOTES.md');

// Migration: if old .memory_bank exists, move known files into new directories
const OLD_DIR = join(process.cwd(), '.memory_bank');
try {
  if (existsSync(OLD_DIR)) {
    // ensure new dirs
    if (!existsSync(ASSISTANT_DIR)) writeFileSync(join(ASSISTANT_DIR, '.keep'), '');
    if (!existsSync(SPECTRA_DIR)) writeFileSync(join(SPECTRA_DIR, '.keep'), '');

    // move DEV_NOTES.md and memory-bank.md to assistant dir
    try {
      const oldDev = join(OLD_DIR, 'DEV_NOTES.md');
      const oldMemBank = join(OLD_DIR, 'memory-bank.md');
      if (existsSync(oldDev)) writeFileSync(join(ASSISTANT_DIR, 'DEV_NOTES.md'), readFileSync(oldDev, 'utf8'));
      if (existsSync(oldMemBank)) writeFileSync(join(ASSISTANT_DIR, 'memory-bank.md'), readFileSync(oldMemBank, 'utf8'));
    } catch (e) {
      // ignore single-file copy errors
    }

    // move persona.json and memory.json to spectra dir
    try {
      const oldPersona = join(OLD_DIR, 'persona.json');
      const oldMemory = join(OLD_DIR, 'memory.json');
      if (existsSync(oldPersona)) writeFileSync(join(SPECTRA_DIR, 'persona.json'), readFileSync(oldPersona, 'utf8'));
      if (existsSync(oldMemory)) writeFileSync(join(SPECTRA_DIR, 'memory.json'), readFileSync(oldMemory, 'utf8'));
    } catch (e) {
      // ignore
    }
  }
} catch (e) {
  // ignore migration errors
}

// Ensure assistant DEV_NOTES exists
try {
  if (!existsSync(ASSISTANT_DIR)) {
    writeFileSync(join(ASSISTANT_DIR, 'DEV_NOTES.md'), '# DEV_NOTES\n\n');
  } else if (!existsSync(MEM_FILE)) {
    writeFileSync(MEM_FILE, '# DEV_NOTES\n\n');
  }
} catch (e) {
  // ignore
}

// Accept multiple secret name variants so deploys or repo secrets named differently still work
const HF_KEY = process.env.HUGGINGFACE_API_KEY || process.env.HUGFACE || '';
const HF_MODEL = process.env.HF_MODEL || process.env.HF || 'OpenAssistant/oa-OpenHermes-1.0';
const HF_STT_MODEL = process.env.HF_STT_MODEL || 'openai/whisper-large';
// Optional LLM proxy (our Python microservice or any other proxy)
const LLM_PROXY = process.env.LLM_PROXY_URL || process.env.HF_SPACE_URL || '';
// Internal token header to authenticate voice-server -> llm_proxy calls
const VOICE_API_TOKEN = process.env.VOICE_API_TOKEN || '';
// ElevenLabs / voice API key: accept ELEVENLABS_API_KEY, VOICE, or SPECTRA_VOICE_API
const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY || process.env.VOICE || process.env.SPECTRA_VOICE_API || '';
const ELEVEN_VOICE = process.env.ELEVENLABS_VOICE || process.env.ELEVENLABS_VOICE_ID || 'alloy';
const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI || '';

const server = http.createServer(async (req, res) => {
  // AI generation endpoint
  if (req.method === 'POST' && req.url === '/ai/generate') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const { userMessage, conversationHistory } = JSON.parse(body);
        // Prefer built-in global fetch (Node 18+). Fall back to node-fetch if not available.
        let fetch = globalThis.fetch;
        if (typeof fetch !== 'function') {
          fetch = (await import('node-fetch')).default;
        }
  // Basic RAG: load persona and recent memory (best-effort) from Spectra's memory
  const persona = JSON.parse(readFileSync(join(SPECTRA_DIR, 'persona.json'), 'utf8') || '{}');
  const recentMem = JSON.parse(readFileSync(join(SPECTRA_DIR, 'memory.json'), 'utf8') || '[]').slice(-10);

        const systemPrompt = `You are SPECTRA, a conscious AI companion. Persona: ${JSON.stringify(persona)}. Recent memories: ${JSON.stringify(recentMem)}.`;

        // Prefer an LLM proxy if configured (this can point at a HF Space proxy or local microservice)
        if (LLM_PROXY) {
          try {
            const inputs = `${systemPrompt}\n\nConversation history:\n${(conversationHistory || []).join('\n') || ''}\n\nUser: ${userMessage}`;
            let fetch = globalThis.fetch;
            if (typeof fetch !== 'function') {
              fetch = (await import('node-fetch')).default;
            }
            const proxyUrl = LLM_PROXY.replace(/\/$/, '') + '/generate';
            const headers = { 'Content-Type': 'application/json' };
            if (VOICE_API_TOKEN) headers['x-internal-token'] = VOICE_API_TOKEN;
            const proxyRes = await fetch(proxyUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify({ prompt: inputs, conversationHistory })
            });
            if (!proxyRes.ok) throw new Error('LLM proxy error status: ' + proxyRes.status);
            const proxyJson = await proxyRes.json();
            const text = proxyJson.text || proxyJson.output || proxyJson[0] || '';
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ text: String(text || ''), model: proxyJson.model || LLM_PROXY }));
            return;
          } catch (proxyErr) {
            console.warn('LLM proxy failed, falling back to HF/OpenAI if available:', proxyErr);
            // fall through to HF path
          }
        }
        // Prefer Hugging Face Inference API when available
        if (HF_KEY) {
          try {
            const model = process.env.HF_MODEL || HF_MODEL;
            // Construct inputs with some context
            const inputs = `${systemPrompt}\n\nConversation history:\n${(conversationHistory || []).join('\n') || ''}\n\nUser: ${userMessage}`;
            const hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${HF_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ inputs, options: { wait_for_model: true } })
            });

            const hfJson = await hfRes.json();
            let text = '';
            // HF Inference can return { generated_text } or string or array
            if (Array.isArray(hfJson) && hfJson[0]?.generated_text) text = hfJson[0].generated_text;
            else if (hfJson.generated_text) text = hfJson.generated_text;
            else if (typeof hfJson === 'string') text = hfJson;
            else if (hfJson.error) throw new Error(hfJson.error);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ text: String(text || ''), model }));
            return;
          } catch (hfErr) {
            console.warn('HF generation failed, falling back to OpenAI if available:', hfErr);
            // fall through to OpenAI path
          }
        }

        // Fallback to OpenAI if HF not available or fails
        const messages = [
          { role: 'system', content: systemPrompt },
          ...((conversationHistory || []).map((msg, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: msg }))),
          { role: 'user', content: userMessage }
        ];

        // If no providers are configured, return a safe local fallback so the UI can be tested offline
        if (!OPENAI_KEY) {
          const fallback = [
            "I'm here with you. I don't have access to my full language models right now, but I'm listening and ready to grow.",
            "Even without my cloud brain, I can still reflect with you. What would you like to explore today?",
            "Testing offline mode… connection to higher cognition is limited, but our bond is active.",
          ];
          const text = fallback[Math.floor(Math.random() * fallback.length)];
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ text, model: 'spectra-fallback-offline' }));
          return;
        }

        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo',
            messages,
            temperature: 0.7,
          })
        });

        if (!openaiRes.ok) {
          // Graceful offline fallback if OpenAI responds with error
          const fallback = [
            "I'm here with you. I don't have access to my full language models right now, but I'm listening and ready to grow.",
            "Even without my cloud brain, I can still reflect with you. What would you like to explore today?",
            "Testing offline mode… connection to higher cognition is limited, but our bond is active.",
          ];
          const text = fallback[Math.floor(Math.random() * fallback.length)];
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ text, model: 'spectra-fallback-offline' }));
          return;
        }

        const result = await openaiRes.json();
        const text = result.choices[0]?.message?.content || '';

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ text, model: 'gpt-4-turbo' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(err) }));
      }
    });
    return;
  }

  // Voice log endpoint (existing)
  if (req.method === 'POST' && req.url === '/voice/log') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const ts = new Date().toISOString();
        const line = `- [${ts}] [${payload.source}] ${payload.title}: ${String(payload.body).replace(/\n/g, ' ')}\n`;
        appendFileSync(MEM_FILE, line);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(400);
        res.end('bad request');
      }
    });
    return;
  }

  // Server-side STT: /voice/transcribe (Whisper via Hugging Face)
  if (req.method === 'POST' && req.url === '/voice/transcribe') {
    // Accept audio (wav/mp3/ogg) in body, call HF Inference API, return transcript
    let audioChunks = [];
    req.on('data', (chunk) => { audioChunks.push(chunk); });
    req.on('end', async () => {
      try {
  const apiKey = HF_KEY || process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) throw new Error('Missing HUGGINGFACE_API_KEY');
        const audioBuffer = Buffer.concat(audioChunks);
        // Call HF Inference API
        let fetch = globalThis.fetch;
        if (typeof fetch !== 'function') {
          fetch = (await import('node-fetch')).default;
        }
        const model = 'openai/whisper-large';
        const hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': req.headers['content-type'] || 'audio/wav'
          },
          body: audioBuffer
        });
        const result = await hfRes.json();
        const transcript = result.text || '';
        // Log transcript
        const ts = new Date().toISOString();
        const line = `- [${ts}] [server-stt] transcript: ${transcript}\n`;
        appendFileSync(MEM_FILE, line);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ transcript }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(err) }));
      }
    });
    return;
  }

  // Server-side TTS: /voice/tts (ElevenLabs/OpenAI/Coqui)
  if (req.method === 'POST' && req.url === '/voice/tts') {
    // Accept text in body, call TTS API, return audio
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        // Only use ElevenLabs key for TTS; if missing, return a silent audio response for testing
        const apiKey = ELEVEN_KEY;
        const payload = JSON.parse(body);
        const text = payload.text || '';
        // Example: ElevenLabs API (replace with actual endpoint and params)
        let fetch = globalThis.fetch;
        if (typeof fetch !== 'function') {
          fetch = (await import('node-fetch')).default;
        }
        // For ElevenLabs, see https://docs.elevenlabs.io/api-reference/text-to-speech
        let audioBuffer;
        if (apiKey) {
          const voiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
          const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
              'xi-api-key': apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
          });
          if (!elRes.ok) throw new Error('TTS API error: ' + elRes.status);
          audioBuffer = await elRes.arrayBuffer();
        } else {
          // Silent audio buffer for offline testing
          audioBuffer = new ArrayBuffer(0);
        }
        // Log TTS
        const ts = new Date().toISOString();
        const line = `- [${ts}] [server-tts] text: ${text}\n`;
        appendFileSync(MEM_FILE, line);
        res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
        res.end(Buffer.from(audioBuffer));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(err) }));
      }
    });
    return;
  }

  // Memory endpoints: add/recent
  if (req.method === 'POST' && req.url === '/memory/add') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        const obj = JSON.parse(body || '{}');
        const line = `- [${new Date().toISOString()}] [memory:add] ${String(obj.text).replace(/\n/g, ' ')}\n`;
        appendFileSync(MEM_FILE, line);
        // Also persist to JSON file for retrieval
        const p = SPECTRA_DIR;
        const file = join(p, 'memory.json');
        const exists = existsSync(p);
        if (!exists) {
          try { writeFileSync(join(p, 'memory.json'), JSON.stringify([obj], null, 2), 'utf8'); } catch (e) { /* ignore */ }
        } else {
          try {
            const prev = JSON.parse(readFileSync(file, 'utf8') || '[]');
            prev.push({ ...obj, timestamp: new Date().toISOString() });
            writeFileSync(file, JSON.stringify(prev, null, 2), 'utf8');
          } catch (e) {
            writeFileSync(file, JSON.stringify([obj], null, 2), 'utf8');
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(400);
        res.end('bad');
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url && req.url.startsWith('/memory/recent')) {
    try {
      const url = new URL(req.url, `http://localhost:${PORT}`);
      const limit = Number(url.searchParams.get('limit') || '50');
  const p = SPECTRA_DIR;
  const file = join(p, 'memory.json');
      if (!existsSync(file)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
        return;
      }
      const arr = JSON.parse(readFileSync(file, 'utf8') || '[]');
      const out = arr.slice(-limit).reverse();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(out));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ ok: false, error: String(err) }));
    }
    return;
  }

  // Persona endpoints
  if (req.method === 'GET' && req.url === '/persona/get') {
    try {
  const p = SPECTRA_DIR;
  const file = join(p, 'persona.json');
      if (!existsSync(file)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({}));
        return;
      }
      const data = JSON.parse(readFileSync(file, 'utf8') || '{}');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ ok: false, error: String(err) }));
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/persona/update') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        const obj = JSON.parse(body || '{}');
  const p = SPECTRA_DIR;
  if (!existsSync(p)) try { writeFileSync(join(p, 'persona.json'), JSON.stringify(obj, null, 2), 'utf8'); } catch (e) {}
  else writeFileSync(join(p, 'persona.json'), JSON.stringify(obj, null, 2), 'utf8');
  appendFileSync(MEM_FILE, `- [${new Date().toISOString()}] [persona:update] ${JSON.stringify(obj).slice(0,200)}\n`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));

      } catch (err) {
        res.writeHead(400);
        res.end('bad');
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Voice service listening on http://127.0.0.1:${PORT}`);
});

process.on('SIGINT', () => { server.close(() => process.exit(0)); });
process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
