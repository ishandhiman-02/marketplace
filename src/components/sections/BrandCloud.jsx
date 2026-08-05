import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { BRANDS, BRAND_SIZES } from '../../data/brands';
import { TESTIMONIALS } from '../../data/social';
import { BrandTile } from '../ui/BrandTile';
import { SpeechBubble } from '../ui/SpeechBubble';
import { IconChip } from '../ui/IconChip';

// f05: center headline, chaaro taraf brand tiles ka cloud.
// Tiles edges pe canvas se bahar bleed karte hain — overflow: clip crop kar deta hai.
const TOP = BRANDS.slice(0, 8);
const BOTTOM = BRANDS.slice(8, 16);
const TOP_OFFSETS = [26, -8, 44, 6, 34, -12, 20, 2];
const BOTTOM_OFFSETS = [-4, 30, 2, 42, -10, 24, 8, 36];
const ROTATIONS = [-6, 4, -3, 6, -5, 3, -4, 5];

function TileBand({ brands, offsets, edge }) {
  const reduce = useReducedMotion();
  return (
    <div className={`flex justify-between items-start -mx-8 md:-mx-14 px-1 ${edge === 'top' ? 'mb-6' : 'mt-6'}`}>
      {brands.map((b, i) => (
        <motion.div
          key={b.name}
          initial={reduce ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 16,
            // center se bahar ki taraf radiating stagger
            delay: Math.abs(i - (brands.length - 1) / 2) * 0.06,
          }}
          whileHover={reduce ? undefined : { scale: 1.12, rotate: 0 }}
          className={`${i % 3 === 2 ? 'hidden lg:block' : i % 2 === 1 ? 'hidden sm:block' : ''}`}
          style={{ marginTop: offsets[i] }}
        >
          <BrandTile {...b} size={BRAND_SIZES[b.size]} rotate={ROTATIONS[i]} />
        </motion.div>
      ))}
    </div>
  );
}

export function BrandCloud() {
  const [qi, setQi] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setQi((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const q = TESTIMONIALS[qi];
  const bubbleA = TESTIMONIALS[0]; // Arjun · Coursera Plus
  const bubbleB = TESTIMONIALS[5]; // Anjali · Netflix + Prime

  return (
    <section className="py-24 bg-canvas overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="relative">
          <TileBand brands={TOP} offsets={TOP_OFFSETS} edge="top" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="absolute left-[6%] top-[52%] hidden md:block"
          >
            <SpeechBubble rotate={-7}>
              @{bubbleA.name.split(' ')[0].toLowerCase()} · {bubbleA.deal}
            </SpeechBubble>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55 }}
            className="absolute right-[5%] top-[46%] hidden md:block"
          >
            <SpeechBubble rotate={6}>
              @{bubbleB.name.split(' ')[0].toLowerCase()} · {bubbleB.deal}
            </SpeechBubble>
          </motion.div>

          {/* center */}
          <div className="text-center max-w-2xl mx-auto py-10 md:py-14 relative z-10">
            <IconChip icon="GraduationCap" size={44} className="mx-auto mb-6" />
            <h2
              className="font-bold text-ink mb-4"
              style={{ fontSize: 'clamp(36px, 5vw, 68px)', letterSpacing: '-0.035em', lineHeight: 1.02 }}
            >
              Sab kuch,
              <br />
              ek hi jagah.
            </h2>
            <p className="text-[14px] text-muted mb-8">
              Netflix, Spotify, ChatGPT, Canva &amp; 12 more — one DM away.
            </p>

            {/* rotating testimonial */}
            <div style={{ minHeight: 76 }}>
              <AnimatePresence mode="wait">
                <motion.figure
                  key={q.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="max-w-lg mx-auto"
                >
                  <blockquote className="text-[14px] leading-relaxed text-muted italic line-clamp-2">
                    &ldquo;{q.text}&rdquo;
                  </blockquote>
                  <figcaption className="flex items-center justify-center gap-1.5 mt-2.5 text-[12px] font-semibold text-ink">
                    — {q.name}, <span className="font-normal text-faint">{q.role}</span>
                    <Icons.BadgeCheck size={13} style={{ color: '#10b981' }} />
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            {/* trust metrics */}
            <div className="flex items-center justify-center gap-x-5 gap-y-2 flex-wrap mt-8 text-[12px] font-medium text-faint">
              {['500+ students', '4.9/5 rating', '<30 min delivery', 'Free replacement'].map((m, i, arr) => (
                <span key={m} className="flex items-center gap-5">
                  {m}
                  {i < arr.length - 1 && <span className="w-1 h-1 rounded-full bg-line inline-block" />}
                </span>
              ))}
            </div>
          </div>

          <TileBand brands={BOTTOM} offsets={BOTTOM_OFFSETS} edge="bottom" />
        </div>
      </div>
    </section>
  );
}
