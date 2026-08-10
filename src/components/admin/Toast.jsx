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
          className="fixed bottom-6 left-1/2 z-[70] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium border"
          style={{
            translateX: '-50%',
            // Built from surface tokens rather than a fixed near-black. A
            // #0f172a toast on the dark theme's #101917 page was all but
            // invisible; this way it lifts off the page in both themes.
            background: 'var(--color-surface)',
            borderColor: 'var(--color-line)',
            color: 'var(--color-ink)',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          {bad
            ? <Icons.AlertCircle size={16} className="shrink-0" style={{ color: 'var(--admin-danger)' }} />
            : <Icons.CheckCircle2 size={16} className="shrink-0" style={{ color: 'var(--admin-success)' }} />}
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
