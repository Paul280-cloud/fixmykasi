import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// BR11 / PRD 8.3 Labels: a red "Overdue" label with a clock icon.
export default function OverdueLabel() {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-error">
      <Clock aria-hidden="true" size={16} />
      {t('labels.overdue')}
    </span>
  );
}
