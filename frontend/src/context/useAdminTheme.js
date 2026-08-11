import { useContext } from 'react';
import { AdminThemeContext } from './adminThemeContextObject';

/**
 * { dark, theme, toggle }
 *
 * `theme` resolves to 'admin' | 'admin-dark' — the value to put in a
 * data-theme attribute.
 */
export const useAdminTheme = () => useContext(AdminThemeContext);
