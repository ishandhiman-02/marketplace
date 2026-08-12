import { useEffect, useRef } from 'react';
import { onContentChange } from '../lib/liveRefresh';

/**
 * Re-runs `reload` whenever an admin changes something on the server.
 *
 * `enabled` exists for screens with an editable form: refetching under someone
 * who is halfway through typing would throw their work away, so Global Settings
 * passes `false` while the form is dirty.
 *
 * The callback is kept in a ref so a caller does not have to memoise it — an
 * inline arrow function would otherwise resubscribe on every render.
 */
export function useLiveRefresh(reload, enabled = true) {
  const latest = useRef(reload);
  latest.current = reload;

  useEffect(() => {
    if (!enabled) return undefined;
    return onContentChange(() => latest.current?.());
  }, [enabled]);
}
