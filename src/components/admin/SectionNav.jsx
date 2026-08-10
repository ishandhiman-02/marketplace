import { useState, useEffect, useRef } from 'react';

/**
 * Sticky row of jump chips for a long settings page.
 * The active chip follows the scroll position, so the row doubles as a
 * "where am I" indicator rather than just a set of links.
 */
export function SectionNav({ sections }) {
  const [active, setActive] = useState(sections[0]?.id);
  const rowRef = useRef(null);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);
    if (!els.length) return undefined;

    // Only count a section once it is under the sticky row and still in the
    // upper half of the viewport — otherwise the last section never wins.
    const io = new IntersectionObserver(
      (entries) => {
        const onscreen = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (onscreen[0]) setActive(onscreen[0].target.id);
      },
      { rootMargin: '-140px 0px -55% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  // Keep the active chip visible when the row overflows sideways.
  // Scrolls the row only — scrollIntoView would drag the page with it.
  useEffect(() => {
    const row = rowRef.current;
    const chip = row?.querySelector(`[data-chip="${active}"]`);
    if (!row || !chip) return;
    row.scrollTo({
      left: Math.max(0, chip.offsetLeft - row.clientWidth / 2 + chip.clientWidth / 2),
      behavior: 'smooth',
    });
  }, [active]);

  return (
    <div
      className="sticky top-14 lg:top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8
                 py-3 mb-6 border-b border-line"
      style={{ background: 'var(--color-canvas)' }}
    >
      <nav
        ref={rowRef}
        aria-label="Settings sections"
        className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {sections.map((s) => {
          const on = s.id === active;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              data-chip={s.id}
              aria-current={on ? 'true' : undefined}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-colors
                          ${on ? '' : 'text-muted border-line hover:text-ink'}`}
              style={on
                ? {
                  background: 'var(--color-ink)',
                  color: 'var(--color-canvas)',
                  borderColor: 'var(--color-ink)',
                }
                : undefined}
            >
              {s.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
