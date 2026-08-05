import * as Icons from 'lucide-react';

// Brand logo nahi hai assets mein — colored rounded-square + lucide icon se tile banta hai
// (reference ke avatar cloud jaisa)
export function BrandTile({ name, icon, color, size = 72, rotate = 0, className = '', style }) {
  const Icon = Icons[icon] || Icons.HelpCircle;
  return (
    <div
      title={name}
      className={`flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
        borderRadius: Math.round(size * 0.3),
        transform: `rotate(${rotate}deg)`,
        boxShadow: '0 6px 18px rgba(15,23,42,0.14)',
        ...style,
      }}
    >
      <Icon size={Math.round(size * 0.44)} color="#fff" />
    </div>
  );
}