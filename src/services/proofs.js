import { requireSupabase } from '../lib/supabase';

const TABLE = 'proofs';
const BUCKET = 'proofs';

function fromRow(r) {
  return {
    id: r.id,
    imageUrl: r.image_url,
    caption: r.caption,
    productName: r.product_name,
    isActive: r.is_active,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  };
}

export async function listProofs({ includeInactive = false } = {}) {
  let q = requireSupabase().from(TABLE).select('*').order('sort_order').order('created_at', { ascending: false });
  if (!includeInactive) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error) throw error;
  return data.map(fromRow);
}

/**
 * Phone ke screenshots 4MB tak ke hote hain — upload se pehle browser mein hi
 * compress kar dete hain, warna proofs section site slow kar dega.
 */
export async function compressImage(file, { maxWidth = 1200, quality = 0.8 } = {}) {
  if (!file.type.startsWith('image/')) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  if (scale === 1 && file.size < 400_000) return file;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
}

/** File storage mein daalta hai + proofs row banata hai */
export async function uploadProof(file, { caption = '', productName = '' } = {}) {
  const sb = requireSupabase();
  const compressed = await compressImage(file);

  const ext = compressed.name.split('.').pop() || 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await sb.storage
    .from(BUCKET).upload(path, compressed, { cacheControl: '3600', upsert: false });
  if (uploadError) throw uploadError;

  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);

  const { data, error } = await sb.from(TABLE)
    .insert({ image_url: pub.publicUrl, caption, product_name: productName })
    .select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateProof(id, patch) {
  const row = {};
  if (patch.caption !== undefined) row.caption = patch.caption;
  if (patch.productName !== undefined) row.product_name = patch.productName;
  if (patch.isActive !== undefined) row.is_active = patch.isActive;
  if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder;

  const { data, error } = await requireSupabase()
    .from(TABLE).update(row).eq('id', id).select().single();
  if (error) throw error;
  return fromRow(data);
}

/** Row ke saath storage se file bhi hataata hai — warna bucket bharta rahega */
export async function deleteProof(proof) {
  const sb = requireSupabase();

  const { error } = await sb.from(TABLE).delete().eq('id', proof.id);
  if (error) throw error;

  const path = proof.imageUrl?.split(`/${BUCKET}/`).pop();
  if (path) await sb.storage.from(BUCKET).remove([path]);
}

export async function reorderProofs(orderedIds) {
  const sb = requireSupabase();
  await Promise.all(
    orderedIds.map((id, i) => sb.from(TABLE).update({ sort_order: i }).eq('id', id)),
  );
}
