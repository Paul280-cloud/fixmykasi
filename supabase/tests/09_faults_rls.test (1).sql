-- Issue #11: PRD 11.4 rows for Fault, FaultPhoto, Upvote and StatusChange.
-- For every action I wrote an ALLOW test and a DENY test, like 04_profiles_rls.
begin;
create extension if not exists pgtap with schema extensions;

select plan(34);

-- Test data (as postgres) -------------------------------------------------------------
insert into public.wards (id, name) values
  ('0000000a-0000-0000-0000-000000000901', 'RLS Fault Ward One'),
  ('0000000a-0000-0000-0000-000000000902', 'RLS Fault Ward Two');
insert into public.field_teams (id, name, category) values
  ('0000000f-0000-0000-0000-000000000901', 'RLS Fault Roads Team', 'roads');

insert into auth.users (id, email, raw_user_meta_data)
select id::uuid, email, jsonb_build_object(
  'full_name', full_name, 'ward_id', ward, 'is_18_or_older', true)
from (values
  ('c0000000-0000-0000-0000-000000000001', 'rls.res1@test.local', 'Fault Resident One', '0000000a-0000-0000-0000-000000000901'),
  ('c0000000-0000-0000-0000-000000000002', 'rls.res2@test.local', 'Fault Resident Two', '0000000a-0000-0000-0000-000000000901'),
  ('c0000000-0000-0000-0000-000000000003', 'rls.admin1@test.local', 'Fault Admin One', '0000000a-0000-0000-0000-000000000901'),
  ('c0000000-0000-0000-0000-000000000004', 'rls.admin2@test.local', 'Fault Admin Two', '0000000a-0000-0000-0000-000000000902'),
  ('c0000000-0000-0000-0000-000000000005', 'rls.team@test.local', 'Fault Team Member', '0000000a-0000-0000-0000-000000000901')
) as u (id, email, full_name, ward);

update public.profiles set role = 'ward_admin' where id in (
  'c0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004');
update public.profiles set role = 'field_team', ward_id = null,
  field_team_id = '0000000f-0000-0000-0000-000000000901'
  where id = 'c0000000-0000-0000-0000-000000000005';

create temp table t_pothole as select id from public.fault_types where name = 'Pothole';
grant select on t_pothole to anon, authenticated;

-- ==== Fault: create ===================================================================
set local role authenticated;
set local request.jwt.claims to '{"sub": "c0000000-0000-0000-0000-000000000001", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.faults (id, fault_type_id, ward_id, description, street_address)
     values ('f0000000-0000-0000-0000-000000000901', (select id from t_pothole),
             '0000000a-0000-0000-0000-000000000901', 'Deep pothole by the taxi rank', '1 Rank Road') $$,
  'ALLOW: a resident reports a fault');
select throws_ok(
  $$ insert into public.faults (fault_type_id, ward_id, description, street_address, reporter_id)
     values ((select id from t_pothole), '0000000a-0000-0000-0000-000000000901', 'Pretending to be someone else',
             '1 Rank Road', 'c0000000-0000-0000-0000-000000000002') $$,
  '42501', null, 'DENY: a resident cannot report a fault in someone else''s name');
select throws_ok(
  $$ insert into public.faults (fault_type_id, ward_id, description, street_address, status)
     values ((select id from t_pothole), '0000000a-0000-0000-0000-000000000901', 'Trying to skip straight to fixed',
             '1 Rank Road', 'fixed') $$,
  '42501', null, 'DENY: a resident cannot choose the status of a new fault');

set local request.jwt.claims to '{"sub": "c0000000-0000-0000-0000-000000000003", "role": "authenticated"}';
select throws_ok(
  $$ insert into public.faults (fault_type_id, ward_id, description, street_address)
     values ((select id from t_pothole), '0000000a-0000-0000-0000-000000000901', 'Admins do not report faults', '1 Rank Road') $$,
  '42501', null, 'DENY: a ward admin cannot report a fault');

set local request.jwt.claims to '{"sub": "c0000000-0000-0000-0000-000000000005", "role": "authenticated"}';
select throws_ok(
  $$ insert into public.faults (fault_type_id, ward_id, description, street_address)
     values ((select id from t_pothole), '0000000a-0000-0000-0000-000000000901', 'Teams do not report faults', '1 Rank Road') $$,
  '42501', null, 'DENY: a field team member cannot report a fault');

reset role;
set local role anon;
set local request.jwt.claims to '{"role": "anon"}';
select throws_ok(
  $$ insert into public.faults (fault_type_id, ward_id, description, street_address)
     values ((select id from t_pothole), '0000000a-0000-0000-0000-000000000901', 'Visitors cannot report', '1 Rank Road') $$,
  '42501', null, 'DENY: a visitor (not logged in) cannot report a fault');

-- ==== Fault: read ===================================================================
select results_eq(
  $$ select reference_number is not null from public.faults_public where id = 'f0000000-0000-0000-0000-000000000901' $$,
  $$ values (true) $$,
  'ALLOW: a visitor reads a fault through faults_public');
select throws_ok(
  $$ select reporter_id from public.faults $$,
  '42501', null, 'DENY: a visitor cannot read reporter_id');

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub": "c0000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select throws_ok(
  $$ select municipal_reference from public.faults $$,
  '42501', null, 'DENY: a logged-in resident cannot read municipal_reference');

-- ==== Fault: update and delete =========================================================
set local request.jwt.claims to '{"sub": "c0000000-0000-0000-0000-000000000001", "role": "authenticated"}';
select throws_ok(
  $$ update public.faults set description = 'Changing my story now' where id = 'f0000000-0000-0000-0000-000000000901' $$,
  '42501', null, 'DENY: even the reporter cannot edit a fault directly');
select throws_ok(
  $$ delete from public.faults where id = 'f0000000-0000-0000-0000-000000000901' $$,
  '42501', null, 'DENY: nobody deletes a fault from the app');

-- ==== FaultPhoto ======================================================================
select lives_ok(
  $$ insert into public.fault_photos (fault_id, kind, storage_path)
     values ('f0000000-0000-0000-0000-000000000901', 'before', 'before/11111111-1111-1111-1111-111111111111.jpg') $$,
  'ALLOW: the reporter adds a before photo to their new fault');
select throws_ok(
  $$ insert into public.fault_photos (fault_id, kind, storage_path)
     values ('f0000000-0000-0000-0000-000000000901', 'before', 'after/66666666-6666-6666-6666-666666666666.jpg') $$,
  '23514', null, 'DENY: a before photo must live in the before/ folder');
select lives_ok(
  $$ insert into public.fault_photos (fault_id, kind, storage_path) values
     ('f0000000-0000-0000-0000-000000000901', 'before', 'before/22222222-2222-2222-2222-222222222222.jpg'),
     ('f0000000-0000-0000-0000-000000000901', 'before', 'before/33333333-3333-3333-3333-333333333333.jpg') $$,
  'ALLOW: up to 3 before photos');
select throws_ok(
  $$ insert into public.fault_photos (fault_id, kind, storage_path)
     values ('f0000000-0000-0000-0000-000000000901', 'before', 'before/44444444-4444-4444-4444-444444444444.jpg') $$,
  'P0001', 'too_many_photos', 'DENY: a 4th before photo');
select throws_ok(
  $$ insert into public.fault_photos (fault_id, kind, storage_path)
     values ('f0000000-0000-0000-0000-000000000901', 'after', 'after/55555555-5555-5555-5555-555555555555.jpg') $$,
  '42501', null, 'DENY: a resident cannot add an after photo');
select throws_ok(
  $$ delete from public.fault_photos where fault_id = 'f0000000-0000-0000-0000-000000000901' $$,
  '42501', null, 'DENY: nobody deletes a photo from the app');

-- Resident Two reports a fault in Ward Two (so Ward One's admin still cannot
-- read Resident Two, see the last tests).
set local request.jwt.claims to '{"sub": "c0000000-0000-0000-0000-000000000002", "role": "authenticated"}';
insert into public.faults (id, fault_type_id, ward_id, description, street_address)
values ('f0000000-0000-0000-0000-000000000902', (select id from t_pothole),
        '0000000a-0000-0000-0000-000000000902', 'Another pothole near the shops', '5 Shop Street');

-- One insert with 4 photos must not get past the limit either.
select throws_ok(
  $$ insert into public.fault_photos (fault_id, kind, storage_path)
     select 'f0000000-0000-0000-0000-000000000902', 'before', 'before/' || gen_random_uuid() || '.jpg'
     from generate_series(1, 4) $$,
  'P0001', 'too_many_photos', 'DENY: 4 before photos in one insert');

-- Resident One tries to add a photo to Resident Two's fault (it has no photos yet).
set local request.jwt.claims to '{"sub": "c0000000-0000-0000-0000-000000000001", "role": "authenticated"}';
select throws_ok(
  $$ insert into public.fault_photos (fault_id, kind, storage_path)
     values ('f0000000-0000-0000-0000-000000000902', 'before', 'before/77777777-7777-7777-7777-777777777777.jpg') $$,
  '42501', null, 'DENY: another resident cannot add a photo to someone else''s fault');

reset role;
-- The team can add after photos once the fault is theirs (#25 builds the screen).
update public.faults set field_team_id = '0000000f-0000-0000-0000-000000000901', status = 'in_progress'
  where id = 'f0000000-0000-0000-0000-000000000901';
set local role authenticated;
set local request.jwt.claims to '{"sub": "c0000000-0000-0000-0000-000000000005", "role": "authenticated"}';
select lives_ok(
  $$ insert into public.fault_photos (fault_id, kind, storage_path)
     values ('f0000000-0000-0000-0000-000000000901', 'after', 'after/88888888-8888-8888-8888-888888888888.jpg') $$,
  'ALLOW: the fault''s field team adds an after photo');

reset role;
set local role anon;
set local request.jwt.claims to '{"role": "anon"}';
select is((select count(*)::int from public.fault_photos where fault_id = 'f0000000-0000-0000-0000-000000000901'),
  4, 'ALLOW: a visitor sees the fault''s photos');

-- ==== Upvote ===========================================================================
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub": "c0000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select lives_ok(
  $$ insert into public.upvotes (fault_id) values ('f0000000-0000-0000-0000-000000000901') $$,
  'ALLOW: a resident upvotes someone else''s fault');
select throws_ok(
  $$ insert into public.upvotes (fault_id) values ('f0000000-0000-0000-0000-000000000901') $$,
  '23505', null, 'DENY: the same resident cannot upvote the same fault twice');
select results_eq($$ select count(*)::int from public.upvotes $$, $$ values (1) $$,
  'ALLOW: a resident reads their own upvotes');

set local request.jwt.claims to '{"sub": "c0000000-0000-0000-0000-000000000001", "role": "authenticated"}';
select throws_ok(
  $$ insert into public.upvotes (fault_id) values ('f0000000-0000-0000-0000-000000000901') $$,
  '42501', null, 'DENY: BR5 a reporter cannot upvote their own fault');
select is_empty($$ select * from public.upvotes $$,
  'DENY: a resident cannot see other residents'' upvotes');
delete from public.upvotes where fault_id = 'f0000000-0000-0000-0000-000000000901';

reset role;
select is((select count(*)::int from public.upvotes), 1,
  'DENY: a resident cannot delete someone else''s upvote');

update public.faults set status = 'closed' where id = 'f0000000-0000-0000-0000-000000000901';
insert into auth.users (id, email, raw_user_meta_data) values
  ('c0000000-0000-0000-0000-000000000006', 'rls.res3@test.local',
   '{"full_name": "Fault Resident Three", "ward_id": "0000000a-0000-0000-0000-000000000901", "is_18_or_older": true}');
set local role authenticated;
set local request.jwt.claims to '{"sub": "c0000000-0000-0000-0000-000000000006", "role": "authenticated"}';
select throws_ok(
  $$ insert into public.upvotes (fault_id) values ('f0000000-0000-0000-0000-000000000901') $$,
  '42501', null, 'DENY: BR5 nobody can upvote a Closed fault');

set local request.jwt.claims to '{"sub": "c0000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select lives_ok(
  $$ delete from public.upvotes where fault_id = 'f0000000-0000-0000-0000-000000000901' $$,
  'ALLOW: a resident removes their own upvote');

-- ==== StatusChange =====================================================================
select ok((select count(*) from public.status_changes where fault_id = 'f0000000-0000-0000-0000-000000000901') >= 1,
  'ALLOW: anyone reads the status history');
select throws_ok(
  $$ insert into public.status_changes (fault_id, to_status) values ('f0000000-0000-0000-0000-000000000901', 'fixed') $$,
  '42501', null, 'DENY: only the trigger writes status history');

-- ==== Profile: ward admins read reporters in their ward =====================================
set local request.jwt.claims to '{"sub": "c0000000-0000-0000-0000-000000000003", "role": "authenticated"}';
select results_eq(
  $$ select full_name from public.profiles where id = 'c0000000-0000-0000-0000-000000000001' $$,
  $$ values ('Fault Resident One'::text) $$,
  'ALLOW: a ward admin reads the profile of someone who reported a fault in their ward');
select is_empty(
  $$ select id from public.profiles where id = 'c0000000-0000-0000-0000-000000000002' $$,
  'DENY: a ward admin cannot read a resident who has not reported a fault in their ward');

set local request.jwt.claims to '{"sub": "c0000000-0000-0000-0000-000000000004", "role": "authenticated"}';
select is_empty(
  $$ select id from public.profiles where id = 'c0000000-0000-0000-0000-000000000001' $$,
  'DENY: a ward admin cannot read reporters from another ward');

select * from finish();
rollback;
