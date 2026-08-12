// Plain string literal on purpose. On backend deploy the platform rewrites this
// to "<backendURL>/api"; it cannot rewrite an env expression, so do NOT change
// this to import.meta.env / ?? / || / a template literal.
// BASE already carries /api — every request path below must be relative to it,
// with no leading /api, or requests hit /api/api/...
import { startRequest, endRequest } from './pending';

const BASE = '/api';

/**
 * Resolves a stored image path against the API origin.
 *
 * Uploads are saved as "/uploads/<name>", which as a bare src would resolve against
 * whatever origin the page is served from — the preview host, not the backend. The
 * backend serves them at "<BASE>/uploads/<name>", so joining onto BASE keeps them
 * working both same-origin in dev and cross-origin once deployed. Anything else
 * (a bundled asset, a full URL) passes straight through.
 */
export const mediaUrl = (u: string | null | undefined) =>
  (typeof u === 'string' && u.startsWith('/uploads/') ? `${BASE}${u}` : u);

const TOKEN_KEY = 'substore-token';

export const getToken = (): string | null => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};

export const setToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* private mode */ }
};

type RequestOptions = {
  method?: string;
  /** Raw FormData when `raw` is set, otherwise anything JSON-serialisable. */
  body?: unknown;
  /** Attach the bearer token, and bounce to the login page on a 401. */
  auth?: boolean;
  /** Send the body as-is — the browser sets its own multipart boundary. */
  raw?: boolean;
  /** Keep this request out of the global progress bar (used by the revision poll). */
  silent?: boolean;
};

async function request(path: string, { method = 'GET', body, auth = false, raw = false, silent = false }: RequestOptions = {}) {
  const headers: Record<string, string> = {};
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (body && !raw) headers['Content-Type'] = 'application/json';

  if (!silent) startRequest();
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: raw ? (body as BodyInit) : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    if (!silent) endRequest();
    throw new Error('Could not reach the server. Is the API running?');
  }
  if (!silent) endRequest();

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
  get: (p: string, opts?: RequestOptions) => request(p, { ...opts }),
  post: (p: string, body?: unknown, opts?: RequestOptions) => request(p, { method: 'POST', body, ...opts }),
  put: (p: string, body?: unknown, opts?: RequestOptions) => request(p, { method: 'PUT', body, ...opts }),
  patch: (p: string, body?: unknown, opts?: RequestOptions) => request(p, { method: 'PATCH', body, ...opts }),
  del: (p: string, opts?: RequestOptions) => request(p, { method: 'DELETE', ...opts }),
  upload: (p: string, formData: FormData) => request(p, { method: 'POST', body: formData, raw: true, auth: true }),
};
