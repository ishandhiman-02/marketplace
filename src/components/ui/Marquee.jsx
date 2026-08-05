// Generic marquee — children do baar render hote hain, CSS -50% translate loop.
// Har copy apne wrapper mein hai taaki React keys clash na karein.
// Reduced motion mein index.css animation band kar deta hai.
export function Marquee({ children, className = '' }) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="marquee-track flex w-max">
        <div className="flex items-center shrink-0">{children}</div>
        <div className="flex items-center shrink-0" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
