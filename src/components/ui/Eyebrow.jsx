// Chhota uppercase label — reference mein har section heading ke upar hota hai.
// Accent word ke liye caller <span style={{color}}> pass kare.
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