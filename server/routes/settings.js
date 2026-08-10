import { Router } from 'express';
import { one } from '../db.js';
import { requireAuth } from '../auth.js';

export const settings = Router();

/**
 * PUBLIC — the storefront reads this on every load.
 * Returns the raw document; the frontend merges it over its own defaults,
 * so an empty object here means "everything as shipped".
 */
settings.get('/', async (req, res, next) => {
  try {
    const row = await one('select data, updated_at from site_settings where id = 1');
    res.json({ data: row?.data ?? {}, updatedAt: row?.updated_at ?? null });
  } catch (e) { next(e); }
});

/**
 * ADMIN — replaces the whole document.
 * A full replace rather than a deep merge, because the admin form always
 * submits the complete shape. A merge would make deleting a nav link or a
 * trust item impossible.
 */
settings.put('/', requireAuth, async (req, res, next) => {
  try {
    const data = req.body?.data;
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ error: 'Settings must be an object' });
    }

    const row = await one(
      `insert into site_settings (id, data, updated_at) values (1, $1, now())
       on conflict (id) do update set data = excluded.data, updated_at = now()
       returning data, updated_at`,
      [JSON.stringify(data)],
    );
    return res.json({ data: row.data, updatedAt: row.updated_at });
  } catch (e) { return next(e); }
});

/** ADMIN — back to shipped defaults, without hunting through every field. */
settings.post('/reset', requireAuth, async (req, res, next) => {
  try {
    const row = await one(
      `update site_settings set data = '{}'::jsonb, updated_at = now()
       where id = 1 returning data, updated_at`,
    );
    res.json({ data: row.data, updatedAt: row.updated_at });
  } catch (e) { next(e); }
});
