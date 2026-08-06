import { Router } from 'express';
import { q, one } from '../db.js';
import { requireAuth } from '../auth.js';

export const products = Router();

const COLS = `id, title, subtitle, description, category, price, duration,
              tag, tag_color, color, icon, image_url, variants,
              is_active, sort_order, created_at`;

function toApi(r) {
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

const vals = (b) => [
  b.title, b.subtitle ?? null, b.description ?? null, b.category,
  Number(b.price), b.duration ?? null, b.tag ?? null, b.tagColor ?? null,
  b.color ?? null, b.icon ?? null, b.image ?? null,
  JSON.stringify(b.variants ?? []), b.isActive ?? true, b.sortOrder ?? 0,
];

// PUBLIC — sirf active products
products.get('/', async (req, res, next) => {
  try {
    const rows = await q(
      `select ${COLS} from products where is_active = true order by sort_order, created_at`,
    );
    res.json(rows.map(toApi));
  } catch (e) { next(e); }
});

// ADMIN — inactive bhi, warna unhe manage nahi kar payenge
products.get('/all', requireAuth, async (req, res, next) => {
  try {
    const rows = await q(`select ${COLS} from products order by sort_order, created_at`);
    res.json(rows.map(toApi));
  } catch (e) { next(e); }
});

products.post('/', requireAuth, async (req, res, next) => {
  try {
    if (!req.body.title || req.body.price == null) {
      return res.status(400).json({ error: 'title aur price zaroori hain' });
    }
    const row = await one(
      `insert into products
        (title, subtitle, description, category, price, duration, tag, tag_color,
         color, icon, image_url, variants, is_active, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       returning ${COLS}`,
      vals(req.body),
    );
    return res.status(201).json(toApi(row));
  } catch (e) { return next(e); }
});

products.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const row = await one(
      `update products set
         title=$1, subtitle=$2, description=$3, category=$4, price=$5, duration=$6,
         tag=$7, tag_color=$8, color=$9, icon=$10, image_url=$11, variants=$12,
         is_active=$13, sort_order=$14
       where id=$15 returning ${COLS}`,
      [...vals(req.body), req.params.id],
    );
    if (!row) return res.status(404).json({ error: 'Product nahi mila' });
    return res.json(toApi(row));
  } catch (e) { return next(e); }
});

// inline price edit — sabse common admin action, isliye apna chhota endpoint
products.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const sets = [];
    const params = [];
    const add = (col, val) => { params.push(val); sets.push(`${col}=$${params.length}`); };

    if (req.body.price !== undefined) add('price', Number(req.body.price));
    if (req.body.isActive !== undefined) add('is_active', req.body.isActive);
    if (req.body.sortOrder !== undefined) add('sort_order', req.body.sortOrder);
    if (!sets.length) return res.status(400).json({ error: 'Kuch update karne ko nahi hai' });

    params.push(req.params.id);
    const row = await one(
      `update products set ${sets.join(', ')} where id=$${params.length} returning ${COLS}`,
      params,
    );
    if (!row) return res.status(404).json({ error: 'Product nahi mila' });
    return res.json(toApi(row));
  } catch (e) { return next(e); }
});

products.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const row = await one('delete from products where id=$1 returning id', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Product nahi mila' });
    return res.status(204).end();
  } catch (e) { return next(e); }
});
