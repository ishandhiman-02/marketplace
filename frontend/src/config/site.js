/**
 * Set from the admin's Global Settings, pushed in by SettingsProvider once
 * the settings request resolves. It lives in a module variable rather than
 * React state because the order helpers below are plain functions called from
 * event handlers, not hooks.
 *
 * Empty means every order button leads nowhere, so the buttons check first.
 */
let instagramHandle = '';
let messagePrefix = "Hi! I'd like to order:";

export function setInstagramHandle(handle) {
  instagramHandle = String(handle || '').replace(/^@/, '').trim();
}

export function setOrderMessagePrefix(prefix) {
  if (prefix) messagePrefix = prefix;
}

export const hasInstagramHandle = () => instagramHandle.length > 0;

/**
 * Both platforms open a message box rather than a profile.
 *
 * Phones get ig.me/m/<handle>, which hands over to the app and opens the chat
 * with us directly. That one is solid.
 *
 * Desktop is the awkward half, because Instagram Web publishes no way to address
 * a DM by username. Two routes have already been tried and both fail:
 *   ig.me/m/<handle>          HTTP 400 to a desktop user agent
 *   instagram.com/m/<handle>  "Sorry, this page isn't available" when signed in
 * Neither can be told apart from a working link by curling it — signed out,
 * Instagram answers 200 and redirects to a login page carrying ?next=, which
 * proves only that the redirect exists.
 *
 * /direct/new/ is a real, working page: the message composer. The ?username= is
 * best-effort — if Instagram honours it the recipient is preselected, and if it
 * ignores it the customer is still in their inbox with the order already on the
 * clipboard. The downside is having to pick the account; the upside is landing
 * in messages, which is what was asked for. Switch back to
 * `https://www.instagram.com/${instagramHandle}/` if picking proves worse.
 */
const isMobile = () =>
  typeof navigator !== 'undefined' &&
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

export const igDmUrl = () => (isMobile()
  ? `https://ig.me/m/${instagramHandle}`
  : `https://www.instagram.com/direct/new/?username=${encodeURIComponent(instagramHandle)}`);

function buildOrderText(detail) {
  if (!detail?.title) return null;
  const parts = [detail.title, detail.variant, detail.price != null ? `Rs.${detail.price}` : null]
    .filter(Boolean);
  return `${messagePrefix} ${parts.join(' — ')}`;
}

// ── pub/sub: both the modal and the toast listen here ─────────
const orderListeners = new Set();
const toastListeners = new Set();

export function onOrderRequest(fn) {
  orderListeners.add(fn);
  return () => orderListeners.delete(fn);
}

export function onOrderToast(fn) {
  toastListeners.add(fn);
  return () => toastListeners.delete(fn);
}

/**
 * Every "Order" button calls this.
 * It does not open Instagram directly — it raises the OrderModal first so we
 * get a record of who is buying. completeOrder() runs when the modal is
 * submitted or skipped.
 */
export function orderOnInstagram(detail) {
  const request = { detail, id: Date.now() };
  if (orderListeners.size === 0) {
    completeOrder(request); // modal not mounted — never block the customer
    return;
  }
  orderListeners.forEach((fn) => fn(request));
}

/**
 * Copies the order details to the clipboard, then opens the DM.
 * Instagram DM text cannot be prefilled from a URL — the clipboard is the only
 * way. The tab still opens even if the clipboard write fails.
 */
export function completeOrder(request) {
  const text = buildOrderText(request?.detail);

  // No handle set in Global Settings yet. Opening the link with an empty handle
  // lands the customer on an Instagram error page, which looks like the shop is broken.
  // Copy the order and say so instead — they can still reach us.
  if (!hasInstagramHandle()) {
    if (text && navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {});
    toastListeners.forEach((fn) => fn(
      'Ordering is not set up yet — please message us on Instagram and we will help.',
    ));
    return;
  }

  const open = () => window.open(igDmUrl(), '_blank', 'noopener,noreferrer');

  if (!text || !navigator.clipboard?.writeText) {
    open();
    return;
  }

  // Start the copy and open the tab in the SAME tick as the click.
  //
  // This used to await the clipboard and open in .finally(), which put the
  // window.open outside the user gesture — Safari and Firefox treat that as an
  // unsolicited popup and block it, so the button appeared to do nothing. The
  // write still begins inside the gesture here; only the toast waits on it.
  const writing = navigator.clipboard.writeText(text);
  open();

  const copied = isMobile()
    ? 'Order details copied — paste them into the Instagram DM.'
    : `Order details copied — paste them in the message box to @${instagramHandle}.`;

  writing
    .then(() => toastListeners.forEach((fn) => fn(copied)))
    .catch(() => { /* clipboard blocked; the page is open either way */ });
}
