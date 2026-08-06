export const SITE = {
  brandName: 'SubStore',
  // TODO: client ka asli Instagram handle yahan daalein (bina @ ke), warna
  // DM link kisi profile pe nahi jaayega.
  instagramHandle: '',
};

// ig.me/m/<handle> seedha DM thread kholta hai (profile page nahi)
export const IG_DM_URL = `https://ig.me/m/${SITE.instagramHandle}`;

function buildOrderText(detail) {
  if (!detail?.title) return null;
  const parts = [detail.title, detail.variant, detail.price != null ? `Rs.${detail.price}` : null]
    .filter(Boolean);
  return `Hi! Mujhe ye chahiye: ${parts.join(' — ')}`;
}

// ── pub/sub: modal aur toast dono yahin se sunte hain ──────────
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
 * Har "Order" button yahi call karta hai.
 * Seedha Instagram nahi kholta — pehle OrderModal uthata hai, taaki
 * "kaun khareed raha hai" ka record ban sake. Modal submit/skip pe
 * completeOrder() chalta hai.
 */
export function orderOnInstagram(detail) {
  const request = { detail, id: Date.now() };
  if (orderListeners.size === 0) {
    completeOrder(request); // modal mount nahi hai — customer ko rokna nahi hai
    return;
  }
  orderListeners.forEach((fn) => fn(request));
}

/**
 * Order details clipboard pe copy karta hai, phir DM kholta hai.
 * Instagram DM ka text URL se prefill nahi hota — clipboard hi ek tarika hai.
 * Clipboard fail ho jaaye tab bhi tab khulta hai.
 */
export function completeOrder(request) {
  const open = () => window.open(IG_DM_URL, '_blank', 'noopener,noreferrer');
  const text = buildOrderText(request?.detail);

  if (!text || !navigator.clipboard?.writeText) {
    open();
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => toastListeners.forEach((fn) => fn('Order details copy ho gaye — Instagram DM mein paste kar dijiye.')))
    .catch(() => { /* clipboard blocked */ })
    .finally(open);
}
