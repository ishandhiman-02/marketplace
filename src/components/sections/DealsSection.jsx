import { useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { orderOnInstagram } from '../../config/site';
import { useDark } from '../../context/useDark';
import { useCatalog } from '../../context/useCatalog';
import { CountUp } from '../ui/CountUp';
import { IgIcon } from '../ui/IgIcon';

export function DealsSection() {
  const { dark } = useDark();
  const [activeFilter, setActiveFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(6);
  const { products, categories } = useCatalog();
  // Filters follow the live catalogue. When they were hand-written, products
  // in a new category only showed under "All" (VPN & Security, Music and
  // Developer Tools were all missed that way).
  const filters = ['All', ...categories.map((c) => c.label)];

  const filteredAll = activeFilter === 'All'
    ? products
    : products.filter((c) => c.category === activeFilter);
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
                {/* the image sits inset inside the card — the reference treatment */}
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

                  {/* large price numeral — like the reference's pricing cards */}
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
                          <CountUp value={course.price} duration={800} />
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

        {filteredAll.length === 0 && (
          <p className="text-center py-16 text-sm" style={{ color: dark ? '#64748b' : '#8A9490' }}>
            Nothing in this category right now — try another one.
          </p>
        )}

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
