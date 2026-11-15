import { WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOnline } from '../lib/useOnline';

// PRD 8.3 Offline banner: grey bar at the top while offline.
export default function OfflineBanner() {
  const { t } = useTranslation();
  const online = useOnline();
  if (online) return null;
  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-offline px-4 py-2 text-[13px] font-semibold text-white"
    >
      <WifiOff aria-hidden="true" className="h-4 w-4 text-accent" />
      <span>{t('common.offline')}</span>
    </div>
  );
}
