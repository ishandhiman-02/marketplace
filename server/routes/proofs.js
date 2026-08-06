import { Router } from 'express';
import { q, one } from '../db.js';
import { requireAuth } from '../auth.js';
import { upload, removeUpload } from './uploads.js';

export const proofs = Router();

const COLS = 'id, image_url, caption, product_name, is_active, sort_order, created_at';

function toApi(r) {
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

// PUBLIC
proofs.get('/', async (req, res, next) => {
  try {
    const rows = await q(
      `select ${COLS} from proofs where is_active = true order by sort_order, created_at desc`,
    );
    res.json(rows.map(toApi));
  } catch (e) { next(e); }
});

proofs.get('/all', requireAuth, async (req, res, next) => {
  try {
    const rows = await q(`select ${COLS} from proofs order by sort_order, created_at desc`);
    res.json(rows.map(toApi));
  } catch (e) { next(e); }
});

/** Multiple files ek saath — client se compressed aati hain */
proofs.post('/', requireAuth, upload.array('files', 12), async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'Koi file nahi mili' });

    const created = [];
    for (const file of req.files) {
      const row = await one(
        `insert into proofs (image_url, caption, product_name)
         values ($1,$2,$3) returning ${COLS}`,
        [`/uploads/${file.filename}`, req.body.caption || null, req.body.productName || null],
      );
      created.push(toApi(row));
    }
    return res.status(201).json(created);
  } catch (e) { return next(e); }
});

proofs.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const sets = [];
    const params = [];
    const add = (col, val) => { params.push(val); sets.push(`${col}=$${params.length}`); };

    if (req.body.caption !== undefined) add('caption', req.body.caption);
    if (req.body.productName !== undefined) add('product_name', req.body.productName);
    if (req.body.isActive !== undefined) add('is_active', req.body.isActive);
    if (req.body.sortOrder !== undefined) add('sort_order', req.body.sortOrder);
    if (!sets.length) return res.status(400).json({ error: 'Kuch update karne ko nahi hai' });

    params.push(req.params.id);
    const row = await one(
      `update proofs set ${sets.join(', ')} where id=$${params.length} returning ${COLS}`,
      params,
    );
    if (!row) return res.status(404).json({ error: 'Proof nahi mila' });
    return res.json(toApi(row));
  } catch (e) { return next(e); }
});

/** Row ke saath disk se file bhi hataata hai, warna uploads/ bharta rahega */
proofs.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const row = await one('delete from proofs where id=$1 returning image_url', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Proof nahi mila' });
    await removeUpload(row.image_url);
    return res.status(204).end();
  } catch (e) { return next(e); }
});
