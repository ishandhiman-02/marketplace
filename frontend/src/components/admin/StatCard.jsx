import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { CountUp } from '../ui/CountUp';
import { radius } from './ui';

/**
 * One number on the dashboard.
 * Always a link — a stat you can't act on is a dead end, so every card
 * lands on the page where that number can actually be worked.
 * `active` fills the icon tile and darkens the border, marking the metric
 * that needs attention today (e.g. new leads waiting).
 */
export function StatCard({ to, icon, value, label, active = false, loading = false }) {
  const Icon = Icons[icon] || Icons.Circle;

  return (
    <Link
      to={to}
      className="group relative block p-5 transition-shadow hover:shadow-[0_6px_24px_rgba(18,48,58,0.08)]"
      style={{
        borderRadius: radius,
        background: 'var(--color-surface)',
        border: `1.5px solid ${active ? 'var(--admin-accent)' : 'var(--color-line)'}`,
      }}
    >
      <Icons.ArrowUpRight
        size={16}
        className="absolute top-4 right-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        style={{ color: active ? 'var(--admin-accent)' : 'var(--color-faint)' }}
        aria-hidden="true"
      />

      <div className="flex items-center gap-4">
        <span
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: active ? 'var(--admin-highlight)' : 'var(--admin-accent-soft)',
            color: active ? 'var(--admin-sidebar-active-text)' : 'var(--color-muted)',
          }}
        >
          <Icon size={20} />
        </span>

        <div className="min-w-0">
          <div
            className="text-[30px] font-bold text-ink leading-none tabular-nums"
            style={{ letterSpacing: '-1.2px' }}
          >
            {loading
              ? <span className="inline-block w-10 h-7 rounded-md bg-surface-2 animate-pulse align-middle" />
              : <CountUp value={value} duration={900} immediate />}
          </div>
          <div
            className="text-[10px] font-bold uppercase text-faint mt-2"
            style={{ letterSpacing: '0.11em' }}
          >
            {label}
          </div>
        </div>
      </div>
    </Link>
  );
}
