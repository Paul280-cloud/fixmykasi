import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import ButtonLink from '../../components/ButtonLink';
import { homeByRole } from '../../lib/auth';
import { useAuth } from '../../lib/authContext';

// S1 Welcome (PRD 8.2). Part of #23: the language picker, logo and
// illustration come later.
export default function HomeScreen() {
  const { t } = useTranslation();
  const { role, ready } = useAuth();

  // Wait until we know who this is, so a logged-in user never sees S1 flash.
  if (!ready) return null;
  // S1 is for logged-out users. A user with no role stays here, because the
  // other screens send a user with no role back to "/".
  if (role) return <Navigate to={homeByRole[role]} replace />;

  return (
    <main className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
      {/* The logo is the wordmark "FixMyKasi" (PRD 9.1). Its map-pin icon comes later. */}
      <h1 className="text-center text-2xl font-bold text-primary">{t('app.name')}</h1>
      <h2 className="mt-6 text-2xl font-bold text-secondary">{t('welcome.title')}</h2>
      <p className="mt-2 text-text-secondary">{t('welcome.text')}</p>
      <div className="mt-8 flex max-w-xs flex-col gap-3">
        <ButtonLink to="/sign-up">{t('welcome.createAccount')}</ButtonLink>
        <ButtonLink to="/log-in" variant="secondary">
          {t('welcome.logIn')}
        </ButtonLink>
        <Link to="/faults" className="mt-2 text-center font-semibold text-primary underline underline-offset-2">
          {t('welcome.browse')}
        </Link>
      </div>
    </main>
  );
}
