import { useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Banner from '../../components/Banner';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import TextField from '../../components/TextField';
import { sendPasswordReset } from '../../lib/auth';
import { useOnline } from '../../lib/useOnline';
import { isValidEmail } from '../../lib/validation';

// M1 Forgot Password (PRD 5, 8.2). Opened from S3 and from S12's
// expired-link state.
export default function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const online = useOnline();
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError(true);
      emailRef.current?.focus();
      return;
    }
    setStatus('sending');
    const { error } = await sendPasswordReset(email);
    setStatus(error ? 'error' : 'sent');
  }

  const sent = status === 'sent';

  return (
    <Modal title={t('forgotPassword.title')} onClose={onClose}>
      <form noValidate onSubmit={onSubmit} className="space-y-4">
        {status === 'error' && <Banner tone="error">{t('common.somethingWentWrong')}</Banner>}
        {sent ? (
          <Banner tone="success">{t('forgotPassword.sent')}</Banner>
        ) : (
          <>
            <p className="text-base text-text-secondary">{t('forgotPassword.text')}</p>
            <TextField
              ref={emailRef}
              id="forgot-email"
              label={t('forgotPassword.email')}
              type="email"
              autoComplete="email"
              placeholder={t('forgotPassword.emailPlaceholder')}
              value={email}
              disabled={status === 'sending'}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError(false);
              }}
              error={emailError ? t('forgotPassword.emailError') : undefined}
            />
          </>
        )}
        {sent ? (
          <Button onClick={onClose}>{t('forgotPassword.done')}</Button>
        ) : (
          <>
            <Button type="submit" loading={status === 'sending'} disabled={!online}>
              {t('forgotPassword.submit')}
            </Button>
            <Button variant="text" onClick={onClose} disabled={status === 'sending'}>
              {t('forgotPassword.cancel')}
            </Button>
          </>
        )}
      </form>
    </Modal>
  );
}
