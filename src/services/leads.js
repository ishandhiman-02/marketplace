import { requireSupabase } from '../lib/supabase';

const TABLE = 'leads';

export const LEAD_STATUSES = ['new', 'contacted', 'paid', 'delivered', 'cancelled'];

function fromRow(r) {
  return {
    id: r.id,
    name: r.name,
    instagramUsername: r.instagram_username,
    phone: r.phone,
    productName: r.product_name,
    price: r.price,
    status: r.status,
    notes: r.notes,
    createdAt: r.created_at,
  };
}

/**
 * Public site se call hota hai — RLS mein anon ko sirf INSERT allowed hai.
 * Yahi wo jagah hai jahan "kaun khareed raha hai" ka record banta hai,
 * kyunki purchase khud Instagram DM pe hota hai.
 */
export async function createLead({ name, instagramUsername, phone, productName, price }) {
  const { data, error } = await requireSupabase().from(TABLE).insert({
    name: name.trim(),
    instagram_username: instagramUsername.trim().replace(/^@/, ''),
    phone: phone?.trim() || null,
    product_name: productName ?? null,
    price: price ?? null,
  }).select().single();
  if (error) throw error;
  return fromRow(data);
}

/** Admin only — anon ke paas SELECT policy hai hi nahi */
export async function listLeads({ status = null, sinceDays = null } = {}) {
  let q = requireSupabase().from(TABLE).select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  if (sinceDays) {
    const since = new Date(Date.now() - sinceDays * 86_400_000).toISOString();
    q = q.gte('created_at', since);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data.map(fromRow);
}

export async function updateLead(id, patch) {
  const row = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.notes !== undefined) row.notes = patch.notes;

  const { data, error } = await requireSupabase()
    .from(TABLE).update(row).eq('id', id).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteLead(id) {
  const { error } = await requireSupabase().from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

/** Dashboard ke upar wale 4 numbers */
export async function leadStats() {
  const leads = await listLeads();
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const weekAgo = Date.now() - 7 * 86_400_000;

  const paid = leads.filter((l) => l.status === 'paid' || l.status === 'delivered');
  return {
    today: leads.filter((l) => new Date(l.createdAt) >= startOfDay).length,
    thisWeek: leads.filter((l) => new Date(l.createdAt).getTime() >= weekAgo).length,
    paidCount: paid.length,
    revenue: paid.reduce((sum, l) => sum + (l.price || 0), 0),
    total: leads.length,
  };
}

/** Filtered rows ko CSV mein — admin "Export CSV" button */
export function leadsToCsv(leads) {
  const head = ['Date', 'Name', 'Instagram', 'Phone', 'Product', 'Price', 'Status', 'Notes'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = leads.map((l) => [
    new Date(l.createdAt).toLocaleString('en-IN'),
    l.name, l.instagramUsername, l.phone, l.productName, l.price, l.status, l.notes,
  ].map(esc).join(','));
  return [head.join(','), ...rows].join('\n');
}
