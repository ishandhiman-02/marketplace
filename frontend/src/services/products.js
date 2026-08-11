import { api } from '../lib/api';
import { resizeImage } from '../lib/image';

/** The public site sees only active products; admin sees all (includeInactive). */
export function listProducts({ includeInactive = false } = {}) {
  return includeInactive ? api.get('/products/all', { auth: true }) : api.get('/products');
}

export function createProduct(product) {
  return api.post('/products', product, { auth: true });
}

export function updateProduct(id, product) {
  return api.put(`/products/${id}`, product, { auth: true });
}

/** Inline price edit — the admin's most frequent action */
export function updateProductPrice(id, price) {
  return api.patch(`/products/${id}`, { price }, { auth: true });
}

export function setProductActive(id, isActive) {
  return api.patch(`/products/${id}`, { isActive }, { auth: true });
}

export function deleteProduct(id) {
  return api.del(`/products/${id}`, { auth: true });
}

/**
 * Phone screenshots can be up to 4MB — we compress them in the browser before
 * upload, otherwise both the server and the site get slow.
 */
export function compressImage(file, { maxWidth = 1200, quality = 0.8 } = {}) {
  return resizeImage(file, { maxPx: maxWidth, quality, type: 'image/jpeg', rawLimit: 400_000 });
}

/** Stores the image and returns its public URL (no DB row is created) */
export async function uploadProductImage(file) {
  const fd = new FormData();
  fd.append('file', await compressImage(file, { maxWidth: 1200, quality: 0.82 }));
  const { url } = await api.upload('/uploads', fd);
  return url;
}
