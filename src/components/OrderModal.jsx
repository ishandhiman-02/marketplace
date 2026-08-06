import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { createLead } from '../services/leads';
import { onOrderRequest, completeOrder } from '../config/site';
import { IgIcon } from './ui/IgIcon';

const REMEMBER_KEY = 'substore-buyer';
const field = 'px-3.5 py-2.5 rounded-xl border border-line bg-canvas text-ink text-sm outline-none focus:border-ink transition-colors w-full';

/**
 * Instagram DM kholne se pehle chhota form.
 * Wajah: purchase DM pe hota hai, isliye website ko warna kabhi pata hi nahi
 * chalta ki kaun khareed raha hai. Form optional hai — "seedha DM karo" link
 * hamesha maujood hai, warna kuch customers bhaag jaayenge.
 */
export function OrderModal() {
  const [item, setItem] = useState(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => onOrderRequest((requested) => {
    try {
      const saved = JSON.parse(localStorage.getItem(REMEMBER_KEY) || '{}');
      setName(saved.name || '');
      setUsername(saved.username || '');
      setPhone(saved.phone || '');
    } catch { /* ignore */ }
    setError(null);
    setItem(requested);
  }), []);

  const close = () => setItem(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createLead({
        name,
        instagramUsername: username,
        phone,
        productName: item?.detail?.title ? [item.detail.title, item.detail.variant].filter(Boolean).join(' — ') : null,
        price: item?.detail?.price ?? null,
      });
      try {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({ name, username, phone }));
      } catch { /* private mode */ }
      completeOrder(item);
      close();
    } catch (err) {
      // lead save na ho paaye to bhi customer ko roka nahi jaata
      setError(`${err.message} — phir bhi Instagram khol rahe hain.`);
      setTimeout(() => { completeOrder(item); close(); }, 1400);
    } finally {
      setBusy(false);
    }
  };

  const skip = () => { completeOrder(item); close(); };

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0" style={{ background: 'rgba(15,23,42,0.5)' }}
            onClick={close}
          />
          <motion.form
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            onSubmit={submit}
            className="relative w-full max-w-sm bg-surface border border-line p-6 flex flex-col gap-4"
            style={{ borderRadius: 26 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink" style={{ letterSpacing: '-0.4px' }}>Almost there</h2>
                <p className="text-[13px] text-muted mt-0.5">Details bhar dein, hum DM pe pehchan lenge.</p>
              </div>
              <button type="button" onClick={close} aria-label="Close" className="text-muted hover:text-ink cursor-pointer">
                <Icons.X size={19} />
              </button>
            </div>

            {item.detail?.title && (
              <div className="px-3.5 py-3 rounded-xl bg-surface-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-ink truncate">{item.detail.title}</div>
                  {item.detail.variant && <div className="text-[11px] text-faint truncate">{item.detail.variant}</div>}
                </div>
                {item.detail.price != null && (
                  <span className="text-[15px] font-bold text-ink shrink-0">Rs.{item.detail.price}</span>
                )}
              </div>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-muted">Naam *</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={field} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-muted">Instagram username *</span>
              <input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@yourhandle" className={field} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-muted">Phone <span className="font-normal text-faint">(optional)</span></span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
            </label>

            {error && (
              <div role="alert" className="text-[12px] px-3 py-2 rounded-xl" style={{ background: '#FEE2E2', color: '#991B1B' }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="py-3 rounded-full text-sm font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)' }}
            >
              <IgIcon size={15} />
              {busy ? 'Opening…' : 'Instagram pe order karo'}
            </button>

            <button type="button" onClick={skip} className="text-[12px] text-faint hover:text-muted cursor-pointer">
              Form bharna nahi hai? Seedha DM karo
            </button>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}
