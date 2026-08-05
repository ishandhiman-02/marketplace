import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

import { DarkModeProvider } from '../context/DarkModeContext';
import { useDark } from '../context/useDark';
import { CATEGORIES } from '../data/products';
import { STATS, TRUST_ITEMS, TESTIMONIALS } from '../data/social';
import { Navbar } from '../components/sections/Navbar';
import { HeroSection } from '../components/sections/HeroSection';
import { MarketplaceSection } from '../components/sections/MarketplaceSection';
import { DealCarousel } from '../components/sections/DealCarousel';
import { OffersBento } from '../components/sections/OffersBento';
import { PricingFan } from '../components/sections/PricingFan';
import { OrderCta } from '../components/sections/OrderCta';
import { Footer } from '../components/sections/Footer';
import { FloatingInstagramButton } from '../components/sections/FloatingInstagramButton';

// ─── STATS ───────────────────────────────────────────────────────────────────

function StatsSection() {
  const { dark } = useDark();
  return (
    <section className="py-16 relative" style={{
      background: dark ? '#1e293b' : '#ffffff',
      borderTop: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
      borderBottom: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
    }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => {
            const Icon = Icons[stat.icon] || Icons.HelpCircle;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
                  >
                    <Icon size={18} style={{ color: stat.color }} />
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight mb-1" style={{ color: dark ? '#f8fafc' : '#0f172a', letterSpacing: '-1px' }}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium" style={{ color: dark ? '#94a3b8' : '#64748b' }}>{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── TRUST BANNER ────────────────────────────────────────────────────────────

function TrustBanner() {
  const { dark } = useDark();
  // seamless loop ke liye list do baar — marquee-track -50% shift karta hai
  const row = [...TRUST_ITEMS, ...TRUST_ITEMS];

  return (
    <section className="py-6 md:py-10" style={{ background: dark ? '#0f172a' : '#FAFAFA' }}>
      <div
        className="mx-3 md:mx-6 rounded-3xl overflow-hidden py-5 md:py-7"
        style={{ background: '#DFF264' }}
      >
        <div className="marquee-track flex items-center gap-8 md:gap-12 w-max">
          {row.map(({ icon, text }, i) => {
            const Icon = Icons[icon] || Icons.HelpCircle;
            return (
              <div key={`${text}-${i}`} className="flex items-center gap-3 shrink-0">
                <div
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: '#ffffff' }}
                >
                  <Icon size={17} style={{ color: '#0f172a' }} />
                </div>
                <span
                  className="text-lg md:text-2xl font-semibold whitespace-nowrap"
                  style={{ color: '#0f172a', letterSpacing: '-0.5px' }}
                >
                  {text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

function CategoriesSection() {
  const { dark } = useDark();
  return (
    <section id="categories" className="py-24 relative" style={{ background: dark ? '#0f172a' : '#f8faff' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.2)', color: '#4f46e5' }}
          >
            Explore
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4" style={{ color: dark ? '#f8fafc' : '#0f172a', letterSpacing: '-1.5px' }}>
            Every category you need
          </h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: dark ? '#94a3b8' : '#475569' }}>
            Streaming, learning, design, AI tools, security & productivity — all at unbeatable prices.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => {
            const Icon = Icons[cat.icon] || Icons.BookOpen;
            return (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="p-6 rounded-2xl cursor-pointer group"
                style={{
                  background: dark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
                  boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                  style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}25` }}
                >
                  <Icon size={22} style={{ color: cat.color }} />
                </div>
                <div className="font-semibold text-sm mb-1" style={{ color: dark ? '#f1f5f9' : '#0f172a' }}>{cat.label}</div>
                <div className="text-xs font-medium" style={{ color: '#94a3b8' }}>{cat.count} deals</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── PROOF / TESTIMONIALS ────────────────────────────────────────────────────

function ProofSection() {
  const { dark } = useDark();

  return (
    <section id="proof" className="py-24 relative" style={{ background: dark ? '#0f172a' : '#FAFAFA' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div
            className="text-[11px] font-semibold uppercase mb-5"
            style={{ letterSpacing: '0.16em', color: dark ? '#879793' : '#9AA3A0' }}
          >
            Real students · Real orders
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tighter mb-4"
            style={{ color: dark ? '#f8fafc' : '#0f172a', letterSpacing: '-1.8px' }}
          >
            What students say
          </h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: dark ? '#94a3b8' : '#6B7570' }}>
            Students from top colleges across India order from SubStore every month.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14 items-stretch">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -5 }}
              className="flex flex-col h-full"
              style={{
                background: dark ? '#16211f' : '#ffffff',
                border: `1px solid ${dark ? '#26332f' : '#ECEDE9'}`,
                borderRadius: 26,
                padding: 28,
              }}
            >
              {/* monochrome stars — rangeen se zyada premium lagte hain */}
              <div className="flex items-center gap-0.5 mb-5">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Icons.Star
                    key={si}
                    size={13}
                    style={{ color: dark ? '#e2e8f0' : '#0f172a', fill: dark ? '#e2e8f0' : '#0f172a' }}
                  />
                ))}
              </div>

              <p
                className="text-[15px] flex-1 mb-6"
                style={{ color: dark ? '#cbd5e1' : '#2A3330', lineHeight: 1.7, letterSpacing: '-0.1px' }}
              >
                {t.text}
              </p>

              {/* neutral chip + colour sirf ek chhote dot mein */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium w-fit mb-6"
                style={{ background: dark ? '#1e293b' : '#F4F5F2', color: dark ? '#94a3b8' : '#5A6663' }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: t.color }} />
                {t.deal}
              </div>

              <div
                className="flex items-center gap-3 mt-auto pt-5"
                style={{ borderTop: `1px solid ${dark ? '#26332f' : '#F0F1EE'}` }}
              >
                <div
                  className="w-11 h-11 flex items-center justify-center text-[13px] font-semibold text-white shrink-0"
                  style={{ background: t.color, borderRadius: 14 }}
                >
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-sm font-semibold truncate"
                      style={{ color: dark ? '#f1f5f9' : '#0f172a' }}
                    >
                      {t.name}
                    </span>
                    <Icons.BadgeCheck size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                  </div>
                  <div className="text-[11px] truncate" style={{ color: dark ? '#64748b' : '#9AA3A0' }}>
                    {t.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust metrics bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="px-6 py-10 grid grid-cols-2 md:grid-cols-5 gap-y-9 gap-x-6"
          style={{
            background: dark ? '#16211f' : '#ffffff',
            border: `1px solid ${dark ? '#26332f' : '#ECEDE9'}`,
            borderRadius: 26,
          }}
        >
          {/* icons hata diye — sirf numbers, isse zyada saaf aur premium lagta hai */}
          {[
            { value: '500+', label: 'Happy students' },
            { value: '4.9/5', label: 'Average rating' },
            { value: '100%', label: 'Verified accounts' },
            { value: '<30 min', label: 'Avg. delivery' },
            { value: 'Free', label: 'Replacement' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div
                className="text-[27px] font-bold mb-1.5"
                style={{ color: dark ? '#f8fafc' : '#0f172a', letterSpacing: '-1.2px' }}
              >
                {value}
              </div>
              <div
                className="text-[10px] font-semibold uppercase"
                style={{ letterSpacing: '0.12em', color: dark ? '#64748b' : '#9AA3A0' }}
              >
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────

function HomeInner() {
  const { dark } = useDark();

  return (
    <div
      data-theme={dark ? 'dark' : 'light'}
      style={{
        background: dark ? '#070F0E' : '#E7E8E4',
        minHeight: '100vh',
        padding: 'clamp(0px, 2.2vw, 30px)',
        transition: 'background 0.3s',
      }}
    >
      {/* inset canvas — poori site ek rounded card ke andar.
          overflow: clip hi rakhna — hidden sticky navbar tod deta hai */}
      <div
        style={{
          background: dark ? '#0f172a' : '#FAFAFA',
          maxWidth: 1720,
          margin: '0 auto',
          borderRadius: 'clamp(0px, 2.2vw, 30px)',
          overflow: 'clip',
          boxShadow: dark ? '0 24px 70px rgba(0,0,0,0.55)' : '0 24px 70px rgba(15,23,42,0.10)',
          transition: 'background 0.3s',
        }}
      >
        <Navbar />
        <HeroSection />
        <DealCarousel />
        <StatsSection />
        <CategoriesSection />
        <OffersBento />
        <MarketplaceSection />
        <PricingFan />
        <TrustBanner />
        <ProofSection />
        <OrderCta />
        <Footer />
      </div>
      <FloatingInstagramButton />
    </div>
  );
}

export default function Home() {
  return (
    <DarkModeProvider>
      <HomeInner />
    </DarkModeProvider>
  );
}
