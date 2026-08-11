import { createContext } from 'react';

/**
 * Kept separate from the provider so that module only exports components —
 * react-refresh/only-export-components.
 */
export const CatalogContext = createContext(null);
