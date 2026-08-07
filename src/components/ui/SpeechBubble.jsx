// The reference's black speech bubble ("@reatha") — tail at bottom-left.
// Inverts with the theme via the ink/canvas tokens.
export function SpeechBubble({ children, rotate = 0, className = '' }) {
  return (
    <div className={`relative inline-block ${className}`} style={{ transform: `rotate(${rotate}deg)` }}>
      <div className="bg-ink text-canvas text-[13px] font-semibold px-4 py-2 rounded-full whitespace-nowrap">
        {children}
      </div>
      <div
        className="absolute bg-ink"
        style={{
          width: 10,
          height: 10,
          left: 14,
          bottom: -4,
          clipPath: 'polygon(0 0, 100% 0, 20% 100%)',
        }}
      />
    </div>
  );
}