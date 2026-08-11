import { api } from '../lib/api';
import { resizeImage } from '../lib/image';

/** Public — the raw stored document, before defaults are merged in. */
export function getSettings() {
  return api.get('/settings');
}

export function saveSettings(data) {
  return api.put('/settings', { data }, { auth: true });
}

export function resetSettings() {
  return api.post('/settings/reset', undefined, { auth: true });
}

/**
 * Stores a brand logo and returns its public URL.
 *
 * Deliberately NOT the product-image path: that one re-encodes to JPEG, which
 * flattens transparency onto black and would put a hard box behind a logo that
 * is meant to sit on the navbar. Here an SVG is passed through untouched, and a
 * raster file is only resized when it is genuinely oversized — re-encoded as PNG
 * so the alpha channel survives.
 */
export async function uploadLogo(file) {
  const fd = new FormData();
  fd.append('file', await prepareLogo(file));
  const { url } = await api.upload('/uploads', fd);
  return url;
}

// PNG rather than JPEG so an alpha channel survives, measured on the longest side
// so a tall logo is bounded too, and SVG left untouched.
function prepareLogo(file) {
  return resizeImage(file, {
    maxPx: 512,
    type: 'image/png',
    fitBy: 'longest',
    rawLimit: 512 * 1024,
    passThroughVector: true,
  });
}
