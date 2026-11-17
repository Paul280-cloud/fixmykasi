-- Issue #16: allowed status transitions, permissions, delay, reopen, private reasons,
-- note-scope regression, automatic closure, and the pg_cron schedule.
-- These are integration tests against the Issue #18 assign_fault() contract.

begin;
create extension if not exists pgtap with schema extensions;

select plan(103);

create temporary table issue16_test_temp_namespace_anchor (id integer) on commit drop;

-- Test-only wrappers make absent Issue #16 schema objects return NULL, allowing
-- pgTAP to record normal failures instead of aborting the file during the red baseline.
create function pg_temp.status_history_team_for_test(p_fault_id uuid, p_to_status public.fault_status)
returns uuid language plpgsql as $$
declare result_value uuid;
begin
  if not exists (
    select 1 from pg_catalog.pg_attribute
    where attrelid = 'public.status_changes'::regclass
      and attname = 'field_team_id' and not attisdropped
  ) then return null; end if;
  execute 'select field_team_id from public.status_changes where fault_id = $1 and to_status = $2'
    into result_value using p_fault_id, p_to_status;
  return result_value;
end;
$$;

create function pg_temp.status_history_reopen_reason_for_test(p_fault_id uuid, p_to_status public.fault_status)
returns text language plpgsql as $$
declare result_value text;
begin
  if not exists (
    select 1 from pg_catalog.pg_attribute
    where attrelid = 'public.status_changes'::regclass
      and attname = 'reopen_reason' and not attisdropped
  ) then return null; end if;
  execute 'select reopen_reason from public.status_changes where fault_id = $1 and to_status = $2'
    into result_value using p_fault_id, p_to_status;
  return result_value;
end;
$$;

create function pg_temp.reopen_reason_for_test(p_fault_id uuid)
returns text language plpgsql as $$
declare result_value text;
begin
  if pg_catalog.to_regprocedure('public.get_fault_reopen_reasons(uuid)') is null then return null; end if;
  execute 'select reopen_reason from public.get_fault_reopen_reasons($1)'
    into result_value using p_fault_id;
  return result_value;
end;
$$;

create function pg_temp.reopen_reason_count_for_test(p_fault_id uuid)
returns integer language plpgsql as $$
declare result_value integer;
begin
  if pg_catalog.to_regprocedure('public.get_fault_reopen_reasons(uuid)') is null then return null; end if;
  execute 'select count(*)::integer from public.get_fault_reopen_reasons($1)'
    into result_value using p_fault_id;
  return result_value;
end;
$$;

create function pg_temp.auto_close_fixed_faults_for_test()
returns integer language plpgsql as $$
declare result_value integer;
begin
  if pg_catalog.to_regprocedure('public.auto_close_fixed_faults()') is null then return null; end if;
  execute 'select public.auto_close_fixed_faults()' into result_value;
  return result_value;
end;
$$;

create function pg_temp.cron_schedule_for_test()
returns text language plpgsql as $$
declare result_value text;
begin
  if pg_catalog.to_regclass('cron.job') is null then return null; end if;
  execute 'select schedule::text from cron.job where jobname = $1'
    into result_value using 'fixmykasi-auto-close-fixed-faults';
  return result_value;
end;
$$;

create function pg_temp.cron_command_for_test()
returns text language plpgsql as $$
declare result_value text;
begin
  if pg_catalog.to_regclass('cron.job') is null then return null; end if;
  execute 'select command::text from cron.job where jobname = $1'
    into result_value using 'fixmykasi-auto-close-fixed-faults';
  return result_value;
end;
$$;

create function pg_temp.cron_job_count_for_test()
returns integer language plpgsql as $$
declare result_value integer;
begin
  if pg_catalog.to_regclass('cron.job') is null then return null; end if;
  execute 'select count(*)::integer from cron.job where jobname = $1'
    into result_value using 'fixmykasi-auto-close-fixed-faults';
  return result_value;
end;
$$;

create function pg_temp.cron_job_active_for_test()
returns boolean language plpgsql as $$
declare result_value boolean;
begin
  if pg_catalog.to_regclass('cron.job') is null then return null; end if;
  execute 'select active from cron.job where jobname = $1'
    into result_value using 'fixmykasi-auto-close-fixed-faults';
  return result_value;
end;
$$;


-- Fixtures -----------------------------------------------------------------------------
insert into public.wards (id, name) values
  ('0000000a-0000-0000-0000-000000000930', 'Lifecycle Test Ward'),
  ('0000000a-0000-0000-0000-000000000931', 'Other Lifecycle Ward');

insert into public.field_teams (id, name, kind, category) values
  ('0000000f-0000-0000-0000-000000000930', 'Lifecycle Roads Team A', 'municipal', 'roads'),
  ('0000000f-0000-0000-0000-000000000931', 'Lifecycle Roads Team B', 'contractor', 'roads');

insert into auth.users (id, email, raw_user_meta_data) values
  ('c0000000-0000-0000-0000-000000000930', 'lifecycle.reporter@test.local',
   jsonb_build_object('full_name', 'Lifecycle Reporter', 'ward_id', '0000000a-0000-0000-0000-000000000930', 'is_18_or_older', true)),
  ('c0000000-0000-0000-0000-000000000931', 'lifecycle.admin1@test.local',
   jsonb_build_object('full_name', 'Lifecycle Ward Admin', 'ward_id', '0000000a-0000-0000-0000-000000000930', 'is_18_or_older', true)),
  ('c0000000-0000-0000-0000-000000000932', 'lifecycle.admin2@test.local',
   jsonb_build_object('full_name', 'Other Ward Admin', 'ward_id', '0000000a-0000-0000-0000-000000000931', 'is_18_or_older', true)),
  ('c0000000-0000-0000-0000-000000000933', 'lifecycle.teama@test.local',
   jsonb_build_object('full_name', 'Lifecycle Team A Member', 'ward_id', '0000000a-0000-0000-0000-000000000930', 'is_18_or_older', true)),
  ('c0000000-0000-0000-0000-000000000934', 'lifecycle.teamb@test.local',
   jsonb_build_object('full_name', 'Lifecycle Team B Member', 'ward_id', '0000000a-0000-0000-0000-000000000930', 'is_18_or_older', true));

update public.profiles set role = 'ward_admin'
where id = 'c0000000-0000-0000-0000-000000000931';
update public.profiles set role = 'ward_admin'
where id = 'c0000000-0000-0000-0000-000000000932';
update public.profiles set role = 'field_team', ward_id = null,
  field_team_id = '0000000f-0000-0000-0000-000000000930'
where id = 'c0000000-0000-0000-0000-000000000933';
update public.profiles set role = 'field_team', ward_id = null,
  field_team_id = '0000000f-0000-0000-0000-000000000931'
where id = 'c0000000-0000-0000-0000-000000000934';

-- The status changes tests use explicit IDs so they can assert exact history rows.
insert into public.faults (
  id, reporter_id, ward_id, fault_type_id, description, street_address,
  status, field_team_id, due_date, estimated_days, fixed_at,
  is_delayed, delay_reason, municipal_reference
)
select v.id::uuid, 'c0000000-0000-0000-0000-000000000930'::uuid,
       '0000000a-0000-0000-0000-000000000930'::uuid, t.id,
       v.description, v.street_address, v.status::public.fault_status,
       v.field_team_id::uuid, v.due_date, v.estimated_days, v.fixed_at,
       v.is_delayed, v.delay_reason, v.municipal_reference
from public.fault_types t
cross join (values
  ('f0000000-0000-0000-0000-000000000930', 'Received fault for automatic Viewed', '30 View Road', 'received', null, (now() at time zone 'Africa/Johannesburg')::date + 4, null, null, false, null, null),
  ('f0000000-0000-0000-0000-000000000931', 'Assigned fault for normal lifecycle', '31 Lifecycle Road', 'assigned', '0000000f-0000-0000-0000-000000000930', (now() at time zone 'Africa/Johannesburg')::date + 5, 5, null, false, null, null),
  ('f0000000-0000-0000-0000-000000000932', 'Assigned fault for delay rule', '32 Delay Road', 'assigned', '0000000f-0000-0000-0000-000000000930', (now() at time zone 'Africa/Johannesburg')::date + 2, 2, null, false, null, null),
  ('f0000000-0000-0000-0000-000000000933', 'Old Fixed fault for auto-close', '33 Old Fixed Road', 'fixed', '0000000f-0000-0000-0000-000000000930', (now() at time zone 'Africa/Johannesburg')::date - 9, 5, now() - interval '8 days', false, null, null),
  ('f0000000-0000-0000-0000-000000000934', 'Recent Fixed fault must remain open', '34 Recent Fixed Road', 'fixed', '0000000f-0000-0000-0000-000000000930', (now() at time zone 'Africa/Johannesburg')::date - 1, 5, now() - interval '6 days', false, null, null),
  ('f0000000-0000-0000-0000-000000000938', 'Exactly seven days Fixed fault', '38 Seven Day Road', 'fixed', '0000000f-0000-0000-0000-000000000930', (now() at time zone 'Africa/Johannesburg')::date - 7, 5, now() - interval '7 days', false, null, null),
  ('f0000000-0000-0000-0000-000000000935', 'Fixed fault for reopen rules', '35 Reopen Road', 'fixed', '0000000f-0000-0000-0000-000000000930', (now() at time zone 'Africa/Johannesburg')::date + 1, 5, now() - interval '1 day', true, 'Waiting for replacement material', 'MUN-ISSUE16-935'),
  ('f0000000-0000-0000-0000-000000000936', 'Received fault for wrong ward view denial', '36 Wrong Ward Road', 'received', null, (now() at time zone 'Africa/Johannesburg')::date + 3, null, null, false, null, null),
  ('f0000000-0000-0000-0000-000000000937', 'Received fault for note clearing', '37 Note Scope Road', 'received', null, (now() at time zone 'Africa/Johannesburg')::date + 3, null, null, false, null, null)
) as v(id, description, street_address, status, field_team_id, due_date, estimated_days, fixed_at, is_delayed, delay_reason, municipal_reference)
where t.name = 'Pothole';

insert into public.fault_photos (fault_id, kind, storage_path)
values (
  'f0000000-0000-0000-0000-000000000935',
  'after',
  'after/issue16-lifecycle-reopen.jpg'
);

-- BR10: opening a Received fault automatically marks it Viewed for its ward admin.
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000931","role":"authenticated"}';
select lives_ok(
  $$ select public.change_fault_status('f0000000-0000-0000-0000-000000000930', 'viewed'::public.fault_status) $$,
  'ALLOW: opening a Received fault as its ward admin marks it Viewed'
);
reset role;
select is((select status::text from public.faults where id = 'f0000000-0000-0000-0000-000000000930'),
  'viewed', 'automatic Viewed updates the status');
select isnt((select viewed_at from public.faults where id = 'f0000000-0000-0000-0000-000000000930'),
  null, 'automatic Viewed records viewed_at');
select is((select count(*)::integer from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000930'),
  2, 'automatic Viewed creates exactly one history row after the initial row');
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000931","role":"authenticated"}';
select lives_ok(
  $$ select public.change_fault_status('f0000000-0000-0000-0000-000000000930', 'viewed'::public.fault_status) $$,
  'ALLOW: repeated automatic Viewed calls are idempotent'
);
reset role;
select is((select count(*)::integer from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000930'),
  2, 'repeated automatic Viewed call does not add a history row');

set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000932","role":"authenticated"}';
select throws_ok(
  $$ select public.change_fault_status('f0000000-0000-0000-0000-000000000936', 'viewed'::public.fault_status) $$,
  '42501', null, 'DENY: a ward admin from another ward cannot mark the fault Viewed'
);
reset role;

-- Only the currently assigned field team can advance a fault.
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000934","role":"authenticated"}';
select throws_ok(
  $$ select public.change_fault_status('f0000000-0000-0000-0000-000000000931', 'in_progress'::public.fault_status, 'Wrong team') $$,
  '42501', null, 'DENY: Team B cannot change Team A fault status'
);
reset role;
select is((select status::text from public.faults where id = 'f0000000-0000-0000-0000-000000000931'),
  'assigned', 'rejected wrong-team status change leaves the fault unchanged');
select is((select count(*)::integer from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000931'),
  1, 'rejected wrong-team status change creates no history row');

set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000933","role":"authenticated"}';
select lives_ok(
  $$ select public.change_fault_status('f0000000-0000-0000-0000-000000000931', 'scheduled'::public.fault_status, 'Work scheduled') $$,
  'ALLOW: assigned field team can move Assigned to Scheduled'
);
select lives_ok(
  $$ select public.change_fault_status('f0000000-0000-0000-0000-000000000931', 'in_progress'::public.fault_status, 'Work started') $$,
  'ALLOW: assigned field team can move Scheduled to In progress'
);
select lives_ok(
  $$ select public.change_fault_status('f0000000-0000-0000-0000-000000000931', 'fixed'::public.fault_status, 'Repair complete') $$,
  'ALLOW: assigned field team can move In progress to Fixed without an after photo'
);
reset role;
select is((select status::text from public.faults where id = 'f0000000-0000-0000-0000-000000000931'),
  'fixed', 'field-team lifecycle reaches Fixed');
select isnt((select fixed_at from public.faults where id = 'f0000000-0000-0000-0000-000000000931'),
  null, 'moving to Fixed records fixed_at');
select is((select count(*)::integer from public.fault_photos where fault_id = 'f0000000-0000-0000-0000-000000000931' and kind = 'after'),
  0, 'Fixed is accepted without an after photo until Issue #25');
select is((select count(*)::integer from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000931'),
  4, 'three accepted lifecycle updates create exactly three history rows');

-- The reporter may confirm the repair and close a Fixed fault.
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000930","role":"authenticated"}';
select lives_ok(
  $$ select public.change_fault_status('f0000000-0000-0000-0000-000000000931', 'closed'::public.fault_status, 'Repair confirmed') $$,
  'ALLOW: the reporter can close a Fixed fault'
);
reset role;
select is((select status::text from public.faults where id = 'f0000000-0000-0000-0000-000000000931'),
  'closed', 'reporter confirmation closes the fault');
select isnt((select closed_at from public.faults where id = 'f0000000-0000-0000-0000-000000000931'),
  null, 'reporter confirmation records closed_at');
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000930","role":"authenticated"}';
select throws_ok(
  $$ select public.change_fault_status('f0000000-0000-0000-0000-000000000931', 'reopened'::public.fault_status, 'Closed is final', 'This must not reopen') $$,
  'P0001', 'invalid_status_transition', 'DENY: Closed is final and cannot be reopened');
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000933","role":"authenticated"}';
select throws_ok(
  $$ select public.mark_fault_delayed('f0000000-0000-0000-0000-000000000931', 'Waiting for material delivery', (now() at time zone 'Africa/Johannesburg')::date + 12) $$,
  'P0001', 'status_not_eligible_for_delay', 'DENY: a Closed fault cannot be marked delayed');
reset role;

-- BR12: delay requires the assigned field team, an eligible status, a reason,
-- and a due date later than both today and the existing due date.
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000934","role":"authenticated"}';
select throws_ok(
  $$ select public.mark_fault_delayed('f0000000-0000-0000-0000-000000000932', 'Waiting for material delivery', (now() at time zone 'Africa/Johannesburg')::date + 10) $$,
  '42501', null, 'DENY: an unassigned field team cannot delay another team fault'
);
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000933","role":"authenticated"}';
select throws_ok(
  $$ select public.mark_fault_delayed('f0000000-0000-0000-0000-000000000932', 'short', (now() at time zone 'Africa/Johannesburg')::date + 10) $$,
  'P0001', 'bad_delay_reason', 'DENY: delay reason shorter than 10 characters'
);
select throws_ok(
  $$ select public.mark_fault_delayed('f0000000-0000-0000-0000-000000000932', null, (now() at time zone 'Africa/Johannesburg')::date + 10) $$,
  'P0001', 'bad_delay_reason', 'DENY: delay reason is required'
);
select throws_ok(
  $$ select public.mark_fault_delayed('f0000000-0000-0000-0000-000000000932', 'Waiting for material delivery', null) $$,
  'P0001', 'bad_delay_due_date', 'DENY: revised due date is required'
);
select throws_ok(
  $$ select public.mark_fault_delayed('f0000000-0000-0000-0000-000000000932', repeat('x', 201), (now() at time zone 'Africa/Johannesburg')::date + 10) $$,
  'P0001', 'bad_delay_reason', 'DENY: delay reason longer than 200 characters'
);
select throws_ok(
  $$ select public.mark_fault_delayed('f0000000-0000-0000-0000-000000000932', 'Waiting for material delivery', (now() at time zone 'Africa/Johannesburg')::date + 2) $$,
  'P0001', 'bad_delay_due_date', 'DENY: new due date is not later than existing due date'
);
select lives_ok(
  $$ select public.mark_fault_delayed('f0000000-0000-0000-0000-000000000932', 'Waiting for material delivery', (now() at time zone 'Africa/Johannesburg')::date + 10) $$,
  'ALLOW: assigned field team can delay an Assigned fault with a later due date'
);
reset role;
select is((select status::text from public.faults where id = 'f0000000-0000-0000-0000-000000000932'),
  'assigned', 'delay does not change the fault status');
select is((select is_delayed from public.faults where id = 'f0000000-0000-0000-0000-000000000932'),
  true, 'delay sets the Delayed flag');
select is((select delay_reason from public.faults where id = 'f0000000-0000-0000-0000-000000000932'),
  'Waiting for material delivery', 'delay stores its reason');
select is((select due_date from public.faults where id = 'f0000000-0000-0000-0000-000000000932'),
  (now() at time zone 'Africa/Johannesburg')::date + 10, 'delay stores the later due date');
select is((select count(*)::integer from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000932'),
  1, 'delay-only update creates no status history row');

-- The same BR12 permission applies while Scheduled and In progress.
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000933","role":"authenticated"}';
select lives_ok(
  $$ select public.change_fault_status('f0000000-0000-0000-0000-000000000932', 'scheduled'::public.fault_status, 'Schedule delayed work') $$,
  'ALLOW: assigned field team can schedule the delayed fault'
);
select lives_ok(
  $$ select public.mark_fault_delayed('f0000000-0000-0000-0000-000000000932', 'Supplier delivery is still outstanding', (now() at time zone 'Africa/Johannesburg')::date + 14) $$,
  'ALLOW: assigned field team can delay a Scheduled fault'
);
select lives_ok(
  $$ select public.change_fault_status('f0000000-0000-0000-0000-000000000932', 'in_progress'::public.fault_status, 'Work started despite delay') $$,
  'ALLOW: assigned field team can move Scheduled to In progress'
);
select lives_ok(
  $$ select public.mark_fault_delayed('f0000000-0000-0000-0000-000000000932', 'Additional time needed for the repair', (now() at time zone 'Africa/Johannesburg')::date + 20) $$,
  'ALLOW: assigned field team can delay an In progress fault'
);
reset role;
select is((select status::text from public.faults where id = 'f0000000-0000-0000-0000-000000000932'),
  'in_progress', 'delay leaves the status unchanged while the fault is In progress');
select is((select count(*)::integer from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000932'),
  3, 'two additional delay-only updates still create no history rows');

set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000933","role":"authenticated"}';
select throws_ok(
  $$ select public.mark_fault_delayed('f0000000-0000-0000-0000-000000000934', 'Waiting for material delivery', (now() at time zone 'Africa/Johannesburg')::date + 10) $$,
  'P0001', 'status_not_eligible_for_delay', 'DENY: a Fixed fault cannot be marked delayed'
);
reset role;

-- BR14: reopen reason is separate from the public note, and reopening clears
-- assignment/due/delay/fixed metadata while preserving municipal reference, photos
-- and the previous team's identity in status history.
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000930","role":"authenticated"}';
select throws_ok(
  $$ select public.change_fault_status(
       'f0000000-0000-0000-0000-000000000935',
       'reopened'::public.fault_status,
       'The fault is still present after repair',
       'short'
     ) $$,
  'P0001', 'bad_reopen_reason', 'DENY: reopen reason shorter than 10 characters'
);
select throws_ok(
  $$ select public.change_fault_status(
       'f0000000-0000-0000-0000-000000000935',
       'reopened'::public.fault_status,
       'The fault is still present after repair',
       repeat('x', 201)
     ) $$,
  'P0001', 'bad_reopen_reason', 'DENY: reopen reason longer than 200 characters'
);
select throws_ok(
  $$ select public.change_fault_status(
       'f0000000-0000-0000-0000-000000000935',
       'reopened'::public.fault_status,
       'The fault is still present after repair',
       null
     ) $$,
  'P0001', 'bad_reopen_reason', 'DENY: reopen reason is required'
);
select lives_ok(
  $$ select public.change_fault_status(
       'f0000000-0000-0000-0000-000000000935',
       'reopened'::public.fault_status,
       'The fault is still present after repair',
       'The repair did not resolve the underlying problem'
     ) $$,
  'ALLOW: the reporter can reopen a Fixed fault with a separate private reason'
);
reset role;
select is((select status::text from public.faults where id = 'f0000000-0000-0000-0000-000000000935'),
  'reopened', 'reopening changes the status to Reopened');
select is((select field_team_id from public.faults where id = 'f0000000-0000-0000-0000-000000000935'),
  null::uuid, 'reopening clears field_team_id');
select is((select due_date from public.faults where id = 'f0000000-0000-0000-0000-000000000935'),
  null::date, 'reopening clears due_date');
select is((select estimated_days from public.faults where id = 'f0000000-0000-0000-0000-000000000935'),
  null::integer, 'reopening clears estimated_days');
select is((select is_delayed from public.faults where id = 'f0000000-0000-0000-0000-000000000935'),
  false, 'reopening clears is_delayed');
select is((select delay_reason from public.faults where id = 'f0000000-0000-0000-0000-000000000935'),
  null::text, 'reopening clears delay_reason');
select is((select fixed_at from public.faults where id = 'f0000000-0000-0000-0000-000000000935'),
  null::timestamptz, 'reopening clears fixed_at');
select is((select reopen_count from public.faults where id = 'f0000000-0000-0000-0000-000000000935'),
  1, 'reopening increments reopen_count once');
select is(current_setting('app.reopen_reason', true), '', 'change_fault_status clears app.reopen_reason immediately after UPDATE');
select is((select municipal_reference from public.faults where id = 'f0000000-0000-0000-0000-000000000935'),
  'MUN-ISSUE16-935', 'reopening preserves municipal_reference');
select is((select count(*)::integer from public.fault_photos where fault_id = 'f0000000-0000-0000-0000-000000000935' and kind = 'after'),
  1, 'reopening preserves existing after photos');
select is(pg_temp.status_history_team_for_test('f0000000-0000-0000-0000-000000000935', 'reopened'::public.fault_status),
  '0000000f-0000-0000-0000-000000000930'::uuid, 'reopen history retains the previous field team');
select is(pg_temp.status_history_reopen_reason_for_test('f0000000-0000-0000-0000-000000000935', 'reopened'::public.fault_status),
  'The repair did not resolve the underlying problem', 'private reopen reason is stored separately');
select is((select note from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000935' and to_status = 'reopened'),
  'The fault is still present after repair', 'public note does not contain the private reopen reason');

-- Reporter and ward admin may read the reason through the controlled function.
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000930","role":"authenticated"}';
select is(pg_temp.reopen_reason_for_test('f0000000-0000-0000-0000-000000000935'),
  'The repair did not resolve the underlying problem', 'reporter can read the private reason through the function');
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000931","role":"authenticated"}';
select is(pg_temp.reopen_reason_count_for_test('f0000000-0000-0000-0000-000000000935'),
  1, 'ward admin of the fault ward can read private reasons through the function');
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000932","role":"authenticated"}';
select throws_ok(
  $$ select * from public.get_fault_reopen_reasons('f0000000-0000-0000-0000-000000000935') $$,
  '42501', null, 'DENY: ward admin of another ward cannot read private reasons'
);
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000933","role":"authenticated"}';
select throws_ok(
  $$ select * from public.get_fault_reopen_reasons('f0000000-0000-0000-0000-000000000935') $$,
  '42501', null, 'DENY: the previous field team cannot read after it has been removed from the fault'
);
reset role;

-- The ward admin assigns the reopened fault to Team B. The NEXT team can then
-- read the reason; the former team remains unauthorised.
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000931","role":"authenticated"}';
select lives_ok(
  $$ select public.assign_fault(
       'f0000000-0000-0000-0000-000000000935',
       '0000000f-0000-0000-0000-000000000931',
       (now() at time zone 'Africa/Johannesburg')::date + 8,
       8,
       null,
       'Reassigned after reopening'
     ) $$,
  'ALLOW: ward admin can assign the reopened fault to its next team'
);
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000934","role":"authenticated"}';
select is(pg_temp.reopen_reason_count_for_test('f0000000-0000-0000-0000-000000000935'),
  1, 'next/current field team can read private reopen reasons through the function');
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000933","role":"authenticated"}';
select throws_ok(
  $$ select * from public.get_fault_reopen_reasons('f0000000-0000-0000-0000-000000000935') $$,
  '42501', null, 'DENY: previous field team cannot read after reassignment to the next team'
);
reset role;

-- Reopen a second time, then prove the third reopen is rejected and adds no row.
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000934","role":"authenticated"}';
select lives_ok(
  $$ select public.change_fault_status('f0000000-0000-0000-0000-000000000935', 'in_progress'::public.fault_status, 'Second repair started') $$,
  'ALLOW: next field team can start the reassigned fault'
);
select lives_ok(
  $$ select public.change_fault_status('f0000000-0000-0000-0000-000000000935', 'fixed'::public.fault_status, 'Second repair complete') $$,
  'ALLOW: next field team can fix the reassigned fault'
);
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000930","role":"authenticated"}';
select lives_ok(
  $$ select public.change_fault_status(
       'f0000000-0000-0000-0000-000000000935',
       'reopened'::public.fault_status,
       'The fault returned after the second repair',
       'The second repair also failed to resolve it'
     ) $$,
  'ALLOW: reporter can reopen for the second and final time'
);
reset role;
select is((select reopen_count from public.faults where id = 'f0000000-0000-0000-0000-000000000935'),
  2, 'second reopen brings reopen_count to the maximum of two');

set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000931","role":"authenticated"}';
select lives_ok(
  $$ select public.assign_fault(
       'f0000000-0000-0000-0000-000000000935',
       '0000000f-0000-0000-0000-000000000930',
       (now() at time zone 'Africa/Johannesburg')::date + 8,
       8
     ) $$,
  'ward admin can assign the second reopened fault again'
);
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000933","role":"authenticated"}';
select lives_ok(
  $$ select public.change_fault_status('f0000000-0000-0000-0000-000000000935', 'in_progress'::public.fault_status, 'Third repair started') $$,
  'assigned field team can start the final permitted repair'
);
select lives_ok(
  $$ select public.change_fault_status('f0000000-0000-0000-0000-000000000935', 'fixed'::public.fault_status, 'Third repair complete') $$,
  'assigned field team can fix the final permitted repair'
);
reset role;
select is((select count(*)::integer from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000935' and to_status = 'reopened'),
  2, 'exactly two reopen history rows exist before the rejected third attempt');
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000930","role":"authenticated"}';
select throws_ok(
  $$ select public.change_fault_status(
       'f0000000-0000-0000-0000-000000000935',
       'reopened'::public.fault_status,
       'Trying to reopen for the third time',
       'This third reopen must be rejected'
     ) $$,
  'P0001', 'reopen_limit_reached', 'DENY: a third reopen is rejected'
);
reset role;
select is((select status::text from public.faults where id = 'f0000000-0000-0000-0000-000000000935'),
  'fixed', 'rejected third reopen leaves the fault Fixed');
select is((select count(*)::integer from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000935' and to_status = 'reopened'),
  2, 'rejected third reopen creates no history row');

-- Paul/#18 condition: the status note is cleared after each UPDATE. A second
-- assignment in the same transaction with no note must not inherit the first.
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000931","role":"authenticated"}';
select lives_ok(
  $$ select public.assign_fault(
       'f0000000-0000-0000-0000-000000000937',
       '0000000f-0000-0000-0000-000000000930',
       (now() at time zone 'Africa/Johannesburg')::date + 4,
       4,
       null,
       'First assignment note'
     ) $$,
  'first assignment succeeds with a note'
);
select is(current_setting('app.status_note', true), '', 'assign_fault clears app.status_note immediately after UPDATE');
select lives_ok(
  $$ select public.assign_fault(
       'f0000000-0000-0000-0000-000000000937',
       '0000000f-0000-0000-0000-000000000931',
       (now() at time zone 'Africa/Johannesburg')::date + 6,
       6
     ) $$,
  'second assignment/reassignment succeeds without a note'
);
reset role;
select is((select note from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000937' and from_status = 'received' and to_status = 'assigned'),
  'First assignment note' || E'\nDue date changed from ' || ((now() at time zone 'Africa/Johannesburg')::date + 3)::text || ' to ' || ((now() at time zone 'Africa/Johannesburg')::date + 4)::text || '.',
  'first assignment history preserves the M2 note and records its due-date change');
select is((select note from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000937' and from_status = 'assigned' and to_status = 'assigned' and note like 'Due date changed from %'),
  'Due date changed from ' || ((now() at time zone 'Africa/Johannesburg')::date + 4)::text || ' to ' || ((now() at time zone 'Africa/Johannesburg')::date + 6)::text || '.',
  'different-team reassignment records its due-date change without inheriting the stale note');
select is((select count(*)::integer from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000937'),
  3, 'two status/team assignment changes create one history row each plus the initial row');

-- A same-team M2 reassignment changes the due date but not status/team. It
-- must still create one timeline row and preserve its own note.
set local role authenticated;
set local request.jwt.claims = '{"sub":"c0000000-0000-0000-0000-000000000931","role":"authenticated"}';
select lives_ok(
  $$ select public.assign_fault(
       'f0000000-0000-0000-0000-000000000937',
       '0000000f-0000-0000-0000-000000000931',
       (now() at time zone 'Africa/Johannesburg')::date + 8,
       8,
       null,
       'Keep the work area clear for inspection'
     ) $$,
  'same-team reassignment succeeds and creates a timeline event'
);
reset role;
select is((select count(*)::integer from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000937'),
  4, 'same-team reassignment creates exactly one additional row');
select is((select from_status::text || '>' || to_status::text from public.status_changes
  where fault_id = 'f0000000-0000-0000-0000-000000000937' and note like 'Keep the work area clear for inspection%'),
  'assigned>assigned', 'same-team M2 action is represented as an Assigned-to-Assigned timeline entry');
select is((select note from public.status_changes
  where fault_id = 'f0000000-0000-0000-0000-000000000937' and note like 'Keep the work area clear for inspection%'),
  'Keep the work area clear for inspection' || E'\nDue date changed from ' || ((now() at time zone 'Africa/Johannesburg')::date + 6)::text || ' to ' || ((now() at time zone 'Africa/Johannesburg')::date + 8)::text || '.',
  'same-team timeline entry contains the M2 note and the revised due date');
select is((select field_team_id from public.status_changes
  where fault_id = 'f0000000-0000-0000-0000-000000000937' and note like 'Keep the work area clear for inspection%'),
  '0000000f-0000-0000-0000-000000000931'::uuid, 'same-team timeline entry records the team');
select is((select changed_by from public.status_changes
  where fault_id = 'f0000000-0000-0000-0000-000000000937' and note like 'Keep the work area clear for inspection%'),
  'c0000000-0000-0000-0000-000000000931'::uuid, 'same-team timeline entry records the ward admin');
select is((select due_date from public.faults where id = 'f0000000-0000-0000-0000-000000000937'),
  (now() at time zone 'Africa/Johannesburg')::date + 8, 'same-team reassignment stores the revised due date');

-- BR14 auto-close: only Fixed faults with fixed_at at least seven days ago close.
-- Clear the simulated JWT so the scheduled/system action has no auth.uid().
select pg_catalog.set_config('request.jwt.claims', '{}', true);
select pg_catalog.set_config('request.jwt.claim.sub', '', true);
select is(pg_temp.auto_close_fixed_faults_for_test(), 2, 'auto-close closes both Fixed faults at or beyond seven days');
select is((select status::text from public.faults where id = 'f0000000-0000-0000-0000-000000000933'),
  'closed', 'Fixed fault older than seven days is automatically Closed');
select is((select status::text from public.faults where id = 'f0000000-0000-0000-0000-000000000938'),
  'closed', 'Fixed fault at exactly seven days is automatically Closed');
select is((select status::text from public.faults where id = 'f0000000-0000-0000-0000-000000000934'),
  'fixed', 'Fixed fault younger than seven days remains Fixed');
select isnt((select closed_at from public.faults where id = 'f0000000-0000-0000-0000-000000000933'),
  null, 'automatic closure records closed_at');
select is((select changed_by from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000933' and to_status = 'closed'),
  null::uuid, 'automatic closure is recorded as a system action without an auth user');
select is((select count(*)::integer from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000933'),
  2, 'auto-close creates exactly one history row');
select is((select count(*)::integer from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000938'),
  2, 'exact seven-day auto-close creates exactly one history row');

-- The cron worker uses GMT or the equivalent UTC; 00:00 in either is 02:00 SAST.
select is(pg_temp.cron_schedule_for_test(),
  '0 0 * * *', 'auto-close is scheduled daily at 00:00 GMT/UTC (02:00 SAST)');
select is(pg_temp.cron_command_for_test(),
  'select public.auto_close_fixed_faults();', 'auto-close cron job invokes the database closure function');
select is(pg_temp.cron_job_count_for_test(),
  1, 'only one active job is registered for automatic closure');
select ok((select setting in ('GMT', 'UTC') from pg_catalog.pg_settings where name = 'cron.timezone'),
  'pg_cron timezone is GMT/UTC so the schedule is 02:00 SAST');
select ok(pg_temp.cron_job_active_for_test(),
  'auto-close cron job is active');

select * from finish();
rollback;
