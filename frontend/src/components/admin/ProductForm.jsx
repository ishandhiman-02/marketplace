import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { uploadProductImage } from '../../services/products';
import { ImageField } from './SettingsField';
import { field, labelCls, btnPrimary, btnGhost, iconBtn } from './ui';

const ICON_CHOICES = ['Tv', 'Play', 'Music', 'Shield', 'Brain', 'Code2', 'Palette', 'BookOpen', 'Briefcase', 'ShoppingBag', 'GraduationCap'];

const EMPTY = {
  title: '', subtitle: '', description: '', category: CATEGORIES[0]?.label || 'Streaming',
  price: '', duration: '', tag: '', tagColor: '#4f46e5', color: '#4f46e5',
  icon: 'Tag', image: '', variants: [], isActive: true, sortOrder: 0,
};

export function ProductForm({ product, onCancel, onSave }) {
  const [form, setForm] = useState(() => (product ? { ...EMPTY, ...product } : EMPTY));
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setVariant = (i, k, v) => setForm((f) => ({
    ...f,
    variants: f.variants.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)),
  }));

  // Escape closes the drawer — expected of anything that covers the page
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave({
        ...form,
        price: Number(form.price),
        variants: form.variants
          .filter((v) => v.label.trim())
          .map((v) => ({ label: v.label.trim(), price: Number(v.price) || 0 })),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={product ? 'Edit product' : 'Add product'}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(18,48,58,0.4)' }}
        onClick={onCancel}
        aria-hidden="true"
      />
      <motion.form
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onSubmit={submit}
        data-lenis-prevent
        className="relative w-full max-w-lg h-full overflow-y-auto bg-surface border-l border-line flex flex-col"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-surface border-b border-line">
          <h2 className="text-[17px] font-bold text-ink" style={{ letterSpacing: '-0.4px' }}>
            {product ? 'Edit product' : 'Add product'}
          </h2>
          <button type="button" onClick={onCancel} aria-label="Close" className={iconBtn}>
            <Icons.X size={19} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Title *</span>
            <input required autoFocus value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Netflix Premium" className={field} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Subtitle</span>
            <input value={form.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} placeholder="6 Months Access" className={field} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Description</span>
            <textarea rows={3} value={form.description || ''} onChange={(e) => set('description', e.target.value)} className={`${field} resize-y`} />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Category *</span>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className={field}>
                {CATEGORIES.map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Price (Rs.) *</span>
              <input required type="number" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} className={field} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Duration</span>
              <input value={form.duration || ''} onChange={(e) => set('duration', e.target.value)} placeholder="1 Year" className={field} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Icon</span>
              <select value={form.icon || 'Tag'} onChange={(e) => set('icon', e.target.value)} className={field}>
                {ICON_CHOICES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Tag text</span>
              <input value={form.tag || ''} onChange={(e) => set('tag', e.target.value)} placeholder="Best Value" className={field} />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className={labelCls}>Tag colour</span>
              <div className="flex items-center gap-2">
                <input type="color" aria-label="Tag colour" value={form.tagColor || '#4f46e5'} onChange={(e) => set('tagColor', e.target.value)} className="w-10 h-10 rounded-lg border border-line bg-surface shrink-0" />
                <input value={form.tagColor || ''} onChange={(e) => set('tagColor', e.target.value)} className={field} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={labelCls}>Brand colour</span>
            <div className="flex items-center gap-2">
              <input type="color" aria-label="Brand colour" value={form.color || '#4f46e5'} onChange={(e) => set('color', e.target.value)} className="w-10 h-10 rounded-lg border border-line bg-surface shrink-0" />
              <input value={form.color || ''} onChange={(e) => set('color', e.target.value)} className={field} />
            </div>
          </div>

          {/* image */}
          <ImageField
            label="Image"
            value={form.image}
            onChange={(v) => set('image', v)}
            onUpload={uploadProductImage}
            fit="cover"
            placeholder="or paste an image URL"
          />

          {/* variants */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className={labelCls}>Variants</span>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, variants: [...f.variants, { label: '', price: '' }] }))}
                className="text-[12px] font-semibold inline-flex items-center gap-1"
                style={{ color: 'var(--admin-accent)' }}
              >
                <Icons.Plus size={13} /> Add row
              </button>
            </div>
            {form.variants.length === 0 && (
              <p className="text-[12px] text-faint">If this product has multiple plans, add them here (e.g. 1 / 3 / 6 months).</p>
            )}
            {form.variants.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={v.label} onChange={(e) => setVariant(i, 'label', e.target.value)} placeholder="3 Months" aria-label="Variant name" className={field} />
                <input type="number" min="0" value={v.price} onChange={(e) => setVariant(i, 'price', e.target.value)} placeholder="230" aria-label="Variant price" className={`${field} w-28`} />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }))}
                  aria-label="Remove variant"
                  className={`${iconBtn} shrink-0`}
                  style={{ color: 'var(--admin-danger)' }}
                >
                  <Icons.Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-surface-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4" />
            <span className="text-[13px] text-ink font-medium">Show on the site</span>
          </label>
        </div>

        <div className="sticky bottom-0 flex items-center gap-3 px-6 py-4 bg-surface border-t border-line">
          <button type="submit" disabled={busy} className={btnPrimary} style={{ background: 'var(--admin-accent)', color: 'var(--admin-accent-text)' }}>
            {busy ? 'Saving…' : 'Save product'}
          </button>
          <button type="button" onClick={onCancel} className={btnGhost}>Cancel</button>
        </div>
      </motion.form>
    </div>
  );
}
