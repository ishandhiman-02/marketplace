import { Router } from 'express';
import { q, one } from '../db.js';
import { requireAuth } from '../auth.js';

export const offers = Router();

const COLS = `id, emoji, title, subtitle, description, original_price, deal_price,
              tag, tag_color, slots_total, slots_left, expires_at, is_active, created_at`;

function toApi(r) {
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

const vals = (b) => [
  b.emoji ?? null, b.title, b.subtitle ?? null, b.description ?? null,
  b.originalPrice ?? null, Number(b.dealPrice), b.tag ?? null, b.tagColor ?? null,
  b.slots ?? 0, b.slotsLeft ?? 0, b.expiresAt || null, b.isActive ?? true,
];

// PUBLIC — sirf wo offers jo live hain: active, expire nahi hue, slots bache hain
offers.get('/', async (req, res, next) => {
  try {
    const rows = await q(
      `select ${COLS} from daily_offers
       where is_active = true
         and slots_left > 0
         and (expires_at is null or expires_at > now())
       order by created_at desc`,
    );
    res.json(rows.map(toApi));
  } catch (e) { next(e); }
});

offers.get('/all', requireAuth, async (req, res, next) => {
  try {
    const rows = await q(`select ${COLS} from daily_offers order by created_at desc`);
    res.json(rows.map(toApi));
  } catch (e) { next(e); }
});

offers.post('/', requireAuth, async (req, res, next) => {
  try {
    if (!req.body.title || req.body.dealPrice == null) {
      return res.status(400).json({ error: 'title aur deal price zaroori hain' });
    }
    const row = await one(
      `insert into daily_offers
        (emoji, title, subtitle, description, original_price, deal_price,
         tag, tag_color, slots_total, slots_left, expires_at, is_active)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning ${COLS}`,
      vals(req.body),
    );
    return res.status(201).json(toApi(row));
  } catch (e) { return next(e); }
});

offers.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const row = await one(
      `update daily_offers set
         emoji=$1, title=$2, subtitle=$3, description=$4, original_price=$5,
         deal_price=$6, tag=$7, tag_color=$8, slots_total=$9, slots_left=$10,
         expires_at=$11, is_active=$12
       where id=$13 returning ${COLS}`,
      [...vals(req.body), req.params.id],
    );
    if (!row) return res.status(404).json({ error: 'Offer nahi mila' });
    return res.json(toApi(row));
  } catch (e) { return next(e); }
});

/** Kal ka offer copy karke aaj ka — roz naya likhne se time bachta hai */
offers.post('/:id/duplicate', requireAuth, async (req, res, next) => {
  try {
    const row = await one(
      `insert into daily_offers
        (emoji, title, subtitle, description, original_price, deal_price,
         tag, tag_color, slots_total, slots_left, expires_at, is_active)
       select emoji, title, subtitle, description, original_price, deal_price,
              tag, tag_color, slots_total, slots_total, null, false
       from daily_offers where id=$1
       returning ${COLS}`,
      [req.params.id],
    );
    if (!row) return res.status(404).json({ error: 'Offer nahi mila' });
    return res.status(201).json(toApi(row));
  } catch (e) { return next(e); }
});

offers.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const row = await one('delete from daily_offers where id=$1 returning id', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Offer nahi mila' });
    return res.status(204).end();
  } catch (e) { return next(e); }
});
