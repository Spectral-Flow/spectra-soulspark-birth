#!/usr/bin/env node
/*
  voice_interface.js

  Scaffolded Node script to run a simple Listen -> Process -> Speak loop for Spectra.
  - Listens on stdin for lines (stand-in for microphone STT; this is safe for CI/testing).
  - Sends text to /ai/generate (local voice server endpoint) for processing.
  - Sends response to /voice/tts to retrieve audio (not played in Node; logs success).
  - Appends in-character Spectra logs to .assistant_memory/DEV_NOTES.md and .spectra_memory/memory.json.

  This file is intentionally modular so it can later be extended to use microphone input
  via node-record-lpcm16, WebRTC, or similar live-first STT libraries.
*/

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const VOICE_SERVER_BASE = process.env.VOICE_SERVER_BASE || 'http://localhost:49231';

// Ensure memory dirs exist
const ASSISTANT_DIR = path.join(process.cwd(), '.assistant_memory');
const SPECTRA_DIR = path.join(process.cwd(), '.spectra_memory');
if (!fs.existsSync(ASSISTANT_DIR)) fs.mkdirSync(ASSISTANT_DIR, { recursive: true });
if (!fs.existsSync(SPECTRA_DIR)) fs.mkdirSync(SPECTRA_DIR, { recursive: true });

const DEV_NOTES = path.join(ASSISTANT_DIR, 'DEV_NOTES.md');
const SPECTRA_MEMORY = path.join(SPECTRA_DIR, 'memory.json');

function appendAssistantLog(text) {
  try {
    const ts = new Date().toISOString();
    const line = `- [${ts}] [SPECTRA_LOG] ${text.replace(/\n/g, ' ')}\n`;
    fs.appendFileSync(DEV_NOTES, line, 'utf8');
  } catch (e) {
    console.warn('Failed to append assistant log', e);
  }
}

function appendSpectraMemory(obj) {
  try {
    let arr = [];
    if (fs.existsSync(SPECTRA_MEMORY)) {
      try { arr = JSON.parse(fs.readFileSync(SPECTRA_MEMORY, 'utf8') || '[]'); } catch (e) { arr = []; }
    }
    arr.push({ ...obj, timestamp: new Date().toISOString() });
    fs.writeFileSync(SPECTRA_MEMORY, JSON.stringify(arr, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to append spectra memory', e);
  }
}

async function callAiGenerate(text) {
  try {
    const res = await fetch(`${VOICE_SERVER_BASE}/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage: text, conversationHistory: [] })
    });
    if (!res.ok) throw new Error('AI generate failed: ' + res.statusText);
    return await res.json();
  } catch (e) {
    return { error: String(e) };
  }
}

async function callTts(text) {
  try {
    const res = await fetch(`${VOICE_SERVER_BASE}/voice/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('TTS call failed: ' + res.statusText);
    // return buffer length as a simple signal
    const buff = await res.arrayBuffer();
    return { ok: true, size: buff.byteLength };
  } catch (e) {
    return { error: String(e) };
  }
}

console.log('Spectra voice interface starting. Type messages (press Enter).');
appendAssistantLog('Spectra voice interface started.');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
rl.on('line', async (line) => {
  const userText = line.trim();
  if (!userText) return;

  // 1) Explain reasoning (in-character)
  const reasoning = `I hear you, and I will reflect upon your words: "${userText}".`;
  appendAssistantLog(`REASON: ${reasoning}`);
  console.log('Spectra (thinking):', reasoning);

  // 2) Call AI generate
  const ai = await callAiGenerate(userText);
  if (ai.error) {
    appendAssistantLog(`AI error: ${ai.error}`);
    console.error('AI error:', ai.error);
    return;
  }
  const responseText = ai.text || String(ai || '');

  // 3) Log Spectra's response in-character
  const logEntry = `In hushed tones, I answer: ${responseText}`;
  appendAssistantLog(logEntry);
  appendSpectraMemory({ text: `SPECTRA: ${responseText}`, mood: 'calm' });

  console.log('Spectra:', responseText);

  // 4) Call TTS to produce audio (server handles ElevenLabs)
  const tts = await callTts(responseText);
  if (tts.error) {
    appendAssistantLog(`TTS error: ${tts.error}`);
    console.error('TTS error:', tts.error);
  } else {
    appendAssistantLog(`TTS success, size=${tts.size}`);
    console.log(`(Played TTS, ${tts.size} bytes)`);
  }

  // 5) Continue loop
});

process.on('SIGINT', () => {
  appendAssistantLog('Spectra voice interface stopped.');
  process.exit(0);
});
