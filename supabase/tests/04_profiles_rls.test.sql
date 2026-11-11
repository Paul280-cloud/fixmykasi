-- PRD 11.4 Profile rows: an ALLOW and a DENY test for each action, including anon.
-- Not covered here: "ward admins can read profiles of reporters in their ward".
-- That policy needs the faults table and is added with Issue #11.
begin;
create extension if not exists pgtap with schema extensions;

select plan(33);

-- Test data (as postgres) ----------------------------------------------------
insert into public.wards (id, name) values
  ('0000000a-0000-0000-0000-000000000201', 'RLS Ward One'),
  ('0000000a-0000-0000-0000-000000000202', 'RLS Ward Two');
insert into public.field_teams (id, name, category) values
  ('0000000f-0000-0000-0000-000000000201', 'RLS Team One', 'sewer');

insert into auth.users (id, email, raw_user_meta_data)
select id::uuid, email, jsonb_build_object(
  'full_name', full_name, 'ward_id', '0000000a-0000-0000-0000-000000000201', 'is_18_or_older', true)
from (values
  ('a0000000-0000-0000-0000-000000000001', 'res.one@test.local', 'Resident One'),
  ('a0000000-0000-0000-0000-000000000002', 'res.two@test.local', 'Resident Two'),
  ('a0000000-0000-0000-0000-000000000003', 'admin.one@test.local', 'Admin One'),
  ('a0000000-0000-0000-0000-000000000004', 'team.one@test.local', 'Team One')
) as u (id, email, full_name);

-- Staff roles are set by the admin (postgres), never by the user.
update public.profiles set role = 'ward_admin'
  where id = 'a0000000-0000-0000-0000-000000000003';
update public.profiles set role = 'field_team', field_team_id = '0000000f-0000-0000-0000-000000000201', ward_id = null
  where id = 'a0000000-0000-0000-0000-000000000004';

-- ==== Read ====================================================================
set local role authenticated;
set local request.jwt.claims to '{"sub": "a0000000-0000-0000-0000-000000000001", "role": "authenticated"}';

select results_eq($$ select id from public.profiles where id = 'a0000000-0000-0000-0000-000000000001' $$,
  $$ values ('a0000000-0000-0000-0000-000000000001'::uuid) $$,
  'ALLOW: a resident reads their own profile');
select is_empty($$ select id from public.profiles where id = 'a0000000-0000-0000-0000-000000000002' $$,
  'DENY: a resident cannot read another resident''s profile');
select is_empty($$ select id from public.profiles where id = 'a0000000-0000-0000-0000-000000000003' $$,
  'DENY: a resident cannot read their ward admin''s profile');

set local request.jwt.claims to '{"sub": "a0000000-0000-0000-0000-000000000003", "role": "authenticated"}';
select results_eq($$ select role::text from public.profiles $$, $$ values ('ward_admin') $$,
  'ALLOW: a ward admin reads their own profile (and, until #11, only that)');

set local request.jwt.claims to '{"sub": "a0000000-0000-0000-0000-000000000004", "role": "authenticated"}';
select results_eq($$ select role::text from public.profiles $$, $$ values ('field_team') $$,
  'ALLOW: a field team member reads only their own profile');

reset role;
set local role anon;
set local request.jwt.claims to '{"role": "anon"}';
select throws_ok($$ select id from public.profiles $$, '42501', null,
  'DENY: a visitor (anon) cannot read profiles');

-- ==== Create ==================================================================
select throws_ok($$ insert into public.profiles (id, full_name, email, ward_id, is_18_or_older)
  values (gen_random_uuid(), 'Anon Person', 'anon@test.local', '0000000a-0000-0000-0000-000000000201', true) $$,
  '42501', null, 'DENY: anon cannot create a profile');

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub": "a0000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select throws_ok($$ insert into public.profiles (id, full_name, email, ward_id, is_18_or_older)
  values (gen_random_uuid(), 'Extra Person', 'extra@test.local', '0000000a-0000-0000-0000-000000000201', true) $$,
  '42501', null, 'DENY: a logged-in user cannot create a profile directly (only the sign-up trigger can)');
-- ALLOW for Create (trigger makes the profile on sign-up) is in 02_handle_new_user.test.sql.

-- ==== Update ==================================================================
set local request.jwt.claims to '{"sub": "a0000000-0000-0000-0000-000000000001", "role": "authenticated"}';

select lives_ok($$ update public.profiles
  set full_name = 'Resident Uno', phone = '+27821112222', language = 'af'
  where id = 'a0000000-0000-0000-0000-000000000001' $$,
  'ALLOW: a resident updates their own name, phone and language');
select results_eq($$ select full_name, phone, language::text from public.profiles where id = 'a0000000-0000-0000-0000-000000000001' $$,
  $$ values ('Resident Uno', '+27821112222', 'af') $$,
  'the resident''s own changes are saved');
select lives_ok($$ update public.profiles set ward_id = '0000000a-0000-0000-0000-000000000202'
  where id = 'a0000000-0000-0000-0000-000000000001' $$,
  'ALLOW: a resident changes their own home ward');
select results_eq($$ select ward_id from public.profiles where id = 'a0000000-0000-0000-0000-000000000001' $$,
  $$ values ('0000000a-0000-0000-0000-000000000202'::uuid) $$,
  'the new home ward is saved');

select throws_ok($$ update public.profiles set role = 'ward_admin' where id = 'a0000000-0000-0000-0000-000000000001' $$,
  '42501', null, 'DENY: a resident cannot change their own role');
select throws_ok($$ update public.profiles set field_team_id = '0000000f-0000-0000-0000-000000000201' where id = 'a0000000-0000-0000-0000-000000000001' $$,
  '42501', null, 'DENY: a resident cannot set their own field_team_id');
select throws_ok($$ update public.profiles set email = 'new@test.local' where id = 'a0000000-0000-0000-0000-000000000001' $$,
  '42501', null, 'DENY: a resident cannot change their email');
select throws_ok($$ update public.profiles set is_18_or_older = false where id = 'a0000000-0000-0000-0000-000000000001' $$,
  '42501', null, 'DENY: a resident cannot change is_18_or_older');
select throws_ok($$ update public.profiles set privacy_consent_at = now() - interval '1 year' where id = 'a0000000-0000-0000-0000-000000000001' $$,
  '42501', null, 'DENY: a resident cannot change privacy_consent_at');

-- Another resident's row is invisible, so the update changes nothing.
update public.profiles set full_name = 'Hacked Name' where id = 'a0000000-0000-0000-0000-000000000002';

set local request.jwt.claims to '{"sub": "a0000000-0000-0000-0000-000000000003", "role": "authenticated"}';
select lives_ok($$ update public.profiles set full_name = 'Admin Uno', language = 'nso' where id = 'a0000000-0000-0000-0000-000000000003' $$,
  'ALLOW: a ward admin updates their own name and language');
select throws_ok($$ update public.profiles set ward_id = '0000000a-0000-0000-0000-000000000202' where id = 'a0000000-0000-0000-0000-000000000003' $$,
  '42501', null, 'DENY: a ward admin cannot change their own ward_id');
select throws_ok($$ update public.profiles set role = 'resident' where id = 'a0000000-0000-0000-0000-000000000003' $$,
  '42501', null, 'DENY: a ward admin cannot change their own role');

set local request.jwt.claims to '{"sub": "a0000000-0000-0000-0000-000000000004", "role": "authenticated"}';
select lives_ok($$ update public.profiles set phone = '+27823334444' where id = 'a0000000-0000-0000-0000-000000000004' $$,
  'ALLOW: a field team member updates their own phone');
select throws_ok($$ update public.profiles set field_team_id = null where id = 'a0000000-0000-0000-0000-000000000004' $$,
  '42501', null, 'DENY: a field team member cannot change their field_team_id');

reset role;
set local role anon;
set local request.jwt.claims to '{"role": "anon"}';
select throws_ok($$ update public.profiles set full_name = 'Anon Edit' where id = 'a0000000-0000-0000-0000-000000000001' $$,
  '42501', null, 'DENY: anon cannot update profiles');

reset role;
select is((select full_name from public.profiles where id = 'a0000000-0000-0000-0000-000000000002'),
  'Resident Two', 'DENY: a resident cannot update another resident''s profile (row unchanged)');
select is((select ward_id from public.profiles where id = 'a0000000-0000-0000-0000-000000000003'),
  '0000000a-0000-0000-0000-000000000201'::uuid, 'the ward admin''s ward is unchanged');
select is((select role::text from public.profiles where id = 'a0000000-0000-0000-0000-000000000001'),
  'resident', 'the resident''s role is unchanged');
select lives_ok($$ update public.profiles set ward_id = '0000000a-0000-0000-0000-000000000202' where id = 'a0000000-0000-0000-0000-000000000003' $$,
  'ALLOW: the admin (postgres, Supabase dashboard) can still move a ward admin to another ward');

-- ==== Delete ==================================================================
set local role authenticated;
set local request.jwt.claims to '{"sub": "a0000000-0000-0000-0000-000000000001", "role": "authenticated"}';
delete from public.profiles where id = 'a0000000-0000-0000-0000-000000000002';

set local request.jwt.claims to '{"sub": "a0000000-0000-0000-0000-000000000003", "role": "authenticated"}';
delete from public.profiles where id = 'a0000000-0000-0000-0000-000000000003';

set local request.jwt.claims to '{"sub": "a0000000-0000-0000-0000-000000000004", "role": "authenticated"}';
delete from public.profiles where id = 'a0000000-0000-0000-0000-000000000004';

reset role;
set local role anon;
set local request.jwt.claims to '{"role": "anon"}';
select throws_ok($$ delete from public.profiles where id = 'a0000000-0000-0000-0000-000000000001' $$,
  '42501', null, 'DENY: anon cannot delete profiles');

reset role;
select isnt_empty($$ select 1 from public.profiles where id = 'a0000000-0000-0000-0000-000000000002' $$,
  'DENY: a resident cannot delete another resident''s profile');
select isnt_empty($$ select 1 from public.profiles where id = 'a0000000-0000-0000-0000-000000000003' $$,
  'DENY: a ward admin cannot delete their own profile (staff are removed by the admin)');
select isnt_empty($$ select 1 from public.profiles where id = 'a0000000-0000-0000-0000-000000000004' $$,
  'DENY: a field team member cannot delete their own profile');

set local role authenticated;
set local request.jwt.claims to '{"sub": "a0000000-0000-0000-0000-000000000001", "role": "authenticated"}';
select lives_ok($$ delete from public.profiles where id = 'a0000000-0000-0000-0000-000000000001' $$,
  'ALLOW: a resident deletes their own profile');
reset role;
select is_empty($$ select 1 from public.profiles where id = 'a0000000-0000-0000-0000-000000000001' $$,
  'the resident''s profile is gone');

select * from finish();
rollback;
