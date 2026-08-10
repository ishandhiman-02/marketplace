import * as Icons from 'lucide-react';
import { radius, btnPrimary } from './ui';

/** White rounded container. Every table and grid on the admin sits in one. */
export function Panel({ children, className = '', flush = false }) {
  return (
    <div
      className={`bg-surface border border-line ${flush ? '' : 'overflow-hidden'} ${className}`}
      style={{ borderRadius: radius }}
    >
      {children}
    </div>
  );
}

/**
 * Empty state with a way out.
 * The old pages just said "No products yet." — true, but it left the client
 * staring at a blank box with no idea what to do next.
 */
export function EmptyState({ icon = 'Inbox', title, hint, actionLabel, onAction }) {
  const Icon = Icons[icon] || Icons.Inbox;
  return (
    <div className="px-6 py-14 text-center">
      <span
        className="w-14 h-14 rounded-2xl inline-flex items-center justify-center mb-4"
        style={{ background: 'var(--admin-accent-soft)', color: 'var(--admin-accent)' }}
      >
        <Icon size={24} />
      </span>
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {hint && <p className="text-[13px] text-muted mt-1.5 max-w-sm mx-auto leading-relaxed">{hint}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className={`${btnPrimary} mt-5`}
          style={{ background: 'var(--admin-accent)', color: 'var(--admin-accent-text)' }}
        >
          <Icons.Plus size={15} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Loading placeholder shaped like the rows it replaces.
 * A skeleton keeps the layout from jumping the way a centred "Loading…" did.
 */
export function SkeletonRows({ rows = 4, cols = 5 }) {
  return Array.from({ length: rows }).map((_, r) => (
    <tr key={r} className="border-b border-line last:border-0">
      {Array.from({ length: cols }).map((__, c) => (
        <td key={c} className="px-5 py-4">
          <span
            className="block h-3.5 rounded-md bg-surface-2 animate-pulse"
            style={{ width: c === 0 ? '60%' : '80%' }}
          />
        </td>
      ))}
    </tr>
  ));
}

/** Red inline error bar, used at the top of a page when a load fails. */
export function ErrorBar({ message, onRetry }) {
  if (!message) return null;
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] mb-5"
      style={{ background: 'var(--admin-danger-soft)', color: 'var(--admin-danger)' }}
      role="alert"
    >
      <Icons.AlertCircle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-2 shrink-0">
          Retry
        </button>
      )}
    </div>
  );
}
