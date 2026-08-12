import { api } from './api';

/**
 * Watches the server's content revision so an admin's edit shows up everywhere
 * without anyone pressing reload.
 *
 * Deliberately a poll of a tiny endpoint rather than a websocket or an SSE
 * stream. GET /version reads one integer from memory, so it is cheaper to ask
 * than a connection is to hold open, and there is nothing for a proxy to drop,
 * nothing to reconnect after a redeploy, and nothing to rewrite if the backend
 * ever runs on more than one instance.
 *
 * Three things keep it from being wasteful:
 *   - one poller is shared by every subscriber on the page, not one each;
 *   - it stops entirely while the tab is hidden — a background tab costs nothing;
 *   - it checks immediately when the tab becomes visible again, which is what
 *     makes switching from the admin to the storefront feel instant.
 */

const POLL_MS = 10_000;

const subscribers = new Set();
let timer = null;
let listening = false;
let lastSeen = null;
let inFlight = false;

const isVisible = () => typeof document === 'undefined' || document.visibilityState === 'visible';

async function check() {
  if (inFlight || !isVisible() || subscribers.size === 0) return;
  inFlight = true;
  try {
    // silent: this poll must never light up the progress bar.
    const { revision } = await api.get('/version', { silent: true });
    if (revision == null) return;
    // First read only establishes the baseline — it is not a change.
    if (lastSeen !== null && revision !== lastSeen) {
      subscribers.forEach((fn) => {
        try { fn(); } catch { /* one bad subscriber must not stop the others */ }
      });
    }
    lastSeen = revision;
  } catch {
    // Offline or the API is down. Stay quiet and try again next tick — this is
    // a background nicety and must never surface an error to anyone.
  } finally {
    inFlight = false;
  }
}

function onVisibility() {
  if (isVisible()) check();
}

function start() {
  if (timer !== null) return;
  timer = window.setInterval(check, POLL_MS);
  if (!listening) {
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onVisibility);
    listening = true;
  }
  check();
}

function stop() {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
  if (listening) {
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('focus', onVisibility);
    listening = false;
  }
}

/**
 * Calls `onChange` whenever the server's content revision moves.
 * Returns an unsubscribe function.
 */
export function onContentChange(handler) {
  subscribers.add(handler);
  start();
  return () => {
    subscribers.delete(handler);
    if (subscribers.size === 0) stop();
  };
}
