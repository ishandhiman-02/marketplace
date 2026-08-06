import * as Icons from 'lucide-react';

/**
 * Steps 6–9 in pages ko bharenge. Tab tak ye saaf-saaf batata hai ki
 * kya aane wala hai — khaali page se behtar.
 */
export function AdminPlaceholder({ title, description, step, features }) {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-ink mb-1.5" style={{ letterSpacing: '-0.5px' }}>{title}</h1>
      <p className="text-sm text-muted mb-8">{description}</p>

      <div className="bg-surface border border-line p-7" style={{ borderRadius: 22 }}>
        <div className="flex items-center gap-2.5 mb-4">
          <Icons.Hammer size={16} className="text-faint" />
          <span className="text-[11px] font-semibold uppercase text-faint" style={{ letterSpacing: '0.12em' }}>
            Step {step} mein banega
          </span>
        </div>
        <ul className="flex flex-col gap-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-[13px] text-muted leading-relaxed">
              <Icons.Check size={14} className="text-faint mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
