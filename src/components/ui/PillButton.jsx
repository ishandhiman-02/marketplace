import { motion } from 'framer-motion';

const VARIANTS = {
  // ink/canvas tokens theme ke saath invert hote hain — light mein dark button, dark mein light
  dark: 'bg-ink text-canvas',
  magenta: 'text-white',
  ig: 'text-white',
  outline: 'bg-transparent text-ink border border-line',
  surface: 'bg-surface text-ink border border-line',
};

const SIZES = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-[15px]',
};

const INLINE = {
  magenta: { background: '#C555F5' },
  ig: { background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)' },
};

export function PillButton({ variant = 'dark', size = 'md', children, onClick, className = '', style, ...rest }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`rounded-full font-semibold inline-flex items-center justify-center gap-2 cursor-pointer ${VARIANTS[variant] || VARIANTS.dark} ${SIZES[size] || SIZES.md} ${className}`}
      style={{ ...INLINE[variant], ...style }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}