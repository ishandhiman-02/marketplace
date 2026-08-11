import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { orderOnInstagram } from '../../config/site';
import { useDark } from '../../context/useDark';
import { OFFERS } from '../../data/offers';
import { AudioPlayer } from '../ui/AudioPlayer';
import { CountdownTimer } from '../ui/CountdownTimer';
import { IgIcon } from '../ui/IgIcon';
import { VideoOfferCard } from '../ui/VideoOfferCard';

export function OffersSection() {
  const { dark } = useDark();
  return (
    <section id="offers" className="py-24 relative overflow-hidden" style={{ background: dark ? '#0f172a' : '#f8faff' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(79,70,229,0.04) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', color: '#d97706' }}
          >
            <Icons.Zap size={12} />
            Limited Time
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4" style={{ color: dark ? '#f8fafc' : '#0f172a', letterSpacing: '-1.5px' }}>
            Exclusive offers
          </h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: dark ? '#94a3b8' : '#475569' }}>
            Hand-picked deals in every format — video, audio, image, and text. Don&apos;t miss out.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {OFFERS.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: dark ? '#1e293b' : '#ffffff',
                border: `1px solid ${offer.color}30`,
                boxShadow: `0 4px 20px rgba(15,23,42,0.06)`,
              }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${offer.color}15`, border: `1px solid ${offer.color}25` }}
                    >
                      {offer.type === 'video' && <Icons.Video size={14} style={{ color: offer.color }} />}
                      {offer.type === 'audio' && <Icons.Music size={14} style={{ color: offer.color }} />}
                      {offer.type === 'image' && <Icons.Image size={14} style={{ color: offer.color }} />}
                      {offer.type === 'text' && <Icons.FileText size={14} style={{ color: offer.color }} />}
                    </div>
                    <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: offer.color }}>
                      {offer.badge}
                    </span>
                  </div>
                  {offer.discount && (
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: `${offer.color}15`, color: offer.color, border: `1px solid ${offer.color}25` }}
                    >
                      {offer.discount}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold mb-2 leading-snug" style={{ color: dark ? '#f1f5f9' : '#0f172a', letterSpacing: '-0.4px' }}>
                  {offer.title}
                </h3>
                <p className="text-sm mb-5 leading-relaxed" style={{ color: dark ? '#94a3b8' : '#475569' }}>
                  {offer.description}
                </p>

                {offer.type === 'video' && <VideoOfferCard offer={offer} />}
                {offer.type === 'audio' && <AudioPlayer offer={offer} />}
                {offer.type === 'image' && (
                  <div className="rounded-xl overflow-hidden mb-2" style={{ height: 180 }}>
                    <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                  </div>
                )}
                {offer.type === 'text' && (
                  <div className="grid grid-cols-2 gap-2">
                    {offer.highlights.map((h) => (
                      <div
                        key={h}
                        className="flex items-center gap-2 p-3 rounded-lg text-xs font-medium"
                        style={{ background: `${offer.color}08`, border: `1px solid ${offer.color}18`, color: dark ? '#94a3b8' : '#334155' }}
                      >
                        <Icons.Check size={12} style={{ color: offer.color, flexShrink: 0 }} />
                        {h}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: `1px solid ${dark ? '#334155' : '#f1f5f9'}` }}>
                  {offer.type === 'video' ? (
                    <CountdownTimer />
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-medium" style={{ color: '#94a3b8' }}>
                      <Icons.Clock size={12} />
                      Limited availability
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => orderOnInstagram({ title: offer.title })}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ml-auto shadow-md"
                    style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color: '#fff' }}
                  >
                    <IgIcon size={12} />
                    Claim via Instagram
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
