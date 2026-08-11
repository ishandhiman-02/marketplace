import { useRef, useState } from 'react';
import * as Icons from 'lucide-react';

export function AudioPlayer({ offer }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const toggle = () => {
    setPlaying((p) => {
      if (!p) {
        intervalRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) { clearInterval(intervalRef.current); return 0; }
            return prev + 0.3;
          });
        }, 100);
      } else {
        clearInterval(intervalRef.current);
      }
      return !p;
    });
  };

  const bars = [3, 5, 7, 4, 8, 6, 9, 5, 7, 4, 6, 8, 5, 7, 3, 9, 6, 4, 8, 5];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1 h-14 justify-center">
        {bars.map((h, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: 3,
              height: `${h * 5}px`,
              background: playing ? `rgba(79,70,229,${0.3 + (h / 9) * 0.7})` : '#e2e8f0',
            }}
          />
        ))}
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: '#4f46e5' }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>
          {Math.floor((progress / 100) * 14)}:{String(Math.floor(((progress / 100) * 30) % 60)).padStart(2, '0')}
        </span>
        <button
          onClick={toggle}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-md"
          style={{ background: '#4f46e5' }}
        >
          {playing ? <Icons.Pause size={16} color="#fff" /> : <Icons.Play size={16} color="#fff" />}
        </button>
        <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{offer.audioDuration}</span>
      </div>
    </div>
  );
}
