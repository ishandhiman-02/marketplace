import { Router } from 'express';
import { q, one } from '../db.js';
import { requireAuth } from '../auth.js';

export const leads = Router();

const COLS = `id, name, instagram_username, phone, product_name, price,
              status, notes, created_at`;

const STATUSES = ['new', 'contacted', 'paid', 'delivered', 'cancelled'];

function toApi(r) {
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
 * PUBLIC — this is where the record of who is buying gets created.
 * The purchase happens in an Instagram DM, so the site calls this just before
 * opening the DM. The response returns only an id — the public can never read
 * anyone else's leads.
 */
leads.post('/', async (req, res, next) => {
  try {
    const { name, instagramUsername, phone, productName, price } = req.body;
    if (!name?.trim() || !instagramUsername?.trim()) {
      return res.status(400).json({ error: 'Name and Instagram username are required' });
    }
    const row = await one(
      `insert into leads (name, instagram_username, phone, product_name, price)
       values ($1,$2,$3,$4,$5) returning id`,
      [
        name.trim().slice(0, 120),
        instagramUsername.trim().replace(/^@/, '').slice(0, 60),
        phone?.trim().slice(0, 30) || null,
        productName?.slice(0, 200) || null,
        price != null ? Number(price) : null,
      ],
    );
    return res.status(201).json({ id: row.id });
  } catch (e) { return next(e); }
});

// ADMIN only from here down — the public can never see these
leads.get('/', requireAuth, async (req, res, next) => {
  try {
    const where = [];
    const params = [];
    if (req.query.status) {
      params.push(req.query.status);
      where.push(`status = $${params.length}`);
    }
    if (req.query.sinceDays) {
      params.push(Number(req.query.sinceDays));
      where.push(`created_at >= now() - ($${params.length} || ' days')::interval`);
    }
    const rows = await q(
      `select ${COLS} from leads
       ${where.length ? `where ${where.join(' and ')}` : ''}
       order by created_at desc`,
      params,
    );
    res.json(rows.map(toApi));
  } catch (e) { next(e); }
});

/** The four numbers at the top of the dashboard */
leads.get('/stats', requireAuth, async (req, res, next) => {
  try {
    const row = await one(`
      select
        count(*) filter (where created_at >= date_trunc('day', now()))        as today,
        count(*) filter (where created_at >= now() - interval '7 days')       as this_week,
        count(*) filter (where status in ('paid','delivered'))                as paid_count,
        count(*) filter (where status = 'new')                                as new_count,
        coalesce(sum(price) filter (where status in ('paid','delivered')), 0) as revenue,
        count(*)                                                              as total
      from leads`);
    res.json({
      today: Number(row.today),
      thisWeek: Number(row.this_week),
      paidCount: Number(row.paid_count),
      newCount: Number(row.new_count),
      revenue: Number(row.revenue),
      total: Number(row.total),
    });
  } catch (e) { next(e); }
});

leads.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const sets = [];
    const params = [];
    const add = (col, val) => { params.push(val); sets.push(`${col}=$${params.length}`); };

    if (req.body.status !== undefined) {
      if (!STATUSES.includes(req.body.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      add('status', req.body.status);
    }
    if (req.body.notes !== undefined) add('notes', req.body.notes);
    if (!sets.length) return res.status(400).json({ error: 'Nothing to update' });

    params.push(req.params.id);
    const row = await one(
      `update leads set ${sets.join(', ')} where id=$${params.length} returning ${COLS}`,
      params,
    );
    if (!row) return res.status(404).json({ error: 'Lead not found' });
    return res.json(toApi(row));
  } catch (e) { return next(e); }
});

leads.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const row = await one('delete from leads where id=$1 returning id', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Lead not found' });
    return res.status(204).end();
  } catch (e) { return next(e); }
});
