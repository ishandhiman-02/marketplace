import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

export function RoundNavButton({ dir = 'next', onClick, disabled = false, className = '' }) {
  const Icon = dir === 'prev' ? Icons.ChevronLeft : Icons.ChevronRight;
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.06 }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? 'Previous' : 'Next'}
      className={`w-10 h-10 rounded-full border border-line bg-surface flex items-center justify-center cursor-pointer disabled:opacity-35 disabled:cursor-default ${className}`}
    >
      <Icon size={17} className="text-ink" />
    </motion.button>
  );
}