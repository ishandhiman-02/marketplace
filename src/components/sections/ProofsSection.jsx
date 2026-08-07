import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { listProofs } from '../../services/proofs';
import { useDark } from '../../context/useDark';

/** PDF requirement #1 — screenshots of real orders, managed from the admin panel */
export function ProofsSection() {
  const { dark } = useDark();
  const [proofs, setProofs] = useState([]);
  const [open, setOpen] = useState(null); // lightbox index

  useEffect(() => {
    listProofs().then(setProofs).catch(() => setProofs([]));
  }, []);

  useEffect(() => {
    if (open === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % proofs.length);
      if (e.key === 'ArrowLeft') setOpen((i) => (i - 1 + proofs.length) % proofs.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, proofs.length]);

  // no proofs at all — hide the whole section, an empty one looks bad
  if (proofs.length === 0) return null;

  return (
    <section id="proofs" className="py-24" style={{ background: dark ? '#0f172a' : '#FAFAFA' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="text-[11px] font-semibold uppercase mb-5" style={{ letterSpacing: '0.16em', color: dark ? '#879793' : '#9AA3A0' }}>
            Real orders · Real proof
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4" style={{ color: dark ? '#f8fafc' : '#0f172a', letterSpacing: '-1.8px' }}>
            Delivered, not promised.
          </h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: dark ? '#94a3b8' : '#6B7570' }}>
            A screenshot after every order — so you can see the receipts before you trust us.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {proofs.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 4) * 0.06 }}
              whileHover={{ y: -4 }}
              onClick={() => setOpen(i)}
              className="relative overflow-hidden cursor-pointer group"
              style={{ borderRadius: 20, aspectRatio: '4 / 5' }}
            >
              <img src={p.imageUrl} alt={p.caption || 'Order proof'} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              {(p.productName || p.caption) && (
                <div className="absolute inset-x-0 bottom-0 p-3" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.85), transparent)' }}>
                  <div className="text-[11px] font-semibold text-white truncate">{p.productName || p.caption}</div>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[90] flex items-center justify-center p-6"
            style={{ background: 'rgba(15,23,42,0.9)' }}
          >
            <button onClick={() => setOpen(null)} aria-label="Close" className="absolute top-6 right-6 text-white/80 hover:text-white cursor-pointer">
              <Icons.X size={26} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setOpen((i) => (i - 1 + proofs.length) % proofs.length); }}
              aria-label="Previous"
              className="absolute left-4 md:left-8 w-11 h-11 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white cursor-pointer"
            >
              <Icons.ChevronLeft size={20} />
            </button>
            <motion.img
              key={proofs[open].id}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={proofs[open].imageUrl}
              alt={proofs[open].caption || 'Order proof'}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-full object-contain"
              style={{ borderRadius: 18 }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); setOpen((i) => (i + 1) % proofs.length); }}
              aria-label="Next"
              className="absolute right-4 md:right-8 w-11 h-11 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white cursor-pointer"
            >
              <Icons.ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
