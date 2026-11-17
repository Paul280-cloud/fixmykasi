-- Issue #16: status lifecycle, history, delay, reopen, overdue and auto-close.
-- Integrates with Issue #18 assign_fault(): this migration replaces that function
-- and removes its explicit history INSERT in the same transaction that installs
-- the single AFTER UPDATE history trigger.

begin;

-- 1) Extend the timeline. The private reopen reason is deliberately not granted
-- to anon/authenticated. field_team_id is safe for the public timeline to use
-- when it needs to display the team that handled a historical transition. The
-- default NO ACTION foreign key deliberately prevents deleting a team that is
-- still referenced by history, so historical team IDs cannot silently disappear.
alter table public.status_changes
  add column field_team_id uuid
    references public.field_teams (id),
  add column reopen_reason text
    constraint status_changes_reopen_reason_length_check
    check (
      reopen_reason is null
      or char_length(btrim(reopen_reason)) between 10 and 200
    );

grant select (field_team_id)
  on public.status_changes to anon, authenticated;

-- 2) The initial row remains the responsibility of the AFTER INSERT trigger.
-- Capture the team if a test/admin inserts an already-assigned fault.
create or replace function public.faults_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.status_changes (
    fault_id, from_status, to_status, changed_by, field_team_id
  )
  values (
    new.id, null, new.status, new.reporter_id, new.field_team_id
  );
  return null;
end;
$$;

revoke all on function public.faults_after_insert() from public, anon, authenticated;

-- 3) Canonical writer for every subsequent status or team change.
-- Exactly one row is written for one UPDATE, even if both columns change.
-- Team reassignments store NEW.field_team_id; reopening stores OLD.field_team_id.
create or replace function public.faults_after_update_status_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_note text := nullif(btrim(current_setting('app.status_note', true)), '');
  v_reopen_reason text := nullif(btrim(current_setting('app.reopen_reason', true)), '');
begin
  if new.status is distinct from old.status
     or new.field_team_id is distinct from old.field_team_id then
    insert into public.status_changes (
      fault_id,
      from_status,
      to_status,
      changed_by,
      note,
      field_team_id,
      reopen_reason
    )
    values (
      new.id,
      old.status,
      new.status,
      (select auth.uid()),
      v_note,
      coalesce(new.field_team_id, old.field_team_id),
      v_reopen_reason
    );
  end if;

  return new;
end;
$$;

revoke all on function public.faults_after_update_status_history() from public, anon, authenticated;

drop trigger if exists faults_after_update_status_history on public.faults;
create trigger faults_after_update_status_history
  after update of status, field_team_id on public.faults
  for each row
  execute function public.faults_after_update_status_history();

-- 4) Replace Issue #18's assign_fault in this same migration. The trigger is
-- now the only history writer. The transaction-local note is cleared immediately
-- after the UPDATE so a later UPDATE in the same transaction cannot inherit it.
create or replace function public.assign_fault(
  p_fault_id uuid,
  p_field_team_id uuid,
  p_due_date date,
  p_estimated_days integer,
  p_municipal_reference text default null,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  today date := (now() at time zone 'Africa/Johannesburg')::date;
  the_fault public.faults%rowtype;
  clean_reference text := nullif(btrim(p_municipal_reference), '');
  clean_note text := nullif(btrim(p_note), '');
begin
  select * into the_fault
  from public.faults
  where id = p_fault_id
  for update;

  if not found then
    raise exception 'fault_not_found';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = me
      and p.role = 'ward_admin'
      and p.ward_id = the_fault.ward_id
  ) then
    raise exception 'not_your_ward'
      using hint = 'BR8: only the ward admin of the fault''s ward can assign it.';
  end if;

  if the_fault.status not in ('received', 'viewed', 'reopened', 'assigned', 'scheduled') then
    raise exception 'cannot_assign_now'
      using hint = '10.3: a fault can only be assigned while it is received, viewed, reopened, assigned or scheduled.';
  end if;

  if not exists (
    select 1
    from public.field_teams ft
    join public.fault_types t on t.id = the_fault.fault_type_id
    where ft.id = p_field_team_id
      and ft.category = t.category
  ) then
    raise exception 'wrong_team_category'
      using hint = 'BR8: the field team''s category must match the fault''s category.';
  end if;

  if p_due_date is null or p_due_date < today or p_due_date > today + 90 then
    raise exception 'bad_due_date'
      using hint = 'BR8: the due date must be between today and 90 days from today (SAST).';
  end if;

  if p_estimated_days is null or p_estimated_days not between 1 and 90 then
    raise exception 'bad_estimated_days'
      using hint = 'BR8: the estimated time to fix is 1 to 90 days.';
  end if;

  if char_length(clean_reference) > 30 then
    raise exception 'municipal_reference_too_long'
      using hint = 'BR8: the municipality''s reference is up to 30 characters.';
  end if;

  if char_length(clean_note) > 200 then
    raise exception 'note_too_long'
      using hint = 'M2: the note to the field team is up to 200 characters.';
  end if;

  perform pg_catalog.set_config('app.status_note', coalesce(clean_note, ''), true);
  perform pg_catalog.set_config('app.reopen_reason', '', true);

  update public.faults
  set status = 'assigned',
      field_team_id = p_field_team_id,
      due_date = p_due_date,
      estimated_days = p_estimated_days,
      municipal_reference = coalesce(clean_reference, the_fault.municipal_reference),
      is_delayed = false,
      delay_reason = null,
      assigned_at = now(),
      updated_at = now()
  where id = p_fault_id;

  perform pg_catalog.set_config('app.status_note', '', true);
  perform pg_catalog.set_config('app.reopen_reason', '', true);
end;
$$;

revoke all on function public.assign_fault(uuid, uuid, date, integer, text, text) from public, anon, authenticated;
grant execute on function public.assign_fault(uuid, uuid, date, integer, text, text) to authenticated;

-- 5) One function for PRD 10.3 status transitions other than assignment
-- (assignment remains the Issue #18 assign_fault operation).
-- The client calls 'viewed' automatically when the matching ward admin opens
-- a Received fault; there is no manual Viewed button.
create function public.change_fault_status(
  p_fault_id uuid,
  p_to_status public.fault_status,
  p_note text default null,
  p_reopen_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  actor public.profiles%rowtype;
  the_fault public.faults%rowtype;
  clean_note text := nullif(btrim(p_note), '');
  clean_reopen_reason text := nullif(btrim(p_reopen_reason), '');
begin
  if me is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  if char_length(clean_note) > 200 then
    raise exception 'note_too_long';
  end if;

  if p_to_status <> 'reopened' and clean_reopen_reason is not null then
    raise exception 'reopen_reason_only_for_reopen';
  end if;

  select * into the_fault
  from public.faults
  where id = p_fault_id
  for update;

  if not found then
    raise exception 'fault_not_found';
  end if;

  select * into actor
  from public.profiles
  where id = me;

  if not found then
    raise exception 'profile_not_found' using errcode = '42501';
  end if;

  -- BR10: viewed is automatic on opening the fault detail, only for its ward admin.
  if p_to_status = 'viewed' then
    if actor.role <> 'ward_admin' or actor.ward_id is distinct from the_fault.ward_id then
      raise exception 'not_your_ward' using errcode = '42501';
    end if;

    -- Opening a fault is idempotent. If another request already viewed or
    -- progressed it, don't add a duplicate row or fail the detail-page load.
    if the_fault.status <> 'received' then
      return;
    end if;

  elsif p_to_status in ('scheduled', 'in_progress', 'fixed') then
    if actor.role <> 'field_team'
       or actor.field_team_id is distinct from the_fault.field_team_id then
      raise exception 'not_assigned_field_team' using errcode = '42501';
    end if;

    if p_to_status = 'scheduled' and the_fault.status <> 'assigned' then
      raise exception 'invalid_status_transition';
    elsif p_to_status = 'in_progress'
          and the_fault.status not in ('assigned', 'scheduled') then
      raise exception 'invalid_status_transition';
    elsif p_to_status = 'fixed' and the_fault.status <> 'in_progress' then
      raise exception 'invalid_status_transition';
    end if;

  elsif p_to_status in ('closed', 'reopened') then
    if actor.role <> 'resident'
       or the_fault.reporter_id is distinct from me then
      raise exception 'not_fault_reporter' using errcode = '42501';
    end if;

    if the_fault.status <> 'fixed' then
      raise exception 'invalid_status_transition';
    end if;

    if p_to_status = 'reopened' then
      if the_fault.reopen_count >= 2 then
        raise exception 'reopen_limit_reached';
      end if;

      if clean_reopen_reason is null
         or char_length(clean_reopen_reason) not between 10 and 200 then
        raise exception 'bad_reopen_reason';
      end if;
    elsif clean_reopen_reason is not null then
      raise exception 'reopen_reason_only_for_reopen';
    end if;

  else
    -- 'assigned' is handled only by assign_fault; 'received' is an insert state.
    raise exception 'invalid_status_transition';
  end if;

  perform pg_catalog.set_config('app.status_note', coalesce(clean_note, ''), true);
  perform pg_catalog.set_config('app.reopen_reason', coalesce(clean_reopen_reason, ''), true);

  if p_to_status = 'reopened' then
    update public.faults
    set status = 'reopened',
        field_team_id = null,
        due_date = null,
        estimated_days = null,
        is_delayed = false,
        delay_reason = null,
        fixed_at = null,
        reopen_count = reopen_count + 1,
        updated_at = now()
    where id = p_fault_id;
  else
    update public.faults
    set status = p_to_status,
        viewed_at = case when p_to_status = 'viewed' then now() else viewed_at end,
        fixed_at = case when p_to_status = 'fixed' then now() else fixed_at end,
        closed_at = case when p_to_status = 'closed' then now() else closed_at end,
        updated_at = now()
    where id = p_fault_id;
  end if;

  -- Paul/#18 integration condition: clear both transaction-local values immediately.
  perform pg_catalog.set_config('app.status_note', '', true);
  perform pg_catalog.set_config('app.reopen_reason', '', true);
end;
$$;

revoke all on function public.change_fault_status(uuid, public.fault_status, text, text) from public, anon;
grant execute on function public.change_fault_status(uuid, public.fault_status, text, text) to authenticated;

-- 6) BR12: only the currently assigned field-team member can mark a fault delayed.
-- Delaying changes metadata and due_date, never the status or timeline.
create function public.mark_fault_delayed(
  p_fault_id uuid,
  p_delay_reason text,
  p_new_due_date date
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  actor public.profiles%rowtype;
  the_fault public.faults%rowtype;
  clean_reason text := nullif(btrim(p_delay_reason), '');
  today date := (now() at time zone 'Africa/Johannesburg')::date;
begin
  if me is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  select * into the_fault
  from public.faults
  where id = p_fault_id
  for update;

  if not found then
    raise exception 'fault_not_found';
  end if;

  select * into actor from public.profiles where id = me;
  if not found
     or actor.role <> 'field_team'
     or actor.field_team_id is distinct from the_fault.field_team_id then
    raise exception 'not_assigned_field_team' using errcode = '42501';
  end if;

  if the_fault.status not in ('assigned', 'scheduled', 'in_progress') then
    raise exception 'status_not_eligible_for_delay';
  end if;

  if clean_reason is null or char_length(clean_reason) not between 10 and 200 then
    raise exception 'bad_delay_reason';
  end if;

  if p_new_due_date is null
     or p_new_due_date <= greatest(coalesce(the_fault.due_date, today), today) then
    raise exception 'bad_delay_due_date';
  end if;

  update public.faults
  set is_delayed = true,
      delay_reason = clean_reason,
      due_date = p_new_due_date,
      updated_at = now()
  where id = p_fault_id;
end;
$$;

revoke all on function public.mark_fault_delayed(uuid, text, date) from public, anon;
grant execute on function public.mark_fault_delayed(uuid, text, date) to authenticated;

-- 7) Private BR14 reopen-reason reader. It returns only the reasons for the
-- requested fault and only to its reporter, its ward admin, or its NEXT/current
-- assigned field team. The previous team is not authorised after reassignment.
create function public.get_fault_reopen_reasons(p_fault_id uuid)
returns table (
  status_change_id uuid,
  reopen_reason text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
begin
  if me is null or not exists (
    select 1
    from public.faults f
    join public.profiles p on p.id = me
    where f.id = p_fault_id
      and (
        f.reporter_id = me
        or (p.role = 'ward_admin' and p.ward_id = f.ward_id)
        or (p.role = 'field_team' and p.field_team_id = f.field_team_id)
      )
  ) then
    raise exception 'not_authorised_to_read_reopen_reason' using errcode = '42501';
  end if;

  return query
  select sc.id, sc.reopen_reason, sc.created_at
  from public.status_changes sc
  where sc.fault_id = p_fault_id
    and sc.reopen_reason is not null
  order by sc.created_at, sc.id;
end;
$$;

revoke all on function public.get_fault_reopen_reasons(uuid) from public, anon;
grant execute on function public.get_fault_reopen_reasons(uuid) to authenticated;

-- 8) BR14: a Fixed fault is automatically Closed once it has been Fixed for
-- seven complete days. The trigger records the transition; auth.uid() is NULL
-- for the scheduled job, which accurately represents a system action.
create function public.auto_close_fixed_faults()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  closed_count integer;
begin
  update public.faults
  set status = 'closed',
      closed_at = now(),
      updated_at = now()
  where status = 'fixed'
    and fixed_at is not null
    and fixed_at <= now() - interval '7 days';

  get diagnostics closed_count = row_count;
  return closed_count;
end;
$$;

revoke all on function public.auto_close_fixed_faults() from public, anon, authenticated;

-- 9) Install the Supabase pg_cron extension and schedule 02:00 SAST.
-- pg_cron defaults to GMT; UTC is equivalent for this schedule. South Africa
-- is GMT+02:00, therefore 00:00 GMT/UTC is 02:00 SAST. Fail visibly if the
-- project has changed the pg_cron timezone instead of silently mis-scheduling.
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

commit;
