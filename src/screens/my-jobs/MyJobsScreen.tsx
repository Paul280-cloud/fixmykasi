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
import { getFaultTypes } from '../../lib/faults';
import { DONE, getMyJobs, getMyTeam, sortJobs, TO_DO, type JobFault } from '../../lib/jobs';
import { useOnline } from '../../lib/useOnline';
import UpdateStatusModal from './UpdateStatusModal';

// S10 My Jobs (PRD 8.2, US8, BR11), the small version for #20. Left for later:
// the first photo on each card and the "Delayed" label (BR12).

type Tab = 'toDo' | 'done';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-11-18" -> "18 Nov 2026" */
function niceDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

export default function MyJobsScreen() {
  const { userId, role, ready } = useAuth();
  if (!ready) return null;
  if (!userId) return <Navigate to="/log-in" replace state={{ from: '/my-jobs' }} />;
  if (role !== 'field_team') return <Navigate to={role ? homeByRole[role] : '/'} replace />;
  return <MyJobs userId={userId} />;
}

function MyJobs({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const online = useOnline();
  const [teamName, setTeamName] = useState('');
  const [jobs, setJobs] = useState<JobFault[] | null>(null);
  const [typeNames, setTypeNames] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [tab, setTab] = useState<Tab>('toDo');
  // The job M3 is open for, or null when M3 is closed.
  const [updating, setUpdating] = useState<JobFault | null>(null);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const team = await getMyTeam(userId);
      // A field team user with no team has no jobs, which is the empty state.
      const [list, types] = await Promise.all([team ? getMyJobs(team.id) : [], getFaultTypes()]);
      return { team, list, types };
    }
    load().then(
      ({ team, list, types }) => {
        if (cancelled) return;
        setTeamName(team?.name ?? '');
        setTypeNames(Object.fromEntries(types.map((type) => [type.id, type.name])));
        setJobs(sortJobs(list));
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
    setJobs(null);
    setAttempt((n) => n + 1);
  }

  // After M3 saves: close it, show "Status updated" and load the jobs again.
  function onUpdated() {
    setUpdating(null);
    setUpdated(true);
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
  } else if (!jobs) {
    content = (
      <ul aria-label={t('common.loading')}>
        {[1, 2, 3].map((n) => (
          <li key={n} className="mb-3 h-20 animate-pulse rounded-card bg-surface" />
        ))}
      </ul>
    );
  } else {
    const statuses = tab === 'toDo' ? TO_DO : DONE;
    const shown = jobs.filter((job) => statuses.includes(job.status));
    content = (
      <>
        <div role="tablist" className="mb-4 flex gap-2 overflow-x-auto">
          {(['toDo', 'done'] as const).map((id) => {
            const count = jobs.filter((job) => (id === 'toDo' ? TO_DO : DONE).includes(job.status)).length;
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
                {t(`myJobs.tabs.${id}`, { count })}
              </button>
            );
          })}
        </div>
        <div role="tabpanel">
          {shown.length === 0 ? (
            <p className="py-12 text-center text-text-secondary">
              {t(tab === 'toDo' ? 'myJobs.empty' : 'wardQueue.emptyOther')}
            </p>
          ) : (
            <ul className="space-y-3">
              {shown.map((job) => (
                <li key={job.id} className="rounded-card border border-border bg-background shadow-card">
                  <Link to={`/faults/${job.reference}`} className="block rounded-card p-4 hover:bg-surface">
                    <p className="font-semibold">{typeNames[job.faultTypeId]}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StatusChip status={job.status} />
                      {job.isUrgent && (
                        <span className="text-[13px] font-semibold text-error">{t('labels.urgent')}</span>
                      )}
                      {job.isOverdue && <OverdueLabel />}
                    </div>
                    <p className="mt-1">
                      {job.landmark ? `${job.streetAddress}, ${job.landmark}` : job.streetAddress}
                    </p>
                    <p className="mt-1 text-[13px] text-text-secondary">{job.reference}</p>
                    {job.dueDate && (
                      <p className="text-[13px] text-text-secondary">
                        {t('myJobs.due', { date: niceDate(job.dueDate) })}
                      </p>
                    )}
                  </Link>
                  {/* Only To do jobs can still move. The button sits outside the link. */}
                  {TO_DO.includes(job.status) && (
                    <div className="px-4 pb-4">
                      <Button variant="secondary" disabled={!online} onClick={() => setUpdating(job)}>
                        {t('myJobs.update')}
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

  return (
    <TabScreen title={t('myJobs.title')}>
      {teamName && <p className="-mt-2 mb-4 text-text-secondary">{teamName}</p>}
      {updated && (
        <div className="mb-4">
          <Banner tone="success">{t('updateStatus.updated')}</Banner>
        </div>
      )}
      {content}
      {updating && <UpdateStatusModal job={updating} onClose={() => setUpdating(null)} onUpdated={onUpdated} />}
    </TabScreen>
  );
}
