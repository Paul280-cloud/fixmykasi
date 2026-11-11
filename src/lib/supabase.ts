import { createClient } from '@supabase/supabase-js';

// The address the app was opened with, read before the Supabase client
// tidies the URL. Email links (confirm email, reset password) put their
// result or error in it (S3, S12).
export const initialUrl = typeof window === 'undefined' ? '' : window.location.href;

// Only the public URL and anon key are used in the app (PRD 11.5).
// Real values come from .env locally and from Vercel in production.
const url = import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost:54321';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'missing-anon-key';

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true, // PRD 5: the session renews itself
    detectSessionInUrl: true, // confirm-email and reset-password links
    // Implicit flow so a link still works when it is opened in another
    // browser than the one that asked for it (PKCE would fail there).
    flowType: 'implicit',
  },
});
