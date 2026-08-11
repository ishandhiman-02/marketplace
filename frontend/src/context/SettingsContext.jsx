import { useState, useEffect } from 'react';
import { getSettings } from '../services/settings';
import { mergeSettings } from '../config/defaults';
import { setInstagramHandle, setOrderMessagePrefix } from '../config/site';
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
      .catch(() => { /* defaults are already in place */ });
    return () => { alive = false; };
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}
