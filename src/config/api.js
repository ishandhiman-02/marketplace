// AUTO-GENERATED API config. The ONE canonical HTTP helper set for the app.
// Every page/component MUST use apiGet/apiPost/apiPut/apiDelete — never a hand-rolled fetch.
// Paths come from .api_contract.json — the single source of truth shared with the backend generator.

export const API_BASE_URL = ""; // same-origin; never hardcode http://localhost

// UNAVAILABLE ENDPOINTS — the backend does NOT register these routes; calling them returns 404.
// Do NOT fetch these paths (not via the helpers, not via raw fetch). Use static/local data instead:
//   GET /api/categories
//   GET /api/courses
//   GET /api/offers
//   GET /api/testimonials
//   GET /api/stats
//   POST /api/newsletter

export const API_ENDPOINTS = {
};

function authHeaders() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${text ? ': ' + text : ''}`);
  }
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

export async function apiGet(path) {
  const res = await fetch(API_BASE_URL + path, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  return handle(res);
}

export async function apiPost(path, body) {
  const res = await fetch(API_BASE_URL + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  return handle(res);
}

export async function apiPut(path, body) {
  const res = await fetch(API_BASE_URL + path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  return handle(res);
}

export async function apiDelete(path) {
  const res = await fetch(API_BASE_URL + path, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  return handle(res);
}
