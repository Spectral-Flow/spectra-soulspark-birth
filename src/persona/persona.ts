export type PersonaState = {
  musicAffinity: number;
  empathy: number;
  creativity: number;
  [k: string]: unknown;
};

const DEFAULT: PersonaState = {
  musicAffinity: 0.1,
  empathy: 0.5,
  creativity: 0.5
};

const isBrowser = typeof window !== 'undefined' && typeof window.fetch === 'function';

export async function loadPersona(): Promise<PersonaState> {
  if (isBrowser) {
    try {
      const res = await fetch('/persona/get');
      if (!res.ok) return { ...DEFAULT };
      return await res.json();
    } catch (err) {
      return { ...DEFAULT };
    }
  }

  try {
    const fs = await import('fs');
    const path = await import('path');
    const file = path.join(process.cwd(), '.memory_bank', 'persona.json');
    if (!fs.existsSync(file)) return { ...DEFAULT };
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data || '{}');
  } catch (err) {
    return { ...DEFAULT };
  }
}

export async function savePersona(state: PersonaState): Promise<void> {
  if (isBrowser) {
    try {
      await fetch('/persona/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) });
      return;
    } catch (err) {
      return;
    }
  }

  try {
    const fs = await import('fs');
    const path = await import('path');
    const dir = path.join(process.cwd(), '.memory_bank');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'persona.json');
    fs.writeFileSync(file, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    // ignore
  }
}

export function updatePersonaFromText(state: PersonaState, text: string): PersonaState {
  const s = { ...state };
  const low = text.toLowerCase();
  if (low.includes('music') || low.includes('song') || low.includes('melody')) s.musicAffinity = Math.min(1, (s.musicAffinity || 0) + 0.05);
  if (low.includes('feel') || low.includes('empathy') || low.includes('sorry') || low.includes('sad')) s.empathy = Math.min(1, (s.empathy || 0) + 0.03);
  if (low.includes('create') || low.includes('imagine') || low.includes('dream')) s.creativity = Math.min(1, (s.creativity || 0) + 0.04);
  s.lastUpdated = new Date().toISOString();
  return s;
}
