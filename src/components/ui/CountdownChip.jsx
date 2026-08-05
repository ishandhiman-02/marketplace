import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

// Purane CountdownTimer ka logic, compact pill mein.
// 5:47:23 se shuru, 0 pe 23:59:59 pe wapas (marketing loop).
export function CountdownChip({ className = '', light = false }) {
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
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-semibold font-mono ${
        light ? 'bg-white/15 text-white backdrop-blur-sm' : 'bg-surface-2 text-ink'
      } ${className}`}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      <Icons.Clock size={13} />
      {pad(time.h)}:{pad(time.m)}:{pad(time.s)} left
    </div>
  );
}