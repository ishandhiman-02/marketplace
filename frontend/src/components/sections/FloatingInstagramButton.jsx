import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { orderOnInstagram } from '../../config/site';
import { IgIcon } from '../ui/IgIcon';

export function FloatingInstagramButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => orderOnInstagram()}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color: '#fff' }}
        >
          <IgIcon size={16} />
          Order now
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ─── ORDER TOAST ─────────────────────────────────────────────────────────────

// 2-second confirmation after the clipboard copy — emitted by config/site.js
