/**
 * Small two-or-three-way switch, like the Active / Closed toggle in the
 * reference. Used where a dropdown would be overkill.
 * options = [{ value, label, count? }]
 */
export function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex items-center p-1 rounded-xl border border-line bg-surface"
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors whitespace-nowrap"
            style={{
              background: on ? 'var(--color-surface-2)' : 'transparent',
              color: on ? 'var(--color-ink)' : 'var(--color-muted)',
              boxShadow: on ? '0 1px 2px rgba(18,48,58,0.06)' : 'none',
            }}
          >
            {o.label}
            {o.count != null && (
              <span className="ml-1.5 text-[11px] font-bold" style={{ color: on ? 'var(--admin-accent)' : 'var(--color-faint)' }}>
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
