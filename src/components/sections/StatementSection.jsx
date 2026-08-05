import { motion } from 'framer-motion';
import { BRANDS, BRAND_SIZES } from '../../data/brands';
import { TESTIMONIALS } from '../../data/social';
import { BrandTile } from '../ui/BrandTile';
import { SpeechBubble } from '../ui/SpeechBubble';
import { FannedStack } from '../ui/FannedStack';

// f03: center statement, beech mein mini brand-tile fan + testimonial bubble
const STACK_BRANDS = ['Netflix', 'YouTube Premium', 'Spotify', 'ChatGPT Plus', 'Canva Pro'];

export function StatementSection() {
  const picks = STACK_BRANDS.map((n) => BRANDS.find((b) => b.name === n)).filter(Boolean);
  const t = TESTIMONIALS[1]; // Priya Sharma
  const handle = `@${t.name.toLowerCase().replace(' ', '.')}`;

  return (
    <section className="py-24 md:py-32 bg-canvas overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center relative">
        {/* mini fan — text ke upar overlap hota hua */}
        <div className="relative flex justify-center" style={{ height: 150 }}>
          <div className="absolute -top-4">
            <FannedStack
              items={picks.map((b) => ({
                key: b.name,
                node: <BrandTile {...b} size={BRAND_SIZES[b.size] * 0.9} />,
              }))}
              rotations={[-14, -7, 0, 8, 15]}
              width={86}
              height={150}
              spreadX={52}
              spreadY={8}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="absolute right-2 md:right-16 top-2"
          >
            <SpeechBubble rotate={7}>{handle}</SpeechBubble>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="font-medium"
          style={{ fontSize: 'clamp(26px, 3.5vw, 48px)', letterSpacing: '-0.025em', lineHeight: 1.22 }}
        >
          <span className="text-muted">Whether you&apos;re bingeing Netflix at 2am</span>
          <br />
          <span className="text-muted">or grinding Coursera before finals — </span>
          <span className="text-ink font-bold">pay student prices.</span>
        </motion.p>
      </div>
    </section>
  );
}
