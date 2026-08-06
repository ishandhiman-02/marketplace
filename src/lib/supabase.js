import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase abhi configure hua hai ya nahi.
 * Jab tak .env nahi bhara, public site hardcoded data pe chalti rahegi —
 * app crash nahi hogi.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        // refresh pe logout nahi hona chahiye
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'substore-auth',
      },
    })
  : null;

/** Service functions isse call karte hain — saaf error, undefined crash nahi */
export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase configure nahi hai. .env mein VITE_SUPABASE_URL aur VITE_SUPABASE_ANON_KEY daalein (.env.example dekhein).',
    );
  }
  return supabase;
}
