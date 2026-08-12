import { useEffect, useRef, useState } from 'react';
import { onPendingChange } from '../../lib/pending';

/**
 * A slim bar across the top that reports background work — saving a product,
 * refetching after an edit, loading a screen.
 *
 * Two details are what stop it feeling twitchy:
 *
 *   - it waits ~180ms before appearing, so anything that finishes quickly (most
 *     local requests) never flashes a bar at all;
 *   - it eases towards 90% while work is outstanding and only completes when the
 *     last request lands, because the real duration is unknowable. A bar that
 *     jumps straight to 100% and waits is worse than none.
 *
 * The revision poll opts out via `silent`, so an idle page shows nothing.
 */
const APPEAR_AFTER_MS = 180;
const TICK_MS = 200;
const FADE_MS = 320;

export function TopProgress() {
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const appearTimer = useRef(null);
  const tickTimer = useRef(null);
  const fadeTimer = useRef(null);

  useEffect(() => {
    const clearAll = () => {
      [appearTimer, tickTimer, fadeTimer].forEach((t) => {
        if (t.current) { window.clearTimeout(t.current); window.clearInterval(t.current); t.current = null; }
      });
    };

    const unsubscribe = onPendingChange((pending) => {
      if (pending > 0) {
        if (appearTimer.current || tickTimer.current) return; // already running
        appearTimer.current = window.setTimeout(() => {
          setVisible(true);
          setWidth(12);
          // Creep towards 90%, slowing as it goes — never claims to be finished.
          tickTimer.current = window.setInterval(() => {
            setWidth((w) => (w >= 90 ? w : w + Math.max(0.6, (90 - w) * 0.18)));
          }, TICK_MS);
        }, APPEAR_AFTER_MS);
        return;
      }

      clearAll();
      setWidth((w) => (w > 0 ? 100 : 0));
      fadeTimer.current = window.setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, FADE_MS);
    });

    return () => { unsubscribe(); clearAll(); };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 inset-x-0 z-[9998] pointer-events-none"
      style={{ height: 2 }}
    >
      <div
        style={{
          height: '100%',
          width: `${width}%`,
          background: 'var(--admin-accent, #4f46e5)',
          boxShadow: '0 0 8px currentColor',
          transition: `width ${TICK_MS}ms ease-out, opacity ${FADE_MS}ms ease`,
          opacity: width >= 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
