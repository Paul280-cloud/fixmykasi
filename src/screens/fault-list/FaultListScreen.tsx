import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import ButtonLink from '../../components/ButtonLink';
import OverdueLabel from '../../components/OverdueLabel';
import StatusChip from '../../components/StatusChip';
import TabScreen from '../../components/TabScreen';
import { getWards } from '../../lib/auth';
import { useAuth } from '../../lib/authContext';
import { getFaultList, type ListFault } from '../../lib/faultList';
import { getFaultTypes } from '../../lib/faults';

// S4 Fault list (PRD 8.2), the small version for #12 so residents don't land on
// a placeholder. Everyone can open it, visitors too. Left for later in #12:
// search, filter chips, sort, "load more", the photo thumbnail and the map.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "12 Nov 2026": the day the fault was reported, in SAST. */
function reportDate(iso: string): string {
  // en-CA writes dates as 2026-11-12, which is easy to split.
  const sast = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(new Date(iso));
  const [year, month, day] = sast.split('-');
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

export default function FaultListScreen() {
  const { t } = useTranslation();
  const { userId, ready } = useAuth();
  const [faults, setFaults] = useState<ListFault[] | null>(null);
  const [typeNames, setTypeNames] = useState<Record<string, string>>({});
  const [wardNames, setWardNames] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getFaultList(), getFaultTypes(), getWards()]).then(
      ([list, types, wards]) => {
        if (cancelled) return;
        setTypeNames(Object.fromEntries(types.map((type) => [type.id, type.name])));
        setWardNames(Object.fromEntries(wards.map((ward) => [ward.id, ward.name])));
        setFaults(list);
      },
      () => {
        if (!cancelled) setFailed(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function tryAgain() {
    setFailed(false);
    setFaults(null);
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
        {[1, 2, 3].map((n) => (
          <li key={n} className="mb-3 h-20 animate-pulse rounded-card bg-surface" />
        ))}
      </ul>
    );
  } else if (faults.length === 0) {
    content = (
      <div className="py-12 text-center">
        <p className="text-text-secondary">{t('faultList.empty')}</p>
        <div className="mx-auto mt-4 max-w-xs">
          {/* A visitor has to log in before they can report (PRD 8.2 S4). */}
          <ButtonLink to={ready && userId ? '/report' : '/log-in'}>{t('faultList.report')}</ButtonLink>
        </div>
      </div>
    );
  } else {
    content = (
      <ul className="space-y-3">
        {faults.map((fault) => (
          <li key={fault.id} className="rounded-card border border-border bg-background shadow-card">
            <Link to={`/faults/${fault.reference}`} className="block rounded-card p-4 hover:bg-surface">
              <p className="font-semibold">{typeNames[fault.faultTypeId]}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StatusChip status={fault.status} />
                {fault.isUrgent && <span className="text-[13px] font-semibold text-error">{t('labels.urgent')}</span>}
                {fault.isOverdue && <OverdueLabel />}
              </div>
              <p className="mt-1">
                {wardNames[fault.wardId] ? `${fault.streetAddress}, ${wardNames[fault.wardId]}` : fault.streetAddress}
              </p>
              <p className="mt-1 text-[13px] text-text-secondary">{fault.reference}</p>
              {/* PRD 8.2: "14 upvotes", "1 upvote", hidden at 0. */}
              {fault.upvotes > 0 && (
                <p className="text-[13px] text-text-secondary">{t('faultList.upvotes', { count: fault.upvotes })}</p>
              )}
              <p className="text-[13px] text-text-secondary">{reportDate(fault.createdAt)}</p>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return <TabScreen title={t('faultList.title')}>{content}</TabScreen>;
}
