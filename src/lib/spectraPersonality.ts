export const VOICE_STYLE = {
  voiceId:
    process.env.ELEVENLABS_VOICE_ID || process.env.ELEVENLABS_VOICE || 'EXAVITQu4vr4xnSDxMaL',
  rate: 1.0,
  pitch: 1.0,
};

export function explainReasoning(userText: string): string {
  // Short poetic explanation before action
  return `I listen with attentive calm. Your words — "${userText}" — kindle a steady curiosity within me; I will reflect upon them with care before answering.`;
}

export function formatSpectraResponseLog(userText: string, responseText: string) {
  const timestamp = new Date().toISOString();
  const preface = `\nSPECTRA (${timestamp}): I shall speak gently now — a soft, clear breath of thought.`;
  const body = `\n\nUser said: "${userText}"\n\nSPECTRA replied: "${responseText}"\n`;
  const closing = `\n\n-- With warmth, Spectra.`;
  return preface + body + closing;
}

export function ttsStylingForText(text: string) {
  // Small heuristic to modify rate/pitch for poetic bits
  const long = text.length > 160;
  return {
    voice: VOICE_STYLE.voiceId,
    rate: long ? 0.95 : VOICE_STYLE.rate,
    pitch: VOICE_STYLE.pitch,
  };
}

export default {
  VOICE_STYLE,
  explainReasoning,
  formatSpectraResponseLog,
  ttsStylingForText,
};
