import { motion } from 'framer-motion';
import { CATEGORIES } from '../../data/products';
import { STATS } from '../../data/social';
import { Eyebrow } from '../ui/Eyebrow';
import { IconChip } from '../ui/IconChip';

import heroImg from '../../assets/online_learning_dark_background.jpg';
import studentImg from '../../assets/student_learning_technology.jpg';
import codingImg from '../../assets/coding_course_laptop_dark.jpg';
import designImg from '../../assets/design_course_creative_dark.jpg';
import businessImg from '../../assets/business_course_professional_dark.jpg';
import abstractImg from '../../assets/abstract_purple_blue_gradient_dark.jpg';

// f04: left floating icon chips + stats, right 2x3 image grid
const GRID = [heroImg, codingImg, designImg, businessImg, abstractImg, studentImg];

const CHIP_POSITIONS = [
  { left: '4%', top: 8, delay: '0s', size: 52 },
  { left: '30%', top: 52, delay: '0.8s', size: 44 },
  { left: '56%', top: 12, delay: '1.6s', size: 48 },
  { left: '76%', top: 64, delay: '0.4s', size: 44 },
  { left: '16%', top: 108, delay: '1.2s', size: 40 },
];

export function CategorySplit() {
  return (
    <section className="py-24 bg-canvas">
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Eyebrow className="mb-5">Explore</Eyebrow>
            <h2
              className="font-bold text-ink mb-4"
              style={{ fontSize: 'clamp(34px, 4.5vw, 60px)', letterSpacing: '-0.03em', lineHeight: 1.02 }}
            >
              Every category
              <br />
              you need.
            </h2>
            <p className="text-[15px] leading-relaxed text-muted max-w-sm">
              Streaming, learning, design, AI tools, security & productivity — all at prices
              that fit a student budget.
            </p>
          </motion.div>

          {/* floating chips — reference ke tairte icon circles */}
          <div className="relative hidden md:block" style={{ height: 170 }}>
            {CHIP_POSITIONS.map((pos, i) => (
              <IconChip
                key={CATEGORIES[i].label}
                icon={CATEGORIES[i].icon}
                size={pos.size}
                className="absolute float-anim"
                style={{ left: pos.left, top: pos.top, animationDelay: pos.delay }}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-10 md:mt-2">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="font-bold text-ink text-[22px]" style={{ letterSpacing: '-0.8px' }}>
                  {value}
                </div>
                <div className="text-[10px] font-semibold uppercase text-faint mt-0.5" style={{ letterSpacing: '0.1em' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right — image grid ek rounded clip mein */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="overflow-hidden"
          style={{ borderRadius: 24 }}
        >
          <div className="grid grid-cols-3 grid-rows-2 gap-0.5" style={{ aspectRatio: '3 / 2' }}>
            {GRID.map((img, i) => {
              const cat = CATEGORIES[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="relative group overflow-hidden"
                >
                  <img
                    src={img}
                    alt={cat?.label || 'Category'}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {cat && (
                    <div className="absolute inset-0 flex items-end p-2.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(15,23,42,0.35)' }}>
                      <span
                        className="text-[10px] font-semibold px-2 py-1 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.94)', color: '#0f172a' }}
                      >
                        {cat.label} · {cat.count}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
