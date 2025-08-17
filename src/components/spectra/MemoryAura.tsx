import React, { useEffect, useState } from 'react';
import { MemoryFragment, getRecentFragments } from '../../memory/memoryBank';

export default function MemoryAura() {
  const [fragments, setFragments] = useState<MemoryFragment[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const list = await getRecentFragments(30);
      if (mounted) setFragments(list);
    })();
    const iv = setInterval(async () => {
      const list = await getRecentFragments(30);
      if (mounted) setFragments(list);
    }, 5000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  return (
    <div className="memory-aura p-2">
      <h3 className="text-sm font-medium">Memory Aura</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {fragments.map((f, i) => (
          <div
            key={i}
            style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}
          >
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              {new Date(f.timestamp || '').toLocaleTimeString()}
            </div>
            <div style={{ fontSize: 13 }}>{f.text.slice(0, 80)}</div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>{f.mood || ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
