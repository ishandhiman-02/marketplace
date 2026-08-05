import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { OFFERS } from '../../data/offers';
import { openInstagram } from '../../lib/instagram';
import { Eyebrow } from '../ui/Eyebrow';
import { PillButton } from '../ui/PillButton';

// Static waveform — audio offer ke liye (reference bento flat media blocks use karta hai)
const WAVE_BARS = [3, 5, 7, 4, 8, 6, 9, 5, 7, 4, 6, 8, 5, 7, 3, 9, 6, 4, 8, 5, 6, 3, 7, 5];

function OfferMedia({ offer }) {
  if (offer.type === 'video') {
    return (
      <div className="relative w-full h-full">
        <img src={offer.thumbnail} alt={offer.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'rgba(15,23,42,0.35)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xl">
            <Icons.Play size={20} style={{ color: '#0f172a', marginLeft: 2 }} />
          </div>
        </div>
      </div>
    );
  }
  if (offer.type === 'image') {
    return <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />;
  }
  if (offer.type === 'audio') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-5" style={{ background: offer.color }}>
        <div className="flex items-end gap-1" style={{ height: 52 }}>
          {WAVE_BARS.map((h, i) => (
            <div key={i} className="rounded-full bg-white/85" style={{ width: 3.5, height: h * 5.5 }} />
          ))}
        </div>
        <div className="flex items-center gap-2 text-[12px] font-semibold text-white/90">
          <Icons.Headphones size={14} />
          {offer.audioDuration}
        </div>
      </div>
    );
  }
  // text offer
  return (
    <div className="w-full h-full bg-surface-2 p-5 grid grid-cols-2 gap-2.5 content-center">
      {offer.highlights.map((h) => (
        <div
          key={h}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface border border-line text-[11px] font-medium text-muted"
        >
          <Icons.Check size={12} style={{ color: offer.color, flexShrink: 0 }} />
          {h}
        </div>
      ))}
    </div>
  );
}

export function OffersBento() {
  return (
    <section id="offers" className="py-24 bg-canvas">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Eyebrow className="mb-5">Limited time</Eyebrow>
          <h2
            className="font-bold text-ink"
            style={{ fontSize: 'clamp(34px, 4.5vw, 60px)', letterSpacing: '-0.03em', lineHeight: 1.02 }}
          >
            Exclusive offers.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {OFFERS.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 2) * 0.1 }}
              className={`bg-surface border border-line flex flex-col ${i % 2 === 1 ? 'md:mt-16' : ''}`}
              style={{ borderRadius: 26, padding: 10 }}
            >
              <div className="relative overflow-hidden" style={{ borderRadius: 18, height: 230 }}>
                <OfferMedia offer={offer} />
                {offer.discount && (
                  <span
                    className="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.94)', color: '#0f172a' }}
                  >
                    {offer.discount}
                  </span>
                )}
              </div>

              <div className="px-4 pt-5 pb-4 flex flex-col flex-1">
                <div
                  className="text-[10px] font-semibold uppercase mb-2.5"
                  style={{ letterSpacing: '0.14em', color: offer.color }}
                >
                  {offer.badge}
                </div>
                <h3 className="font-bold text-[19px] leading-snug text-ink mb-2" style={{ letterSpacing: '-0.4px' }}>
                  {offer.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-muted mb-5 line-clamp-2">{offer.description}</p>
                <div className="mt-auto">
                  <PillButton variant="outline" size="sm" onClick={openInstagram}>
                    Claim via Instagram
                    <Icons.ArrowUpRight size={13} />
                  </PillButton>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
