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

// ig.me/m/<handle> opens the DM thread directly (not the profile page)
export const igDmUrl = () => `https://ig.me/m/${instagramHandle}`;

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

  // No handle set in Global Settings yet. Opening https://ig.me/m/ lands the
  // customer on an Instagram error page, which looks like the shop is broken.
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

  navigator.clipboard.writeText(text)
    .then(() => toastListeners.forEach((fn) => fn('Order details copied — paste them into the Instagram DM.')))
    .catch(() => { /* clipboard blocked */ })
    .finally(open);
}
