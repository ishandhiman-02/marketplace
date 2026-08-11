import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDark } from '../../context/useDark';
import { useSettings } from '../../context/useSettings';
import { useCatalog } from '../../context/useCatalog';
import { CountUp } from '../ui/CountUp';

/**
 * `auto` lets a stat stay correct on its own: the deal count and the lowest
 * price come from the catalogue, so nobody has to remember to update them
 * after adding a product.
 */
const AUTO_VALUES = {
  productCount: (cat) => `${cat.products.length}`,
  minPrice: (cat) => `Rs.${cat.minPrice}`,
};

export function StatsSection() {
  const { dark } = useDark();
  const { stats } = useSettings();
  const catalog = useCatalog();
  const STATS = stats.items
    .filter((s) => s.label?.trim())
    .map((s) => ({ ...s, value: AUTO_VALUES[s.auto]?.(catalog) ?? s.value }));

  if (STATS.length === 0) return null;
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
                  <CountUp value={stat.value} />
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
