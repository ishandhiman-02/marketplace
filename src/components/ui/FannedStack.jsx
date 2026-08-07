import { motion, useReducedMotion } from 'framer-motion';

// The reference's signature move: cards fan out from a single pile.
// items = [{ key, node }] — node can be any card content.
// Hero, Statement and Pricing all use this.
export function FannedStack({
  items,
  rotations = [-12, -6, 0, 5, 10, 16],
  width = 240,
  height = 440,
  spreadX = 58,
  spreadY = 14,
  className = '',
}) {
  const reduce = useReducedMotion();
  const n = items.length;

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {items.map((item, i) => {
        const rotate = rotations[i % rotations.length];
        const x = (i - (n - 1) / 2) * spreadX;
        const y = Math.abs(i - (n - 1) / 2) * spreadY;
        return (
          <motion.div
            key={item.key}
            initial={reduce ? { opacity: 0 } : { x: 0, y: 60, rotate: 0, opacity: 0, scale: 0.9 }}
            whileInView={reduce ? { opacity: 1 } : { x, y, rotate, opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16, delay: i * 0.07 }}
            whileHover={reduce ? undefined : { rotate: 0, scale: 1.05, zIndex: 50 }}
            className="absolute left-1/2 top-1/2"
            style={{ width, marginLeft: -width / 2, marginTop: -height * 0.34, zIndex: i + 1 }}
          >
            {item.node}
          </motion.div>
        );
      })}
    </div>
  );
}
