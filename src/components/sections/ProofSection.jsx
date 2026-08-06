import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDark } from '../../context/useDark';
import { TESTIMONIALS } from '../../data/testimonials';

export function ProofSection() {
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
