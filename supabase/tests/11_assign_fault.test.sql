-- Issue #18: assign_fault (BR8, 10.3, US7). I wrote these before the function,
-- so they all failed first. Every rule has an ALLOW and a DENY test.
-- The error codes (like 'not_your_ward') are what the M2 screen turns into the PRD messages.
begin;
create extension if not exists pgtap with schema extensions;

select plan(35);

-- Test data (as postgres) -------------------------------------------------------------
insert into public.wards (id, name) values
  ('0000000a-0000-0000-0000-000000001101', 'Assign Ward One'),
  ('0000000a-0000-0000-0000-000000001102', 'Assign Ward Two');
insert into public.field_teams (id, name, kind, category) values
  ('0000000f-0000-0000-0000-000000001101', 'Assign Roads Team', 'municipal', 'roads'),
  ('0000000f-0000-0000-0000-000000001102', 'Assign Roads Contractor (Pty) Ltd', 'contractor', 'roads'),
  ('0000000f-0000-0000-0000-000000001103', 'Assign Water Team', 'municipal', 'clean_water');

insert into auth.users (id, email, raw_user_meta_data)
select id::uuid, email, jsonb_build_object(
  'full_name', full_name, 'ward_id', ward, 'is_18_or_older', true)
from (values
  ('d0000000-0000-0000-0000-000000000001', 'assign.res@test.local', 'Assign Resident', '0000000a-0000-0000-0000-000000001101'),
  ('d0000000-0000-0000-0000-000000000002', 'assign.admin1@test.local', 'Assign Admin One', '0000000a-0000-0000-0000-000000001101'),
  ('d0000000-0000-0000-0000-000000000003', 'assign.admin2@test.local', 'Assign Admin Two', '0000000a-0000-0000-0000-000000001102'),
  ('d0000000-0000-0000-0000-000000000004', 'assign.team@test.local', 'Assign Team Member', '0000000a-0000-0000-0000-000000001101')
) as u (id, email, full_name, ward);

update public.profiles set role = 'ward_admin' where id in (
  'd0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003');
update public.profiles set role = 'field_team', ward_id = null,
  field_team_id = '0000000f-0000-0000-0000-000000001101'
  where id = 'd0000000-0000-0000-0000-000000000004';

-- "Today" for BR8 is today in SAST, not the server's UTC date.
create temp table t_day as
select (now() at time zone 'Africa/Johannesburg')::date as today;
grant select on t_day to anon, authenticated;

-- The resident reports two potholes in Ward One (a roads fault).
set local role authenticated;
set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000001", "role": "authenticated"}';
insert into public.faults (id, fault_type_id, ward_id, description, street_address) values
  ('f0000000-0000-0000-0000-000000001101', (select id from public.fault_types where name = 'Pothole'),
   '0000000a-0000-0000-0000-000000001101', 'Big pothole outside the clinic', '4 Clinic Road'),
  ('f0000000-0000-0000-0000-000000001102', (select id from public.fault_types where name = 'Pothole'),
   '0000000a-0000-0000-0000-000000001101', 'Another pothole near the school', '9 School Street');
reset role;

select has_function('public', 'assign_fault',
  array['uuid', 'uuid', 'date', 'integer', 'text', 'text'], 'assign_fault exists');

-- ==== Who may assign (BR8, T-US7-4) =====================================================
set local role authenticated;

-- A ward admin from ANOTHER ward
set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000003", "role": "authenticated"}';
select throws_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001101',
       (select today + 2 from t_day), 2) $$,
  'P0001', 'not_your_ward', 'DENY: a ward admin of another ward cannot assign the fault (T-US7-4)');

-- The resident who reported it
set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000001", "role": "authenticated"}';
select throws_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001101',
       (select today + 2 from t_day), 2) $$,
  'P0001', 'not_your_ward', 'DENY: a resident cannot assign a fault');

-- A field team member
set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000004", "role": "authenticated"}';
select throws_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001101',
       (select today + 2 from t_day), 2) $$,
  'P0001', 'not_your_ward', 'DENY: a field team member cannot assign a fault');

-- A visitor who is not logged in cannot even call it
reset role;
set local role anon;
set local request.jwt.claims to '{"role": "anon"}';
select throws_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001101',
       current_date + 2, 2) $$,
  '42501', null, 'DENY: a visitor cannot call assign_fault');
reset role;

-- ==== The form rules (BR8, M2) ===========================================================
set local role authenticated;
set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000002", "role": "authenticated"}';

select throws_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001103',
       (select today + 2 from t_day), 2) $$,
  'P0001', 'wrong_team_category', 'DENY: a Clean water team cannot get a Roads fault (BR8)');
select throws_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', gen_random_uuid(),
       (select today + 2 from t_day), 2) $$,
  'P0001', 'wrong_team_category', 'DENY: a field team that does not exist');
select throws_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001101',
       (select today - 1 from t_day), 2) $$,
  'P0001', 'bad_due_date', 'DENY: a due date in the past (BR8)');
select throws_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001101',
       (select today + 120 from t_day), 2) $$,
  'P0001', 'bad_due_date', 'DENY: a due date 120 days away (T-US7-3)');
select throws_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001101',
       null, 2) $$,
  'P0001', 'bad_due_date', 'DENY: no due date');
select throws_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001101',
       (select today + 2 from t_day), 0) $$,
  'P0001', 'bad_estimated_days', 'DENY: 0 days to fix (must be 1 to 90)');
select throws_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001101',
       (select today + 2 from t_day), 91) $$,
  'P0001', 'bad_estimated_days', 'DENY: 91 days to fix (must be 1 to 90)');
select throws_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001101',
       (select today + 2 from t_day), 2, repeat('J', 31)) $$,
  'P0001', 'municipal_reference_too_long', 'DENY: a municipal reference over 30 characters');
select throws_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001101',
       (select today + 2 from t_day), 2, null, repeat('n', 201)) $$,
  'P0001', 'note_too_long', 'DENY: a note to the field team over 200 characters');

-- None of the refused calls changed anything.
reset role;
select is((select status::text from public.faults where id = 'f0000000-0000-0000-0000-000000001101'),
  'received', 'the refused calls left the fault as received');

-- ==== Assign (T-US7-2) =====================================================================
set local role authenticated;
set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select lives_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001101',
       (select today + 2 from t_day), 2, 'JW-778812', 'Please bring cones, it is by the clinic gate') $$,
  'ALLOW: the ward admin of the fault''s ward assigns it (T-US7-2)');
reset role;

select is((select status::text from public.faults where id = 'f0000000-0000-0000-0000-000000001101'),
  'assigned', 'saving M2 sets the status to assigned (BR8)');
select results_eq(
  $$ select field_team_id, due_date, estimated_days from public.faults where id = 'f0000000-0000-0000-0000-000000001101' $$,
  $$ select '0000000f-0000-0000-0000-000000001101'::uuid, (select today + 2 from t_day), 2 $$,
  'the field team, due date and days to fix are saved');
select is((select municipal_reference from public.faults where id = 'f0000000-0000-0000-0000-000000001101'),
  'JW-778812', 'the municipal reference is saved (only the ward admin sees it, BR16)');
select isnt((select assigned_at from public.faults where id = 'f0000000-0000-0000-0000-000000001101'),
  null, 'assigned_at is filled in');

-- BR9: the timeline gets a row, with the note.
select results_eq(
  $$ select from_status::text, to_status::text, note from public.status_changes
     where fault_id = 'f0000000-0000-0000-0000-000000001101' and to_status = 'assigned' $$,
  $$ values ('received'::text, 'assigned'::text, 'Please bring cones, it is by the clinic gate'::text) $$,
  'BR9: assigning writes a received to assigned row with the note');
select is(
  (select changed_by from public.status_changes
   where fault_id = 'f0000000-0000-0000-0000-000000001101' and to_status = 'assigned'),
  'd0000000-0000-0000-0000-000000000002'::uuid, 'the history row says the ward admin made the change');

-- ==== Reassign (10.3: assigned or scheduled back to assigned) ==============================
-- I pretend the team marked it delayed, to check a new assignment starts clean.
update public.faults set is_delayed = true, delay_reason = 'Waiting for asphalt delivery'
  where id = 'f0000000-0000-0000-0000-000000001101';

set local role authenticated;
set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select lives_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001102',
       (select today + 90 from t_day), 5) $$,
  'ALLOW: the ward admin reassigns to another roads team, with a due date exactly 90 days away');
reset role;

select results_eq(
  $$ select status::text, field_team_id, estimated_days, is_delayed, delay_reason
     from public.faults where id = 'f0000000-0000-0000-0000-000000001101' $$,
  $$ select 'assigned'::text, '0000000f-0000-0000-0000-000000001102'::uuid, 5, false, null::text $$,
  'reassigning sets the new team and days, and clears the old delay');
select is((select municipal_reference from public.faults where id = 'f0000000-0000-0000-0000-000000001101'),
  'JW-778812', 'reassigning without a municipal reference keeps the old one');
select is(
  (select count(*)::int from public.status_changes
   where fault_id = 'f0000000-0000-0000-0000-000000001101' and to_status = 'assigned'),
  2, 'reassigning writes its own history row (PO decision on #16)');

-- Scheduled can also go back to assigned.
update public.faults set status = 'scheduled' where id = 'f0000000-0000-0000-0000-000000001101';
set local role authenticated;
set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select lives_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001101',
       (select today from t_day), 1) $$,
  'ALLOW: a scheduled fault can be reassigned, and today is a valid due date');
reset role;
select is((select status::text from public.faults where id = 'f0000000-0000-0000-0000-000000001101'),
  'assigned', 'scheduled goes back to assigned');

-- ==== Statuses that cannot be assigned (10.3) ==============================================
update public.faults set status = 'in_progress' where id = 'f0000000-0000-0000-0000-000000001101';
set local role authenticated;
set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select throws_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001101',
       (select today + 2 from t_day), 2) $$,
  'P0001', 'cannot_assign_now', 'DENY: an in progress fault cannot be reassigned');
reset role;

update public.faults set status = 'fixed' where id = 'f0000000-0000-0000-0000-000000001101';
set local role authenticated;
set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select throws_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001101',
       (select today + 2 from t_day), 2) $$,
  'P0001', 'cannot_assign_now', 'DENY: a fixed fault cannot be assigned');
reset role;

update public.faults set status = 'closed' where id = 'f0000000-0000-0000-0000-000000001101';
set local role authenticated;
set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select throws_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001101', '0000000f-0000-0000-0000-000000001101',
       (select today + 2 from t_day), 2) $$,
  'P0001', 'cannot_assign_now', 'DENY: a closed fault can never change (10.3)');
select throws_ok(
  $$ select public.assign_fault(gen_random_uuid(), '0000000f-0000-0000-0000-000000001101',
       (select today + 2 from t_day), 2) $$,
  'P0001', 'fault_not_found', 'DENY: a fault that does not exist');
reset role;

-- Viewed and Reopened faults can be assigned too.
update public.faults set status = 'viewed' where id = 'f0000000-0000-0000-0000-000000001102';
set local role authenticated;
set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select lives_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001102', '0000000f-0000-0000-0000-000000001101',
       (select today + 7 from t_day), 3) $$,
  'ALLOW: a viewed fault can be assigned');
reset role;

update public.faults set status = 'reopened' where id = 'f0000000-0000-0000-0000-000000001102';
set local role authenticated;
set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select lives_ok(
  $$ select public.assign_fault('f0000000-0000-0000-0000-000000001102', '0000000f-0000-0000-0000-000000001102',
       (select today + 7 from t_day), 3) $$,
  'ALLOW: a reopened fault can be assigned again (BR14)');

-- ==== Nobody gets around it ==================================================================
-- The app still has no UPDATE rights on faults, so assign_fault is the only way in.
select throws_ok(
  $$ update public.faults set status = 'assigned', field_team_id = '0000000f-0000-0000-0000-000000001101'
     where id = 'f0000000-0000-0000-0000-000000001102' $$,
  '42501', null, 'DENY: even the ward admin cannot update a fault directly, only through assign_fault');
reset role;

select * from finish();
rollback;
