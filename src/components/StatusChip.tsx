import { useTranslation } from 'react-i18next';
import type { FaultStatus } from '../lib/faults';

// PRD 8.3 Status chip: a coloured dot plus the status name. Never colour alone.
// Full class names are written out so Tailwind can find them.
const DOT: Record<FaultStatus, string> = {
  received: 'bg-status-received',
  viewed: 'bg-status-viewed',
  assigned: 'bg-status-assigned',
  scheduled: 'bg-status-scheduled',
  in_progress: 'bg-status-in-progress',
  fixed: 'bg-status-fixed',
  closed: 'bg-status-closed',
  reopened: 'bg-status-reopened',
};

export default function StatusChip({ status }: { status: FaultStatus }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-[13px]">
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${DOT[status]}`} />
      {t(`status.${status}`)}
    </span>
  );
}
