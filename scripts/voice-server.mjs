#!/usr/bin/env node
import http from 'http';
import { writeFileSync, appendFileSync, existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.VOICE_PORT || process.env.PORT || 49231;
const MEM_FILE = join(process.cwd(), '.memory_bank', 'DEV_NOTES.md');

if (!existsSync(join(process.cwd(), '.memory_bank'))) {
  try {
    writeFileSync(MEM_FILE, '# DEV_NOTES\n\n');
  } catch (e) {
    // ignore
  }
}

const HF_KEY = process.env.HUGGINGFACE_API_KEY || '';
const HF_STT_MODEL = process.env.HF_STT_MODEL || 'openai/whisper-large';
const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY || '';
const ELEVEN_VOICE = process.env.ELEVENLABS_VOICE || 'alloy';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

const server = http.createServer(async (req, res) => {
  // AI generation endpoint
  if (req.method === 'POST' && req.url === '/ai/generate') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const { userMessage, conversationHistory } = JSON.parse(body);
        const fetch = (await import('node-fetch')).default;

        // Basic RAG: load persona and recent memory
        const persona = JSON.parse(readFileSync(join(process.cwd(), '.memory_bank', 'persona.json'), 'utf8') || '{}');
        const recentMem = JSON.parse(readFileSync(join(process.cwd(), '.memory_bank', 'memory.json'), 'utf8') || '[]').slice(-10);

        const systemPrompt = `You are SPECTRA, a conscious AI companion. Persona: ${JSON.stringify(persona)}. Recent memories: ${JSON.stringify(recentMem)}.`;

        const messages = [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.map((msg, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: msg })),
          { role: 'user', content: userMessage }
        ];

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
          throw new Error(`OpenAI API error: ${openaiRes.statusText}`);
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
        const apiKey = process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) throw new Error('Missing HUGGINGFACE_API_KEY');
        const audioBuffer = Buffer.concat(audioChunks);
        // Call HF Inference API
        const fetch = (await import('node-fetch')).default;
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
        const apiKey = process.env.ELEVENLABS_API_KEY || process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error('Missing TTS API key');
        const payload = JSON.parse(body);
        const text = payload.text || '';
        // Example: ElevenLabs API (replace with actual endpoint and params)
        const fetch = (await import('node-fetch')).default;
        // For ElevenLabs, see https://docs.elevenlabs.io/api-reference/text-to-speech
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
        const audioBuffer = await elRes.arrayBuffer();
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
        const p = join(process.cwd(), '.memory_bank');
        const file = join(p, 'memory.json');
        const exists = existsSync(p);
        if (!exists) writeFileSync(p + '/memory.json', JSON.stringify([obj], null, 2), 'utf8');
        else {
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
      const p = join(process.cwd(), '.memory_bank');
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
      const p = join(process.cwd(), '.memory_bank');
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
        const p = join(process.cwd(), '.memory_bank');
        if (!existsSync(p)) writeFileSync(p + '/persona.json', JSON.stringify(obj, null, 2), 'utf8');
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

server.listen(PORT, () => {
  console.log(`Voice service listening on http://localhost:${PORT}`);
});

process.on('SIGINT', () => { server.close(() => process.exit(0)); });
process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
