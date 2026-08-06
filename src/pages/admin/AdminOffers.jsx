import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import {
  listDailyOffers, createDailyOffer, updateDailyOffer,
  duplicateDailyOffer, deleteDailyOffer, offerStatus, STATUS_STYLE,
} from '../../services/offers';
import { Toast } from '../../components/admin/Toast';
import { useToast } from '../../components/admin/useToast';

const field = 'px-3.5 py-2.5 rounded-xl border border-line bg-canvas text-ink text-sm outline-none focus:border-ink transition-colors w-full';
const labelCls = 'text-[12px] font-semibold text-muted';

const EMPTY = {
  emoji: '🔥', title: '', subtitle: '', description: '',
  originalPrice: '', dealPrice: '', tag: '', tagColor: '#e50914',
  slots: 5, slotsLeft: 5, expiresAt: '', isActive: true,
};

/** datetime-local input ko ISO chahiye hota hai, aur wapas bhi */
const toLocalInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');

function OfferForm({ offer, onCancel, onSave }) {
  const [form, setForm] = useState(() => (
    offer ? { ...EMPTY, ...offer, expiresAt: toLocalInput(offer.expiresAt) } : EMPTY
  ));
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const savings = (Number(form.originalPrice) || 0) - (Number(form.dealPrice) || 0);

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
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0" style={{ background: 'rgba(15,23,42,0.35)' }} onClick={onCancel} aria-hidden="true" />
      <motion.form
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onSubmit={submit}
        className="relative w-full max-w-lg h-full overflow-y-auto bg-surface border-l border-line p-6 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink" style={{ letterSpacing: '-0.4px' }}>
            {offer ? 'Edit offer' : 'New daily offer'}
          </h2>
          <button type="button" onClick={onCancel} aria-label="Close" className="text-muted hover:text-ink cursor-pointer">
            <Icons.X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-[70px_1fr] gap-3">
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
          <p className="text-[12px] font-semibold -mt-2" style={{ color: '#166534' }}>Customer Rs.{savings} bachaayega</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Tag</span>
            <input value={form.tag || ''} onChange={(e) => set('tag', e.target.value)} placeholder="BUNDLE" className={field} />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className={labelCls}>Tag colour</span>
            <div className="flex items-center gap-2">
              <input type="color" value={form.tagColor || '#e50914'} onChange={(e) => set('tagColor', e.target.value)} className="w-10 h-10 rounded-lg border border-line cursor-pointer shrink-0" />
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
          <span className="text-[11px] text-faint">Khaali chhodenge to offer expire nahi hoga.</span>
        </label>

        <label className="flex items-center gap-2.5">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4" />
          <span className="text-[13px] text-ink">Site pe live karein</span>
        </label>

        <div className="flex items-center gap-3 mt-2 pb-2">
          <button type="submit" disabled={busy} className="px-6 py-2.5 rounded-full text-sm font-semibold bg-ink text-canvas disabled:opacity-45 cursor-pointer">
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-full text-sm font-semibold border border-line text-ink cursor-pointer">
            Cancel
          </button>
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
  const { toast, show } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      setOffers(await listDailyOffers());
      setError(null);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

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
      show('Copy ban gayi — paused hai, edit karke live karein');
    } catch (e) { show(e.message, 'error'); }
  };

  const remove = async (o) => {
    if (!window.confirm(`"${o.subtitle || o.title}" delete ho jaayega. Pakka?`)) return;
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
      show(o.isActive ? 'Paused' : 'Live');
    } catch (e) { show(e.message, 'error'); }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-1.5" style={{ letterSpacing: '-0.5px' }}>Daily Offers</h1>
          <p className="text-sm text-muted">Roz ke deals — products se alag. Duplicate se kal ka offer copy ho jaata hai.</p>
        </div>
        <button onClick={() => setEditing('new')} className="px-5 py-2.5 rounded-full text-sm font-semibold bg-ink text-canvas inline-flex items-center gap-2 cursor-pointer">
          <Icons.Plus size={15} /> New offer
        </button>
      </div>

      {error && <div className="p-4 rounded-2xl text-[13px] mb-6" style={{ background: '#FEE2E2', color: '#991B1B' }}>{error}</div>}
      {loading && <p className="text-sm text-muted">Loading…</p>}
      {!loading && offers.length === 0 && !error && (
        <div className="bg-surface border border-line p-10 text-center" style={{ borderRadius: 22 }}>
          <p className="text-sm text-muted">Abhi koi daily offer nahi hai. &ldquo;New offer&rdquo; se pehla banayein.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map((o) => {
          const st = STATUS_STYLE[offerStatus(o)];
          return (
            <div key={o.id} className="bg-surface border border-line p-5" style={{ borderRadius: 22 }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0">{o.emoji}</span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase text-faint" style={{ letterSpacing: '0.1em' }}>{o.title}</div>
                    <div className="font-semibold text-ink truncate">{o.subtitle}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ background: st.bg, color: st.fg }}>
                  {st.label}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-[22px] font-bold text-ink" style={{ letterSpacing: '-0.8px' }}>Rs.{o.dealPrice}</span>
                {o.originalPrice > 0 && <span className="text-sm line-through text-faint">Rs.{o.originalPrice}</span>}
                {o.savings > 0 && <span className="text-[11px] font-semibold" style={{ color: '#166534' }}>Save Rs.{o.savings}</span>}
              </div>

              <div className="text-[12px] text-muted mb-4">
                {o.slotsLeft} of {o.slots} slots left
                {o.expiresAt && ` · expires ${new Date(o.expiresAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`}
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                <button onClick={() => setEditing(o)} className="px-3 py-1.5 rounded-full text-[12px] font-semibold border border-line text-ink cursor-pointer inline-flex items-center gap-1.5">
                  <Icons.Pencil size={12} /> Edit
                </button>
                <button onClick={() => duplicate(o)} className="px-3 py-1.5 rounded-full text-[12px] font-semibold border border-line text-ink cursor-pointer inline-flex items-center gap-1.5">
                  <Icons.Copy size={12} /> Duplicate
                </button>
                <button onClick={() => toggle(o)} className="px-3 py-1.5 rounded-full text-[12px] font-semibold border border-line text-ink cursor-pointer">
                  {o.isActive ? 'Pause' : 'Go live'}
                </button>
                <button onClick={() => remove(o)} aria-label="Delete" className="ml-auto p-2 rounded-lg cursor-pointer" style={{ color: '#991B1B' }}>
                  <Icons.Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <OfferForm offer={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onSave={save} />
      )}
      <Toast toast={toast} />
    </div>
  );
}
