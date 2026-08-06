import { useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { uploadProductImage } from '../../services/products';

const ICON_CHOICES = ['Tv', 'Play', 'Music', 'Shield', 'Brain', 'Code2', 'Palette', 'BookOpen', 'Briefcase', 'ShoppingBag', 'GraduationCap'];

const EMPTY = {
  title: '', subtitle: '', description: '', category: CATEGORIES[0]?.label || 'Streaming',
  price: '', duration: '', tag: '', tagColor: '#4f46e5', color: '#4f46e5',
  icon: 'Tag', image: '', variants: [], isActive: true, sortOrder: 0,
};

const field = 'px-3.5 py-2.5 rounded-xl border border-line bg-canvas text-ink text-sm outline-none focus:border-ink transition-colors w-full';
const labelCls = 'text-[12px] font-semibold text-muted';

export function ProductForm({ product, onCancel, onSave, onError }) {
  const [form, setForm] = useState(() => (product ? { ...EMPTY, ...product } : EMPTY));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setVariant = (i, k, v) => setForm((f) => ({
    ...f,
    variants: f.variants.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)),
  }));

  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      set('image', await uploadProductImage(file));
    } catch (err) {
      onError?.(err.message || 'Image upload nahi ho paayi');
    } finally {
      setUploading(false);
    }
  };

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
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(15,23,42,0.35)' }}
        onClick={onCancel}
        aria-hidden="true"
      />
      <motion.form
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onSubmit={submit}
        className="relative w-full max-w-lg h-full overflow-y-auto bg-surface border-l border-line p-6 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink" style={{ letterSpacing: '-0.4px' }}>
            {product ? 'Edit product' : 'Add product'}
          </h2>
          <button type="button" onClick={onCancel} aria-label="Close" className="text-muted hover:text-ink cursor-pointer">
            <Icons.X size={20} />
          </button>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Title *</span>
          <input required value={form.title} onChange={(e) => set('title', e.target.value)} className={field} />
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
              <input type="color" value={form.tagColor || '#4f46e5'} onChange={(e) => set('tagColor', e.target.value)} className="w-10 h-10 rounded-lg border border-line bg-canvas cursor-pointer shrink-0" />
              <input value={form.tagColor || ''} onChange={(e) => set('tagColor', e.target.value)} className={field} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={labelCls}>Brand colour</span>
          <div className="flex items-center gap-2">
            <input type="color" value={form.color || '#4f46e5'} onChange={(e) => set('color', e.target.value)} className="w-10 h-10 rounded-lg border border-line bg-canvas cursor-pointer shrink-0" />
            <input value={form.color || ''} onChange={(e) => set('color', e.target.value)} className={field} />
          </div>
        </div>

        {/* image */}
        <div className="flex flex-col gap-1.5">
          <span className={labelCls}>Image</span>
          <div className="flex items-center gap-3">
            {form.image
              ? <img src={form.image} alt="" className="w-16 h-16 rounded-xl object-cover border border-line shrink-0" />
              : <div className="w-16 h-16 rounded-xl border border-line bg-surface-2 flex items-center justify-center shrink-0"><Icons.Image size={18} className="text-faint" /></div>}
            <div className="flex-1 flex flex-col gap-2">
              <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-line text-[13px] font-semibold text-ink cursor-pointer w-fit hover:bg-surface-2 transition-colors">
                <Icons.Upload size={13} />
                {uploading ? 'Uploading…' : 'Upload image'}
                <input type="file" accept="image/*" onChange={pickImage} className="hidden" disabled={uploading} />
              </label>
              <input value={form.image || ''} onChange={(e) => set('image', e.target.value)} placeholder="ya image URL paste karein" className={field} />
            </div>
          </div>
        </div>

        {/* variants */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className={labelCls}>Variants</span>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, variants: [...f.variants, { label: '', price: '' }] }))}
              className="text-[12px] font-semibold text-ink inline-flex items-center gap-1 cursor-pointer"
            >
              <Icons.Plus size={13} /> Add row
            </button>
          </div>
          {form.variants.length === 0 && (
            <p className="text-[12px] text-faint">Alag-alag plans hain to yahan add karein (jaise 1 / 3 / 6 months).</p>
          )}
          {form.variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={v.label} onChange={(e) => setVariant(i, 'label', e.target.value)} placeholder="3 Months" className={field} />
              <input type="number" min="0" value={v.price} onChange={(e) => setVariant(i, 'price', e.target.value)} placeholder="230" className={`${field} w-28`} />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }))}
                aria-label="Remove variant"
                className="text-muted hover:text-ink cursor-pointer shrink-0"
              >
                <Icons.Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2.5 mt-1">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 accent-current" />
          <span className="text-[13px] text-ink">Site pe dikhaayein</span>
        </label>

        <div className="flex items-center gap-3 mt-2 pb-2">
          <button type="submit" disabled={busy} className="px-6 py-2.5 rounded-full text-sm font-semibold bg-ink text-canvas disabled:opacity-45 cursor-pointer">
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-full text-sm font-semibold border border-line text-ink cursor-pointer">
            Cancel
          </button>
        </div>
      </motion.form>
    </div>
  );
}
