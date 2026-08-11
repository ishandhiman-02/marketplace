import * as Icons from 'lucide-react';

/**
 * Builds a windowed page list: 1 … 4 5 [6] 7 8 … 20
 * Always shows the first and last page so the ends stay one click away.
 */
function pageWindow(page, pageCount) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const pages = new Set([1, pageCount, page, page - 1, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1].forEach((p) => pages.add(p));

  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);

  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push(`gap-${p}`);
    out.push(p);
    prev = p;
  }
  return out;
}

/**
 * Sits under a table or grid. Hides itself entirely when everything fits on
 * one page — a lone disabled "1 of 1" is noise.
 */
export function Pagination({ page, pageCount, from, to, total, onGo, unit = 'items' }) {
  if (total === 0) return null;

  const single = pageCount <= 1;

  return (
    <div
      className={`flex items-center justify-between gap-4 flex-wrap px-5 py-3.5 ${single ? '' : 'border-t border-line'}`}
      style={single ? undefined : { background: 'var(--color-surface-2)' }}
    >
      <p className="text-[13px] text-muted" aria-live="polite">
        Showing <strong className="text-ink font-semibold">{from}–{to}</strong> of{' '}
        <strong className="text-ink font-semibold">{total}</strong> {unit}
      </p>

      {!single && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            type="button"
            onClick={() => onGo(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
            className="p-2 rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Icons.ChevronLeft size={16} />
          </button>

          {pageWindow(page, pageCount).map((p) =>
            (typeof p === 'string'
              ? <span key={p} className="px-1.5 text-faint select-none">…</span>
              : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onGo(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? 'page' : undefined}
                  className="min-w-8 h-8 px-2 rounded-lg text-[13px] font-semibold transition-colors"
                  style={p === page
                    ? { background: 'var(--admin-accent)', color: 'var(--admin-accent-text)' }
                    : { color: 'var(--color-muted)' }}
                >
                  {p}
                </button>
              )))}

          <button
            type="button"
            onClick={() => onGo(page + 1)}
            disabled={page === pageCount}
            aria-label="Next page"
            className="p-2 rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Icons.ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
