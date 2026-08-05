import * as Icons from 'lucide-react';

// White circle mein icon — reference mein floating chips aur marquee ke neeche dikhte hain
export function IconChip({ icon, size = 44, className = '', style }) {
  const Icon = Icons[icon] || Icons.HelpCircle;
  return (
    <div
      className={`bg-surface border border-line rounded-full flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size, boxShadow: '0 2px 10px rgba(15,23,42,0.07)', ...style }}
    >
      <Icon size={Math.round(size * 0.42)} className="text-ink" />
    </div>
  );
}