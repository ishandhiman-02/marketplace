import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import {
  listDailyOffers, createDailyOffer, updateDailyOffer,
  duplicateDailyOffer, deleteDailyOffer, offerStatus, STATUS_STYLE,
} from '../../services/offers';
import { CountUp } from '../../components/ui/CountUp';
import { PageHeader } from '../../components/admin/PageHeader';
import { SearchInput } from '../../components/admin/SearchInput';
import { Pagination } from '../../components/admin/Pagination';
import { usePagination } from '../../components/admin/usePagination';
import { Segmented } from '../../components/admin/Segmented';
import { Panel, EmptyState, ErrorBar } from '../../components/admin/Panel';
import { Toast } from '../../components/admin/Toast';
import { useToast } from '../../components/admin/useToast';
import { field, labelCls, btnPrimary, btnGhost, btnSmall, iconBtn, radius } from '../../components/admin/ui';

const EMPTY = {
  emoji: '🔥', title: '', subtitle: '', description: '',
  originalPrice: '', dealPrice: '', tag: '', tagColor: '#e50914',
  slots: 5, slotsLeft: 5, expiresAt: '', isActive: true,
};

/** datetime-local inputs need ISO in and ISO out */
const toLocalInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');

function OfferForm({ offer, onCancel, onSave }) {
  const [form, setForm] = useState(() => (
    offer ? { ...EMPTY, ...offer, expiresAt: toLocalInput(offer.expiresAt) } : EMPTY
  ));
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const savings = (Number(form.originalPrice) || 0) - (Number(form.dealPrice) || 0);

  // Escape closes the drawer — expected of anything that covers the page
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave({
        ...form,
        originalPrice: form.originalPrice === '' ? null : Number(form.originalPrice),
        dealPrice: Number(form.dealPrice),
        slots: Number(form.slots) || 0,
        slotsLeft: Number(form.slotsLeft) || 0,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label={offer ? 'Edit offer' : 'New daily offer'}>
      <div className="absolute inset-0" style={{ background: 'rgba(18,48,58,0.4)' }} onClick={onCancel} aria-hidden="true" />
      <motion.form
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onSubmit={submit}
        data-lenis-prevent
        className="relative w-full max-w-lg h-full overflow-y-auto bg-surface border-l border-line flex flex-col"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-surface border-b border-line">
          <h2 className="text-[17px] font-bold text-ink" style={{ letterSpacing: '-0.4px' }}>
            {offer ? 'Edit offer' : 'New daily offer'}
          </h2>
          <button type="button" onClick={onCancel} aria-label="Close" className={iconBtn}>
            <Icons.X size={19} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-[76px_1fr] gap-3">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Emoji</span>
              <input value={form.emoji || ''} onChange={(e) => set('emoji', e.target.value)} className={`${field} text-center text-lg`} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Label *</span>
              <input required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Today's Flash Deal" className={field} />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Deal name *</span>
            <input required value={form.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} placeholder="Netflix 4K + Amazon Prime Bundle" className={field} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Description</span>
            <textarea rows={2} value={form.description || ''} onChange={(e) => set('description', e.target.value)} className={`${field} resize-y`} />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Original price</span>
              <input type="number" min="0" value={form.originalPrice ?? ''} onChange={(e) => set('originalPrice', e.target.value)} className={field} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Deal price *</span>
              <input required type="number" min="0" value={form.dealPrice} onChange={(e) => set('dealPrice', e.target.value)} className={field} />
            </label>
          </div>
          {savings > 0 && (
            <p
              className="text-[12px] font-semibold -mt-2 px-3 py-2 rounded-lg"
              style={{ background: 'var(--admin-success-soft)', color: 'var(--admin-success)' }}
            >
              Customer saves Rs.{savings}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Tag</span>
              <input value={form.tag || ''} onChange={(e) => set('tag', e.target.value)} placeholder="BUNDLE" className={field} />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className={labelCls}>Tag colour</span>
              <div className="flex items-center gap-2">
                <input type="color" aria-label="Tag colour" value={form.tagColor || '#e50914'} onChange={(e) => set('tagColor', e.target.value)} className="w-10 h-10 rounded-lg border border-line shrink-0" />
                <input value={form.tagColor || ''} onChange={(e) => set('tagColor', e.target.value)} className={field} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Total slots</span>
              <input type="number" min="0" value={form.slots} onChange={(e) => set('slots', e.target.value)} className={field} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Slots left</span>
              <input type="number" min="0" max={form.slots} value={form.slotsLeft} onChange={(e) => set('slotsLeft', e.target.value)} className={field} />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Expires at</span>
            <input type="datetime-local" value={form.expiresAt || ''} onChange={(e) => set('expiresAt', e.target.value)} className={field} />
            <span className="text-[11px] text-faint">Leave empty and the offer never expires.</span>
          </label>

          <label className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-surface-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4" />
            <span className="text-[13px] text-ink font-medium">Show live on the site</span>
          </label>
        </div>

        <div className="sticky bottom-0 flex items-center gap-3 px-6 py-4 bg-surface border-t border-line">
          <button type="submit" disabled={busy} className={btnPrimary} style={{ background: 'var(--admin-accent)', color: 'var(--admin-accent-text)' }}>
            {busy ? 'Saving…' : 'Save offer'}
          </button>
          <button type="button" onClick={onCancel} className={btnGhost}>Cancel</button>
        </div>
      </motion.form>
    </div>
  );
}

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const { toast, show } = useToast();

  const load = () => {
    setLoading(true);
    listDailyOffers()
      .then((rows) => { setOffers(rows); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const liveCount = useMemo(() => offers.filter((o) => offerStatus(o) === 'live').length, [offers]);
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return offers.filter((o) => {
      const okTab = tab !== 'live' || offerStatus(o) === 'live';
      const okText = !q
        || (o.subtitle || '').toLowerCase().includes(q)
        || (o.title || '').toLowerCase().includes(q)
        || (o.tag || '').toLowerCase().includes(q);
      return okTab && okText;
    });
  }, [offers, tab, search]);

  const paged = usePagination(visible, 12, `${tab}|${search}`);

  const save = async (data) => {
    try {
      if (editing === 'new') {
        const created = await createDailyOffer(data);
        setOffers((l) => [created, ...l]);
      } else {
        const updated = await updateDailyOffer(editing.id, data);
        setOffers((l) => l.map((o) => (o.id === editing.id ? updated : o)));
      }
      setEditing(null);
      show('Saved');
    } catch (e) { show(e.message, 'error'); }
  };

  const duplicate = async (o) => {
    try {
      const copy = await duplicateDailyOffer(o.id);
      setOffers((l) => [copy, ...l]);
      show('Copy created — it is paused, edit it and go live');
    } catch (e) { show(e.message, 'error'); }
  };

  const remove = async (o) => {
    if (!window.confirm(`"${o.subtitle || o.title}" will be deleted. Are you sure?`)) return;
    try {
      await deleteDailyOffer(o.id);
      setOffers((l) => l.filter((x) => x.id !== o.id));
      show('Deleted');
    } catch (e) { show(e.message, 'error'); }
  };

  const toggle = async (o) => {
    try {
      const updated = await updateDailyOffer(o.id, { ...o, isActive: !o.isActive });
      setOffers((l) => l.map((x) => (x.id === o.id ? updated : x)));
      show(o.isActive ? 'Paused' : 'Live on the site');
    } catch (e) { show(e.message, 'error'); }
  };

  return (
    <div>
      <PageHeader
        title="Daily Offers"
        subtitle="Deals that run for a day — separate from products. Use Duplicate to reuse an offer the next day."
      >
        <button
          type="button"
          onClick={() => setEditing('new')}
          className={btnPrimary}
          style={{ background: 'var(--admin-accent)', color: 'var(--admin-accent-text)' }}
        >
          <Icons.Plus size={16} /> New offer
        </button>
      </PageHeader>

      <ErrorBar message={error} onRetry={load} />

      {offers.length > 0 && (
        <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search offers by name or tag…"
            label="Search offers"
            width="w-full sm:w-72"
          />
          <Segmented
            ariaLabel="Filter offers"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'all', label: 'All', count: offers.length },
              { value: 'live', label: 'Live', count: liveCount },
            ]}
          />
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="bg-surface border border-line p-5 h-44 animate-pulse" style={{ borderRadius: radius }} />
          ))}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <Panel>
          <EmptyState
            icon="Flame"
            title={offers.length === 0
              ? 'No daily offers yet'
              : search ? 'Nothing matches that search' : 'No live offers right now'}
            hint={offers.length === 0
              ? 'A daily offer shows in the carousel at the top of the site, with a countdown and a slot counter.'
              : search
                ? 'Try a shorter search, or clear the box to see every offer.'
                : 'Every offer is paused, expired or sold out. Edit one to put it back on the site.'}
            actionLabel={offers.length === 0 ? 'Create first offer' : undefined}
            onAction={offers.length === 0 ? () => setEditing('new') : undefined}
          />
        </Panel>
      )}

      <span ref={paged.anchorRef} aria-hidden="true" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!loading && paged.pageItems.map((o) => {
          const st = STATUS_STYLE[offerStatus(o)];
          const sold = o.slots > 0 ? Math.round(((o.slots - o.slotsLeft) / o.slots) * 100) : 0;
          return (
            <div key={o.id} className="bg-surface border border-line p-5" style={{ borderRadius: radius }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0" aria-hidden="true">{o.emoji}</span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase text-faint" style={{ letterSpacing: '0.1em' }}>{o.title}</div>
                    <div className="font-semibold text-ink truncate">{o.subtitle}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ background: st.bg, color: st.fg }}>
                  {st.label}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-[24px] font-bold text-ink" style={{ letterSpacing: '-0.9px' }}>
                  <CountUp value={`Rs.${o.dealPrice}`} duration={800} immediate />
                </span>
                {o.originalPrice > 0 && <span className="text-sm line-through text-faint">Rs.{o.originalPrice}</span>}
                {o.savings > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--admin-success-soft)', color: 'var(--admin-success)' }}>
                    Save Rs.{o.savings}
                  </span>
                )}
              </div>

              {/* slot progress — how close the offer is to selling out, at a glance */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-[12px] text-muted mb-1.5">
                  <span>{o.slotsLeft} of {o.slots} slots left</span>
                  {o.expiresAt && (
                    <span className="text-faint">
                      {new Date(o.expiresAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${sold}%`, background: 'var(--admin-accent)' }} />
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button type="button" onClick={() => setEditing(o)} className={btnSmall}>
                  <Icons.Pencil size={12} /> Edit
                </button>
                <button type="button" onClick={() => duplicate(o)} className={btnSmall}>
                  <Icons.Copy size={12} /> Duplicate
                </button>
                <button type="button" onClick={() => toggle(o)} className={btnSmall}>
                  {o.isActive ? <Icons.Pause size={12} /> : <Icons.Play size={12} />}
                  {o.isActive ? 'Pause' : 'Go live'}
                </button>
                <button
                  type="button"
                  onClick={() => remove(o)}
                  aria-label={`Delete ${o.subtitle || o.title}`}
                  className={`${iconBtn} ml-auto`}
                  style={{ color: 'var(--admin-danger)' }}
                >
                  <Icons.Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && visible.length > 0 && (
        <div className="mt-4">
          <Panel>
            <Pagination
              page={paged.page}
              pageCount={paged.pageCount}
              from={paged.from}
              to={paged.to}
              total={paged.total}
              onGo={paged.goTo}
              unit="offers"
            />
          </Panel>
        </div>
      )}

      {editing && (
        <OfferForm offer={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onSave={save} />
      )}
      <Toast toast={toast} />
    </div>
  );
}
