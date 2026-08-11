import { useState, useEffect, useMemo } from 'react';
import { listProducts } from '../services/products';
import { listDailyOffers } from '../services/offers';
import { COURSES } from '../data/products';
import { DAILY_DEALS } from '../data/dailyOffers';
import { CATEGORY_META } from '../data/categories';
import { CatalogContext } from './catalogContextObject';

/**
 * Feeds the storefront from the database instead of the bundled arrays.
 *
 * This is what makes the admin panel real: change a price in /admin/products
 * and the grid, the hero cards and the "Starts From" stat all follow.
 *
 * The bundled data in src/data still ships, but only as a safety net. It
 * seeds the first paint so the page is never an empty grid, and it stands in
 * if the API is unreachable — a store that cannot reach its database should
 * still show something to sell.
 *
 * Note the difference between "the request failed" and "the request returned
 * nothing". An empty catalogue is a legitimate answer — the client may have
 * deleted everything — so only a genuine error falls back.
 */
export function CatalogProvider({ children }) {
  const [products, setProducts] = useState(COURSES);
  const [dailyDeals, setDailyDeals] = useState(DAILY_DEALS);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let alive = true;

    Promise.allSettled([
      listProducts(),
      listDailyOffers({ liveOnly: true }),
    ]).then(([p, d]) => {
      if (!alive) return;

      // Each half falls back on its own — a broken offers endpoint should not
      // take the product grid down with it.
      //
      // The Array check is not paranoia: a 200 that is not JSON (an API base
      // pointing at the preview origin returns the SPA's own index.html) parses
      // to null here, and `null` would replace the catalogue and then throw on
      // the first iteration. An empty array is still honoured — deleting every
      // product is a legitimate thing for the admin to do.
      if (p.status === 'fulfilled' && Array.isArray(p.value)) setProducts(p.value);
      if (d.status === 'fulfilled' && Array.isArray(d.value)) setDailyDeals(d.value);

      setOffline(p.status === 'rejected' && d.status === 'rejected');
      setLoading(false);
    });

    return () => { alive = false; };
  }, []);

  const value = useMemo(() => {
    const prices = products.flatMap((c) => (
      c.variants?.length ? c.variants.map((v) => Number(v.price)) : [Number(c.price)]
    )).filter((n) => Number.isFinite(n));

    return {
      products,
      dailyDeals,
      // Counts follow the live catalogue, and a category with nothing in it
      // is dropped rather than shown as an empty tile.
      categories: CATEGORY_META
        .map((c) => ({ ...c, count: products.filter((p) => p.category === c.label).length }))
        .filter((c) => c.count > 0),
      minPrice: prices.length ? Math.min(...prices) : 0,
      loading,
      offline,
    };
  }, [products, dailyDeals, loading, offline]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
