// The only place the screens talk to Supabase Auth (PRD 5). Screens get
// simple results and error codes back, and tests mock this module.
import type { AuthError } from '@supabase/supabase-js';
import { initialUrl, supabase } from './supabase';
import { normaliseEmail } from './validation';

export type Role = 'resident' | 'ward_admin' | 'field_team';

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'too_many_attempts'
  | 'email_not_confirmed'
  | 'email_taken'
  | 'unknown';

export type Ward = { id: string; name: string };

export type SignUpInput = {
  fullName: string;
  email: string;
  phone: string;
  wardId: string;
  password: string;
  isAdult: boolean;
  language: string;
};

// Home screen after log-in for each role (PRD 7.2, 8.2 S3).
export const homeByRole: Record<Role, string> = {
  resident: '/faults',
  ward_admin: '/queue',
  field_team: '/my-jobs',
};

function siteUrl(path: string): string {
  return `${window.location.origin}${path}`;
}

// Where the "Confirm email" button in the sign-up email lands (PRD 4.5).
export const CONFIRMED_PATH = '/log-in?confirmed=1';

export function toErrorCode(error: AuthError | null | undefined): AuthErrorCode | undefined {
  if (!error) return undefined;
  switch (error.code) {
    case 'invalid_credentials':
      return 'invalid_credentials';
    case 'email_not_confirmed':
      return 'email_not_confirmed';
    case 'user_already_exists':
    case 'email_exists':
      return 'email_taken';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'too_many_attempts';
  }
  if (error.status === 429) return 'too_many_attempts';
  return 'unknown';
}

export async function getWards(): Promise<Ward[]> {
  const { data, error } = await supabase.from('wards').select('id, name').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function signUp(input: SignUpInput): Promise<{ error?: AuthErrorCode }> {
  const { data, error } = await supabase.auth.signUp({
    email: normaliseEmail(input.email),
    password: input.password,
    options: {
      emailRedirectTo: siteUrl(CONFIRMED_PATH),
      // Keys read by public.handle_new_user(). The role is never sent.
      data: {
        full_name: input.fullName.trim(),
        phone: input.phone.replace(/\s/g, ''),
        ward_id: input.wardId,
        is_18_or_older: input.isAdult,
        language: input.language,
      },
    },
  });
  if (error) return { error: toErrorCode(error) };
  // With email confirmation on, Supabase does not return an error for an
  // email that already has an account. It returns a user with no identities.
  if (data.user && data.user.identities?.length === 0) return { error: 'email_taken' };
  return {};
}

export async function getRole(userId: string): Promise<Role | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data.role as Role;
}

export async function logIn(
  email: string,
  password: string,
): Promise<{ role?: Role; error?: AuthErrorCode }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normaliseEmail(email),
    password,
  });
  if (error) return { error: toErrorCode(error) };
  const role = await getRole(data.user.id);
  if (!role) {
    await supabase.auth.signOut({ scope: 'local' });
    return { error: 'unknown' };
  }
  return { role };
}

export async function resendConfirmation(email: string): Promise<{ error?: AuthErrorCode }> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: normaliseEmail(email),
    options: { emailRedirectTo: siteUrl(CONFIRMED_PATH) },
  });
  return { error: toErrorCode(error) };
}

export async function sendPasswordReset(email: string): Promise<{ error?: AuthErrorCode }> {
  const { error } = await supabase.auth.resetPasswordForEmail(normaliseEmail(email), {
    redirectTo: siteUrl('/reset-password'),
  });
  // M1 shows the same message whether or not the email has an account
  // (PRD 5), so only rate limits and server errors are reported.
  return { error: toErrorCode(error) };
}

// True when an email link came back with an error, such as an expired or
// already used link (error_code=otp_expired).
export function linkHasError(url: string = initialUrl): boolean {
  if (!url) return false;
  const parsed = new URL(url);
  const hash = new URLSearchParams(parsed.hash.replace(/^#/, ''));
  return parsed.searchParams.has('error_code') || hash.has('error_code') || hash.has('error');
}

// S12 can only be used with the session a valid reset link creates.
export async function getRecoveryState(): Promise<'ready' | 'expired'> {
  if (linkHasError()) return 'expired';
  const { data } = await supabase.auth.getSession();
  return data.session ? 'ready' : 'expired';
}

export async function updatePassword(password: string): Promise<{ error?: AuthErrorCode }> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: toErrorCode(error) };
  // PRD 8.2 S12: after saving, the user logs in again on S3.
  await supabase.auth.signOut({ scope: 'local' });
  return {};
}

export async function logOut(): Promise<void> {
  await supabase.auth.signOut({ scope: 'local' });
}

// Tells the app who is logged in, now and after every change.
export function onAuthChange(callback: (userId: string | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user.id ?? null);
  });
  return () => data.subscription.unsubscribe();
}

// The "Confirm email" link logs the user in. PRD 4.5 and 7.1 want S3 with
// "Email confirmed. Please log in.", so the link's session is ended here.
// Returns false when the link came back with an error.
export async function finishEmailConfirmation(): Promise<boolean> {
  if (linkHasError()) return false;
  const { data } = await supabase.auth.getSession();
  if (data.session) await supabase.auth.signOut({ scope: 'local' });
  return true;
}
