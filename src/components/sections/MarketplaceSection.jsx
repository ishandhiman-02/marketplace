import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COURSES } from '../../data/products';
import { Eyebrow } from '../ui/Eyebrow';
import { PillButton } from '../ui/PillButton';
import { RoundNavButton } from '../ui/RoundNavButton';
import { ProgressLines } from '../ui/ProgressLines';
import { ProductCard } from '../ui/ProductCard';

const FILTERS = ['All', 'Streaming', 'Learning', 'Design', 'AI Tools', 'Productivity', 'VPN & Security'];
const GAP = 20;

export function MarketplaceSection() {
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef(null);
  const [cw, setCw] = useState(0);

  useEffect(() => {
    const measure = () => containerRef.current && setCw(containerRef.current.offsetWidth);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const items = filter === 'All' ? COURSES : COURSES.filter((c) => c.category === filter);

  // 1.15 ka matlab: mobile pe agla card thoda jhaankta hai (reference jaisa peek)
  const perView = cw >= 1180 ? 4 : cw >= 880 ? 3 : cw >= 620 ? 2 : 1.15;
  const whole = Math.max(1, Math.floor(perView));
  const cardW = cw ? (cw - GAP * Math.floor(perView)) / perView : 280;
  const pages = Math.max(1, Math.ceil(items.length / whole));
  const pageIdx = Math.min(page, pages - 1);

  const rawX = -(pageIdx * whole) * (cardW + GAP);
  const maxX = Math.max(0, items.length * (cardW + GAP) - GAP - cw);
  const x = Math.max(rawX, -maxX);

  const pickFilter = (f) => {
    setFilter(f);
    setPage(0);
  };

  return (
    <section id="deals" className="py-24 bg-canvas overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10"
        >
          <div>
            <Eyebrow className="mb-5">
              Get more · <span style={{ color: '#C555F5' }}>for less</span>
            </Eyebrow>
            <h2
              className="font-bold text-ink"
              style={{ fontSize: 'clamp(34px, 4.5vw, 60px)', letterSpacing: '-0.03em', lineHeight: 1.02 }}
            >
              Marketplace
              <br />
              for students.
            </h2>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <p className="text-[13px] leading-relaxed text-muted max-w-[240px] hidden lg:block">
              16 premium subscriptions, one Instagram DM away. Prices start at Rs.50.
            </p>
            <PillButton
              variant="magenta"
              size="md"
              onClick={() => setShowAll((s) => !s)}
              className="shrink-0"
            >
              {showAll ? 'Collapse' : 'View All'}
            </PillButton>
          </div>
        </motion.div>

        {/* filters + nav */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => pickFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  filter === f ? 'bg-ink text-canvas' : 'bg-surface-2 text-muted hover:text-ink'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {!showAll && pages > 1 && (
            <div className="flex items-center gap-2">
              <RoundNavButton dir="prev" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={pageIdx === 0} />
              <RoundNavButton dir="next" onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={pageIdx === pages - 1} />
            </div>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {showAll ? (
            <motion.div
              key={`grid-${filter}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch"
            >
              {items.map((c) => (
                <ProductCard key={c.id} product={c} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`carousel-${filter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div ref={containerRef} className="overflow-hidden">
                <motion.div
                  className="flex items-stretch"
                  style={{ gap: GAP }}
                  animate={{ x }}
                  transition={{ type: 'spring', stiffness: 170, damping: 26 }}
                >
                  {items.map((c) => (
                    <div key={c.id} className="shrink-0" style={{ width: cardW }}>
                      <ProductCard product={c} />
                    </div>
                  ))}
                </motion.div>
              </div>

              {pages > 1 && (
                <ProgressLines
                  count={pages}
                  active={pageIdx}
                  onSelect={setPage}
                  className="mt-8 max-w-sm"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
