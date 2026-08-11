import { useState, useEffect, useMemo, useCallback } from 'react';
import { AdminThemeContext } from './adminThemeContextObject';

const KEY = 'substore-admin-theme';

/** Read the OS setting. Optional call guards jsdom, where matchMedia is absent. */
const systemPrefersDark = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

/**
 * Light / dark for the admin panel.
 *
 * One switch, but it starts from the operating system rather than guessing:
 * until someone actually clicks, `stored` is null and the panel follows
 * prefers-color-scheme live. The first click pins a choice and it sticks.
 *
 * Kept apart from the storefront's dark mode on purpose: that one is a
 * customer's preference for a marketing page, this one belongs to whoever
 * runs the shop, and they are often two different people on two different
 * machines. Separate localStorage key, separate toggle.
 */
export function AdminThemeProvider({ children }) {
  const [stored, setStored] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY);
      return saved === 'light' || saved === 'dark' ? saved : null;
    } catch { return null; }
  });

  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  // Only matters before the first click, but harmless to keep listening —
  // it means a machine that flips to dark at sunset is picked up straight away.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const dark = stored ? stored === 'dark' : systemDark;

  const toggle = useCallback(() => {
    const next = dark ? 'light' : 'dark';
    setStored(next);
    try { localStorage.setItem(KEY, next); } catch { /* private mode */ }
  }, [dark]);

  const theme = dark ? 'admin-dark' : 'admin';

  // The page background outside the app root shows during overscroll bounce.
  // Without this it flashes the light canvas at the edge of a dark page.
  // Restored on unmount so the public site is unaffected.
  useEffect(() => {
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = dark ? '#070F0E' : '#E7E8E4';
    return () => { document.body.style.backgroundColor = previous; };
  }, [dark]);

  const value = useMemo(() => ({ dark, theme, toggle }), [dark, theme, toggle]);

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
}
