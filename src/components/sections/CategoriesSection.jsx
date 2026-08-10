import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDark } from '../../context/useDark';
import { useCatalog } from '../../context/useCatalog';

export function CategoriesSection() {
  const { dark } = useDark();
  const { categories } = useCatalog();

  // Every category is empty — nothing to browse, so show nothing.
  if (categories.length === 0) return null;

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
          {categories.map((cat, i) => {
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
