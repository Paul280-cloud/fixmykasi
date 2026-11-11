import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Banner from '../../components/Banner';
import Button from '../../components/Button';
import Header from '../../components/Header';
import TextField from '../../components/TextField';
import {
  finishEmailConfirmation,
  homeByRole,
  logIn,
  resendConfirmation,
  type AuthErrorCode,
} from '../../lib/auth';
import { useOnline } from '../../lib/useOnline';
import { isValidEmail } from '../../lib/validation';
import ForgotPasswordModal from '../forgot-password/ForgotPasswordModal';

// Messages other screens can pass to S3 (PRD 8.2 S3 banner area).
export type LogInBanner = 'checkEmail' | 'emailConfirmed' | 'passwordChanged';

const BANNER_TEXT: Record<LogInBanner, string> = {
  checkEmail: 'logIn.bannerCheckEmail',
  emailConfirmed: 'logIn.bannerEmailConfirmed',
  passwordChanged: 'logIn.bannerPasswordChanged',
};

const ERROR_TEXT: Record<AuthErrorCode, string> = {
  invalid_credentials: 'logIn.wrongCredentials',
  too_many_attempts: 'logIn.tooManyAttempts',
  email_not_confirmed: 'logIn.emailNotConfirmed',
  email_taken: 'common.somethingWentWrong',
  unknown: 'common.somethingWentWrong',
};

type LocationState = { banner?: LogInBanner; from?: string } | null;

// S3 Log In (PRD 5, 8.2): logs in any role and opens their home screen.
export default function LogInScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const online = useOnline();
  const state = location.state as LocationState;

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: false, password: false });
  const [banner, setBanner] = useState<LogInBanner | undefined>(state?.banner);
  const [error, setError] = useState<AuthErrorCode | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const confirmed = searchParams.get('confirmed') === '1';
  useEffect(() => {
    if (!confirmed) return;
    let active = true;
    void finishEmailConfirmation().then((ok) => {
      if (active && ok) setBanner('emailConfirmed');
    });
    return () => {
      active = false;
    };
  }, [confirmed]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = { email: !isValidEmail(email), password: password === '' };
    setFieldErrors(found);
    if (found.email || found.password) {
      (found.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    setError(undefined);
    setSubmitting(true);
    const result = await logIn(email, password);
    setSubmitting(false);

    if (result.role) {
      const from = state?.from?.startsWith('/') ? state.from : undefined;
      navigate(from ?? homeByRole[result.role], { replace: true });
    } else {
      setBanner(undefined);
      setError(result.error ?? 'unknown');
    }
  }

  async function onResend() {
    setResending(true);
    const result = await resendConfirmation(email);
    setResending(false);
    if (result.error) {
      setError(result.error === 'too_many_attempts' ? 'too_many_attempts' : 'unknown');
    } else {
      setError(undefined);
      setBanner('checkEmail');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('logIn.title')} showBack />
      <main className="mx-auto w-full max-w-md px-4 py-6">
        <form noValidate onSubmit={onSubmit} className="space-y-4">
          {banner && <Banner tone="success">{t(BANNER_TEXT[banner])}</Banner>}
          {error && (
            <Banner tone="error">
              <p>{t(ERROR_TEXT[error])}</p>
              {error === 'email_not_confirmed' && (
                <button
                  type="button"
                  onClick={onResend}
                  disabled={resending || !online}
                  className="mt-1 min-h-11 font-semibold text-primary underline underline-offset-2 disabled:text-disabled-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {t('logIn.resendEmail')}
                </button>
              )}
            </Banner>
          )}

          <TextField
            ref={emailRef}
            id="log-in-email"
            label={t('logIn.email')}
            type="email"
            autoComplete="email"
            placeholder={t('logIn.emailPlaceholder')}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setFieldErrors((current) => ({ ...current, email: false }));
            }}
            error={fieldErrors.email ? t('logIn.emailError') : undefined}
          />
          <div>
            <TextField
              ref={passwordRef}
              id="log-in-password"
              label={t('logIn.password')}
              type="password"
              autoComplete="current-password"
              placeholder={t('logIn.passwordPlaceholder')}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setFieldErrors((current) => ({ ...current, password: false }));
              }}
              error={fieldErrors.password ? t('logIn.passwordError') : undefined}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="min-h-11 px-1 text-base font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                {t('logIn.forgotPassword')}
              </button>
            </div>
          </div>

          <Button type="submit" loading={submitting} disabled={!online}>
            {t('logIn.submit')}
          </Button>
          <p className="flex min-h-11 items-center justify-center gap-1 text-base text-text-secondary">
            {t('logIn.newHere')}
            <Link
              to="/sign-up"
              className="font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              {t('logIn.createAccount')}
            </Link>
          </p>
        </form>
      </main>
      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
    </div>
  );
}
