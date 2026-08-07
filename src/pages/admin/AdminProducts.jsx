import { useState, useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import {
  listProducts, createProduct, updateProduct, updateProductPrice,
  setProductActive, deleteProduct,
} from '../../services/products';
import { ProductForm } from '../../components/admin/ProductForm';
import { Toast } from '../../components/admin/Toast';
import { useToast } from '../../components/admin/useToast';

const field = 'px-3.5 py-2 rounded-xl border border-line bg-canvas text-ink text-sm outline-none focus:border-ink transition-colors';

/** Price cell — click, change the number, Enter to save. The client's most frequent task. */
function PriceCell({ product, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(product.price);
  const [busy, setBusy] = useState(false);

  const commit = async () => {
    const next = Number(value);
    setEditing(false);
    if (!Number.isFinite(next) || next < 0 || next === product.price) {
      setValue(product.price);
      return;
    }
    setBusy(true);
    try {
      await onSave(next);
    } catch {
      setValue(product.price);
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <button
        onClick={() => { setValue(product.price); setEditing(true); }}
        title="Click to edit"
        className="font-semibold text-ink tabular-nums hover:bg-surface-2 px-2 py-1 -mx-2 rounded-lg cursor-pointer transition-colors"
      >
        {busy ? '…' : `Rs.${product.price}`}
      </button>
    );
  }

  return (
    <input
      autoFocus
      type="number"
      min="0"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') { setValue(product.price); setEditing(false); }
      }}
      className={`${field} w-24 py-1`}
    />
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const { toast, show } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      setProducts(await listProducts({ includeInactive: true }));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const okCat = category === 'All' || p.category === category;
      const okText = !q || p.title.toLowerCase().includes(q) || (p.subtitle || '').toLowerCase().includes(q);
      return okCat && okText;
    });
  }, [products, search, category]);

  const savePrice = async (p, price) => {
    try {
      const updated = await updateProductPrice(p.id, price);
      setProducts((list) => list.map((x) => (x.id === p.id ? updated : x)));
      show('Saved');
    } catch (e) {
      show(e.message || 'Could not save the price', 'error');
      throw e;
    }
  };

  const toggleActive = async (p) => {
    try {
      await setProductActive(p.id, !p.isActive);
      setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, isActive: !p.isActive } : x)));
      show(p.isActive ? 'Hidden from the site' : 'Now visible on the site');
    } catch (e) {
      show(e.message || 'Could not apply the change', 'error');
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`"${p.title}" will be deleted. Are you sure?\n\n(To only hide it, switch the Active toggle off instead — that can be undone.)`)) return;
    try {
      await deleteProduct(p.id);
      setProducts((list) => list.filter((x) => x.id !== p.id));
      show('Deleted');
    } catch (e) {
      show(e.message || 'Could not delete', 'error');
    }
  };

  const save = async (data) => {
    try {
      if (editing === 'new') {
        const created = await createProduct(data);
        setProducts((list) => [...list, created]);
      } else {
        const updated = await updateProduct(editing.id, data);
        setProducts((list) => list.map((x) => (x.id === editing.id ? updated : x)));
      }
      setEditing(null);
      show('Saved');
    } catch (e) {
      show(e.message || 'Could not save', 'error');
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-1.5" style={{ letterSpacing: '-0.5px' }}>Products</h1>
          <p className="text-sm text-muted">
            {products.length} products · prices can be edited straight from the table
          </p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="px-5 py-2.5 rounded-full text-sm font-semibold bg-ink text-canvas inline-flex items-center gap-2 cursor-pointer"
        >
          <Icons.Plus size={15} />
          Add product
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl text-[13px] mb-6" style={{ background: '#FEE2E2', color: '#991B1B' }}>{error}</div>
      )}

      {/* filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative">
          <Icons.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className={`${field} pl-9 w-56`}
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
        </select>
        {(search || category !== 'All') && (
          <span className="text-[12px] text-faint">{visible.length} of {products.length}</span>
        )}
      </div>

      {/* table */}
      <div className="bg-surface border border-line overflow-x-auto" style={{ borderRadius: 22 }}>
        <table className="w-full text-sm" style={{ minWidth: 720 }}>
          <thead>
            <tr className="text-left">
              {['', 'Product', 'Category', 'Price', 'Active', ''].map((h, i) => (
                <th key={i} className="px-4 py-3 text-[10px] font-semibold uppercase text-faint border-b border-line whitespace-nowrap" style={{ letterSpacing: '0.1em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">Loading…</td></tr>
            )}
            {!loading && visible.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                {products.length === 0 ? 'No products yet.' : 'Nothing matches this filter.'}
              </td></tr>
            )}
            {visible.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0" style={{ opacity: p.isActive ? 1 : 0.5 }}>
                <td className="px-4 py-3">
                  {p.image
                    ? <img src={p.image} alt="" className="w-11 h-11 rounded-xl object-cover border border-line" />
                    : <div className="w-11 h-11 rounded-xl bg-surface-2 border border-line" />}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-ink">{p.title}</div>
                  <div className="text-[12px] text-faint">{p.subtitle}</div>
                </td>
                <td className="px-4 py-3 text-muted whitespace-nowrap">{p.category}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <PriceCell product={p} onSave={(v) => savePrice(p, v)} />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(p)}
                    aria-label="Toggle active"
                    className="relative w-10 h-6 rounded-full transition-colors cursor-pointer"
                    style={{ background: p.isActive ? '#0f172a' : '#D6DFDB' }}
                  >
                    <span
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                      style={{ left: p.isActive ? 18 : 2 }}
                    />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => setEditing(p)} aria-label="Edit" className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface-2 cursor-pointer">
                      <Icons.Pencil size={15} />
                    </button>
                    <button onClick={() => remove(p)} aria-label="Delete" className="p-2 rounded-lg text-muted hover:bg-surface-2 cursor-pointer" style={{ color: '#991B1B' }}>
                      <Icons.Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSave={save}
          onError={(m) => show(m, 'error')}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
