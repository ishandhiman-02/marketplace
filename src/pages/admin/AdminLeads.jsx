import { useState, useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';
import {
  listLeads, updateLead, deleteLead, downloadCsv, LEAD_STATUSES, STATUS_STYLE,
} from '../../services/leads';
import { PageHeader } from '../../components/admin/PageHeader';
import { SearchInput } from '../../components/admin/SearchInput';
import { Pagination } from '../../components/admin/Pagination';
import { usePagination } from '../../components/admin/usePagination';
import { Segmented } from '../../components/admin/Segmented';
import { Panel, EmptyState, SkeletonRows, ErrorBar } from '../../components/admin/Panel';
import { StatusSelect } from '../../components/admin/StatusSelect';
import { Toast } from '../../components/admin/Toast';
import { useToast } from '../../components/admin/useToast';
import { field, btnGhost, iconBtn, th, td } from '../../components/admin/ui';

const RANGES = [
  { value: 1, label: 'Today' },
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: null, label: 'All' },
];

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [days, setDays] = useState(null);
  const [search, setSearch] = useState('');
  const { toast, show } = useToast();

  const load = () => {
    setLoading(true);
    listLeads({ status: status || null, sinceDays: days })
      .then((rows) => { setLeads(rows); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, days]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      l.instagramUsername.toLowerCase().includes(q)
      || l.name.toLowerCase().includes(q)
      || (l.productName || '').toLowerCase().includes(q));
  }, [leads, search]);

  const paged = usePagination(visible, 25, `${search}|${status}|${days}`);

  const patch = async (lead, changes, quiet = false) => {
    const before = leads;
    setLeads((l) => l.map((x) => (x.id === lead.id ? { ...x, ...changes } : x)));
    try {
      const updated = await updateLead(lead.id, changes);
      setLeads((l) => l.map((x) => (x.id === lead.id ? updated : x)));
      if (!quiet) show('Saved');
    } catch (e) {
      setLeads(before);
      show(e.message, 'error');
    }
  };

  const remove = async (lead) => {
    if (!window.confirm(`The lead for ${lead.name} will be deleted. Are you sure?`)) return;
    try {
      await deleteLead(lead.id);
      setLeads((l) => l.filter((x) => x.id !== lead.id));
      show('Deleted');
    } catch (e) { show(e.message, 'error'); }
  };

  const filtered = search || status || days;

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle="Who is buying — captured just before the Instagram DM opens."
      >
        <button
          type="button"
          onClick={() => downloadCsv(visible)}
          disabled={visible.length === 0}
          className={btnGhost}
        >
          <Icons.Download size={15} /> Export CSV
        </button>
      </PageHeader>

      <ErrorBar message={error} onRetry={load} />

      <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search name, @username or product…"
          label="Search leads"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          className={`${field} w-auto`}
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
        </select>

        <Segmented
          ariaLabel="Filter by date"
          value={days}
          onChange={setDays}
          options={RANGES}
        />

      </div>

      <Panel>
        <span ref={paged.anchorRef} aria-hidden="true" />

        {/* Phone and tablet: one card per lead.
            This is the widest table in the panel (980px) and the one most
            likely to be read on a phone — the client checks new orders away
            from a desk. Status and notes stay editable here. */}
        <div className="lg:hidden divide-y divide-[var(--color-line)]">
          {loading && [0, 1, 2].map((i) => (
            <div key={i} className="p-4 flex flex-col gap-2">
              <span className="h-4 w-1/3 rounded-md bg-surface-2 animate-pulse" />
              <span className="h-3 w-2/3 rounded-md bg-surface-2 animate-pulse" />
            </div>
          ))}

          {!loading && visible.length === 0 && (
            <EmptyState
              icon={filtered ? 'SearchX' : 'Inbox'}
              title={filtered ? 'Nothing matches these filters' : 'No leads yet'}
              hint={filtered
                ? 'Try a wider date range, or clear the search box.'
                : 'A lead is saved every time someone fills the order form on the site.'}
            />
          )}

          {!loading && paged.pageItems.map((l) => (
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

              {l.productName && (
                <div className="text-[13px] text-muted mt-1.5">{l.productName}</div>
              )}

              {l.phone && (
                <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1.5 text-[13px] text-muted mt-1.5 hover:text-ink">
                  <Icons.Phone size={12} />
                  {l.phone}
                </a>
              )}

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <StatusSelect
                  value={l.status}
                  options={LEAD_STATUSES}
                  styleMap={STATUS_STYLE}
                  onChange={(v) => patch(l, { status: v }, true)}
                />
                <input
                  defaultValue={l.notes || ''}
                  onBlur={(e) => e.target.value !== (l.notes || '') && patch(l, { notes: e.target.value })}
                  placeholder="Add note…"
                  aria-label={`Note for ${l.name}`}
                  className="flex-1 min-w-[120px] px-2.5 py-1.5 rounded-lg border border-line bg-surface text-[12px]
                             text-ink outline-none focus:border-[var(--admin-accent)] placeholder:text-faint"
                />
                <button
                  type="button"
                  onClick={() => remove(l)}
                  aria-label={`Delete lead for ${l.name}`}
                  className={iconBtn}
                  style={{ color: 'var(--admin-danger)' }}
                >
                  <Icons.Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block overflow-x-auto" data-lenis-prevent>
          <table className="w-full text-sm" style={{ minWidth: 980 }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)' }}>
                {['Date', 'Name', 'Instagram', 'Phone', 'Product', 'Price', 'Status', 'Notes', ''].map((h, i) => (
                  <th key={h || i} className={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonRows rows={5} cols={9} />}

              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      icon={filtered ? 'SearchX' : 'Inbox'}
                      title={filtered ? 'Nothing matches these filters' : 'No leads yet'}
                      hint={filtered
                        ? 'Try a wider date range, or clear the search box.'
                        : 'A lead is saved every time someone fills the order form on the site.'}
                    />
                  </td>
                </tr>
              )}

              {!loading && paged.pageItems.map((l) => (
                <tr key={l.id} className="border-b border-line last:border-0 transition-colors hover:bg-surface-2">
                  <td className={`${td} text-[13px] text-muted whitespace-nowrap`}>
                    {new Date(l.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    <span className="text-faint block text-[11px]">
                      {new Date(l.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className={`${td} font-semibold text-ink whitespace-nowrap`}>{l.name}</td>
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
                  <td className={`${td} text-muted whitespace-nowrap`}>
                    {l.phone
                      ? <a href={`tel:${l.phone}`} className="hover:text-ink transition-colors">{l.phone}</a>
                      : '—'}
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
                      onChange={(v) => patch(l, { status: v }, true)}
                    />
                  </td>
                  <td className={td}>
                    <input
                      defaultValue={l.notes || ''}
                      onBlur={(e) => e.target.value !== (l.notes || '') && patch(l, { notes: e.target.value })}
                      placeholder="Add note…"
                      aria-label={`Note for ${l.name}`}
                      className="px-2.5 py-1.5 rounded-lg border border-line bg-surface text-[12px] text-ink
                                 outline-none focus:border-[var(--admin-accent)] w-40 placeholder:text-faint"
                    />
                  </td>
                  <td className={td}>
                    <button
                      type="button"
                      onClick={() => remove(l)}
                      aria-label={`Delete lead for ${l.name}`}
                      className={iconBtn}
                      style={{ color: 'var(--admin-danger)' }}
                    >
                      <Icons.Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && (
          <Pagination
            page={paged.page}
            pageCount={paged.pageCount}
            from={paged.from}
            to={paged.to}
            total={paged.total}
            onGo={paged.goTo}
            unit="leads"
          />
        )}
      </Panel>

      <Toast toast={toast} />
    </div>
  );
}
