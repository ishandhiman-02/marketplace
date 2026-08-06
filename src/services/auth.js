import { supabase, isSupabaseConfigured, requireSupabase } from '../lib/supabase';

export async function signIn(email, password) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  await requireSupabase().auth.signOut();
}

export async function getSession() {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Session badalne pe callback — token refresh aur logout dono cover karta hai */
export function onAuthChange(callback) {
  if (!isSupabaseConfigured) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export { isSupabaseConfigured };
