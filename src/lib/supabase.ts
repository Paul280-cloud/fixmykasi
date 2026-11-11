import { createClient } from '@supabase/supabase-js';

// Only the public URL and anon key are used in the app (PRD 11.5).
// Real values come from .env locally and from Vercel in production.
const url = import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost:54321';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'missing-anon-key';

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true, // PRD 5: the session renews itself
    detectSessionInUrl: true, // confirm-email and reset-password links
  },
});
