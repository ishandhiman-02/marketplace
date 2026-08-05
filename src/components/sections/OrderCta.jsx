import { motion } from 'framer-motion';
import { openInstagram } from '../../lib/instagram';
import { Eyebrow } from '../ui/Eyebrow';
import { PillButton } from '../ui/PillButton';
import { IgIcon } from '../ui/IgIcon';

const STEPS = [
  { step: '01', title: 'Pick a deal', desc: 'Browse and choose the subscription you want above.' },
  { step: '02', title: 'DM us', desc: 'Click any "Order now" button to open our Instagram.' },
  { step: '03', title: 'Get access', desc: 'We confirm, you pay, and you get instant access.' },
];

export function OrderCta() {
  return (
    <section id="contact" className="py-24 bg-canvas">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Eyebrow className="mb-5">How to order</Eyebrow>
          <h2
            className="font-bold text-ink mb-4"
            style={{ fontSize: 'clamp(34px, 4.5vw, 60px)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
          >
            Three steps.
            <br />
            That&apos;s it.
          </h2>
          <p className="text-[15px] leading-relaxed text-muted max-w-md mx-auto mb-12">
            Send us a DM with the subscription you want. We confirm your order and deliver it fast — usually within minutes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12 text-left">
          {STEPS.map(({ step, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface border border-line p-7"
              style={{ borderRadius: 26 }}
            >
              <div
                className="font-bold text-line select-none"
                style={{ fontSize: 56, lineHeight: 1, letterSpacing: '-2px' }}
              >
                {step}
              </div>
              <div className="font-semibold text-[15px] text-ink mt-4 mb-1.5">{title}</div>
              <div className="text-[13px] leading-relaxed text-muted">{desc}</div>
            </motion.div>
          ))}
        </div>

        <PillButton variant="ig" size="lg" onClick={openInstagram} className="shadow-xl">
          <IgIcon size={18} />
          Order on Instagram now
        </PillButton>
      </div>
    </section>
  );
}
