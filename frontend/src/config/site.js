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
 * ig.me/m/<handle> opens the DM thread directly in the Instagram app, which is
 * what we want — but Meta does not support ig.me on Instagram Web. On desktop
 * it forwards to instagram.com/m/<handle>, a route that does not exist, and the
 * customer gets "Sorry, this page isn't available".
 *
 * So: phones get the real DM link, desktop gets the profile, where "Message" is
 * one click away. Both land on our account either way.
 */
const isMobile = () =>
  typeof navigator !== 'undefined' &&
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

export const igDmUrl = () => (isMobile()
  ? `https://ig.me/m/${instagramHandle}`
  : `https://www.instagram.com/${instagramHandle}/`);

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

  // On desktop the tab lands on the profile, not the thread, so say which one.
  const copied = isMobile()
    ? 'Order details copied — paste them into the Instagram DM.'
    : 'Order details copied — tap Message on our profile and paste them in.';

  navigator.clipboard.writeText(text)
    .then(() => toastListeners.forEach((fn) => fn(copied)))
    .catch(() => { /* clipboard blocked */ })
    .finally(open);
}
