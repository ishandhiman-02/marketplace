import { motion, useReducedMotion } from 'framer-motion';
import { COURSES } from '../../data/products';
import { openInstagram } from '../../lib/instagram';
import { IconChip } from '../ui/IconChip';
import { Eyebrow } from '../ui/Eyebrow';

// Reference f08: 3 tilted pricing cards, beech wala orange "Popular".
// Data COURSES ke YouTube Premium variants se aata hai — hardcode nahi.
const YT_ID = 3;
const CARD_META = [
  { rotate: -6, y: 10, popular: false, note: 'One-time payment' },
  { rotate: 4, y: -14, popular: true, note: 'Most ordered plan' },
  { rotate: 10, y: 26, popular: false, note: 'Longest access' },
];

function PriceCard({ variant, meta, reduce }) {
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { y: 60, rotate: 0, opacity: 0 }}
      whileInView={reduce ? { opacity: 1 } : { y: meta.y, rotate: meta.rotate, opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ type: 'spring', stiffness: 120, damping: 15 }}
      whileHover={reduce ? undefined : { rotate: 0, y: meta.y - 8, scale: 1.03, zIndex: 30 }}
      onClick={openInstagram}
      className={`cursor-pointer select-none w-[210px] p-6 flex flex-col ${
        meta.popular ? 'text-white z-20' : 'bg-surface border border-line text-ink z-10'
      }`}
      style={{
        borderRadius: 24,
        background: meta.popular ? '#F2740B' : undefined,
        boxShadow: meta.popular ? '0 24px 50px rgba(242,116,11,0.35)' : '0 14px 34px rgba(15,23,42,0.10)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <span className={`text-[13px] font-semibold ${meta.popular ? 'text-white' : 'text-muted'}`}>
          {variant.label}
        </span>
        {meta.popular && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white"
            style={{ color: '#0f172a' }}
          >
            Popular
          </span>
        )}
      </div>

      <div className="flex items-start gap-0.5 mb-1">
        <span className={`text-[15px] font-bold mt-1.5 ${meta.popular ? 'text-white/80' : 'text-faint'}`}>Rs.</span>
        <span className="font-bold leading-none" style={{ fontSize: 56, letterSpacing: '-2.5px' }}>
          {variant.price}
        </span>
      </div>

      {/* orange pe chhota white text contrast fail karta hai — near-black */}
      <span
        className="text-[11px] font-medium mt-4"
        style={{ color: meta.popular ? 'rgba(15,23,42,0.75)' : 'var(--color-faint)' }}
      >
        {meta.note}
      </span>
    </motion.div>
  );
}

export function PricingFan() {
  const reduce = useReducedMotion();
  const yt = COURSES.find((c) => c.id === YT_ID);
  if (!yt?.variants) return null;

  return (
    <section className="py-24 bg-canvas overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <IconChip icon="Play" size={44} className="mb-6" />
          <Eyebrow className="mb-4">Bestseller</Eyebrow>
          <h2
            className="font-bold text-faint"
            style={{ fontSize: 'clamp(34px, 4.5vw, 56px)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
          >
            {yt.title}
            <br />
            <span className="text-ink">plans.</span>
          </h2>
          <p className="text-[15px] leading-relaxed text-muted max-w-sm mt-5">
            Our most-ordered deal. Pick a duration, DM us on Instagram, and your premium
            starts within minutes.
          </p>
        </div>

        {/* desktop: fan · mobile: stack */}
        <div className="hidden md:flex items-center justify-center" style={{ minHeight: 380 }}>
          <div className="flex items-center" style={{ gap: -10 }}>
            {yt.variants.map((v, i) => (
              <div key={v.label} style={{ marginLeft: i === 0 ? 0 : -26 }}>
                <PriceCard variant={v} meta={CARD_META[i % CARD_META.length]} reduce={reduce} />
              </div>
            ))}
          </div>
        </div>

        <div className="md:hidden flex flex-col items-center gap-5">
          {yt.variants.map((v, i) => (
            <PriceCard
              key={v.label}
              variant={v}
              meta={{ ...CARD_META[i % CARD_META.length], rotate: CARD_META[i % CARD_META.length].popular ? 2 : -2, y: 0 }}
              reduce={reduce}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
