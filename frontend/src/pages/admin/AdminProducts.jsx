import { useState, useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import {
  listProducts, createProduct, updateProduct, updateProductPrice,
  setProductActive, deleteProduct,
} from '../../services/products';
import { ProductForm } from '../../components/admin/ProductForm';
import { mediaUrl } from '../../lib/api';
import { PageHeader } from '../../components/admin/PageHeader';
import { SearchInput } from '../../components/admin/SearchInput';
import { Pagination } from '../../components/admin/Pagination';
import { usePagination } from '../../components/admin/usePagination';
import { Panel, EmptyState, SkeletonRows, ErrorBar } from '../../components/admin/Panel';
import { Toast } from '../../components/admin/Toast';
import { useToast } from '../../components/admin/useToast';
import { field, btnPrimary, iconBtn, th, td } from '../../components/admin/ui';
import { useLiveRefresh } from '../../hooks/useLiveRefresh';

/**
 * Price cell — click, change the number, Enter to save. The client's most
 * frequent task, so it never opens a form. Escape cancels.
 */
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
        type="button"
        onClick={() => { setValue(product.price); setEditing(true); }}
        title="Click to edit the price"
        className="group inline-flex items-center gap-1.5 font-semibold text-ink tabular-nums
                   px-2 py-1 -mx-2 rounded-lg transition-colors hover:bg-surface-2"
      >
        {busy ? '…' : `Rs.${product.price}`}
        <Icons.Pencil
          size={11}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-faint"
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <input
      autoFocus
      type="number"
      min="0"
      aria-label={`Price for ${product.title}`}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') { setValue(product.price); setEditing(false); }
      }}
      className={`${field} w-24 py-1.5`}
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

  const load = () => {
    setLoading(true);
    listProducts({ includeInactive: true })
      .then((rows) => { setProducts(rows); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Another admin's edit (or your own in a second tab) lands here on its own.
  useLiveRefresh(load);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const okCat = category === 'All' || p.category === category;
      const okText = !q || p.title.toLowerCase().includes(q) || (p.subtitle || '').toLowerCase().includes(q);
      return okCat && okText;
    });
  }, [products, search, category]);

  const liveCount = products.filter((p) => p.isActive).length;
  const paged = usePagination(visible, 20, `${search}|${category}`);

  const savePrice = async (p, price) => {
    try {
      const updated = await updateProductPrice(p.id, price);
      setProducts((list) => list.map((x) => (x.id === p.id ? updated : x)));
      show(`${p.title} is now Rs.${price}`);
    } catch (e) {
      show(e.message || 'Could not save the price', 'error');
      throw e;
    }
  };

  const toggleActive = async (p) => {
    const before = products;
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, isActive: !p.isActive } : x)));
    try {
      await setProductActive(p.id, !p.isActive);
      show(p.isActive ? `${p.title} hidden from the site` : `${p.title} is now live`);
    } catch (e) {
      setProducts(before);
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
    <div>
      <PageHeader
        title="Products"
        subtitle={loading
          ? 'Loading the catalogue…'
          : `${products.length} products · ${liveCount} live on the site · click any price to edit it`}
      >
        <button
          type="button"
          onClick={() => setEditing('new')}
          className={btnPrimary}
          style={{ background: 'var(--admin-accent)', color: 'var(--admin-accent-text)' }}
        >
          <Icons.Plus size={16} />
          Add product
        </button>
      </PageHeader>

      <ErrorBar message={error} onRetry={load} />

      <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name…"
          label="Search products"
          width="w-full sm:w-64"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className={`${field} w-auto`}
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
        </select>
        {(search || category !== 'All') && (
          <button
            type="button"
            onClick={() => { setSearch(''); setCategory('All'); }}
            className="text-[13px] font-semibold text-muted hover:text-ink transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      <Panel>
        <span ref={paged.anchorRef} aria-hidden="true" />

        {/* Phone and tablet: one card per product.
            A 780px-wide table on a 390px screen is a sideways-scrolling
            spreadsheet, and with scrollbars hidden there is nothing to tell
            you the rest of the row is even there. Every action from the
            table is here — price, live toggle, edit, delete. */}
        <div className="lg:hidden divide-y divide-[var(--color-line)]">
          {loading && [0, 1, 2].map((i) => (
            <div key={i} className="p-4 flex gap-3 items-center">
              <span className="w-12 h-12 rounded-xl bg-surface-2 animate-pulse shrink-0" />
              <span className="flex-1 h-4 rounded-md bg-surface-2 animate-pulse" />
            </div>
          ))}

          {!loading && visible.length === 0 && (
            <EmptyState
              icon={products.length === 0 ? 'Tag' : 'SearchX'}
              title={products.length === 0 ? 'No products yet' : 'Nothing matches this filter'}
              hint={products.length === 0
                ? 'Add your first product and it appears on the site straight away.'
                : 'Try a different category, or clear the search box.'}
              actionLabel={products.length === 0 ? 'Add product' : undefined}
              onAction={products.length === 0 ? () => setEditing('new') : undefined}
            />
          )}

          {!loading && paged.pageItems.map((p) => (
            <div key={p.id} className="p-4 flex gap-3" style={{ opacity: p.isActive ? 1 : 0.55 }}>
              {p.image
                ? <img src={mediaUrl(p.image)} alt="" className="w-14 h-14 rounded-xl object-cover border border-line shrink-0" />
                : (
                  <div className="w-14 h-14 rounded-xl bg-surface-2 border border-line flex items-center justify-center shrink-0">
                    <Icons.Image size={16} className="text-faint" />
                  </div>
                )}

              <div className="min-w-0 flex-1">
                <div className="font-semibold text-ink leading-tight">{p.title}</div>
                <div className="text-[12px] text-faint">{p.subtitle}</div>
                <div className="text-[12px] text-muted mt-0.5">{p.category}</div>

                <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                  <PriceCell product={p} onSave={(v) => savePrice(p, v)} />

                  <button
                    type="button"
                    onClick={() => toggleActive(p)}
                    role="switch"
                    aria-checked={p.isActive}
                    aria-label={`${p.isActive ? 'Hide' : 'Show'} ${p.title} on the site`}
                    className="relative w-10 h-6 rounded-full transition-colors shrink-0"
                    style={{ background: p.isActive ? 'var(--admin-accent)' : 'var(--admin-switch-off)' }}
                  >
                    <span
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm"
                      style={{ left: p.isActive ? 18 : 2 }}
                    />
                  </button>

                  <span className="text-[12px] text-muted">{p.isActive ? 'Live' : 'Hidden'}</span>

                  <div className="flex items-center gap-1 ml-auto">
                    <button type="button" onClick={() => setEditing(p)} aria-label={`Edit ${p.title}`} className={iconBtn}>
                      <Icons.Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(p)}
                      aria-label={`Delete ${p.title}`}
                      className={iconBtn}
                      style={{ color: 'var(--admin-danger)' }}
                    >
                      <Icons.Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block overflow-x-auto" data-lenis-prevent>
          <table className="w-full text-sm" style={{ minWidth: 780 }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)' }}>
                {['', 'Product', 'Category', 'Price', 'Live', ''].map((h, i) => (
                  <th key={h || i} className={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonRows rows={5} cols={6} />}

              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={products.length === 0 ? 'Tag' : 'SearchX'}
                      title={products.length === 0 ? 'No products yet' : 'Nothing matches this filter'}
                      hint={products.length === 0
                        ? 'Add your first product and it appears on the site straight away.'
                        : 'Try a different category, or clear the search box.'}
                      actionLabel={products.length === 0 ? 'Add product' : undefined}
                      onAction={products.length === 0 ? () => setEditing('new') : undefined}
                    />
                  </td>
                </tr>
              )}

              {!loading && paged.pageItems.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-line last:border-0 transition-colors hover:bg-surface-2"
                  style={{ opacity: p.isActive ? 1 : 0.55 }}
                >
                  <td className={`${td} w-16`}>
                    {p.image
                      ? <img src={mediaUrl(p.image)} alt="" className="w-11 h-11 rounded-xl object-cover border border-line" />
                      : (
                        <div className="w-11 h-11 rounded-xl bg-surface-2 border border-line flex items-center justify-center">
                          <Icons.Image size={15} className="text-faint" />
                        </div>
                      )}
                  </td>
                  <td className={td}>
                    <div className="font-semibold text-ink">{p.title}</div>
                    <div className="text-[12px] text-faint">{p.subtitle}</div>
                  </td>
                  <td className={`${td} text-muted whitespace-nowrap`}>{p.category}</td>
                  <td className={`${td} whitespace-nowrap`}>
                    <PriceCell product={p} onSave={(v) => savePrice(p, v)} />
                  </td>
                  <td className={td}>
                    <button
                      type="button"
                      onClick={() => toggleActive(p)}
                      role="switch"
                      aria-checked={p.isActive}
                      aria-label={`${p.isActive ? 'Hide' : 'Show'} ${p.title} on the site`}
                      className="relative w-10 h-6 rounded-full transition-colors shrink-0"
                      style={{ background: p.isActive ? 'var(--admin-accent)' : 'var(--admin-switch-off)' }}
                    >
                      <span
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm"
                        style={{ left: p.isActive ? 18 : 2 }}
                      />
                    </button>
                  </td>
                  <td className={td}>
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditing(p)}
                        aria-label={`Edit ${p.title}`}
                        className={iconBtn}
                      >
                        <Icons.Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(p)}
                        aria-label={`Delete ${p.title}`}
                        className={iconBtn}
                        style={{ color: 'var(--admin-danger)' }}
                      >
                        <Icons.Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && (
          <Pagination
            page={paged.page}
            pageCount={paged.pageCount}
            from={paged.from}
            to={paged.to}
            total={paged.total}
            onGo={paged.goTo}
            unit="products"
          />
        )}
      </Panel>

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
