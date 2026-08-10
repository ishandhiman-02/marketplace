import * as Icons from 'lucide-react';
import { field, labelCls, radius } from './ui';

/** A titled group of settings. One card per area of the site. */
export function SettingsGroup({ title, hint, icon, children }) {
  const Icon = Icons[icon] || Icons.Settings;
  return (
    <section className="bg-surface border border-line p-6" style={{ borderRadius: radius }}>
      <div className="flex items-start gap-3 mb-5">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--admin-accent-soft)', color: 'var(--color-ink)' }}
        >
          <Icon size={17} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-ink leading-tight">{title}</h2>
          {hint && <p className="text-[12px] text-muted mt-1 leading-relaxed">{hint}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

/** Labelled text input with an optional helper line. */
export function TextField({ label, value, onChange, hint, placeholder, prefix, type = 'text' }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelCls}>{label}</span>
      <span className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-sm text-faint pointer-events-none">{prefix}</span>
        )}
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={prefix ? `${field} pl-7` : field}
        />
      </span>
      {hint && <span className="text-[11px] text-faint leading-relaxed">{hint}</span>}
    </label>
  );
}

/** Colour swatch plus hex box, kept in sync. */
export function ColorField({ label, value, onChange, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelCls}>{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-line shrink-0"
        />
        <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={field} />
      </div>
      {hint && <span className="text-[11px] text-faint leading-relaxed">{hint}</span>}
    </div>
  );
}

/** On/off row used for the section visibility list. */
export function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-surface-2 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative w-10 h-6 rounded-full transition-colors shrink-0"
        style={{ background: checked ? 'var(--admin-accent)' : 'var(--admin-switch-off)' }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm"
          style={{ left: checked ? 18 : 2 }}
        />
      </button>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-ink">{label}</span>
        {hint && <span className="block text-[11px] text-faint">{hint}</span>}
      </span>
    </label>
  );
}

/**
 * Editable list of rows (trust items, stats, nav links).
 * `columns` describes each editable cell; `onChange` receives the whole array
 * back so the caller stays a pure setState.
 */
export function RepeaterField({ label, hint, rows, columns, onChange, addLabel, blank, max = 12 }) {
  const update = (i, key, v) => onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const next = i + dir;
    if (next < 0 || next >= rows.length) return;
    const copy = [...rows];
    [copy[i], copy[next]] = [copy[next], copy[i]];
    onChange(copy);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className={labelCls}>{label}</span>
      {hint && <span className="text-[11px] text-faint -mt-1 leading-relaxed">{hint}</span>}

      {rows.length === 0 && (
        <p className="text-[12px] text-faint py-2">Nothing here yet — this part of the site will be hidden.</p>
      )}

      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          {columns.map((c) => (
            <input
              key={c.key}
              value={row[c.key] ?? ''}
              onChange={(e) => update(i, c.key, e.target.value)}
              placeholder={c.placeholder}
              aria-label={`${c.placeholder} — row ${i + 1}`}
              className={field}
              style={c.width ? { flex: `0 0 ${c.width}px` } : undefined}
            />
          ))}
          <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="p-1.5 rounded-lg text-muted disabled:opacity-25 shrink-0">
            <Icons.ArrowUp size={14} />
          </button>
          <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down" className="p-1.5 rounded-lg text-muted disabled:opacity-25 shrink-0">
            <Icons.ArrowDown size={14} />
          </button>
          <button type="button" onClick={() => remove(i)} aria-label="Remove row" className="p-1.5 rounded-lg shrink-0" style={{ color: 'var(--admin-danger)' }}>
            <Icons.Trash2 size={14} />
          </button>
        </div>
      ))}

      {rows.length < max && (
        <button
          type="button"
          onClick={() => onChange([...rows, { ...blank }])}
          className="text-[12px] font-semibold inline-flex items-center gap-1 w-fit mt-1"
          style={{ color: 'var(--admin-accent)' }}
        >
          <Icons.Plus size={13} /> {addLabel}
        </button>
      )}
    </div>
  );
}
