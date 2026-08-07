import { api } from '../lib/api';

export const LEAD_STATUSES = ['new', 'contacted', 'paid', 'delivered', 'cancelled'];

export const STATUS_STYLE = {
  new: { label: 'New', bg: '#E0E7FF', fg: '#3730A3' },
  contacted: { label: 'Contacted', bg: '#FEF3C7', fg: '#92400E' },
  paid: { label: 'Paid', bg: '#DCFCE7', fg: '#166534' },
  delivered: { label: 'Delivered', bg: '#CFFAFE', fg: '#155E75' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', fg: '#991B1B' },
};

/**
 * Called from the public site — this is what records who is buying.
 * The purchase happens in an Instagram DM, so this runs just before the DM opens.
 */
export function createLead(lead) {
  return api.post('/leads', lead);
}

export function listLeads({ status = null, sinceDays = null } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (sinceDays) params.set('sinceDays', String(sinceDays));
  const qs = params.toString();
  return api.get(`/leads${qs ? `?${qs}` : ''}`, { auth: true });
}

export function leadStats() {
  return api.get('/leads/stats', { auth: true });
}

export function updateLead(id, patch) {
  return api.patch(`/leads/${id}`, patch, { auth: true });
}

export function deleteLead(id) {
  return api.del(`/leads/${id}`, { auth: true });
}

/** Turns the filtered rows into CSV */
export function leadsToCsv(leads) {
  const head = ['Date', 'Name', 'Instagram', 'Phone', 'Product', 'Price', 'Status', 'Notes'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = leads.map((l) => [
    new Date(l.createdAt).toLocaleString('en-IN'),
    l.name, l.instagramUsername, l.phone, l.productName, l.price, l.status, l.notes,
  ].map(esc).join(','));
  return [head.join(','), ...rows].join('\n');
}

export function downloadCsv(leads, filename = 'substore-leads.csv') {
  const blob = new Blob([leadsToCsv(leads)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
