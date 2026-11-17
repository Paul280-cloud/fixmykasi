-- Issue #18: assign_fault, the M2 Assign Fault save (PRD BR8, 10.3, US7).
-- The app has no UPDATE rights on faults (see #11), so this function is the
-- only way a fault gets a field team. Tests: supabase/tests/11_assign_fault.test.sql
--
-- What it does, in order:
--   1. checks the caller is the ward admin of the fault's ward (BR8)
--   2. checks the status can go to assigned (10.3)
--   3. checks the form rules from M2 (team category, due date, days, reference, note)
--   4. saves the assignment and writes the history row (BR9)
--
-- Errors are short codes so the M2 screen can show the exact PRD text:
--   not_your_ward                -> "You can only manage faults in your ward."
--   wrong_team_category          -> "Choose a field team."
--   bad_due_date                 -> "Choose a date within the next 90 days."
--   bad_estimated_days           -> "Enter a number of days from 1 to 90."
--   municipal_reference_too_long -> "Keep this under 30 characters."
--   note_too_long                -> "Keep the note under 200 characters."
--   cannot_assign_now, fault_not_found -> "Something went wrong. Try again."

create function public.assign_fault(
  p_fault_id uuid,
  p_field_team_id uuid,
  p_due_date date,
  p_estimated_days integer,
  p_municipal_reference text default null,
  p_note text default null
)
returns void
language plpgsql
-- Security definer because the ward admin has no UPDATE grant on faults and
-- nobody may write status_changes from the app. Step 1 below does the role check.
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  -- BR8 says "today" in SAST, so I don't use current_date (that is UTC on the server).
  today date := (now() at time zone 'Africa/Johannesburg')::date;
  the_fault public.faults%rowtype;
  clean_reference text := nullif(btrim(p_municipal_reference), '');
  clean_note text := nullif(btrim(p_note), '');
begin
  -- Lock the fault row first. If the field team (#16) changes the status at the
  -- same moment, one of us waits, so we never both win (same idea as Bao's review on #45).
  select * into the_fault from public.faults where id = p_fault_id for update;
  if not found then
    raise exception 'fault_not_found';
  end if;

  -- 1. Only the ward admin of THIS fault's ward (BR8, T-US7-4).
  if not exists (
    select 1 from public.profiles p
    where p.id = me and p.role = 'ward_admin' and p.ward_id = the_fault.ward_id
  ) then
    raise exception 'not_your_ward'
      using hint = 'BR8: only the ward admin of the fault''s ward can assign it.';
  end if;

  -- 2. 10.3: received, viewed or reopened -> assigned, and assigned or scheduled -> assigned (reassign).
  --    In progress, fixed and closed cannot be (re)assigned. Closed is final.
  if the_fault.status not in ('received', 'viewed', 'reopened', 'assigned', 'scheduled') then
    raise exception 'cannot_assign_now'
      using hint = '10.3: a fault can only be assigned while it is received, viewed, reopened, assigned or scheduled.';
  end if;

  -- 3. The M2 form rules (BR8).
  -- The team must exist and fix this kind of fault (a water team can't get a pothole).
  if not exists (
    select 1
    from public.field_teams ft
    join public.fault_types t on t.id = the_fault.fault_type_id
    where ft.id = p_field_team_id and ft.category = t.category
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

  -- 4. Save it.
  update public.faults
  set status = 'assigned',
      field_team_id = p_field_team_id,
      due_date = p_due_date,
      estimated_days = p_estimated_days,
      -- The screen can't read municipal_reference (BR16 hides it), so on a
      -- reassign it sends nothing. Then I keep the one we already have.
      municipal_reference = coalesce(clean_reference, the_fault.municipal_reference),
      -- A new assignment starts clean: the old team's delay doesn't carry over.
      is_delayed = false,
      delay_reason = null,
      assigned_at = now(),
      updated_at = now()
  where id = p_fault_id;

  -- BR9: every change goes on the timeline, reassigning too (PO decision on #16).
  -- The note to the field team goes on this row (10.1 has no other place for it).
  insert into public.status_changes (fault_id, from_status, to_status, changed_by, note)
  values (p_fault_id, the_fault.status, 'assigned', me, clean_note);
end;
$$;

revoke all on function public.assign_fault(uuid, uuid, date, integer, text, text) from public, anon;
grant execute on function public.assign_fault(uuid, uuid, date, integer, text, text) to authenticated;

comment on function public.assign_fault(uuid, uuid, date, integer, text, text) is
  'M2 Assign Fault (BR8). Only the ward admin of the fault''s ward. Sets status assigned and writes the history row.';
