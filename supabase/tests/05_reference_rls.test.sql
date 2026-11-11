-- PRD 11.4 Ward, FaultType, FieldTeam: everyone reads, nobody writes from the app,
-- and FieldTeam.contact_phone is only for ward admins (BR16).
begin;
create extension if not exists pgtap with schema extensions;

select plan(42);

-- Test data (as postgres) ----------------------------------------------------
insert into public.wards (id, name) values ('0000000a-0000-0000-0000-000000000301', 'Ref Ward One');
insert into public.field_teams (id, name, category, contact_phone) values
  ('0000000f-0000-0000-0000-000000000301', 'Ref Team One', 'waste', '+27115550001');

insert into auth.users (id, email, raw_user_meta_data)
select id::uuid, email, jsonb_build_object(
  'full_name', full_name, 'ward_id', '0000000a-0000-0000-0000-000000000301', 'is_18_or_older', true)
from (values
  ('d0000000-0000-0000-0000-000000000001', 'ref.res@test.local', 'Ref Resident'),
  ('d0000000-0000-0000-0000-000000000002', 'ref.admin@test.local', 'Ref Admin'),
  ('d0000000-0000-0000-0000-000000000003', 'ref.team@test.local', 'Ref Team')
) as u (id, email, full_name);
update public.profiles set role = 'ward_admin' where id = 'd0000000-0000-0000-0000-000000000002';
update public.profiles set role = 'field_team', field_team_id = '0000000f-0000-0000-0000-000000000301', ward_id = null
  where id = 'd0000000-0000-0000-0000-000000000003';

-- ==== Read: anyone, including anon ===========================================
set local role anon;
set local request.jwt.claims to '{"role": "anon"}';
select isnt_empty($$ select id, municipality, name, created_at from public.wards where name = 'Ref Ward One' $$,
  'ALLOW: anon reads wards');
select isnt_empty($$ select id, category, name, auto_urgent, created_at from public.fault_types $$,
  'ALLOW: anon reads fault_types');
select isnt_empty($$ select id, name, kind, category, created_at from public.field_teams where name = 'Ref Team One' $$,
  'ALLOW: anon reads field_teams (public columns)');
select throws_ok($$ select contact_phone from public.field_teams $$, '42501', null,
  'DENY: anon cannot read field_teams.contact_phone');
select throws_ok($$ select * from public.field_teams $$, '42501', null,
  'DENY: anon cannot read contact_phone through select *');
select throws_ok($$ select * from public.field_team_contacts() $$, '42501', null,
  'DENY: anon cannot call field_team_contacts()');

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000001", "role": "authenticated"}';
select isnt_empty($$ select id from public.wards where name = 'Ref Ward One' $$, 'ALLOW: a resident reads wards');
select isnt_empty($$ select id from public.fault_types $$, 'ALLOW: a resident reads fault_types');
select isnt_empty($$ select id, name, kind, category from public.field_teams where name = 'Ref Team One' $$,
  'ALLOW: a resident reads field_teams (public columns)');
select throws_ok($$ select contact_phone from public.field_teams $$, '42501', null,
  'DENY: a resident cannot read field_teams.contact_phone');
select throws_ok($$ select * from public.field_team_contacts() $$, '42501', null,
  'DENY: a resident gets an error from field_team_contacts()');

set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000003", "role": "authenticated"}';
select isnt_empty($$ select id, name from public.field_teams where name = 'Ref Team One' $$,
  'ALLOW: a field team member reads field_teams (public columns)');
select throws_ok($$ select contact_phone from public.field_teams $$, '42501', null,
  'DENY: a field team member cannot read field_teams.contact_phone');
select throws_ok($$ select * from public.field_team_contacts() $$, '42501', null,
  'DENY: a field team member gets an error from field_team_contacts()');

set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select isnt_empty($$ select id from public.wards where name = 'Ref Ward One' $$, 'ALLOW: a ward admin reads wards');
select isnt_empty($$ select id from public.fault_types $$, 'ALLOW: a ward admin reads fault_types');
select results_eq($$ select contact_phone from public.field_team_contacts() where field_team_id = '0000000f-0000-0000-0000-000000000301' $$,
  $$ values ('+27115550001'::text) $$,
  'ALLOW: a ward admin reads contact_phone through field_team_contacts()');
select throws_ok($$ select contact_phone from public.field_teams $$, '42501', null,
  'a ward admin must use field_team_contacts(); the column itself stays closed');

-- A logged-in user with no profile (e.g. deleted) gets nothing either.
set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-0000000000ff", "role": "authenticated"}';
select throws_ok($$ select * from public.field_team_contacts() $$, '42501', null,
  'DENY: a login without a ward admin profile gets an error from field_team_contacts()');

-- ==== Create, update, delete: nobody from the app ============================
reset role;
set local role anon;
set local request.jwt.claims to '{"role": "anon"}';
select throws_ok($$ insert into public.wards (name) values ('Anon Ward') $$, '42501', null, 'DENY: anon cannot create wards');
select throws_ok($$ update public.wards set name = 'Anon Edit' where name = 'Ref Ward One' $$, '42501', null, 'DENY: anon cannot update wards');
select throws_ok($$ delete from public.wards where name = 'Ref Ward One' $$, '42501', null, 'DENY: anon cannot delete wards');
select throws_ok($$ insert into public.fault_types (category, name) values ('roads', 'Anon Type') $$, '42501', null, 'DENY: anon cannot create fault_types');
select throws_ok($$ update public.fault_types set auto_urgent = true $$, '42501', null, 'DENY: anon cannot update fault_types');
select throws_ok($$ delete from public.fault_types $$, '42501', null, 'DENY: anon cannot delete fault_types');
select throws_ok($$ insert into public.field_teams (name, category) values ('Anon Team', 'roads') $$, '42501', null, 'DENY: anon cannot create field_teams');
select throws_ok($$ update public.field_teams set name = 'Anon Edit' $$, '42501', null, 'DENY: anon cannot update field_teams');
select throws_ok($$ delete from public.field_teams $$, '42501', null, 'DENY: anon cannot delete field_teams');

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000001", "role": "authenticated"}';
select throws_ok($$ insert into public.wards (name) values ('Resident Ward') $$, '42501', null, 'DENY: a resident cannot create wards');
select throws_ok($$ update public.fault_types set auto_urgent = false $$, '42501', null, 'DENY: a resident cannot update fault_types');
select throws_ok($$ delete from public.field_teams $$, '42501', null, 'DENY: a resident cannot delete field_teams');

set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000002", "role": "authenticated"}';
select throws_ok($$ insert into public.wards (name) values ('Admin Ward') $$, '42501', null, 'DENY: a ward admin cannot create wards');
select throws_ok($$ update public.wards set name = 'Admin Edit' where name = 'Ref Ward One' $$, '42501', null, 'DENY: a ward admin cannot update wards');
select throws_ok($$ delete from public.wards where name = 'Ref Ward One' $$, '42501', null, 'DENY: a ward admin cannot delete wards');
select throws_ok($$ insert into public.fault_types (category, name) values ('roads', 'Admin Type') $$, '42501', null, 'DENY: a ward admin cannot create fault_types');
select throws_ok($$ update public.fault_types set auto_urgent = true $$, '42501', null, 'DENY: a ward admin cannot update fault_types');
select throws_ok($$ delete from public.fault_types $$, '42501', null, 'DENY: a ward admin cannot delete fault_types');
select throws_ok($$ insert into public.field_teams (name, category) values ('Admin Team', 'roads') $$, '42501', null, 'DENY: a ward admin cannot create field_teams');
select throws_ok($$ update public.field_teams set contact_phone = '+27110000000' $$, '42501', null, 'DENY: a ward admin cannot update field_teams');
select throws_ok($$ delete from public.field_teams $$, '42501', null, 'DENY: a ward admin cannot delete field_teams');

set local request.jwt.claims to '{"sub": "d0000000-0000-0000-0000-000000000003", "role": "authenticated"}';
select throws_ok($$ update public.field_teams set name = 'My Team' where id = '0000000f-0000-0000-0000-000000000301' $$, '42501', null,
  'DENY: a field team member cannot update their own field team');

-- ALLOW for create/update/delete: the admin in the Supabase dashboard (postgres).
reset role;
select lives_ok($$ update public.field_teams set contact_phone = '+27115550002' where id = '0000000f-0000-0000-0000-000000000301' $$,
  'ALLOW: the admin (postgres, Supabase dashboard) can maintain reference data');

select * from finish();
rollback;
