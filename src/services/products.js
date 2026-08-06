import { requireSupabase } from '../lib/supabase';

const TABLE = 'products';

// DB snake_case -> app camelCase, taaki components ka shape na badle
function fromRow(r) {
  return {
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    description: r.description,
    category: r.category,
    price: r.price,
    duration: r.duration,
    tag: r.tag,
    tagColor: r.tag_color,
    color: r.color,
    icon: r.icon,
    image: r.image_url,
    variants: r.variants?.length ? r.variants : undefined,
    isActive: r.is_active,
    sortOrder: r.sort_order,
  };
}

function toRow(p) {
  return {
    title: p.title,
    subtitle: p.subtitle ?? null,
    description: p.description ?? null,
    category: p.category,
    price: p.price,
    duration: p.duration ?? null,
    tag: p.tag ?? null,
    tag_color: p.tagColor ?? null,
    color: p.color ?? null,
    icon: p.icon ?? null,
    image_url: p.image ?? null,
    variants: p.variants ?? [],
    is_active: p.isActive ?? true,
    sort_order: p.sortOrder ?? 0,
  };
}

/** Public site sirf active products dekhti hai; admin sab. */
export async function listProducts({ includeInactive = false } = {}) {
  let q = requireSupabase().from(TABLE).select('*').order('sort_order').order('created_at');
  if (!includeInactive) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error) throw error;
  return data.map(fromRow);
}

export async function createProduct(product) {
  const { data, error } = await requireSupabase()
    .from(TABLE).insert(toRow(product)).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateProduct(id, patch) {
  const row = toRow(patch);
  // sirf wahi columns bhejo jo patch mein aaye — baaki undefined ho jaate
  Object.keys(row).forEach((k) => { if (row[k] === undefined) delete row[k]; });
  const { data, error } = await requireSupabase()
    .from(TABLE).update(row).eq('id', id).select().single();
  if (error) throw error;
  return fromRow(data);
}

/** Inline price edit — admin ka sabse common kaam */
export async function updateProductPrice(id, price) {
  const { data, error } = await requireSupabase()
    .from(TABLE).update({ price }).eq('id', id).select().single();
  if (error) throw error;
  return fromRow(data);
}

/** Soft delete — galti se hataya product wapas laaya ja sake */
export async function archiveProduct(id) {
  const { error } = await requireSupabase().from(TABLE).update({ is_active: false }).eq('id', id);
  if (error) throw error;
}

export async function setProductActive(id, isActive) {
  const { error } = await requireSupabase().from(TABLE).update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
}

/** Permanently hata deta hai — confirm dialog ke baad hi call karein */
export async function deleteProduct(id) {
  const { error } = await requireSupabase().from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
