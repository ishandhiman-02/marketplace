import { api } from '../lib/api';

/** liveOnly: public site — active, expire nahi hue, slots bache hain */
export function listDailyOffers({ liveOnly = false } = {}) {
  return liveOnly ? api.get('/offers') : api.get('/offers/all', { auth: true });
}

export function createDailyOffer(offer) {
  return api.post('/offers', offer, { auth: true });
}

export function updateDailyOffer(id, offer) {
  return api.put(`/offers/${id}`, offer, { auth: true });
}

/** Kal ka offer copy karke aaj ka — paused banta hai taaki galti se live na ho */
export function duplicateDailyOffer(id) {
  return api.post(`/offers/${id}/duplicate`, undefined, { auth: true });
}

export function deleteDailyOffer(id) {
  return api.del(`/offers/${id}`, { auth: true });
}

/** List view ka status pill */
export function offerStatus(offer) {
  if (!offer.isActive) return 'paused';
  if (offer.slotsLeft <= 0) return 'sold-out';
  if (offer.expiresAt && new Date(offer.expiresAt).getTime() <= Date.now()) return 'expired';
  return 'live';
}

export const STATUS_STYLE = {
  live: { label: 'Live', bg: '#DCFCE7', fg: '#166534' },
  paused: { label: 'Paused', bg: '#F1F5F9', fg: '#475569' },
  expired: { label: 'Expired', bg: '#FEE2E2', fg: '#991B1B' },
  'sold-out': { label: 'Sold out', bg: '#FEF3C7', fg: '#92400E' },
};
