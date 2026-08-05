// Generic marquee — children do baar render hote hain, CSS -50% translate loop.
// Reduced motion mein index.css animation band kar deta hai.
export function Marquee({ children, className = '' }) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="marquee-track flex items-center w-max">
        {children}
        {children}
      </div>
    </div>
  );
}