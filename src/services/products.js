import { api } from '../lib/api';

/** Public site sirf active products dekhti hai; admin sab (includeInactive). */
export function listProducts({ includeInactive = false } = {}) {
  return includeInactive ? api.get('/products/all', { auth: true }) : api.get('/products');
}

export function createProduct(product) {
  return api.post('/products', product, { auth: true });
}

export function updateProduct(id, product) {
  return api.put(`/products/${id}`, product, { auth: true });
}

/** Inline price edit — admin ka sabse common kaam */
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
 * Phone ke screenshots 4MB tak ke hote hain — upload se pehle browser mein hi
 * compress kar dete hain, warna server aur site dono slow ho jaate hain.
 */
export async function compressImage(file, { maxWidth = 1200, quality = 0.8 } = {}) {
  if (!file.type.startsWith('image/')) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  if (scale === 1 && file.size < 400_000) return file;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
}

/** Image store karke uska public URL wapas deta hai (koi DB row nahi banti) */
export async function uploadProductImage(file) {
  const fd = new FormData();
  fd.append('file', await compressImage(file, { maxWidth: 1200, quality: 0.82 }));
  const { url } = await api.upload('/uploads', fd);
  return url;
}
