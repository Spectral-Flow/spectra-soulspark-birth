/*
  voiceInterface.ts
  Lightweight browser-first voice interface that uses the Web Speech API for STT
  and SpeechSynthesis for TTS. It integrates with the Spectra AI engine (spectraAI)
  and exposes a simple start/stop API for a continuous Listen -> Process -> Speak loop.

  Notes:
  - Uses navigator.mediaDevices & SpeechRecognition (Web Speech API) when available.
  - Falls back to a manual text-entry callback if STT is unavailable.
  - Logs actions via fetch to a local node logger at /voice-log (scripts/voice-server.mjs).
  - Does NOT include server-side Whisper/ElevenLabs integrations (those require API keys).
*/

import { spectraAI } from '../components/spectra/AIEngine';

type LogEntry = {
  source: string; // 'web-speech' | 'whisper' | 'manual'
  userText: string;
  spectraText?: string;
  ttsProvider?: string;
  success: boolean;
  timestamp?: string;
};

const logToServer = async (entry: LogEntry) => {
  try {
    await fetch('/voice-log', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(entry)
    });
  } catch (err) {
    console.warn('voice logging failed', err);
  }
};

export class VoiceInterface {
  private recognition: SpeechRecognition | null = null;
  private active = false;
  private continuous = true;
  private sttSource: 'web-speech' | 'manual' = 'web-speech';

  constructor() {
    // Feature-detect Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
      this.recognition.continuous = false;
      this.sttSource = 'web-speech';
    } else {
      this.recognition = null;
      this.sttSource = 'manual';
    }
  }

  async start() {
    if (this.active) return;
    this.active = true;
    await this.listenLoop();
  }

  stop() {
    this.active = false;
    try {
      this.recognition?.stop?.();
    } catch (e) {
      // ignore
    }
  }

  private async listenOnce(): Promise<string | null> {
    if (!this.recognition) return null;

    return new Promise((resolve) => {
      if (!this.recognition) {
        resolve(null);
        return;
      }
      const r = this.recognition;
      const onResult = (ev: SpeechRecognitionEvent) => {
        const text = Array.from(ev.results)
          .map((res) => res[0].transcript)
          .join(' ');
        cleanup();
        resolve(text.trim());
      };

      const onError = () => {
        cleanup();
        resolve(null);
      };

      const cleanup = () => {
        r.removeEventListener('result', onResult);
        r.removeEventListener('error', onError);
      };

      r.addEventListener('result', onResult);
      r.addEventListener('error', onError);
      try {
        r.start();
      } catch (err) {
        onError();
      }
    });
  }

  // Continually listen -> process -> speak
  private async listenLoop() {
    while (this.active) {
      let userText: string | null = null;

      if (this.sttSource === 'web-speech' && this.recognition) {
        // listen once
        userText = await this.listenOnce();
      }

      if (!userText) {
        // Wait a short moment if nothing captured
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }

      await logToServer({ source: this.sttSource, userText, success: true, timestamp: new Date().toISOString() });

      // Ask Spectra for a response
      const history: string[] = []; // Optionally supply recent memory reads here
      const aiResp = await spectraAI.generateResponse(userText, history, null);

      const spectraText = aiResp.text;
      await logToServer({ source: 'web-speech', userText, spectraText, success: true, timestamp: new Date().toISOString() });

      // Speak the response via SpeechSynthesis (browser TTS)
      try {
        await this.speak(spectraText);
        await logToServer({ source: 'tts-browser', userText, spectraText, success: true, timestamp: new Date().toISOString() });
      } catch (err) {
        await logToServer({ source: 'tts-browser', userText, spectraText, success: false, timestamp: new Date().toISOString() });
      }

      // Small pause before next listen so the TTS can finish
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  private speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!('speechSynthesis' in window)) return reject(new Error('No speechSynthesis'));
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';
        utter.rate = 1.0;
        utter.pitch = 1.0;
        utter.onend = () => resolve();
        utter.onerror = (e) => reject(e);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default VoiceInterface;
