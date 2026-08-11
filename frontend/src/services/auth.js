import { api, getToken, setToken } from '../lib/api';

export async function signIn(email, password) {
  const { token, user } = await api.post('/auth/login', { email, password });
  setToken(token);
  return user;
}

export function signOut() {
  setToken(null);
}

/** Is there a token, and is it still valid? Confirms with the server. */
export async function getSession() {
  if (!getToken()) return null;
  try {
    const { user } = await api.get('/auth/me', { auth: true });
    return user;
  } catch {
    setToken(null);
    return null;
  }
}
