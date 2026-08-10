import { api } from '../lib/api';

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
