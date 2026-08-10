import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { orderOnInstagram } from '../../config/site';
import { useDark } from '../../context/useDark';
import { useSettings } from '../../context/useSettings';
import { DarkToggle } from '../ui/DarkToggle';
import { IgIcon } from '../ui/IgIcon';

export function Navbar() {
  const { dark } = useDark();
  const { brand, nav, hero } = useSettings();
  const links = nav.links.filter((l) => l.label?.trim() && l.id?.trim());
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
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: brand.primaryColor }}>
            <Icons.Zap size={14} color="#fff" />
          </div>
          <span className="font-bold text-base tracking-tight" style={{ color: logoColor }}>{brand.name}</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="text-sm font-medium transition-colors"
              style={{ color: textColor }}
              onMouseEnter={e => (e.currentTarget.style.color = brand.primaryColor)}
              onMouseLeave={e => (e.currentTarget.style.color = textColor)}
            >
              {l.label}
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
            {hero.ctaLabel}
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
              {links.map((l) => (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  className="text-sm font-medium"
                  style={{ color: textColor }}
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <button
                onClick={() => orderOnInstagram()}
                className="text-sm font-semibold py-2.5 rounded-full text-center mt-2 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color: '#fff' }}
              >
                <IgIcon size={14} />
                {hero.ctaLabel}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
