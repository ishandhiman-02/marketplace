import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';

/** Take the state from useToast() and render it with this. */
export function Toast({ toast }) {
  const bad = toast?.tone === 'error';
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.key}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[70] flex items-center gap-2.5 px-5 py-3 rounded-full shadow-2xl text-sm font-medium"
          style={{
            translateX: '-50%',
            background: bad ? '#991B1B' : '#0f172a',
            color: '#f8fafc',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          {bad
            ? <Icons.AlertCircle size={16} className="shrink-0" />
            : <Icons.Check size={16} style={{ color: '#DFF264' }} className="shrink-0" />}
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
