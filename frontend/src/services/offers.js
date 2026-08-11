import { api } from '../lib/api';

/** liveOnly: public site — active, not expired, slots still remaining */
export function listDailyOffers({ liveOnly = false } = {}) {
  return liveOnly ? api.get('/offers') : api.get('/offers/all', { auth: true });
}

export function createDailyOffer(offer) {
  return api.post('/offers', offer, { auth: true });
}

export function updateDailyOffer(id, offer) {
  return api.put(`/offers/${id}`, offer, { auth: true });
}

/** Copies an earlier offer into a new one — created paused so it cannot go live by accident */
export function duplicateDailyOffer(id) {
  return api.post(`/offers/${id}/duplicate`, undefined, { auth: true });
}

export function deleteDailyOffer(id) {
  return api.del(`/offers/${id}`, { auth: true });
}

/** Status pill for the list view */
export function offerStatus(offer) {
  if (!offer.isActive) return 'paused';
  if (offer.slotsLeft <= 0) return 'sold-out';
  if (offer.expiresAt && new Date(offer.expiresAt).getTime() <= Date.now()) return 'expired';
  return 'live';
}

/** Same role-named set as the lead pills — see services/leads.js */
export const STATUS_STYLE = {
  live: { label: 'Live', bg: 'var(--pill-fresh-bg)', fg: 'var(--pill-fresh-fg)' },
  paused: { label: 'Paused', bg: 'var(--pill-done-bg)', fg: 'var(--pill-done-fg)' },
  expired: { label: 'Expired', bg: 'var(--pill-lost-bg)', fg: 'var(--pill-lost-fg)' },
  'sold-out': { label: 'Sold out', bg: 'var(--pill-active-bg)', fg: 'var(--pill-active-fg)' },
};
