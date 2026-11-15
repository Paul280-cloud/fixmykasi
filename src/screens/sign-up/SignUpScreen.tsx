import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import Banner from '../../components/Banner';
import Button from '../../components/Button';
import Checkbox from '../../components/Checkbox';
import Header from '../../components/Header';
import SelectField from '../../components/SelectField';
import TextField from '../../components/TextField';
import { getWards, signUp, type Ward } from '../../lib/auth';
import { useOnline } from '../../lib/useOnline';
import { isValidEmail, isValidFullName, isValidPassword, isValidPhone } from '../../lib/validation';
import PrivacyNoticeModal from '../privacy-notice/PrivacyNoticeModal';

// Languages the profile accepts (PRD 10.1, BR18).
const LANGUAGES = ['en', 'af', 'zu', 'nso'];

type Field = 'fullName' | 'email' | 'phone' | 'ward' | 'password' | 'adult' | 'privacy';
type Errors = Partial<Record<Field, 'invalid' | 'taken'>>;

// The order the fields appear in, so the first error gets the focus.
const FIELD_IDS: Record<Field, string> = {
  fullName: 'sign-up-full-name',
  email: 'sign-up-email',
  phone: 'sign-up-phone',
  ward: 'sign-up-ward',
  password: 'sign-up-password',
  adult: 'sign-up-adult',
  privacy: 'sign-up-privacy',
};

// S2 Sign Up (PRD 5, 8.2): creates a resident account.
export default function SignUpScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const online = useOnline();

  const [wards, setWards] = useState<Ward[]>([]);
  const [wardsFailed, setWardsFailed] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    wardId: '',
    password: '',
    isAdult: false,
    agreed: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getWards()
      .then((list) => active && setWards(list))
      .catch(() => active && setWardsFailed(true));
    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K], field: Field) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): Errors {
    const found: Errors = {};
    if (!isValidFullName(form.fullName)) found.fullName = 'invalid';
    if (!isValidEmail(form.email)) found.email = 'invalid';
    if (!isValidPhone(form.phone)) found.phone = 'invalid';
    if (!form.wardId) found.ward = 'invalid';
    if (!isValidPassword(form.password)) found.password = 'invalid';
    if (!form.isAdult) found.adult = 'invalid';
    if (!form.agreed) found.privacy = 'invalid';
    return found;
  }

  function focusFirst(found: Errors) {
    const first = (Object.keys(FIELD_IDS) as Field[]).find((field) => found[field]);
    if (first) document.getElementById(FIELD_IDS[first])?.focus();
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFailed(false);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirst(found);
      return;
    }

    setSubmitting(true);
    const { error } = await signUp({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      wardId: form.wardId,
      password: form.password,
      isAdult: form.isAdult,
      language: LANGUAGES.includes(i18n.language) ? i18n.language : 'en',
    });
    setSubmitting(false);

    if (!error) {
      navigate('/log-in', { replace: true, state: { banner: 'checkEmail' } });
    } else if (error === 'email_taken') {
      setErrors({ email: 'taken' });
      focusFirst({ email: 'taken' });
    } else {
      setFailed(true);
    }
  }

  const emailError =
    errors.email === 'taken' ? (
      <>
        {t('signUp.emailTaken')}{' '}
        <Link to="/log-in" className="font-semibold underline underline-offset-2">
          {t('signUp.emailTakenLink')}
        </Link>
      </>
    ) : errors.email ? (
      t('signUp.emailError')
    ) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('signUp.title')} showBack />
      <main className="mx-auto w-full max-w-md px-4 py-6">
        <form noValidate onSubmit={onSubmit} className="space-y-4">
          <TextField
            id={FIELD_IDS.fullName}
            label={t('signUp.fullName')}
            autoComplete="name"
            placeholder={t('signUp.fullNamePlaceholder')}
            maxLength={60}
            value={form.fullName}
            onChange={(event) => update('fullName', event.target.value, 'fullName')}
            error={errors.fullName && t('signUp.fullNameError')}
          />
          <TextField
            id={FIELD_IDS.email}
            label={t('signUp.email')}
            type="email"
            autoComplete="email"
            placeholder={t('signUp.emailPlaceholder')}
            value={form.email}
            onChange={(event) => update('email', event.target.value, 'email')}
            error={emailError}
          />
          <TextField
            id={FIELD_IDS.phone}
            label={t('signUp.phone')}
            type="tel"
            autoComplete="tel"
            optional
            placeholder={t('signUp.phonePlaceholder')}
            value={form.phone}
            onChange={(event) => update('phone', event.target.value, 'phone')}
            error={errors.phone && t('signUp.phoneError')}
          />
          <SelectField
            id={FIELD_IDS.ward}
            label={t('signUp.ward')}
            placeholder={t('signUp.wardPlaceholder')}
            options={wards.map((ward) => ({ value: ward.id, label: ward.name }))}
            value={form.wardId}
            onChange={(event) => update('wardId', event.target.value, 'ward')}
            error={
              errors.ward ? t('signUp.wardError') : wardsFailed ? t('common.somethingWentWrong') : undefined
            }
          />
          <TextField
            id={FIELD_IDS.password}
            label={t('signUp.password')}
            type="password"
            autoComplete="new-password"
            placeholder={t('signUp.passwordPlaceholder')}
            value={form.password}
            onChange={(event) => update('password', event.target.value, 'password')}
            error={errors.password && t('signUp.passwordError')}
          />

          <div className="space-y-2 pt-1">
            <Checkbox
              id={FIELD_IDS.adult}
              label={t('signUp.adult')}
              checked={form.isAdult}
              onChange={(event) => update('isAdult', event.target.checked, 'adult')}
              error={errors.adult && t('signUp.adultError')}
            />
            <Checkbox
              id={FIELD_IDS.privacy}
              label={
                <>
                  {t('signUp.privacyBefore')}{' '}
                  <button
                    type="button"
                    onClick={() => setPrivacyOpen(true)}
                    className="font-semibold text-primary underline underline-offset-2 hover:text-[#004a20] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {t('signUp.privacyLink')}
                  </button>
                </>
              }
              checked={form.agreed}
              onChange={(event) => update('agreed', event.target.checked, 'privacy')}
              error={errors.privacy && t('signUp.privacyError')}
            />
          </div>

          <div className="space-y-3 pt-2">
            {failed && <Banner tone="error">{t('common.somethingWentWrong')}</Banner>}
            <Button type="submit" loading={submitting} disabled={!online}>
              {t('signUp.submit')}
            </Button>
            <p className="flex min-h-11 items-center justify-center gap-1 text-base text-text-secondary">
              {t('signUp.haveAccount')}
              <Link
                to="/log-in"
                className="font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                {t('signUp.logIn')}
              </Link>
            </p>
          </div>
        </form>
      </main>
      {privacyOpen && <PrivacyNoticeModal onClose={() => setPrivacyOpen(false)} />}
    </div>
  );
}
