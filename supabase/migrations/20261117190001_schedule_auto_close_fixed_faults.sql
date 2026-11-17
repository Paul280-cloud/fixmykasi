-- Issue #16: schedule automatic closure as a separate migration.
-- Keeping pg_cron installation/configuration separate means a scheduler setup
-- issue cannot prevent the core status lifecycle functions from being applied.
-- 00:00 GMT/UTC is 02:00 SAST. Confirm the hosted project's cron.timezone
-- before applying this migration to production.

create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

do $$
declare
  v_cron_timezone text;
begin
  select setting into v_cron_timezone
  from pg_catalog.pg_settings
  where name = 'cron.timezone';

  if v_cron_timezone is null or v_cron_timezone not in ('GMT', 'UTC') then
    raise exception 'Issue #16 expects cron.timezone=GMT or UTC (found: %). The 00:00 GMT/UTC job must run at 02:00 SAST.',
      coalesce(v_cron_timezone, '<unavailable>');
  end if;
end;
$$;

-- Remove any prior copy with this stable name before registering the schedule.
select cron.unschedule(jobid)
from cron.job
where jobname = 'fixmykasi-auto-close-fixed-faults';

select cron.schedule(
  'fixmykasi-auto-close-fixed-faults',
  '0 0 * * *',
  'select public.auto_close_fixed_faults();'
);
