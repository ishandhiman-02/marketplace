import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useCatalog } from '../../context/useCatalog';
import { orderOnInstagram } from '../../config/site';
import { Eyebrow } from '../ui/Eyebrow';
import { SpeechBubble } from '../ui/SpeechBubble';
import { RoundNavButton } from '../ui/RoundNavButton';
import { CountdownChip } from '../ui/CountdownChip';
import { CountUp } from '../ui/CountUp';
import { IgIcon } from '../ui/IgIcon';

// Daily offers carry no image of their own, so each one gets a picture from
// this list by position — stable per deal, and no image to manage in admin.
const DEAL_IMAGES = ['/assets/business_course_professional_dark.jpg', '/assets/coding_course_laptop_dark.jpg', '/assets/design_course_creative_dark.jpg', '/assets/abstract_purple_blue_gradient_dark.jpg'];

/**
 * The bundled data carried a written-out phrase ("Today only"); the database
 * stores a real timestamp instead, so the phrase is derived here. Offers with
 * no expiry never end, which is a legitimate setting in the admin.
 */
function expiresLabel(deal) {
  if (deal.expiresIn) return deal.expiresIn;       // bundled fallback data
  if (!deal.expiresAt) return 'While slots last';

  const ms = new Date(deal.expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'Ended';

  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return `${Math.max(1, Math.round(ms / 60_000))} min left`;
  if (hours < 24) return `${hours}h left`;
  return `${Math.round(hours / 24)}d left`;
}

export function DealCarousel() {
  const { dailyDeals } = useCatalog();
  const [idx, setIdx] = useState(0);
  const [dirn, setDirn] = useState(1);
  const [hovered, setHovered] = useState(false);
  const n = dailyDeals.length;

  const go = (next) => {
    setDirn(next > idx || (next === 0 && idx === n - 1) ? 1 : -1);
    setIdx(((next % n) + n) % n);
  };

  // 7s auto-advance, paused on hover
  useEffect(() => {
    if (hovered || n < 2) return undefined;
    const t = setInterval(() => {
      setDirn(1);
      setIdx((i) => (i + 1) % n);
    }, 7000);
    return () => clearInterval(t);
  }, [hovered, n]);

  // The client can pause or expire every offer, and deleting one can leave
  // idx past the end of a shorter list. Hide the whole section rather than
  // render an empty frame, and clamp before indexing.
  if (n === 0) return null;

  const deal = dailyDeals[Math.min(idx, n - 1)];
  const img = DEAL_IMAGES[Math.min(idx, n - 1) % DEAL_IMAGES.length];
  const date = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <section id="daily-deals" className="py-24 bg-canvas overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between gap-6 mb-10"
        >
          <div>
            <Eyebrow className="mb-5">Updated daily · {date}</Eyebrow>
            <h2
              className="font-bold text-ink"
              style={{ fontSize: 'clamp(34px, 4.5vw, 60px)', letterSpacing: '-0.03em', lineHeight: 1.02 }}
            >
              Deals of
              <br />
              the day.
            </h2>
          </div>
          <SpeechBubble rotate={5} className="hidden sm:block mb-3">
            @substore
          </SpeechBubble>
        </motion.div>

        <div
          className="relative overflow-hidden"
          style={{ borderRadius: 28 }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <AnimatePresence mode="popLayout" initial={false} custom={dirn}>
            <motion.div
              key={deal.id}
              initial={{ x: dirn * 90, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: dirn * -90, opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="relative w-full"
              style={{ aspectRatio: '21 / 10', minHeight: 'clamp(420px, 46vw, 560px)' }}
            >
              <img src={img} alt={deal.subtitle} className="absolute inset-0 w-full h-full object-cover" />
              {/* tint from the deal's tagColor + a dark gradient below — for text readability */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(100deg, rgba(15,23,42,0.82) 15%, ${deal.tagColor}55 75%, rgba(15,23,42,0.35) 100%)`,
                }}
              />

              {/* top-left: reference wala do-lozenge glyph */}
              <div className="absolute top-5 left-5 md:top-7 md:left-8 flex flex-col gap-1.5">
                <div className="w-8 h-4 rounded-full bg-white/90" />
                <div className="w-8 h-4 rounded-full bg-ink/80" style={{ background: 'rgba(15,23,42,0.75)' }} />
              </div>

              {/* top-right: dots */}
              <div className="absolute top-6 right-6 md:top-8 md:right-9 flex items-center gap-1.5">
                {dailyDeals.map((d, i) => (
                  <button
                    key={d.id}
                    onClick={() => go(i)}
                    aria-label={`Deal ${i + 1}`}
                    className="rounded-full cursor-pointer transition-all"
                    style={{
                      width: i === idx ? 18 : 6,
                      height: 6,
                      background: i === idx ? '#fff' : 'rgba(255,255,255,0.45)',
                    }}
                  />
                ))}
              </div>

              {/* content */}
              <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-6 md:px-12 pb-20 md:pb-24 max-w-2xl">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-xl">{deal.emoji}</span>
                  <span className="text-[12px] font-semibold uppercase text-white/75" style={{ letterSpacing: '0.14em' }}>
                    {deal.title}
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: deal.tagColor }}
                  >
                    {deal.tag}
                  </span>
                </div>

                <h3
                  className="font-bold text-white mb-3"
                  style={{ fontSize: 'clamp(24px, 3.2vw, 42px)', letterSpacing: '-0.025em', lineHeight: 1.08 }}
                >
                  {deal.subtitle}
                </h3>

                <p className="text-[13px] md:text-sm text-white/70 leading-relaxed max-w-md mb-5 hidden sm:block">
                  {deal.description}
                </p>

                <div className="flex items-baseline gap-3 mb-5">
                  <span className="font-bold text-white" style={{ fontSize: 'clamp(30px, 3.6vw, 48px)', letterSpacing: '-2px' }}>
                    <CountUp value={`Rs.${deal.dealPrice}`} />
                  </span>
                  <span className="text-lg line-through text-white/50">Rs.{deal.originalPrice}</span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#DFF264', color: '#0f172a' }}>
                    Save <CountUp value={`Rs.${deal.savings}`} />
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <CountdownChip light />
                  <div className="flex items-center gap-2 text-[12px] font-medium text-white/80">
                    <Icons.Flame size={13} style={{ color: '#DFF264' }} />
                    {deal.slotsLeft} of {deal.slots} slots left · {expiresLabel(deal)}
                  </div>
                </div>
              </div>

              {/* bottom-left CTA */}
              <div className="absolute bottom-5 left-5 md:bottom-7 md:left-8">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => orderOnInstagram({
                    title: deal.subtitle,
                    variant: deal.title,
                    price: deal.dealPrice,
                  })}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-ink bg-white cursor-pointer shadow-lg"
                  style={{ color: '#0f172a' }}
                >
                  <IgIcon size={14} color="#0f172a" />
                  Grab deal
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* bottom-right nav — kept outside AnimatePresence so it doesn't move with the slide */}
          <div className="absolute bottom-5 right-5 md:bottom-7 md:right-8 flex items-center gap-2 z-10">
            <RoundNavButton light dir="prev" onClick={() => go(idx - 1)} />
            <RoundNavButton light dir="next" onClick={() => go(idx + 1)} />
          </div>
        </div>
      </div>
    </section>
  );
}
