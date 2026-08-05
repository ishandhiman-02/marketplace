import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { NAV_LINKS, NAV_IDS } from '../../data/nav';
import { openInstagram } from '../../lib/instagram';
import { PillButton } from '../ui/PillButton';
import { DarkToggle } from '../ui/DarkToggle';
import { IgIcon } from '../ui/IgIcon';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="sticky z-50"
      style={{
        // canvas backdrop-padding jitna neeche pin hota hai, aur top corners
        // canvas jaise rounded — aise lagta hai jaise canvas ka apna top edge hai
        top: 0,
        borderRadius: 'clamp(0px, 2.2vw, 30px) clamp(0px, 2.2vw, 30px) 0 0',
        background: 'color-mix(in oklab, var(--color-canvas) 88%, transparent)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${scrolled ? 'var(--color-line)' : 'transparent'}`,
        transition: 'border-color 0.3s',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-ink flex items-center justify-center">
            <Icons.Zap size={15} className="text-canvas" />
          </div>
          <span className="font-bold text-[17px] tracking-tight text-ink">SubStore</span>
        </a>

        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${NAV_IDS[l]}`}
              className="text-[13px] font-medium text-muted hover:text-ink transition-colors"
            >
              {l}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <DarkToggle />
          <PillButton variant="ig" size="sm" onClick={openInstagram}>
            <IgIcon size={13} />
            Order on Instagram
          </PillButton>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <DarkToggle />
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            className="text-ink cursor-pointer"
          >
            {menuOpen ? <Icons.X size={21} /> : <Icons.Menu size={21} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-canvas border-t border-line"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {NAV_LINKS.map((l) => (
                <a
                  key={l}
                  href={`#${NAV_IDS[l]}`}
                  className="text-sm font-medium text-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  {l}
                </a>
              ))}
              <PillButton variant="ig" size="md" onClick={openInstagram} className="mt-1 w-full">
                <IgIcon size={14} />
                Order on Instagram
              </PillButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
