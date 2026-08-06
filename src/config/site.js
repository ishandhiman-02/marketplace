export const SITE = {
  brandName: 'SubStore',
  // TODO: client ka asli Instagram handle yahan daalein (bina @ ke), warna
  // DM link kisi profile pe nahi jaayega.
  instagramHandle: '',
};

// ig.me/m/<handle> seedha DM thread kholta hai (profile page nahi)
export const IG_DM_URL = `https://ig.me/m/${SITE.instagramHandle}`;

// Order summary text — item ke naam, variant aur price se
function buildOrderText(item) {
  if (!item) return null;
  const parts = [item.title, item.variant, item.price != null ? `Rs.${item.price}` : null]
    .filter(Boolean);
  return `Hi! Mujhe ye chahiye: ${parts.join(' — ')}`;
}

// Toast dikhane ke liye — Home.jsx isko subscribe karta hai
const listeners = new Set();

export function onOrderToast(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emitToast(message) {
  listeners.forEach((fn) => fn(message));
}

/**
 * Instagram DM kholta hai. item optional hai — diya ho to order details
 * clipboard pe copy karke toast dikhata hai.
 *
 * Instagram DM ka text URL se prefill nahi hota, isliye clipboard use karte hain.
 * Clipboard fail ho jaaye tab bhi Instagram tab khulta hai.
 */
export function orderOnInstagram(item) {
  const open = () => window.open(IG_DM_URL, '_blank', 'noopener,noreferrer');
  const text = buildOrderText(item);

  if (!text || !navigator.clipboard?.writeText) {
    open();
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => emitToast('Order details copy ho gaye — Instagram DM mein paste kar dijiye.'))
    .catch(() => { /* clipboard blocked — Instagram phir bhi khulega */ })
    .finally(open);
}
