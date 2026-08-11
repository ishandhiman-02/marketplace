import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

export function RoundNavButton({ dir = 'next', onClick, disabled = false, light = false, className = '' }) {
  const Icon = dir === 'prev' ? Icons.ChevronLeft : Icons.ChevronRight;
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.06 }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? 'Previous' : 'Next'}
      className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-35 disabled:cursor-default ${
        light
          ? 'bg-white/15 border border-white/40 backdrop-blur-sm'
          : 'border border-line bg-surface'
      } ${className}`}
    >
      <Icon size={17} className={light ? 'text-white' : 'text-ink'} />
    </motion.button>
  );
}
