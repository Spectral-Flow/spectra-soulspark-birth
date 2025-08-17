// memoryBank.ts
// Provides add/get memory fragment helpers that work in Node (writes to .memory_bank/memory.json)
// and in the browser (POSTs to /memory/add). Lightweight, upgradeable to vector DB later.

export interface MemoryFragment {
  id?: string;
  text: string;
  mood?: string;
  keyConcepts?: string[];
  timestamp?: string;
}

const isBrowser = typeof window !== 'undefined' && typeof window.fetch === 'function';

export async function addFragment(fragment: MemoryFragment): Promise<void> {
  const f = { ...fragment, timestamp: fragment.timestamp || new Date().toISOString() } as MemoryFragment;
  // Ensure a stable id for each fragment so we can dedupe/reference later
  if (!f.id) {
    try {
      // Prefer Web Crypto if available
      const gw = (globalThis as unknown) as { crypto?: { randomUUID?: () => string } };
      if (gw && gw.crypto && typeof gw.crypto.randomUUID === 'function') {
        f.id = gw.crypto.randomUUID();
      } else {
        // Node fallback via dynamic import
        const cryptoModule = await import('crypto');
        f.id = typeof cryptoModule.randomUUID === 'function'
          ? cryptoModule.randomUUID()
          : `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      }
    } catch (_) {
      f.id = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    }
  }
  if (isBrowser) {
    try {
      await fetch('/memory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f)
      });
      return;
    } catch (err) {
      // best-effort in browser
      console.warn('Failed to POST memory fragment to /memory/add', err);
      return;
    }
  }

  // Node environment: write to .memory_bank/memory.json
  try {
     
    const fs = await import('fs');
    const path = await import('path');
    const dir = path.join(process.cwd(), '.memory_bank');
    const file = path.join(dir, 'memory.json');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let arr: MemoryFragment[] = [];
    if (fs.existsSync(file)) {
      try { arr = JSON.parse(fs.readFileSync(file, 'utf8') || '[]'); } catch (e) { arr = []; }
    }
    // Avoid exact duplicate ids
    if (!arr.some((x) => x.id === f.id)) {
      arr.push(f);
    } else {
      // If duplicate id exists, update the entry timestamp/text
      arr = arr.map((x) => (x.id === f.id ? { ...x, ...f } : x));
    }
  fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8');
  } catch (err) {
    // silent fail
    // console.error('Failed to write memory fragment', err);
  }
}

export async function getRecentFragments(limit = 50): Promise<MemoryFragment[]> {
  if (isBrowser) {
    try {
      const res = await fetch(`/memory/recent?limit=${limit}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      return [];
    }
  }

  try {
  const fs = await import('fs');
  const path = await import('path');
  const file = path.join(process.cwd(), '.memory_bank', 'memory.json');
  if (!fs.existsSync(file)) return [];
  const arr = JSON.parse(fs.readFileSync(file, 'utf8') || '[]') as MemoryFragment[];
    // sort by timestamp ascending, then return most recent first
    const sorted = (Array.isArray(arr) ? arr : []).slice().sort((a, b) => {
      const ta = new Date(a?.timestamp || 0).getTime();
      const tb = new Date(b?.timestamp || 0).getTime();
      return ta - tb;
    });
    return sorted.slice(-limit).reverse();
  } catch (err) {
    return [];
  }
}
