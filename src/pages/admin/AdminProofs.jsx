import { useState, useEffect, useRef, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { listProofs, uploadProofs, updateProof, deleteProof, reorderProofs } from '../../services/proofs';
import { PageHeader } from '../../components/admin/PageHeader';
import { SearchInput } from '../../components/admin/SearchInput';
import { Pagination } from '../../components/admin/Pagination';
import { usePagination } from '../../components/admin/usePagination';
import { Panel, EmptyState, ErrorBar } from '../../components/admin/Panel';
import { Toast } from '../../components/admin/Toast';
import { useToast } from '../../components/admin/useToast';
import { btnSmall, iconBtn, radius } from '../../components/admin/ui';

const field = 'px-3 py-2 rounded-lg border border-line bg-surface text-ink text-[13px] '
  + 'outline-none focus:border-[var(--admin-accent)] transition-colors w-full placeholder:text-faint';

export default function AdminProofs() {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);
  const { toast, show } = useToast();

  const load = () => {
    setLoading(true);
    listProofs({ includeInactive: true })
      .then((rows) => { setProofs(rows); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return proofs;
    return proofs.filter((p) =>
      (p.caption || '').toLowerCase().includes(q)
      || (p.productName || '').toLowerCase().includes(q));
  }, [proofs, search]);

  const paged = usePagination(visible, 12, search);

  // The up/down arrows reorder by position in the full list. Once the grid is
  // paged or filtered the card's index is page-local, so map it back or
  // "move up" would swap the wrong two rows.
  const orderIndex = useMemo(() => new Map(proofs.map((p, i) => [p.id, i])), [proofs]);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    setUploading(true);
    try {
      const created = await uploadProofs(files);
      setProofs((l) => [...created, ...l]);
      show(`${created.length} proof${created.length > 1 ? 's' : ''} uploaded`);
    } catch (e) {
      show(e.message, 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const patch = async (proof, changes, quiet = false) => {
    try {
      const updated = await updateProof(proof.id, changes);
      setProofs((l) => l.map((p) => (p.id === proof.id ? updated : p)));
      if (!quiet) show('Saved');
    } catch (e) { show(e.message, 'error'); }
  };

  const remove = async (proof) => {
    if (!window.confirm('This proof will be deleted, along with its image. Are you sure?')) return;
    try {
      await deleteProof(proof.id);
      setProofs((l) => l.filter((p) => p.id !== proof.id));
      show('Deleted');
    } catch (e) { show(e.message, 'error'); }
  };

  /** Up/down — only swaps the sort_order of the two rows involved */
  const move = async (index, dir) => {
    const next = index + dir;
    if (next < 0 || next >= proofs.length) return;
    const list = [...proofs];
    [list[index], list[next]] = [list[next], list[index]];
    setProofs(list);
    try {
      await reorderProofs(list.map((p, i) => ({ id: p.id, sortOrder: i })));
    } catch (e) { show(e.message, 'error'); load(); }
  };

  const liveCount = proofs.filter((p) => p.isActive).length;

  return (
    <div>
      <PageHeader
        title="Proofs"
        subtitle={loading
          ? 'Loading…'
          : `${proofs.length} screenshots · ${liveCount} showing on the site · the first one appears first`}
      />

      <ErrorBar message={error} onRetry={load} />

      <button
        type="button"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full border-2 border-dashed p-10 text-center transition-colors mb-5"
        style={{
          borderRadius: radius,
          borderColor: dragging ? 'var(--admin-accent)' : 'var(--color-line)',
          background: dragging ? 'var(--admin-accent-soft)' : 'var(--color-surface)',
        }}
      >
        {uploading
          ? <Icons.Loader2 size={26} className="mx-auto mb-3 animate-spin" style={{ color: 'var(--admin-accent)' }} />
          : <Icons.UploadCloud size={26} className="mx-auto text-faint mb-3" />}
        <p className="text-sm font-semibold text-ink">
          {uploading ? 'Uploading…' : 'Drag screenshots here, or click to browse'}
        </p>
        <p className="text-[12px] text-faint mt-1.5">
          You can select several files at once. They are compressed in the browser before upload.
        </p>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
      </button>

      <div
        className="flex items-start gap-3 p-4 rounded-xl text-[12px] leading-relaxed mb-6"
        style={{ background: 'var(--admin-warning-soft)', color: 'var(--admin-warning)' }}
      >
        <Icons.ShieldAlert size={16} className="shrink-0 mt-0.5" />
        <p>
          <strong>Careful:</strong> screenshots often contain a customer&rsquo;s name, phone number or UPI ID.
          Mask those before uploading, and get the customer&rsquo;s permission first.
        </p>
      </div>

      {!loading && proofs.length > 0 && (
        <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search caption or product…"
            label="Search proofs"
          />
          {search && (
            <span className="text-[12px] text-muted">
              Reordering is off while a search is active
            </span>
          )}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-surface border border-line h-72 animate-pulse" style={{ borderRadius: radius }} />
          ))}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <Panel>
          <EmptyState
            icon={proofs.length === 0 ? 'Image' : 'SearchX'}
            title={proofs.length === 0 ? 'No proofs yet' : 'Nothing matches that search'}
            hint={proofs.length === 0
              ? 'Upload delivery or payment screenshots and they appear in a trust section on the public site. With none uploaded, that section stays hidden.'
              : 'Try a shorter search, or clear the box to see every screenshot.'}
          />
        </Panel>
      )}

      <span ref={paged.anchorRef} aria-hidden="true" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading && paged.pageItems.map((p) => {
          const i = orderIndex.get(p.id) ?? 0;
          return (
          <div
            key={p.id}
            className="bg-surface border border-line p-3 flex flex-col gap-2.5"
            style={{ borderRadius: radius, opacity: p.isActive ? 1 : 0.55 }}
          >
            <div className="relative">
              <img
                src={p.imageUrl}
                alt={p.caption || 'Delivery proof'}
                className="w-full object-cover"
                style={{ borderRadius: 12, aspectRatio: '4 / 5' }}
              />
              <span
                className="absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ background: 'rgba(18,48,58,0.75)', color: '#ffffff' }}
              >
                #{i + 1}
              </span>
              {!p.isActive && (
                <span
                  className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{ background: 'rgba(18,48,58,0.75)', color: '#ffffff' }}
                >
                  Hidden
                </span>
              )}
            </div>

            <input
              defaultValue={p.caption || ''}
              onBlur={(e) => e.target.value !== (p.caption || '') && patch(p, { caption: e.target.value })}
              placeholder="Caption"
              aria-label="Caption"
              className={field}
            />
            <input
              defaultValue={p.productName || ''}
              onBlur={(e) => e.target.value !== (p.productName || '') && patch(p, { productName: e.target.value })}
              placeholder="Product name"
              aria-label="Product name"
              className={field}
            />

            <div className="flex items-center gap-1">
              <button type="button" onClick={() => patch(p, { isActive: !p.isActive }, true)} className={btnSmall}>
                {p.isActive ? <Icons.EyeOff size={12} /> : <Icons.Eye size={12} />}
                {p.isActive ? 'Hide' : 'Show'}
              </button>
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={!!search || i === 0}
                aria-label="Move up"
                className={`${iconBtn} disabled:opacity-30`}
              >
                <Icons.ArrowUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={!!search || i === proofs.length - 1}
                aria-label="Move down"
                className={`${iconBtn} disabled:opacity-30`}
              >
                <Icons.ArrowDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => remove(p)}
                aria-label="Delete proof"
                className={`${iconBtn} ml-auto`}
                style={{ color: 'var(--admin-danger)' }}
              >
                <Icons.Trash2 size={14} />
              </button>
            </div>
          </div>
          );
        })}
      </div>

      {!loading && visible.length > 0 && (
        <div className="mt-4">
          <Panel>
            <Pagination
              page={paged.page}
              pageCount={paged.pageCount}
              from={paged.from}
              to={paged.to}
              total={paged.total}
              onGo={paged.goTo}
              unit="proofs"
            />
          </Panel>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}
