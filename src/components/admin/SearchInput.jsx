import { useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { field } from './ui';

/**
 * Search box used across the admin.
 *
 * Two things it adds over a bare input: a clear button (a filter you cannot
 * see how to undo is how people conclude their data is gone), and a "/"
 * shortcut so search is reachable without the mouse — the fastest way to
 * find one lead among hundreds.
 */
export function SearchInput({ value, onChange, placeholder, label, width = 'w-full sm:w-72' }) {
  const ref = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      // Don't steal the key while someone is typing a caption or a price.
      const el = document.activeElement;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return;
      e.preventDefault();
      ref.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`relative ${width}`}>
      <Icons.Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none"
      />
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape' && value) onChange(''); }}
        placeholder={placeholder}
        aria-label={label || placeholder}
        className={`${field} pl-9 ${value ? 'pr-16' : 'pr-10'}`}
      />
      {value
        ? (
          <button
            type="button"
            onClick={() => { onChange(''); ref.current?.focus(); }}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-faint hover:text-ink transition-colors"
          >
            <Icons.X size={14} />
          </button>
        )
        : (
          <kbd
            aria-hidden="true"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md text-[11px] font-semibold border border-line text-faint pointer-events-none"
          >
            /
          </kbd>
        )}
    </div>
  );
}
