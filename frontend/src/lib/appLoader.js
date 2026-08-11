/**
 * Dismisses the first-paint loader that lives in index.html.
 *
 * The minimum on-screen time is the whole point of the "smooth" part: when the
 * API answers in 60ms, showing a splash for 60ms and then tearing it away reads
 * as a flicker — worse than no loader at all. Once it has been seen it stays for
 * a beat, then fades. A slow load never waits any longer than it has to.
 */
const MIN_VISIBLE_MS = 450;

/** Must match the #app-loader opacity transition in index.html. */
const FADE_MS = 450;

let dismissed = false;

export function hideAppLoader() {
  if (dismissed || typeof document === 'undefined') return;
  dismissed = true;

  const el = document.getElementById('app-loader');
  if (!el) return;

  const shownAt = Number(document.documentElement.dataset.loaderShownAt) || 0;
  const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt));

  window.setTimeout(() => {
    el.classList.add('is-hiding');
    // Remove rather than leave it transparent — a full-screen fixed element
    // still swallows every click at opacity 0.
    window.setTimeout(() => el.remove(), FADE_MS);
  }, remaining);
}
