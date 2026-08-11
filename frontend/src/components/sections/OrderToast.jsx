import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { onOrderToast } from '../../config/site';

export function OrderToast() {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const unsubscribe = onOrderToast((msg) => setMessage(msg));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(() => setMessage(null), 2000);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 z-[60] flex items-center gap-2.5 px-5 py-3 rounded-full shadow-2xl text-sm font-medium"
          style={{
            translateX: '-50%',
            background: '#0f172a',
            color: '#f8fafc',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          <Icons.ClipboardCheck size={16} style={{ color: '#DFF264', flexShrink: 0 }} />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
