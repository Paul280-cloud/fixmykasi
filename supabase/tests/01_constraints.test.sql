-- PRD 10.1 rules checked by behaviour: lengths, formats, role-based required
-- fields, one ward admin per ward and the foreign key delete rules.
-- Runs as postgres (no RLS) so only constraints are being tested.
begin;
create extension if not exists pgtap with schema extensions;

select plan(31);

insert into public.wards (id, name) values
  ('0000000a-0000-0000-0000-000000000001', 'Test Ward One'),
  ('0000000a-0000-0000-0000-000000000002', 'Test Ward Two');
insert into public.field_teams (id, name, category) values
  ('0000000f-0000-0000-0000-000000000001', 'Test Team One', 'roads');

-- Profiles are normally created by the sign-up trigger. Remove the ones it
-- makes so each constraint can be tested on its own with direct inserts.
insert into auth.users (id, email, raw_user_meta_data)
select id::uuid, email,
  '{"full_name": "Test User", "ward_id": "0000000a-0000-0000-0000-000000000002", "is_18_or_older": true}'::jsonb
from (values
  ('c0000000-0000-0000-0000-000000000001', 'c1@test.local'),
  ('c0000000-0000-0000-0000-000000000002', 'c2@test.local'),
  ('c0000000-0000-0000-0000-000000000003', 'c3@test.local'),
  ('c0000000-0000-0000-0000-000000000004', 'c4@test.local')
) as u (id, email);
delete from public.profiles where id::text like 'c0000000-%';

-- wards ----------------------------------------------------------------------
select throws_ok($$ insert into public.wards (name) values ('') $$, '23514', null, 'ward name cannot be empty');
select throws_ok($$ insert into public.wards (name) values (repeat('x', 61)) $$, '23514', null, 'ward name is at most 60 characters');
select lives_ok($$ insert into public.wards (name) values (repeat('x', 60)) $$, 'ward name of 60 characters is allowed');
select throws_ok($$ insert into public.wards (name, municipality) values ('Ward Long Muni', repeat('x', 61)) $$, '23514', null, 'municipality is at most 60 characters');
select throws_ok($$ insert into public.wards (name) values ('Test Ward One') $$, '23505', null, 'ward names are unique');

-- fault_types ----------------------------------------------------------------
select throws_ok($$ insert into public.fault_types (category, name) values ('roads', repeat('x', 61)) $$, '23514', null, 'fault type name is at most 60 characters');
select throws_ok($$ insert into public.fault_types (category, name) values ('roads', '') $$, '23514', null, 'fault type name cannot be empty');
select throws_ok($$ insert into public.fault_types (category, name) values ('roads', 'Pothole') $$, '23505', null, 'fault type names are unique');
select throws_ok($$ insert into public.fault_types (category, name) values ('parks', 'Test Type') $$, '22P02', null, 'fault type category must be one of the 6 categories');

-- field_teams ----------------------------------------------------------------
select throws_ok($$ insert into public.field_teams (name, category) values (repeat('x', 81), 'roads') $$, '23514', null, 'field team name is at most 80 characters');
select lives_ok($$ insert into public.field_teams (name, category) values (repeat('y', 80), 'roads') $$, 'field team name of 80 characters is allowed');
select throws_ok($$ insert into public.field_teams (name, category) values ('Test Team One', 'roads') $$, '23505', null, 'field team names are unique');
select throws_ok($$ insert into public.field_teams (name, category, contact_phone) values ('Bad Phone Team', 'roads', '0821234567') $$, '23514', null, 'contact_phone must be +27 and 9 digits');
select lives_ok($$ insert into public.field_teams (name, category, contact_phone) values ('Good Phone Team', 'roads', '+27821234567') $$, 'contact_phone in +27 format is allowed');

-- profiles: formats ------------------------------------------------------------
select throws_ok($$ insert into public.profiles (id, full_name, email, ward_id, is_18_or_older)
  values ('c0000000-0000-0000-0000-000000000001', 'A', 'c1@test.local', '0000000a-0000-0000-0000-000000000001', true) $$,
  '23514', null, 'full_name needs at least 2 characters');
select throws_ok($$ insert into public.profiles (id, full_name, email, ward_id, is_18_or_older)
  values ('c0000000-0000-0000-0000-000000000001', repeat('x', 61), 'c1@test.local', '0000000a-0000-0000-0000-000000000001', true) $$,
  '23514', null, 'full_name is at most 60 characters');
select throws_ok($$ insert into public.profiles (id, full_name, email, ward_id, is_18_or_older)
  values ('c0000000-0000-0000-0000-000000000001', 'Test One', 'C1@Test.Local', '0000000a-0000-0000-0000-000000000001', true) $$,
  '23514', null, 'email must be lower case');
select throws_ok($$ insert into public.profiles (id, full_name, email, ward_id, is_18_or_older, phone)
  values ('c0000000-0000-0000-0000-000000000001', 'Test One', 'c1@test.local', '0000000a-0000-0000-0000-000000000001', true, '+2782123456') $$,
  '23514', null, 'phone must be +27 followed by 9 digits');

-- profiles: role rules -------------------------------------------------------
select throws_ok($$ insert into public.profiles (id, full_name, email, is_18_or_older)
  values ('c0000000-0000-0000-0000-000000000001', 'Test One', 'c1@test.local', true) $$,
  '23514', null, 'a resident needs a ward_id');
select throws_ok($$ insert into public.profiles (id, full_name, email, ward_id, is_18_or_older)
  values ('c0000000-0000-0000-0000-000000000001', 'Test One', 'c1@test.local', '0000000a-0000-0000-0000-000000000001', false) $$,
  '23514', null, 'a resident must be 18 or older');
select throws_ok($$ insert into public.profiles (id, full_name, email, role, is_18_or_older)
  values ('c0000000-0000-0000-0000-000000000001', 'Test One', 'c1@test.local', 'ward_admin', true) $$,
  '23514', null, 'a ward admin needs a ward_id');
select throws_ok($$ insert into public.profiles (id, full_name, email, role, is_18_or_older)
  values ('c0000000-0000-0000-0000-000000000001', 'Test One', 'c1@test.local', 'field_team', true) $$,
  '23514', null, 'a field team member needs a field_team_id');
select lives_ok($$ insert into public.profiles (id, full_name, email, role, field_team_id, is_18_or_older)
  values ('c0000000-0000-0000-0000-000000000001', 'Test One', 'c1@test.local', 'field_team', '0000000f-0000-0000-0000-000000000001', true) $$,
  'a field team member with a field_team_id and no ward is allowed');
select throws_ok($$ insert into public.profiles (id, full_name, email, ward_id, is_18_or_older)
  values ('c0000000-0000-0000-0000-000000000002', 'Test Two', 'c1@test.local', '0000000a-0000-0000-0000-000000000001', true) $$,
  '23505', null, 'profile emails are unique');

-- profiles: one ward admin per ward ------------------------------------------
select lives_ok($$ insert into public.profiles (id, full_name, email, role, ward_id, is_18_or_older)
  values ('c0000000-0000-0000-0000-000000000002', 'Admin Two', 'c2@test.local', 'ward_admin', '0000000a-0000-0000-0000-000000000001', true) $$,
  'the first ward admin of a ward is allowed');
select throws_ok($$ insert into public.profiles (id, full_name, email, role, ward_id, is_18_or_older)
  values ('c0000000-0000-0000-0000-000000000003', 'Admin Three', 'c3@test.local', 'ward_admin', '0000000a-0000-0000-0000-000000000001', true) $$,
  '23505', null, 'a second ward admin for the same ward is rejected');
select lives_ok($$ insert into public.profiles (id, full_name, email, role, ward_id, is_18_or_older)
  values ('c0000000-0000-0000-0000-000000000003', 'Admin Three', 'c3@test.local', 'ward_admin', '0000000a-0000-0000-0000-000000000002', true) $$,
  'a ward admin for a different ward is allowed');
select lives_ok($$ insert into public.profiles (id, full_name, email, ward_id, is_18_or_older)
  values ('c0000000-0000-0000-0000-000000000004', 'Resident Four', 'c4@test.local', '0000000a-0000-0000-0000-000000000001', true) $$,
  'many residents can share a ward with its ward admin');

-- Foreign key delete rules ---------------------------------------------------
select throws_ok($$ delete from public.wards where id = '0000000a-0000-0000-0000-000000000001' $$,
  '23503', null, 'a ward that profiles link to cannot be deleted');
select throws_ok($$ delete from public.field_teams where id = '0000000f-0000-0000-0000-000000000001' $$,
  '23503', null, 'a field team that profiles link to cannot be deleted');
delete from auth.users where id = 'c0000000-0000-0000-0000-000000000004';
select is_empty($$ select 1 from public.profiles where id = 'c0000000-0000-0000-0000-000000000004' $$,
  'deleting the login deletes the profile');

select * from finish();
rollback;
