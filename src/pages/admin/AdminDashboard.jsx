import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { leadStats } from '../../services/leads';

const TILES = [
  { key: 'today', label: 'Leads today', icon: 'CalendarDays' },
  { key: 'thisWeek', label: 'This week', icon: 'TrendingUp' },
  { key: 'paidCount', label: 'Paid orders', icon: 'CheckCircle2' },
  { key: 'revenue', label: 'Revenue', icon: 'Wallet', money: true },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    leadStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-ink mb-1.5" style={{ letterSpacing: '-0.5px' }}>Dashboard</h1>
      <p className="text-sm text-muted mb-8">Aaj ke orders aur leads ki summary.</p>

      {error && (
        <div className="p-4 rounded-2xl text-[13px] mb-6" style={{ background: '#FEE2E2', color: '#991B1B' }}>{error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {TILES.map(({ key, label, icon, money }) => {
          const Icon = Icons[icon] || Icons.Circle;
          const value = stats ? stats[key] : null;
          return (
            <div key={key} className="bg-surface border border-line p-5" style={{ borderRadius: 22 }}>
              <Icon size={17} className="text-faint mb-3" />
              <div className="text-[26px] font-bold text-ink" style={{ letterSpacing: '-1px' }}>
                {value === null ? '—' : money ? `Rs.${value}` : value}
              </div>
              <div className="text-[11px] font-semibold uppercase text-faint mt-1" style={{ letterSpacing: '0.1em' }}>
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
