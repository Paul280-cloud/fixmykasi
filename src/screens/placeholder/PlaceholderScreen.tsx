// PLACEHOLDER (Issue #10). These screens only exist so log-in can open each
// role's home screen and the tab bar can be checked. Each one is replaced
// by its own Issue: /faults #12, /queue #19, /my-jobs #20, /profile #23.
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import TabScreen from '../../components/TabScreen';
import { logOut } from '../../lib/auth';

type Props = { title: 'faults' | 'queue' | 'myJobs' | 'profile'; issue: number };

export default function PlaceholderScreen({ title, issue }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <TabScreen title={t(`placeholder.${title}`)}>
      <p className="text-text-secondary">{t('placeholder.note', { issue })}</p>
      {title === 'profile' && (
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
      )}
    </TabScreen>
  );
}
