import { useContext } from 'react';
import { CatalogContext } from './catalogContextObject';

/**
 * Live products and daily offers, straight from the admin panel.
 *
 * Always returns a usable catalogue — the bundled data seeds it before the
 * request resolves and stands in if the API cannot be reached — so callers
 * never have to null-check.
 *
 * { products, dailyDeals, categories, minPrice, loading, offline }
 */
export const useCatalog = () => useContext(CatalogContext);
