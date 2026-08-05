import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDark } from '../../context/useDark';

// Chhota circular toggle — reference ke round navbar icons jaisa
export function DarkToggle({ className = '' }) {
  const { dark, toggle } = useDark();
  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.08 }}
      aria-label="Toggle dark mode"
      className={`w-9 h-9 rounded-full border border-line bg-surface flex items-center justify-center cursor-pointer ${className}`}
    >
      {dark ? <Icons.Sun size={15} className="text-ink" /> : <Icons.Moon size={15} className="text-ink" />}
    </motion.button>
  );
}