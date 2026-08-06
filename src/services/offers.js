import { requireSupabase } from '../lib/supabase';

const TABLE = 'daily_offers';

function fromRow(r) {
  return {
    id: r.id,
    emoji: r.emoji,
    title: r.title,
    subtitle: r.subtitle,
    description: r.description,
    originalPrice: r.original_price,
    dealPrice: r.deal_price,
    savings: (r.original_price ?? 0) - r.deal_price,
    tag: r.tag,
    tagColor: r.tag_color,
    slots: r.slots_total,
    slotsLeft: r.slots_left,
    expiresAt: r.expires_at,
    isActive: r.is_active,
  };
}

function toRow(o) {
  return {
    emoji: o.emoji ?? null,
    title: o.title,
    subtitle: o.subtitle ?? null,
    description: o.description ?? null,
    original_price: o.originalPrice ?? null,
    deal_price: o.dealPrice,
    tag: o.tag ?? null,
    tag_color: o.tagColor ?? null,
    slots_total: o.slots ?? 0,
    slots_left: o.slotsLeft ?? 0,
    expires_at: o.expiresAt ?? null,
    is_active: o.isActive ?? true,
  };
}

/** liveOnly: sirf wahi offers jo active hain, expire nahi hue, aur slots bache hain */
export async function listDailyOffers({ liveOnly = false } = {}) {
  const { data, error } = await requireSupabase()
    .from(TABLE).select('*').order('created_at', { ascending: false });
  if (error) throw error;

  const rows = data.map(fromRow);
  if (!liveOnly) return rows;

  const now = Date.now();
  return rows.filter(
    (o) => o.isActive
      && o.slotsLeft > 0
      && (!o.expiresAt || new Date(o.expiresAt).getTime() > now),
  );
}

export async function createDailyOffer(offer) {
  const { data, error } = await requireSupabase()
    .from(TABLE).insert(toRow(offer)).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateDailyOffer(id, patch) {
  const row = toRow(patch);
  Object.keys(row).forEach((k) => { if (row[k] === undefined) delete row[k]; });
  const { data, error } = await requireSupabase()
    .from(TABLE).update(row).eq('id', id).select().single();
  if (error) throw error;
  return fromRow(data);
}

/** Kal ka offer copy karke aaj ka banana — roz naya likhne se time bachta hai */
export async function duplicateDailyOffer(id) {
  const { data, error } = await requireSupabase().from(TABLE).select('*').eq('id', id).single();
  if (error) throw error;
  const { id: _id, created_at: _created, ...rest } = data;
  const { data: created, error: insertError } = await requireSupabase()
    .from(TABLE).insert({ ...rest, expires_at: null, is_active: false }).select().single();
  if (insertError) throw insertError;
  return fromRow(created);
}

export async function deleteDailyOffer(id) {
  const { error } = await requireSupabase().from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

/** List view ke status pill ke liye */
export function offerStatus(offer) {
  if (!offer.isActive) return 'paused';
  if (offer.slotsLeft <= 0) return 'sold-out';
  if (offer.expiresAt && new Date(offer.expiresAt).getTime() <= Date.now()) return 'expired';
  return 'live';
}
