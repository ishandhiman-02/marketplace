import { motion } from 'framer-motion';
import { orderOnInstagram } from '../../config/site';
import { useDark } from '../../context/useDark';
import { IgIcon } from '../ui/IgIcon';

export function ContactSection() {
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
