// Empty in dev — Vite proxies /api to Express.
// In production VITE_API_URL supplies the full API origin.
const BASE = import.meta.env.VITE_API_URL || '';

const TOKEN_KEY = 'substore-token';

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* private mode */ }
};

async function request(path, { method = 'GET', body, auth = false, raw = false } = {}) {
  const headers = {};
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (body && !raw) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      body: raw ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Could not reach the server. Is the API running? (npm run server)');
  }

  // token expired — send the admin back to sign in
  if (res.status === 401 && auth) {
    setToken(null);
    if (!window.location.pathname.startsWith('/admin/login')) {
      window.location.assign('/admin/login');
    }
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get: (p, opts) => request(p, { ...opts }),
  post: (p, body, opts) => request(p, { method: 'POST', body, ...opts }),
  put: (p, body, opts) => request(p, { method: 'PUT', body, ...opts }),
  patch: (p, body, opts) => request(p, { method: 'PATCH', body, ...opts }),
  del: (p, opts) => request(p, { method: 'DELETE', ...opts }),
  upload: (p, formData) => request(p, { method: 'POST', body: formData, raw: true, auth: true }),
};
