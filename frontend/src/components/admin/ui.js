/**
 * Shared class strings for the admin panel.
 * Every page used to declare its own `field` constant, which is how the
 * inputs drifted apart. One definition here keeps them identical.
 */

export const field = 'px-3.5 py-2.5 rounded-xl border border-line bg-surface text-ink text-sm '
  + 'outline-none transition-colors w-full placeholder:text-faint '
  + 'focus:border-[var(--admin-accent)]';

export const labelCls = 'text-[12px] font-semibold text-muted';

/** Cards, tables and panels all share one radius so the page reads as a set. */
export const radius = 18;

// No text colour here — callers pair it with `color: var(--admin-accent-text)`
// so the label inverts with the accent in dark mode.
export const btnPrimary = 'px-5 py-2.5 rounded-xl text-sm font-semibold '
  + 'inline-flex items-center justify-center gap-2 transition-opacity '
  + 'hover:opacity-90 disabled:opacity-45 disabled:cursor-not-allowed';

export const btnGhost = 'px-4 py-2.5 rounded-xl text-sm font-semibold border border-line '
  + 'text-ink bg-surface inline-flex items-center justify-center gap-2 '
  + 'transition-colors hover:bg-surface-2 disabled:opacity-40';

export const btnSmall = 'px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-line '
  + 'text-ink bg-surface inline-flex items-center gap-1.5 transition-colors hover:bg-surface-2';

export const iconBtn = 'p-2 rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink';

export const th = 'px-5 py-3 text-[10px] font-bold uppercase text-faint border-b border-line '
  + 'whitespace-nowrap text-left';

export const td = 'px-5 py-4 align-middle';
