import { api } from '../lib/api';
import { compressImage } from './products';

export function listProofs({ includeInactive = false } = {}) {
  return includeInactive ? api.get('/proofs/all', { auth: true }) : api.get('/proofs');
}

/** Multiple files ek saath. Compression browser mein hota hai, upload se pehle. */
export async function uploadProofs(files, { caption = '', productName = '' } = {}) {
  const fd = new FormData();
  for (const file of files) {
    fd.append('files', await compressImage(file));
  }
  if (caption) fd.append('caption', caption);
  if (productName) fd.append('productName', productName);
  return api.upload('/proofs', fd);
}

export function updateProof(id, patch) {
  return api.patch(`/proofs/${id}`, patch, { auth: true });
}

export function deleteProof(id) {
  return api.del(`/proofs/${id}`, { auth: true });
}

/** Upar/neeche move — sirf badle hue do rows update hote hain */
export function reorderProofs(pairs) {
  return Promise.all(pairs.map(({ id, sortOrder }) => updateProof(id, { sortOrder })));
}
