import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useDark } from '../../context/useDark';

export function DarkToggle() {
  const { dark, toggle } = useDark();
  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.08 }}
      aria-label="Toggle dark mode"
      className="relative w-12 h-6 rounded-full flex items-center px-0.5 transition-colors duration-300 focus:outline-none"
      style={{ background: dark ? '#4f46e5' : '#e2e8f0' }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="w-5 h-5 rounded-full flex items-center justify-center shadow-md"
        style={{
          background: '#ffffff',
          marginLeft: dark ? 'auto' : '0',
        }}
      >
        {dark
          ? <Icons.Moon size={11} style={{ color: '#4f46e5' }} />
          : <Icons.Sun size={11} style={{ color: '#f59e0b' }} />}
      </motion.div>
    </motion.button>
  );
}
