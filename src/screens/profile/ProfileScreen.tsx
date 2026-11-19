import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import TabScreen from '../../components/TabScreen';
import { getWards, logOut } from '../../lib/auth';
import { useAuth } from '../../lib/authContext';
import { getMyProfile, initials, type MyProfile } from '../../lib/profile';
import PrivacyNoticeModal from '../privacy-notice/PrivacyNoticeModal';

// S11 Profile (PRD 8.2), the small version for #23 so nobody lands on a
// placeholder. It only shows my details for now. Left for later in #23:
// editing the form, changing the language (BR18) and Delete account (M5).

/** "+27825550134" -> "+27 82 555 0134", the same look as the PRD sample. */
function nicePhone(phone: string): string {
  const digits = phone.replace('+27', '');
  return `+27 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

export default function ProfileScreen() {
  const { userId, ready } = useAuth();
  if (!ready) return null;
  if (!userId) return <Navigate to="/log-in" replace state={{ from: '/profile' }} />;
  return <Profile userId={userId} />;
}

function Profile({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [me, setMe] = useState<MyProfile | null>(null);
  const [wardName, setWardName] = useState('');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMyProfile(userId), getWards()]).then(
      ([profile, wards]) => {
        if (cancelled) return;
        setWardName(wards.find((ward) => ward.id === profile.wardId)?.name ?? '');
        setMe(profile);
      },
      () => {
        if (!cancelled) setFailed(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  function tryAgain() {
    setFailed(false);
    setMe(null);
    setAttempt((n) => n + 1);
  }

  let content;
  if (failed) {
    content = (
      <div className="text-center">
        <p>{t('common.somethingWentWrong')}</p>
        <div className="mx-auto mt-4 max-w-xs">
          <Button variant="secondary" onClick={tryAgain}>
            {t('common.tryAgain')}
          </Button>
        </div>
      </div>
    );
  } else if (!me) {
    // PRD: grey lines while the profile loads.
    content = (
      <div aria-label={t('common.loading')} className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-6 animate-pulse rounded-input bg-surface" />
        ))}
      </div>
    );
  } else {
    content = (
      <>
        <div className="flex items-center gap-4">
          {/* 64 px initials circle (PRD 8.2 S11) */}
          <div
            aria-hidden="true"
            className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-primary text-xl font-bold text-white"
          >
            {initials(me.fullName)}
          </div>
          <div>
            <p className="text-lg font-semibold">{me.fullName}</p>
            <p className="text-text-secondary">{me.email}</p>
            <p className="text-[13px] font-semibold text-secondary">{t(`profile.roles.${me.role}`)}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-3">
          {/* I only show these rows when there is something in them. */}
          {me.phone && (
            <div>
              <dt className="text-[13px] text-text-secondary">{t('profile.phone')}</dt>
              <dd>{nicePhone(me.phone)}</dd>
            </div>
          )}
          {wardName && (
            <div>
              <dt className="text-[13px] text-text-secondary">{t('profile.ward')}</dt>
              <dd>{wardName}</dd>
            </div>
          )}
        </dl>

        <button
          type="button"
          onClick={() => setPrivacyOpen(true)}
          className="mt-6 font-semibold text-primary underline underline-offset-2"
        >
          {t('signUp.privacyLink')}
        </button>

        <div className="mt-6 max-w-xs">
          {/* PRD 5: "Log out" on S11, no confirmation, goes to S1. */}
          <Button
            variant="secondary"
            onClick={async () => {
              await logOut();
              navigate('/', { replace: true });
            }}
          >
            {t('common.logOut')}
          </Button>
        </div>
      </>
    );
  }

  return (
    <TabScreen title={t('profile.title')}>
      {content}
      {privacyOpen && <PrivacyNoticeModal onClose={() => setPrivacyOpen(false)} />}
    </TabScreen>
  );
}
