import { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { listProofs, uploadProofs, updateProof, deleteProof, reorderProofs } from '../../services/proofs';
import { Toast } from '../../components/admin/Toast';
import { useToast } from '../../components/admin/useToast';

const field = 'px-3 py-2 rounded-xl border border-line bg-canvas text-ink text-[13px] outline-none focus:border-ink transition-colors w-full';

export default function AdminProofs() {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const { toast, show } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      setProofs(await listProofs({ includeInactive: true }));
      setError(null);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

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

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink mb-1.5" style={{ letterSpacing: '-0.5px' }}>Proofs</h1>
        <p className="text-sm text-muted">Delivery and payment screenshots — these build trust on the public site.</p>
      </div>

      {error && <div className="p-4 rounded-2xl text-[13px] mb-6" style={{ background: '#FEE2E2', color: '#991B1B' }}>{error}</div>}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed p-10 text-center cursor-pointer transition-colors mb-6"
        style={{ borderRadius: 22, borderColor: dragging ? '#0f172a' : 'var(--color-line)', background: dragging ? 'var(--color-surface-2)' : 'transparent' }}
      >
        <Icons.UploadCloud size={26} className="mx-auto text-faint mb-3" />
        <p className="text-sm font-semibold text-ink">
          {uploading ? 'Uploading…' : 'Drag screenshots here, or click to browse'}
        </p>
        <p className="text-[12px] text-faint mt-1.5">
          You can select several files at once. They are compressed in the browser before upload.
        </p>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
      </div>

      <div className="p-3.5 rounded-2xl text-[12px] leading-relaxed mb-6" style={{ background: '#FEF3C7', color: '#92400E' }}>
        <strong>Careful:</strong> screenshots often contain a customer&rsquo;s name, phone number or UPI ID.
        Mask those before uploading, and get the customer&rsquo;s permission first.
      </div>

      {loading && <p className="text-sm text-muted">Loading…</p>}
      {!loading && proofs.length === 0 && !error && (
        <p className="text-sm text-muted text-center py-8">No proofs yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {proofs.map((p, i) => (
          <div key={p.id} className="bg-surface border border-line p-3 flex flex-col gap-2.5" style={{ borderRadius: 22, opacity: p.isActive ? 1 : 0.55 }}>
            <img src={p.imageUrl} alt={p.caption || 'Proof'} className="w-full object-cover" style={{ borderRadius: 16, aspectRatio: '4 / 5' }} />

            <input
              defaultValue={p.caption || ''}
              onBlur={(e) => e.target.value !== (p.caption || '') && patch(p, { caption: e.target.value })}
              placeholder="Caption"
              className={field}
            />
            <input
              defaultValue={p.productName || ''}
              onBlur={(e) => e.target.value !== (p.productName || '') && patch(p, { productName: e.target.value })}
              placeholder="Product name"
              className={field}
            />

            <div className="flex items-center gap-1">
              <button onClick={() => patch(p, { isActive: !p.isActive }, true)} className="px-3 py-1.5 rounded-full text-[12px] font-semibold border border-line text-ink cursor-pointer">
                {p.isActive ? 'Hide' : 'Show'}
              </button>
              <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="p-2 rounded-lg text-muted disabled:opacity-30 cursor-pointer">
                <Icons.ArrowUp size={14} />
              </button>
              <button onClick={() => move(i, 1)} disabled={i === proofs.length - 1} aria-label="Move down" className="p-2 rounded-lg text-muted disabled:opacity-30 cursor-pointer">
                <Icons.ArrowDown size={14} />
              </button>
              <button onClick={() => remove(p)} aria-label="Delete" className="ml-auto p-2 rounded-lg cursor-pointer" style={{ color: '#991B1B' }}>
                <Icons.Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
