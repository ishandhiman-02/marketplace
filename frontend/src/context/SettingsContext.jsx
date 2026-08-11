import { useState, useEffect, useMemo } from 'react';
import { getSettings } from '../services/settings';
import { mergeSettings } from '../config/defaults';
import { setInstagramHandle, setOrderMessagePrefix } from '../config/site';
import { mediaUrl } from '../lib/api';
import { SettingsContext } from './settingsContextObject';

/**
 * Loads the admin's settings once and hands them to the whole storefront.
 *
 * It renders children immediately with the defaults rather than blocking on
 * the request. A settings fetch is not worth a blank screen, and if the API
 * is down the site still has to sell.
 */
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => mergeSettings(null));
  // "The request has settled", not "it succeeded" — a failed fetch leaves the
  // defaults in place and the site is just as ready to show.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    getSettings()
      .then((res) => {
        if (!alive) return;
        const merged = mergeSettings(res?.data);
        setSettings(merged);
        // config/site.js is a plain module, not a hook, so the handle has to
        // be pushed into it once it is known.
        setInstagramHandle(merged.brand.instagramHandle);
        setOrderMessagePrefix(merged.order.messagePrefix);
      })
      .catch(() => { /* defaults are already in place */ })
      .finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);

  // Keep the browser tab in step with the brand.
  //
  // The Go server already writes the real title and favicon into the HTML it
  // sends, which is what search engines and link previews read. This handles the
  // two cases that misses: the Vite dev server (which serves index.html
  // untouched) and a settings save, where the tab should update without a reload.
  useEffect(() => {
    const brand = settings?.brand;
    if (!brand) return;

    if (brand.name) document.title = brand.name;

    const icon = mediaUrl(brand.logoUrl);
    if (!icon) return;
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = icon;
  }, [settings]);

  const value = useMemo(() => ({ ...settings, ready }), [settings, ready]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
