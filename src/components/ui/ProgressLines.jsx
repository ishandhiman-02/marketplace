import { motion } from 'framer-motion';

// Reference carousel ke neeche wali patli progress lines —
// active segment ink mein scaleX se bharta hai, baaki halki grey.
export function ProgressLines({ count, active, onSelect, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={onSelect ? () => onSelect(i) : undefined}
          aria-label={`Slide ${i + 1}`}
          className="flex-1 h-4 flex items-center cursor-pointer bg-transparent"
        >
          <div className="w-full h-[2px] bg-line rounded-full overflow-hidden">
            {i === active && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="h-full bg-ink origin-left rounded-full"
              />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}