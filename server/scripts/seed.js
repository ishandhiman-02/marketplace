/**
 * Loads the arrays from src/data/ into the database.
 * The data stays identical — seeding from a single source of truth avoids the
 * typos that come from hand-copying it into SQL.
 */
import { pool, q } from '../db.js';
import { COURSES } from '../../src/data/products.js';
import { DAILY_DEALS } from '../../src/data/dailyOffers.js';

// in src/data the image comes through the bundler; the DB needs a public path
const imageName = (v) => {
  const m = String(v || '').match(/([\w-]+\.(?:jpg|jpeg|png|webp))/i);
  return m ? `/assets/${m[1]}` : null;
};

await q('truncate table products, daily_offers restart identity');

for (const p of COURSES) {
  await q(
    `insert into products
      (title, subtitle, description, category, price, duration, tag, tag_color,
       color, icon, image_url, variants, sort_order)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [
      p.title, p.subtitle, p.description, p.category, p.price, p.duration,
      p.tag, p.tagColor, p.color, p.icon, imageName(p.image),
      JSON.stringify(p.variants ?? []), p.id,
    ],
  );
}

for (const d of DAILY_DEALS) {
  await q(
    `insert into daily_offers
      (emoji, title, subtitle, description, original_price, deal_price,
       tag, tag_color, slots_total, slots_left)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      d.emoji, d.title, d.subtitle, d.description, d.originalPrice, d.dealPrice,
      d.tag, d.tagColor, d.slots, d.slotsLeft,
    ],
  );
}

console.log(`  seeded ${COURSES.length} products, ${DAILY_DEALS.length} daily offers`);
console.log('  proofs and leads are left empty — both are filled from the admin panel.');
await pool.end();
