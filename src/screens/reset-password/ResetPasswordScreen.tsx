import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Banner from '../../components/Banner';
import Button from '../../components/Button';
import Header from '../../components/Header';
import TextField from '../../components/TextField';
import { getRecoveryState, updatePassword } from '../../lib/auth';
import { useOnline } from '../../lib/useOnline';
import { isValidPassword } from '../../lib/validation';
import ForgotPasswordModal from '../forgot-password/ForgotPasswordModal';

// S12 Set New Password (PRD 5, 8.2). Opened from the reset email link.
export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const online = useOnline();

  const newRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState<'checking' | 'ready' | 'expired'>('checking');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ newPassword: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => {
    let active = true;
    void getRecoveryState().then((state) => active && setLink(state));
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFailed(false);
    const found = {
      newPassword: !isValidPassword(newPassword),
      confirm: confirmPassword !== newPassword,
    };
    setErrors(found);
    if (found.newPassword || found.confirm) {
      (found.newPassword ? newRef : confirmRef).current?.focus();
      return;
    }

    setSaving(true);
    const { error } = await updatePassword(newPassword);
    setSaving(false);
    if (error) setFailed(true);
    else navigate('/log-in', { replace: true, state: { banner: 'passwordChanged' } });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('resetPassword.title')} />
      <main className="mx-auto w-full max-w-md px-4 py-6">
        {link === 'checking' && (
          <div aria-busy="true" aria-label={t('common.loading')} className="space-y-4">
            <div className="h-20 animate-pulse rounded-input bg-surface" />
            <div className="h-20 animate-pulse rounded-input bg-surface" />
            <div className="h-12 animate-pulse rounded-button bg-surface" />
          </div>
        )}

        {link === 'expired' && (
          <div className="space-y-4">
            <Banner tone="error">{t('resetPassword.expired')}</Banner>
            <Button onClick={() => setForgotOpen(true)}>{t('resetPassword.sendNewLink')}</Button>
          </div>
        )}

        {link === 'ready' && (
          <form noValidate onSubmit={onSubmit} className="space-y-4">
            {failed && <Banner tone="error">{t('common.somethingWentWrong')}</Banner>}
            <TextField
              ref={newRef}
              id="reset-new-password"
              label={t('resetPassword.newPassword')}
              type="password"
              autoComplete="new-password"
              placeholder={t('resetPassword.newPasswordPlaceholder')}
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setErrors((current) => ({ ...current, newPassword: false }));
              }}
              error={errors.newPassword ? t('resetPassword.newPasswordError') : undefined}
            />
            <TextField
              ref={confirmRef}
              id="reset-confirm-password"
              label={t('resetPassword.confirmPassword')}
              type="password"
              autoComplete="new-password"
              placeholder={t('resetPassword.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setErrors((current) => ({ ...current, confirm: false }));
              }}
              error={errors.confirm ? t('resetPassword.confirmPasswordError') : undefined}
            />
            <Button type="submit" loading={saving} disabled={!online}>
              {t('resetPassword.submit')}
            </Button>
          </form>
        )}
      </main>
      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
    </div>
  );
}
