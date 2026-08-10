import * as Icons from 'lucide-react';

/**
 * Coloured status dropdown — the pill in the reference table.
 * A native <select> on purpose: it is one tap on mobile, works with the
 * keyboard for free, and never traps focus the way a custom menu can.
 */
export function StatusSelect({ value, options, styleMap, onChange, disabled = false }) {
  const tone = styleMap[value] || { bg: 'var(--color-surface-2)', fg: 'var(--color-muted)' };

  return (
    <span className="relative inline-flex items-center">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Status"
        className="appearance-none pl-3 pr-7 py-1.5 rounded-lg text-[12px] font-bold border-0 outline-none
                   disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: tone.bg, color: tone.fg }}
      >
        {options.map((s) => (
          <option key={s} value={s} style={{ background: '#ffffff', color: '#12303A' }}>
            {styleMap[s].label}
          </option>
        ))}
      </select>
      <Icons.ChevronDown
        size={13}
        className="absolute right-2 pointer-events-none"
        style={{ color: tone.fg }}
        aria-hidden="true"
      />
    </span>
  );
}
