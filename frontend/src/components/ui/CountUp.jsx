import { useState, useRef, useEffect } from 'react';

/**
 * Counts a number up from zero when it first scrolls into view.
 *
 * Accepts whatever the site already renders — a bare number, or a string
 * with the number buried in it ("Rs.499", "100%", "500+"). Only the numeric
 * part animates; everything around it stays put, so the label never reflows
 * mid-count.
 *
 * Deliberately left alone:
 *  - strings with more than one number ("4.9/5", "24/7"). Counting one half
 *    of a ratio while the other sits still reads as a glitch.
 *  - strings with no number at all ("Free") — rendered untouched.
 *
 * Honours prefers-reduced-motion by rendering the final value immediately.
 */

/** Matches the first run of digits, with optional decimals and thousands commas. */
const NUMBER_RE = /\d[\d,]*(?:\.\d+)?/g;

const easeOutCubic = (t) => 1 - (1 - t) ** 3;

const prefersReducedMotion = () =>
  typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function CountUp({
  value,
  duration = 1100,
  className,
  style,
  /** Skip the viewport check and start as soon as it mounts (admin dashboard). */
  immediate = false,
}) {
  const raw = value == null ? '' : String(value);
  const matches = raw.match(NUMBER_RE);

  // Anything that isn't exactly one number is rendered as-is.
  const animatable = matches?.length === 1;
  const target = animatable ? Number(matches[0].replace(/,/g, '')) : 0;
  const decimals = animatable && matches[0].includes('.')
    ? matches[0].split('.')[1].length
    : 0;
  const grouped = animatable && matches[0].includes(',');

  const [display, setDisplay] = useState(() =>
    (animatable && !prefersReducedMotion() ? 0 : target));
  const ref = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    if (!animatable) return undefined;

    if (prefersReducedMotion()) {
      setDisplay(target);
      return undefined;
    }

    done.current = false;
    setDisplay(0);

    let frame;
    const run = () => {
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        setDisplay(target * easeOutCubic(t));
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    if (immediate) {
      run();
      return () => cancelAnimationFrame(frame);
    }

    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setDisplay(target);
      return undefined;
    }

    const io = new IntersectionObserver(([entry]) => {
      // once only — re-counting every time the user scrolls back is noise
      if (entry.isIntersecting && !done.current) {
        done.current = true;
        run();
        io.disconnect();
      }
    }, { threshold: 0.4 });

    io.observe(node);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
  }, [target, duration, animatable, immediate]);

  if (!animatable) return <span className={className} style={style}>{raw}</span>;

  const shown = decimals > 0 ? display.toFixed(decimals) : String(Math.round(display));
  const formatted = grouped
    ? Number(shown).toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    : shown;

  return (
    <span
      ref={ref}
      className={className}
      style={{
        // Digits change width as they tick; tabular figures stop the
        // surrounding layout jittering on every frame.
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {/* The visible text sits at 0 until this scrolls into view, then ticks
          every frame. Screen readers get the real value up front and never
          hear the intermediate numbers. */}
      <span className="sr-only">{raw}</span>
      <span aria-hidden="true">{raw.replace(matches[0], formatted)}</span>
    </span>
  );
}
