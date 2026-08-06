import { useState, useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';
import {
  listLeads, updateLead, deleteLead, downloadCsv, LEAD_STATUSES, STATUS_STYLE,
} from '../../services/leads';
import { Toast } from '../../components/admin/Toast';
import { useToast } from '../../components/admin/useToast';

const field = 'px-3.5 py-2 rounded-xl border border-line bg-canvas text-ink text-sm outline-none focus:border-ink transition-colors';

const RANGES = [
  { label: 'Today', days: 1 },
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: 'All', days: null },
];

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [days, setDays] = useState(null);
  const [search, setSearch] = useState('');
  const { toast, show } = useToast();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listLeads({ status: status || null, sinceDays: days })
      .then((rows) => { if (alive) { setLeads(rows); setError(null); } })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [status, days]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      l.instagramUsername.toLowerCase().includes(q)
      || l.name.toLowerCase().includes(q)
      || (l.productName || '').toLowerCase().includes(q));
  }, [leads, search]);

  const patch = async (lead, changes, quiet = false) => {
    try {
      const updated = await updateLead(lead.id, changes);
      setLeads((l) => l.map((x) => (x.id === lead.id ? updated : x)));
      if (!quiet) show('Saved');
    } catch (e) { show(e.message, 'error'); }
  };

  const remove = async (lead) => {
    if (!window.confirm(`${lead.name} ki lead delete ho jaayegi. Pakka?`)) return;
    try {
      await deleteLead(lead.id);
      setLeads((l) => l.filter((x) => x.id !== lead.id));
      show('Deleted');
    } catch (e) { show(e.message, 'error'); }
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-1.5" style={{ letterSpacing: '-0.5px' }}>Leads</h1>
          <p className="text-sm text-muted">
            Kaun khareed raha hai — Instagram DM kholne se pehle capture hoti hai.
          </p>
        </div>
        <button
          onClick={() => downloadCsv(visible)}
          disabled={visible.length === 0}
          className="px-5 py-2.5 rounded-full text-sm font-semibold border border-line text-ink inline-flex items-center gap-2 disabled:opacity-40 cursor-pointer"
        >
          <Icons.Download size={15} /> Export CSV
        </button>
      </div>

      {error && <div className="p-4 rounded-2xl text-[13px] mb-6" style={{ background: '#FEE2E2', color: '#991B1B' }}>{error}</div>}

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative">
          <Icons.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name / @username…" className={`${field} pl-9 w-60`} />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
        </select>
        <div className="flex items-center gap-1">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setDays(r.days)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer transition-colors ${
                days === r.days ? 'bg-ink text-canvas' : 'border border-line text-muted'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-faint">{visible.length} leads</span>
      </div>

      <div className="bg-surface border border-line overflow-x-auto" style={{ borderRadius: 22 }}>
        <table className="w-full text-sm" style={{ minWidth: 900 }}>
          <thead>
            <tr className="text-left">
              {['Date', 'Name', 'Instagram', 'Phone', 'Product', 'Price', 'Status', 'Notes', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase text-faint border-b border-line whitespace-nowrap" style={{ letterSpacing: '0.1em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted">Loading…</td></tr>}
            {!loading && visible.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted">
                {leads.length === 0 ? 'Abhi koi lead nahi aayi.' : 'Is filter mein kuch nahi mila.'}
              </td></tr>
            )}
            {visible.map((l) => (
              <tr key={l.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-[12px] text-muted whitespace-nowrap">
                  {new Date(l.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  <span className="text-faint"> {new Date(l.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-ink whitespace-nowrap">{l.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <a href={`https://instagram.com/${l.instagramUsername}`} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2">
                    @{l.instagramUsername}
                  </a>
                </td>
                <td className="px-4 py-3 text-muted whitespace-nowrap">{l.phone || '—'}</td>
                <td className="px-4 py-3 text-muted">{l.productName || '—'}</td>
                <td className="px-4 py-3 text-ink tabular-nums whitespace-nowrap">{l.price ? `Rs.${l.price}` : '—'}</td>
                <td className="px-4 py-3">
                  <select
                    value={l.status}
                    onChange={(e) => patch(l, { status: e.target.value })}
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold border-0 outline-none cursor-pointer"
                    style={{ background: STATUS_STYLE[l.status].bg, color: STATUS_STYLE[l.status].fg }}
                  >
                    {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    defaultValue={l.notes || ''}
                    onBlur={(e) => e.target.value !== (l.notes || '') && patch(l, { notes: e.target.value })}
                    placeholder="Add note…"
                    className="px-2.5 py-1.5 rounded-lg border border-line bg-canvas text-[12px] text-ink outline-none focus:border-ink w-40"
                  />
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(l)} aria-label="Delete" className="p-2 rounded-lg cursor-pointer" style={{ color: '#991B1B' }}>
                    <Icons.Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
