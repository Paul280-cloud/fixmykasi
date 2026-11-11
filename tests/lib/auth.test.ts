import type { AuthError } from '@supabase/supabase-js';

const auth = vi.hoisted(() => ({
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  getSession: vi.fn(),
  resend: vi.fn(),
}));
const profileRole = vi.hoisted(() => ({ value: 'resident' as string | null }));

vi.mock('../../src/lib/supabase', () => ({
  initialUrl: '',
  supabase: {
    auth,
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: profileRole.value ? { role: profileRole.value } : null,
            error: null,
          }),
        }),
      }),
    }),
  },
}));

import { linkHasError, logIn, signUp, toErrorCode, updatePassword } from '../../src/lib/auth';

function authError(code: string, status = 400): AuthError {
  return { code, status, message: code, name: 'AuthApiError' } as unknown as AuthError;
}

const input = {
  fullName: ' Thandeka Mokoena ',
  email: 'Thandeka.M@Example.com',
  phone: '+27 82 555 0134',
  wardId: 'ward-a',
  password: 'kasi2026',
  isAdult: true,
  language: 'en',
};

beforeEach(() => {
  vi.clearAllMocks();
  profileRole.value = 'resident';
});

describe('toErrorCode', () => {
  it('maps Supabase error codes to the messages S2 and S3 show', () => {
    expect(toErrorCode(authError('invalid_credentials'))).toBe('invalid_credentials');
    expect(toErrorCode(authError('email_not_confirmed'))).toBe('email_not_confirmed');
    expect(toErrorCode(authError('user_already_exists'))).toBe('email_taken');
    expect(toErrorCode(authError('over_request_rate_limit', 429))).toBe('too_many_attempts');
    expect(toErrorCode(authError('something_new', 429))).toBe('too_many_attempts');
    expect(toErrorCode(authError('unexpected_failure', 500))).toBe('unknown');
    expect(toErrorCode(null)).toBeUndefined();
  });
});

describe('signUp', () => {
  it('sends the profile fields handle_new_user reads, and never a role', async () => {
    auth.signUp.mockResolvedValue({ data: { user: { identities: [{}] } }, error: null });
    await expect(signUp(input)).resolves.toEqual({});
    const args = auth.signUp.mock.calls[0][0];
    expect(args.email).toBe('thandeka.m@example.com');
    expect(args.options.data).toEqual({
      full_name: 'Thandeka Mokoena',
      phone: '+27825550134',
      ward_id: 'ward-a',
      is_18_or_older: true,
      language: 'en',
    });
    expect(args.options.emailRedirectTo).toMatch(/\/log-in\?confirmed=1$/);
  });

  it('reports email_taken when Supabase hides an existing account (no identities)', async () => {
    auth.signUp.mockResolvedValue({ data: { user: { identities: [] } }, error: null });
    await expect(signUp(input)).resolves.toEqual({ error: 'email_taken' });
  });
});

describe('logIn', () => {
  it('returns the role from the profile', async () => {
    auth.signInWithPassword.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    profileRole.value = 'ward_admin';
    await expect(logIn('zanele.k@example.com', 'x')).resolves.toEqual({ role: 'ward_admin' });
  });

  it('logs out again and reports an error when no profile is found', async () => {
    auth.signInWithPassword.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    profileRole.value = null;
    await expect(logIn('a@b.co', 'x')).resolves.toEqual({ error: 'unknown' });
    expect(auth.signOut).toHaveBeenCalled();
  });
});

describe('updatePassword', () => {
  it('logs the user out after saving so they log in again on S3', async () => {
    auth.updateUser.mockResolvedValue({ error: null });
    await expect(updatePassword('kasi2027')).resolves.toEqual({});
    expect(auth.signOut).toHaveBeenCalled();
  });
});

describe('linkHasError', () => {
  it('detects an expired link in the hash or the query', () => {
    expect(
      linkHasError('http://localhost:5173/reset-password#error=access_denied&error_code=otp_expired'),
    ).toBe(true);
    expect(linkHasError('http://localhost:5173/reset-password?error_code=otp_expired')).toBe(true);
  });

  it('is false for a normal recovery link', () => {
    expect(
      linkHasError('http://localhost:5173/reset-password#access_token=abc&type=recovery'),
    ).toBe(false);
    expect(linkHasError('')).toBe(false);
  });
});
