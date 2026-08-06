import { useEffect, useState } from 'react';

export function CountdownTimer() {
  const [time, setTime] = useState({ h: 5, m: 47, s: 23 });

  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2">
      {[{ v: time.h, l: 'HRS' }, { v: time.m, l: 'MIN' }, { v: time.s, l: 'SEC' }].map(({ v, l }, i) => (
        <div key={l} className="flex items-center gap-2">
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-mono text-white"
              style={{ background: '#4f46e5', boxShadow: '0 2px 8px rgba(79,70,229,0.35)' }}
            >
              {pad(v)}
            </div>
            <div className="text-xs mt-1 font-medium" style={{ color: '#94a3b8' }}>{l}</div>
          </div>
          {i < 2 && <span className="text-lg font-bold mb-4" style={{ color: '#4f46e5' }}>:</span>}
        </div>
      ))}
    </div>
  );
}
