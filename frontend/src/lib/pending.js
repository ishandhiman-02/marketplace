/**
 * Counts API requests that are in flight, so the UI can show a single progress
 * bar instead of every screen inventing its own spinner.
 *
 * Requests opt out with `{ silent: true }` — the revision poll runs every ten
 * seconds and would otherwise flicker the bar forever, which is exactly the kind
 * of background noise a progress indicator should never report.
 */
let pending = 0;
const listeners = new Set();

const notify = () => listeners.forEach((fn) => {
  try { fn(pending); } catch { /* one bad listener must not stop the rest */ }
});

export function startRequest() {
  pending += 1;
  notify();
}

export function endRequest() {
  // Never go negative: a mismatched pair would leave the bar stuck on screen.
  pending = Math.max(0, pending - 1);
  notify();
}

export function onPendingChange(fn) {
  listeners.add(fn);
  fn(pending);
  return () => listeners.delete(fn);
}
