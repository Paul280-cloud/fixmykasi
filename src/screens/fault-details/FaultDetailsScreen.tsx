
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import OverdueLabel from '../../components/OverdueLabel';
import StatusChip from '../../components/StatusChip';
import TabBar from '../../components/TabBar';
import { getFaultDetails, type FaultDetails } from '../../lib/faultDetails';
import type { FaultStatus } from '../../lib/faults';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// A date column is stored as YYYY-MM-DD. Format it without converting
// through UTC, which could move it to the previous or next day.
function formatDateOnly(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

// Timeline timestamps are stored in UTC. Always display them in SAST.
function formatSastDateTime(value: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Johannesburg',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value));

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';

  return `${part('day')} ${part('month')} ${part('year')}, ${part('hour')}:${part('minute')}`;
}

export default function FaultDetailsScreen() {
  const { reference = '' } = useParams();
  const { t } = useTranslation();

  const [fault, setFault] = useState<FaultDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setFailed(false);
    setNotFound(false);
    setFault(null);

    getFaultDetails(reference).then(
      (result) => {
        if (!active) return;

        if (!result) {
          setNotFound(true);
        } else {
          setFault(result);
        }

        setLoading(false);
      },
      () => {
        if (!active) return;
        setFailed(true);
        setLoading(false);
      },
    );

    return () => {
      active = false;
    };
  }, [reference, attempt]);

  function tryAgain() {
    setFailed(false);
    setNotFound(false);
    setFault(null);
    setLoading(true);
    setAttempt((current) => current + 1);
  }

  const page = (content: React.ReactNode) => (
    <div className="min-h-screen pb-20 lg:pb-0 lg:pl-60">
      <Header
        title={reference}
        showBack
        backTo="/faults"
      />
      <main className="mx-auto max-w-content space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {content}
      </main>
      <TabBar />
    </div>
  );

  if (loading) {
    return page(
      <ul aria-label={t('common.loading')} className="space-y-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <li
            key={item}
            data-testid="fault-details-placeholder"
            className="h-20 animate-pulse rounded-card bg-surface"
          />
        ))}
      </ul>,
    );
  }

  if (failed) {
    return page(
      <section className="rounded-card border border-border bg-background p-6 text-center">
        <p role="alert">{t('faultDetails.loadError')}</p>
        <button
          type="button"
          onClick={tryAgain}
          className="mt-4 rounded-button bg-primary px-5 py-3 font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t('common.tryAgain')}
        </button>
      </section>,
    );
  }

  if (notFound || !fault) {
    return page(
      <section className="rounded-card border border-border bg-background p-6 text-center">
        <p>{t('faultDetails.notFound')}</p>
        <Link
          to="/faults"
          className="mt-4 inline-block rounded-button bg-primary px-5 py-3 font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t('faultDetails.backToFaults')}
        </Link>
      </section>,
    );
  }

  return page(<FaultDetails fault={fault} />);
}

function FaultDetails({ fault }: { fault: FaultDetails }) {
  const { t } = useTranslation();

  // Sort defensively, even though the database service requests newest first.
  const timeline = [...fault.timeline].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <>
      {/* Photos */}
      {fault.photos.length > 0 && (
        <section aria-label={t('faultDetails.photos')}>
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {fault.photos.map((photo, index) => (
              <img
                key={photo.id}
                src={photo.url}
                alt={t('faultDetails.photoAlt', { number: index + 1 })}
                loading="lazy"
                className="h-56 w-[85%] flex-none snap-center rounded-card bg-surface object-cover sm:w-80"
              />
            ))}
          </div>
        </section>
      )}

      {/* Fault summary */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip status={fault.status as FaultStatus} />
          {fault.isUrgent && (
            <span className="rounded-full bg-error/10 px-3 py-1 text-sm font-semibold text-error">
              {t('faultDetails.urgent')}
            </span>
          )}
          {fault.isOverdue && <OverdueLabel />}
          {fault.isDelayed && (
            <span className="rounded-full bg-warning/10 px-3 py-1 text-sm font-semibold text-warning">
              {t('faultDetails.delayed')}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold">{fault.faultTypeName}</h2>
      </section>

      {/* Location */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary">
          {t('faultDetails.location')}
        </h2>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="font-semibold">{fault.streetAddress}</p>

          {fault.landmark && (
            <p className="mt-1 text-sm text-text-secondary">{fault.landmark}</p>
          )}

          <p className="mt-2 text-sm font-medium text-secondary">
            {fault.wardName}
            {fault.municipality ? ` (${fault.municipality})` : ''}
          </p>
        </div>
      </section>

      {/* Description */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary">
          {t('faultDetails.description')}
        </h2>
        <div className="rounded-card border border-border bg-background p-4 leading-relaxed">
          {fault.description}
        </div>
      </section>

      {/* Responsibility */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary">
          {t('faultDetails.responsibility')}
        </h2>

        <div className="space-y-3 rounded-card border border-border bg-background p-4">
          {fault.fieldTeam ? (
            <>
              <div>
                <p className="text-sm text-text-secondary">
                  {fault.fieldTeam.kind === 'contractor'
                    ? t('faultDetails.contractor')
                    : t('faultDetails.municipalTeam')}
                </p>
                <p className="font-semibold">{fault.fieldTeam.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-text-secondary">
                    {t('faultDetails.expectedFixDate')}
                  </p>
                  <p className="font-semibold">
                    {fault.dueDate
                      ? formatDateOnly(fault.dueDate)
                      : t('faultDetails.notSet')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-text-secondary">
                    {t('faultDetails.estimatedTime')}
                  </p>
                  <p className="font-semibold">
                    {fault.estimatedDays !== null
                      ? t('faultDetails.days', { count: fault.estimatedDays })
                      : t('faultDetails.notSet')}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-text-secondary">
              {t('faultDetails.notAssigned')}
            </p>
          )}

          {fault.isDelayed && fault.delayReason && (
            <p className="border-t border-border pt-3 text-sm text-text-secondary">
              {fault.delayReason}
            </p>
          )}
        </div>
      </section>

      {/* Read-only status timeline */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary">
          {t('faultDetails.statusHistory')}
        </h2>

        <div
          data-testid="fault-timeline"
          className="rounded-card border border-border bg-background p-4"
        >
          {timeline.length === 0 ? (
            <p className="text-sm text-text-secondary">
              {t('faultDetails.noHistory')}
            </p>
          ) : (
            <ol className="relative ml-2 space-y-5 border-l-2 border-border pl-5">
              {timeline.map((event) => (
                <li key={event.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[1.65rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-primary ring-1 ring-border"
                  />

                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span
                      data-testid="timeline-status"
                      className="font-semibold"
                    >
                      {t(`status.${event.toStatus}`)}
                    </span>

                    <time
                      dateTime={event.createdAt}
                      className="text-xs text-text-secondary"
                    >
                      {formatSastDateTime(event.createdAt)}
                    </time>
                  </div>

                  {event.note && (
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      {event.note}
                    </p>
                  )}

                  {!event.note && event.fieldTeamName && (
                    <p className="mt-1 text-sm text-text-secondary">
                      {t('faultDetails.assignedTo', {
                        team: event.fieldTeamName,
                      })}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </>
  );
}
