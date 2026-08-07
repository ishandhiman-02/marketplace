export const SITE = {
  brandName: 'SubStore',
  // TODO: put the client's real Instagram handle here (without the @), otherwise
  // the DM link will not point at any profile.
  instagramHandle: '',
};

// ig.me/m/<handle> opens the DM thread directly (not the profile page)
export const IG_DM_URL = `https://ig.me/m/${SITE.instagramHandle}`;

function buildOrderText(detail) {
  if (!detail?.title) return null;
  const parts = [detail.title, detail.variant, detail.price != null ? `Rs.${detail.price}` : null]
    .filter(Boolean);
  return `Hi! I'd like to order: ${parts.join(' — ')}`;
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
  const open = () => window.open(IG_DM_URL, '_blank', 'noopener,noreferrer');
  const text = buildOrderText(request?.detail);

  if (!text || !navigator.clipboard?.writeText) {
    open();
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => toastListeners.forEach((fn) => fn('Order details copied — paste them into the Instagram DM.')))
    .catch(() => { /* clipboard blocked */ })
    .finally(open);
}
