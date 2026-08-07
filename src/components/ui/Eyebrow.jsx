// Small uppercase label — in the reference it sits above every section heading.
// For an accent word, the caller passes a <span style={{color}}>.
export function Eyebrow({ children, className = '' }) {
  return (
    <div
      className={`text-[11px] font-semibold uppercase text-faint ${className}`}
      style={{ letterSpacing: '0.16em' }}
    >
      {children}
    </div>
  );
}