import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useCatalog } from '../../context/useCatalog';
import { mediaUrl } from '../../lib/api';
import { orderOnInstagram } from '../../config/site';
import { useSettings } from '../../context/useSettings';
import { Eyebrow } from '../ui/Eyebrow';
import { PillButton } from '../ui/PillButton';
import { IgIcon } from '../ui/IgIcon';
import { FannedStack } from '../ui/FannedStack';

/**
 * Six products for the fan-out.
 *
 * This used to be a hard-coded list of row ids, which stopped working the
 * moment the catalogue came from the database — ids are uuids now, and the
 * client can delete any product at any time. Picking one per category
 * instead keeps the fan visually varied whatever the catalogue holds, and
 * falls back to filling from the front if there are fewer than six
 * categories.
 */
function pickHeroProducts(products, count = 6) {
  const seen = new Set();
  const picks = [];

  for (const p of products) {
    if (picks.length === count) break;
    if (seen.has(p.category)) continue;
    seen.add(p.category);
    picks.push(p);
  }
  for (const p of products) {
    if (picks.length === count) break;
    if (!picks.includes(p)) picks.push(p);
  }
  return picks;
}

function HeroTile({ product, compact = false }) {
  const Icon = Icons[product.icon] || Icons.HelpCircle;
  return (
    <div
      onClick={() => orderOnInstagram({
        title: product.title,
        variant: product.subtitle,
        price: product.price,
      })}
      className="relative overflow-hidden cursor-pointer select-none"
      style={{
        borderRadius: 22,
        aspectRatio: '3 / 4',
        boxShadow: '0 18px 40px rgba(15,23,42,0.22)',
      }}
    >
      <img
        src={mediaUrl(product.image)}
        alt={product.title}
        draggable={false}
        className="w-full h-full object-cover"
      />
      {/* brand-colour tint — gives repeated stock images their own identity */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(185deg, transparent 30%, ${product.color}B8 125%)` }}
      />
      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center">
        <Icon size={15} style={{ color: product.color }} />
      </div>
      <div
        className="absolute bottom-3 left-3 rounded-full px-3 py-1.5 font-semibold"
        style={{ background: 'rgba(255,255,255,0.94)', color: '#0f172a', fontSize: compact ? 11 : 12 }}
      >
        {product.title} · Rs.{product.price}
      </div>
    </div>
  );
}

const HEADLINE_LINES = [
  { text: 'Get premium,', accent: false },
  { text: 'pay less,', accent: true },
  { text: 'stream more.', accent: false },
];

export function HeroSection() {
  const { hero } = useSettings();
  const { products } = useCatalog();
  const picks = pickHeroProducts(products);

  return (
    <section id="top" className="relative bg-canvas overflow-hidden">
      <div
        className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-[1.05fr_1fr] gap-8 md:gap-4 items-center"
        style={{ minHeight: 'calc(100dvh - 64px)', paddingTop: 32, paddingBottom: 48 }}
      >
        {/* left — copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Eyebrow className="mb-6">{hero.eyebrow}</Eyebrow>
          </motion.div>

          <h1
            className="font-bold mb-7"
            style={{ fontSize: 'clamp(44px, 6.5vw, 84px)', letterSpacing: '-0.04em', lineHeight: 0.98 }}
          >
            {HEADLINE_LINES.map((line, i) => (
              <motion.span
                key={line.text}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.09, duration: 0.6, ease: 'easeOut' }}
                className={`block ${line.accent ? 'text-wine' : 'text-ink'}`}
              >
                {line.text}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="text-[15px] leading-relaxed text-muted max-w-md mb-9"
          >
            Netflix, Spotify, ChatGPT, Canva, Coursera and 10+ more — at prices that make sense
            for students. Order in a DM, get access in minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.68 }}
            className="flex items-center gap-4 flex-wrap"
          >
            <PillButton variant="ig" size="lg" onClick={() => orderOnInstagram()} className="shadow-lg">
              <IgIcon size={16} />
              {hero.ctaLabel}
            </PillButton>
            <a
              href="#deals"
              className="text-sm font-semibold text-ink inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"
            >
              Browse deals
              <Icons.ArrowDown size={15} />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center gap-6 flex-wrap mt-12"
          >
            {[
              { icon: 'ShieldCheck', text: 'Verified accounts' },
              { icon: 'Zap', text: 'Instant delivery' },
              { icon: 'MessageCircle', text: '24/7 DM support' },
            ].map(({ icon, text }) => {
              const Icon = Icons[icon] || Icons.HelpCircle;
              return (
                <div key={text} className="flex items-center gap-2 text-xs font-medium text-muted">
                  <Icon size={14} className="text-ink" />
                  {text}
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* right — fanned stack (desktop) */}
        <div className="hidden md:block">
          <FannedStack
            items={picks.map((p) => ({ key: p.id, node: <HeroTile product={p} /> }))}
            width={225}
            height={470}
            spreadX={62}
            spreadY={16}
          />
        </div>

        {/* mobile — scroll-snap row */}
        <div className="md:hidden -mx-6 px-6 flex gap-4 overflow-x-auto pb-2" data-lenis-prevent style={{ scrollSnapType: 'x mandatory' }}>
          {picks.slice(0, 4).map((p) => (
            <div key={p.id} className="w-[170px] shrink-0" style={{ scrollSnapAlign: 'center' }}>
              <HeroTile product={p} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
