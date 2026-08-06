import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';

import { DarkModeProvider } from '../context/DarkModeContext';
import { useDark } from '../context/useDark';
import { orderOnInstagram, onOrderToast } from '../config/site';
import { NAV_LINKS, NAV_IDS } from '../data/nav';
import { CATEGORIES, COURSES } from '../data/products';
import { OFFERS } from '../data/offers';
import { STATS, TRUST_ITEMS, TESTIMONIALS } from '../data/social';
import { HeroSection } from '../components/sections/HeroSection';
import { DealCarousel } from '../components/sections/DealCarousel';

function IgIcon({ size = 14, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill={color} stroke="none" />
    </svg>
  );
}

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────

function CountdownTimer() {
  const [time, setTime] = useState({ h: 5, m: 47, s: 23 });

  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2">
      {[{ v: time.h, l: 'HRS' }, { v: time.m, l: 'MIN' }, { v: time.s, l: 'SEC' }].map(({ v, l }, i) => (
        <div key={l} className="flex items-center gap-2">
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-mono text-white"
              style={{ background: '#4f46e5', boxShadow: '0 2px 8px rgba(79,70,229,0.35)' }}
            >
              {pad(v)}
            </div>
            <div className="text-xs mt-1 font-medium" style={{ color: '#94a3b8' }}>{l}</div>
          </div>
          {i < 2 && <span className="text-lg font-bold mb-4" style={{ color: '#4f46e5' }}>:</span>}
        </div>
      ))}
    </div>
  );
}

function AudioPlayer({ offer }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const toggle = () => {
    setPlaying((p) => {
      if (!p) {
        intervalRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) { clearInterval(intervalRef.current); return 0; }
            return prev + 0.3;
          });
        }, 100);
      } else {
        clearInterval(intervalRef.current);
      }
      return !p;
    });
  };

  const bars = [3, 5, 7, 4, 8, 6, 9, 5, 7, 4, 6, 8, 5, 7, 3, 9, 6, 4, 8, 5];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1 h-14 justify-center">
        {bars.map((h, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: 3,
              height: `${h * 5}px`,
              background: playing ? `rgba(79,70,229,${0.3 + (h / 9) * 0.7})` : '#e2e8f0',
            }}
          />
        ))}
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: '#4f46e5' }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>
          {Math.floor((progress / 100) * 14)}:{String(Math.floor(((progress / 100) * 30) % 60)).padStart(2, '0')}
        </span>
        <button
          onClick={toggle}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-md"
          style={{ background: '#4f46e5' }}
        >
          {playing ? <Icons.Pause size={16} color="#fff" /> : <Icons.Play size={16} color="#fff" />}
        </button>
        <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{offer.audioDuration}</span>
      </div>
    </div>
  );
}

function VideoOfferCard({ offer }) {
  const [clicked, setClicked] = useState(false);
  return (
    <div
      className="relative rounded-xl overflow-hidden cursor-pointer"
      style={{ height: 200 }}
      onClick={() => setClicked(true)}
    >
      <img src={offer.thumbnail} alt={offer.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'rgba(15,23,42,0.45)' }} />
      {!clicked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl"
            style={{ background: '#4f46e5' }}
          >
            <Icons.Play size={24} color="#fff" />
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────

// ─── DARK MODE TOGGLE ────────────────────────────────────────────────────────
function DarkToggle() {
  const { dark, toggle } = useDark();
  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.08 }}
      aria-label="Toggle dark mode"
      className="relative w-12 h-6 rounded-full flex items-center px-0.5 transition-colors duration-300 focus:outline-none"
      style={{ background: dark ? '#4f46e5' : '#e2e8f0' }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="w-5 h-5 rounded-full flex items-center justify-center shadow-md"
        style={{
          background: '#ffffff',
          marginLeft: dark ? 'auto' : '0',
        }}
      >
        {dark
          ? <Icons.Moon size={11} style={{ color: '#4f46e5' }} />
          : <Icons.Sun size={11} style={{ color: '#f59e0b' }} />}
      </motion.div>
    </motion.button>
  );
}

function Navbar() {
  const { dark } = useDark();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navBg = dark
    ? scrolled ? 'rgba(15,23,42,0.97)' : 'rgba(15,23,42,0.88)'
    : scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.88)';
  const borderColor = dark ? (scrolled ? '#1e293b' : 'transparent') : (scrolled ? '#e2e8f0' : 'transparent');
  const textColor = dark ? '#e2e8f0' : '#475569';
  const logoColor = dark ? '#f8fafc' : '#0f172a';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="sticky top-0 z-50"
      style={{
        background: navBg,
        borderBottom: `1px solid ${borderColor}`,
        backdropFilter: 'blur(16px)',
        transition: 'all 0.3s',
        boxShadow: scrolled ? '0 1px 12px rgba(15,23,42,0.12)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#4f46e5' }}>
            <Icons.Zap size={14} color="#fff" />
          </div>
          <span className="font-bold text-base tracking-tight" style={{ color: logoColor }}>SubStore</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${NAV_IDS[l]}`}
              className="text-sm font-medium transition-colors"
              style={{ color: textColor }}
              onMouseEnter={e => (e.currentTarget.style.color = '#4f46e5')}
              onMouseLeave={e => (e.currentTarget.style.color = textColor)}
            >
              {l}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <DarkToggle />
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => orderOnInstagram()}
            className="text-sm font-semibold px-5 py-2 rounded-full flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color: '#fff' }}
          >
            <IgIcon size={14} />
            Order on Instagram
          </motion.button>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <DarkToggle />
          <button onClick={() => setMenuOpen((o) => !o)} style={{ color: logoColor }}>
            {menuOpen ? <Icons.X size={20} /> : <Icons.Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden"
            style={{
              background: dark ? '#0f172a' : '#ffffff',
              borderTop: `1px solid ${dark ? '#1e293b' : '#e2e8f0'}`,
            }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {NAV_LINKS.map((l) => (
                <a
                  key={l}
                  href={`#${NAV_IDS[l]}`}
                  className="text-sm font-medium"
                  style={{ color: textColor }}
                  onClick={() => setMenuOpen(false)}
                >
                  {l}
                </a>
              ))}
              <button
                onClick={() => orderOnInstagram()}
                className="text-sm font-semibold py-2.5 rounded-full text-center mt-2 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color: '#fff' }}
              >
                <IgIcon size={14} />
                Order on Instagram
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

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

// ─── DEALS ───────────────────────────────────────────────────────────────────

function DealsSection() {
  const { dark } = useDark();
  const [activeFilter, setActiveFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(6);
  const filters = ['All', 'Streaming', 'Learning', 'Design', 'AI Tools', 'Productivity'];

  const filteredAll = activeFilter === 'All' ? COURSES : COURSES.filter((c) => c.category === activeFilter);
  const filtered = filteredAll.slice(0, visibleCount);

  return (
    <section id="deals" className="py-24 relative" style={{ background: dark ? '#1e293b' : '#ffffff' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.2)', color: '#4f46e5' }}
            >
              Featured
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter" style={{ color: dark ? '#f8fafc' : '#0f172a', letterSpacing: '-1.5px' }}>
              Premium subscriptions & tools
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => { setActiveFilter(f); setVisibleCount(6); }}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: activeFilter === f ? '#4f46e5' : (dark ? '#334155' : '#f1f5f9'),
                  color: activeFilter === f ? '#ffffff' : (dark ? '#94a3b8' : '#475569'),
                  boxShadow: activeFilter === f ? '0 2px 8px rgba(79,70,229,0.25)' : 'none',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filtered.map((course, i) => {
            const Icon = Icons?.[course.icon] || Icons.HelpCircle;
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group cursor-pointer flex flex-col h-full"
                style={{
                  background: dark ? '#16211f' : '#ffffff',
                  border: `1px solid ${dark ? '#26332f' : '#ECEDE9'}`,
                  borderRadius: 26,
                  padding: 10,
                }}
              >
                {/* image card ke andar inset baithti hai — reference wala treatment */}
                <div className="relative overflow-hidden" style={{ borderRadius: 18, aspectRatio: '4 / 3' }}>
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  <span
                    className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.92)', color: '#0f172a', backdropFilter: 'blur(8px)' }}
                  >
                    {course.tag}
                  </span>
                  <div
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: '#ffffff' }}
                  >
                    <Icon size={15} style={{ color: course.color }} />
                  </div>
                </div>

                <div className="px-3 pt-4 pb-2 flex flex-col flex-1">
                  <div
                    className="text-[10px] font-semibold uppercase mb-2"
                    style={{ letterSpacing: '0.12em', color: dark ? '#879793' : '#9AA3A0' }}
                  >
                    {course.category}
                  </div>

                  <h3
                    className="font-semibold text-[17px] leading-tight mb-1"
                    style={{ color: dark ? '#f1f5f9' : '#0f172a', letterSpacing: '-0.4px' }}
                  >
                    {course.title}
                  </h3>
                  <p className="text-xs mb-2.5" style={{ color: dark ? '#94a3b8' : '#64748b' }}>
                    {course.subtitle}
                  </p>
                  <p
                    className="text-xs leading-relaxed mb-4 line-clamp-2"
                    style={{ color: dark ? '#64748b' : '#8A9490' }}
                  >
                    {course.description}
                  </p>

                  {course.variants && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {course.variants.map((v) => (
                        <span
                          key={v.label}
                          className="text-[11px] px-2.5 py-1 rounded-full"
                          style={{
                            background: dark ? '#1e293b' : '#F4F5F2',
                            color: dark ? '#94a3b8' : '#475569',
                          }}
                        >
                          {v.label} · Rs.{v.price}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* bada price numeral — reference ke pricing cards jaisa */}
                  <div className="flex items-end justify-between mt-auto pt-3">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[13px] font-semibold" style={{ color: dark ? '#879793' : '#9AA3A0' }}>
                          Rs.
                        </span>
                        <span
                          className="text-[30px] font-bold leading-none"
                          style={{ color: dark ? '#f8fafc' : '#0f172a', letterSpacing: '-1.5px' }}
                        >
                          {course.price}
                        </span>
                      </div>
                      <div className="text-[11px] mt-1" style={{ color: dark ? '#64748b' : '#9AA3A0' }}>
                        {course.duration}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => orderOnInstagram({
                        title: course.title,
                        variant: course.subtitle,
                        price: course.price,
                      })}
                      className="px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
                      style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color: '#fff' }}
                    >
                      <IgIcon size={12} />
                      Order
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          {visibleCount < filteredAll.length ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setVisibleCount((v) => v + 6)}
              className="px-8 py-3 rounded-full text-sm font-semibold"
              style={{ background: '#f8faff', color: '#4f46e5', border: '1px solid #c7d2fe', boxShadow: '0 1px 4px rgba(79,70,229,0.1)' }}
            >
              Load more
              <Icons.ChevronDown size={14} className="inline ml-2" />
            </motion.button>
          ) : (
            <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>All deals shown</p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── OFFERS ──────────────────────────────────────────────────────────────────

function OffersSection() {
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

// ─── CONTACT ─────────────────────────────────────────────────────────────────

function ContactSection() {
  const { dark } = useDark();
  return (
    <section id="contact" className="py-24 relative overflow-hidden" style={{
      background: dark ? '#1e293b' : '#ffffff',
      borderTop: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
    }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(79,70,229,0.04) 0%, transparent 70%)' }}
      />
      <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.2)', color: '#4f46e5' }}
          >
            <IgIcon size={12} color="#4f46e5" />
            How to order
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4" style={{ color: dark ? '#f8fafc' : '#0f172a', letterSpacing: '-1.5px' }}>
            Ready to get started?
          </h2>
          <p className="text-base mb-10 leading-relaxed" style={{ color: dark ? '#94a3b8' : '#475569' }}>
            Just send us a DM on Instagram with the subscription you want. We confirm your order and deliver it fast — usually within minutes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { step: '01', title: 'Pick a deal', desc: 'Browse and choose the subscription you want above.' },
              { step: '02', title: 'DM us', desc: 'Click any "Order now" button to open our Instagram.' },
              { step: '03', title: 'Get access', desc: 'We confirm, you pay, and you get instant access.' },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="p-5 rounded-xl text-left"
                style={{
                  background: dark ? '#0f172a' : '#f8faff',
                  border: `1px solid ${dark ? '#334155' : '#e0e7ff'}`,
                }}
              >
                <div className="text-xs font-bold mb-2" style={{ color: '#4f46e5' }}>{step}</div>
                <div className="font-semibold text-sm mb-1" style={{ color: dark ? '#f1f5f9' : '#0f172a' }}>{title}</div>
                <div className="text-xs leading-relaxed" style={{ color: dark ? '#64748b' : '#64748b' }}>{desc}</div>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(131,58,180,0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => orderOnInstagram()}
            className="px-9 py-4 rounded-full text-base font-semibold flex items-center gap-3 mx-auto shadow-xl"
            style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color: '#fff' }}
          >
            <IgIcon size={20} />
            Order on Instagram now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

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

function Footer() {
  const { dark } = useDark();
  return (
    <footer className="py-8" style={{
      background: dark ? '#0f172a' : '#f8faff',
      borderTop: `1px solid ${dark ? '#1e293b' : '#e2e8f0'}`,
    }}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#4f46e5' }}>
            <Icons.Zap size={12} color="#fff" />
          </div>
          <span className="font-bold text-sm" style={{ color: dark ? '#f8fafc' : '#0f172a' }}>SubStore</span>
        </div>
        <p className="text-xs text-center" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
          All subscriptions are shared/family plan accounts. Prices are subject to availability.
        </p>
        <button
          onClick={() => orderOnInstagram()}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full"
          style={{ background: 'rgba(131,58,180,0.08)', color: '#4f46e5', border: '1px solid rgba(131,58,180,0.2)' }}
        >
          <IgIcon size={12} color="#4f46e5" />
          Instagram
        </button>
      </div>
    </footer>
  );
}

// ─── FLOATING BUTTON ─────────────────────────────────────────────────────────

function FloatingInstagramButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => orderOnInstagram()}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color: '#fff' }}
        >
          <IgIcon size={16} />
          Order now
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ─── ORDER TOAST ─────────────────────────────────────────────────────────────

// Clipboard copy hone pe 2 second ka confirmation — config/site.js emit karta hai
function OrderToast() {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const unsubscribe = onOrderToast((msg) => setMessage(msg));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(() => setMessage(null), 2000);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 z-[60] flex items-center gap-2.5 px-5 py-3 rounded-full shadow-2xl text-sm font-medium"
          style={{
            translateX: '-50%',
            background: '#0f172a',
            color: '#f8fafc',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          <Icons.ClipboardCheck size={16} style={{ color: '#DFF264', flexShrink: 0 }} />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
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
        <TrustBanner />
        <StatsSection />
        <CategoriesSection />
        <DealsSection />
        <OffersSection />
        <ProofSection />
        <ContactSection />
        <Footer />
      </div>
      <FloatingInstagramButton />
      <OrderToast />
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
