import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import Banner from '../../components/Banner';
import Button from '../../components/Button';
import OverdueLabel from '../../components/OverdueLabel';
import StatusChip from '../../components/StatusChip';
import TabScreen from '../../components/TabScreen';
import { homeByRole } from '../../lib/auth';
import { useAuth } from '../../lib/authContext';
import AssignFaultModal from '../assign-fault/AssignFaultModal';
import {
  getFaultTypes,
  getHomeWardId,
  getWardQueue,
  type FaultStatus,
  type FaultType,
  type QueueFault,
} from '../../lib/faults';

// S8 Ward Queue (PRD 8.2, BR7, BR11). Part of #19: filter chips, the desktop
// table and the ward name in the header come later. The Assign button opens M2 (#18).

type Tab = 'new' | 'inProgress' | 'fixed';

// BR7: which statuses go in which tab. Closed is never loaded.
const TABS: { id: Tab; statuses: FaultStatus[] }[] = [
  { id: 'new', statuses: ['received', 'viewed', 'reopened'] },
  { id: 'inProgress', statuses: ['assigned', 'scheduled', 'in_progress'] },
  { id: 'fixed', statuses: ['fixed'] },
];

// 10.3: these can go to Assigned. The first three say "Assign", the last two "Reassign".
const ASSIGN: FaultStatus[] = ['received', 'viewed', 'reopened'];
const REASSIGN: FaultStatus[] = ['assigned', 'scheduled'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "12 Nov 2026": the day the fault was reported, in SAST. */
function reportDate(iso: string): string {
  // en-CA writes dates as 2026-11-12, which is easy to split.
  const sast = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(new Date(iso));
  const [year, month, day] = sast.split('-');
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

export default function WardQueueScreen() {
  const { userId, role, ready } = useAuth();
  if (!ready) return null;
  if (!userId) return <Navigate to="/log-in" replace state={{ from: '/queue' }} />;
  if (role !== 'ward_admin') return <Navigate to={role ? homeByRole[role] : '/'} replace />;
  return <WardQueue userId={userId} />;
}

function WardQueue({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [faults, setFaults] = useState<QueueFault[] | null>(null);
  // I keep the whole fault type (not just the name) because M2 needs its category.
  const [types, setTypes] = useState<Record<string, FaultType>>({});
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [tab, setTab] = useState<Tab>('new');
  // The fault M2 is open for, or null when M2 is closed.
  const [assigning, setAssigning] = useState<QueueFault | null>(null);
  const [assigned, setAssigned] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const wardId = await getHomeWardId(userId);
      if (!wardId) throw new Error('ward admin has no ward');
      return Promise.all([getWardQueue(wardId), getFaultTypes()]);
    }
    load().then(
      ([queue, types]) => {
        if (cancelled) return;
        setTypes(Object.fromEntries(types.map((type) => [type.id, type])));
        setFaults(queue);
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
    setFaults(null);
    setAttempt((n) => n + 1);
  }

  // After M2 saves: close it, show "Fault assigned" and load the queue again,
  // so the fault moves from New to In progress straight away.
  function onAssigned() {
    setAssigning(null);
    setAssigned(true);
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
  } else if (!faults) {
    content = (
      <ul aria-label={t('common.loading')}>
        {[1, 2, 3, 4, 5].map((n) => (
          <li key={n} data-testid="queue-placeholder" className="mb-3 h-20 animate-pulse rounded-card bg-surface" />
        ))}
      </ul>
    );
  } else {
    const shown = faults.filter((fault) => TABS.find((x) => x.id === tab)!.statuses.includes(fault.status));
    content = (
      <>
        <div role="tablist" className="mb-4 flex gap-2 overflow-x-auto">
          {TABS.map(({ id, statuses }) => {
            const count = faults.filter((fault) => statuses.includes(fault.status)).length;
            const selected = id === tab;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[16px] ${
                  selected ? 'bg-primary font-semibold text-white' : 'border border-border text-text'
                }`}
              >
                {t(`wardQueue.tabs.${id}`, { count })}
              </button>
            );
          })}
        </div>
        <div role="tabpanel">
          {shown.length === 0 ? (
            <p className="py-12 text-center text-text-secondary">
              {t(tab === 'new' ? 'wardQueue.emptyNew' : 'wardQueue.emptyOther')}
            </p>
          ) : (
            <ul className="space-y-3">
              {shown.map((fault) => (
                <li key={fault.id} className="rounded-card border border-border bg-background shadow-card">
                  <Link
                    to={`/faults/${fault.reference}`}
                    className="block rounded-card p-4 hover:bg-surface"
                  >
                    <p className="font-semibold">{types[fault.faultTypeId]?.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StatusChip status={fault.status} />
                      {fault.isOverdue && <OverdueLabel />}
                    </div>
                    <p className="mt-1">{fault.streetAddress}</p>
                    <p className="mt-1 text-[13px] text-text-secondary">{fault.reference}</p>
                    <p className="text-[13px] text-text-secondary">{reportDate(fault.createdAt)}</p>
                  </Link>
                  {/* The button sits outside the link, so tapping it doesn't open S5. */}
                  {(ASSIGN.includes(fault.status) || REASSIGN.includes(fault.status)) && (
                    <div className="px-4 pb-4">
                      <Button variant="secondary" onClick={() => setAssigning(fault)}>
                        {REASSIGN.includes(fault.status) ? t('assignFault.reassign') : t('assignFault.assign')}
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </>
    );
  }

  const assigningType = assigning ? types[assigning.faultTypeId] : undefined;

  return (
    <TabScreen title={t('wardQueue.title')}>
      {assigned && (
        <div className="mb-4">
          <Banner tone="success">{t('assignFault.assigned')}</Banner>
        </div>
      )}
      {content}
      {assigning && assigningType && (
        <AssignFaultModal
          fault={{
            id: assigning.id,
            referenceNumber: assigning.reference,
            faultTypeName: assigningType.name,
            streetAddress: assigning.streetAddress,
            category: assigningType.category,
            isAssigned: REASSIGN.includes(assigning.status),
          }}
          onClose={() => setAssigning(null)}
          onAssigned={onAssigned}
        />
      )}
    </TabScreen>
  );
}
