import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { leadStats, listLeads, updateLead, LEAD_STATUSES, STATUS_STYLE } from '../../services/leads';
import { StatCard } from '../../components/admin/StatCard';
import { PageHeader } from '../../components/admin/PageHeader';
import { Segmented } from '../../components/admin/Segmented';
import { Panel, EmptyState, SkeletonRows, ErrorBar } from '../../components/admin/Panel';
import { StatusSelect } from '../../components/admin/StatusSelect';
import { Toast } from '../../components/admin/Toast';
import { useToast } from '../../components/admin/useToast';
import { th, td } from '../../components/admin/ui';
import { useLiveRefresh } from '../../hooks/useLiveRefresh';

const CLOSED = ['delivered', 'cancelled'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('active');
  const { toast, show } = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([leadStats(), listLeads()])
      .then(([s, l]) => { setStats(s); setLeads(l); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Another admin's edit (or your own in a second tab) lands here on its own.
  useLiveRefresh(load);

  const { active, closed } = useMemo(() => ({
    active: leads.filter((l) => !CLOSED.includes(l.status)),
    closed: leads.filter((l) => CLOSED.includes(l.status)),
  }), [leads]);

  const visible = (tab === 'active' ? active : closed).slice(0, 8);

  const setStatus = async (lead, status) => {
    const before = leads;
    // optimistic — the dropdown should feel instant, not wait on a round trip
    setLeads((list) => list.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    try {
      await updateLead(lead.id, { status });
      setStats(await leadStats());
    } catch (e) {
      setLeads(before);
      show(e.message, 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Today's orders and the leads waiting on a reply."
      />

      <ErrorBar message={error} onRetry={load} />

      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard
          to="/admin/leads"
          icon="Inbox"
          value={stats?.total ?? 0}
          label="Total leads"
          loading={loading}
        />
        <StatCard
          to="/admin/leads"
          icon="BellRing"
          value={stats?.newCount ?? 0}
          label="New leads"
          active={(stats?.newCount ?? 0) > 0}
          loading={loading}
        />
        <StatCard
          to="/admin/leads"
          icon="CheckCircle2"
          value={stats?.paidCount ?? 0}
          label="Paid orders"
          loading={loading}
        />
        <StatCard
          to="/admin/leads"
          icon="Wallet"
          value={`Rs.${stats?.revenue ?? 0}`}
          label="Revenue"
          loading={loading}
        />
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <h2 className="text-[19px] font-bold text-ink" style={{ letterSpacing: '-0.4px' }}>Leads</h2>
        <Segmented
          ariaLabel="Filter leads"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'active', label: 'Active', count: active.length },
            { value: 'closed', label: 'Closed', count: closed.length },
          ]}
        />
      </div>

      <Panel>
        {/* Phone and tablet: cards instead of an 820px table */}
        <div className="lg:hidden divide-y divide-[var(--color-line)]">
          {loading && [0, 1, 2].map((i) => (
            <div key={i} className="p-4 flex flex-col gap-2">
              <span className="h-4 w-1/3 rounded-md bg-surface-2 animate-pulse" />
              <span className="h-3 w-2/3 rounded-md bg-surface-2 animate-pulse" />
            </div>
          ))}

          {!loading && visible.length === 0 && (
            <EmptyState
              icon={tab === 'active' ? 'Inbox' : 'Archive'}
              title={tab === 'active' ? 'No leads waiting' : 'Nothing closed yet'}
              hint={tab === 'active'
                ? 'New leads appear here the moment someone starts an order on the site.'
                : 'Leads marked delivered or cancelled move here.'}
            />
          )}

          {!loading && visible.map((l) => (
            <div key={l.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-ink leading-tight">{l.name}</div>
                  <a
                    href={`https://instagram.com/${l.instagramUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink"
                  >
                    @{l.instagramUsername}
                    <Icons.ArrowUpRight size={12} className="text-faint" />
                  </a>
                </div>
                <div className="text-right shrink-0">
                  {l.price ? <div className="font-semibold text-ink tabular-nums">Rs.{l.price}</div> : null}
                  <div className="text-[11px] text-faint whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>
              {l.productName && <div className="text-[13px] text-muted mt-1.5">{l.productName}</div>}
              <div className="mt-3">
                <StatusSelect
                  value={l.status}
                  options={LEAD_STATUSES}
                  styleMap={STATUS_STYLE}
                  onChange={(v) => setStatus(l, v)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block overflow-x-auto" data-lenis-prevent>
          <table className="w-full text-sm" style={{ minWidth: 820 }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)' }}>
                {['Date', 'Name', 'Phone', 'Instagram', 'Product', 'Price', 'Status'].map((h) => (
                  <th key={h} className={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonRows rows={4} cols={7} />}

              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={tab === 'active' ? 'Inbox' : 'Archive'}
                      title={tab === 'active' ? 'No leads waiting' : 'Nothing closed yet'}
                      hint={tab === 'active'
                        ? 'New leads appear here the moment someone starts an order on the site.'
                        : 'Leads marked delivered or cancelled move here.'}
                    />
                  </td>
                </tr>
              )}

              {!loading && visible.map((l) => (
                <tr key={l.id} className="border-b border-line last:border-0 transition-colors hover:bg-surface-2">
                  <td className={`${td} text-[13px] text-muted whitespace-nowrap`}>
                    {new Date(l.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td className={`${td} font-semibold text-ink whitespace-nowrap`}>{l.name}</td>
                  <td className={`${td} text-muted whitespace-nowrap`}>
                    {l.phone
                      ? <a href={`tel:${l.phone}`} className="hover:text-ink transition-colors">{l.phone}</a>
                      : '—'}
                  </td>
                  <td className={`${td} whitespace-nowrap`}>
                    <a
                      href={`https://instagram.com/${l.instagramUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-ink hover:underline underline-offset-2"
                    >
                      @{l.instagramUsername}
                      <Icons.ArrowUpRight size={12} className="text-faint" />
                    </a>
                  </td>
                  <td className={`${td} text-muted`}>{l.productName || '—'}</td>
                  <td className={`${td} text-ink tabular-nums whitespace-nowrap font-semibold`}>
                    {l.price ? `Rs.${l.price}` : '—'}
                  </td>
                  <td className={td}>
                    <StatusSelect
                      value={l.status}
                      options={LEAD_STATUSES}
                      styleMap={STATUS_STYLE}
                      onChange={(v) => setStatus(l, v)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && (tab === 'active' ? active : closed).length > visible.length && (
          <div className="px-5 py-3.5 border-t border-line text-center">
            <Link to="/admin/leads" className="text-[13px] font-semibold" style={{ color: 'var(--admin-accent)' }}>
              View all {(tab === 'active' ? active : closed).length} leads →
            </Link>
          </div>
        )}
      </Panel>

      <Toast toast={toast} />
    </div>
  );
}
