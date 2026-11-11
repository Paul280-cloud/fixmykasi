-- PRD 11.4 Profile Create: a trigger creates the profile when someone signs up,
-- and the role is always resident (PRD 5: staff accounts are never made on S2).
begin;
create extension if not exists pgtap with schema extensions;

select plan(18);

insert into public.wards (id, name) values ('0000000a-0000-0000-0000-000000000101', 'Signup Test Ward');
insert into public.field_teams (id, name, category) values ('0000000f-0000-0000-0000-000000000101', 'Signup Test Team', 'roads');

select has_function('public', 'handle_new_user', 'handle_new_user() exists');
select has_trigger('auth', 'users', 'on_auth_user_created', 'auth.users has the on_auth_user_created trigger');

-- A sign-up that tries to make itself a ward admin or field team member.
insert into auth.users (id, email, raw_user_meta_data) values (
  'b0000000-0000-0000-0000-000000000001',
  'New.Resident@Example.COM',
  '{"full_name": "  Thandi Test  ", "ward_id": "0000000a-0000-0000-0000-000000000101",
    "language": "zu", "is_18_or_older": true, "phone": "+27825550134",
    "role": "ward_admin", "field_team_id": "0000000f-0000-0000-0000-000000000101"}'::jsonb
);

select isnt_empty($$ select 1 from public.profiles where id = 'b0000000-0000-0000-0000-000000000001' $$,
  'signing up creates a profile with the same id as the login');
select is((select role::text from public.profiles where id = 'b0000000-0000-0000-0000-000000000001'),
  'resident', 'role is resident even when the sign-up asks for ward_admin');
select is((select field_team_id from public.profiles where id = 'b0000000-0000-0000-0000-000000000001'),
  null, 'field_team_id from sign-up data is ignored');
select is((select email from public.profiles where id = 'b0000000-0000-0000-0000-000000000001'),
  'new.resident@example.com', 'email is saved in lower case');
select is((select full_name from public.profiles where id = 'b0000000-0000-0000-0000-000000000001'),
  'Thandi Test', 'full_name comes from sign-up data, trimmed');
select is((select language::text from public.profiles where id = 'b0000000-0000-0000-0000-000000000001'),
  'zu', 'language comes from sign-up data');
select is((select is_18_or_older from public.profiles where id = 'b0000000-0000-0000-0000-000000000001'),
  true, 'is_18_or_older comes from sign-up data');
select is((select ward_id from public.profiles where id = 'b0000000-0000-0000-0000-000000000001'),
  '0000000a-0000-0000-0000-000000000101'::uuid, 'home ward comes from sign-up data');
select is((select phone from public.profiles where id = 'b0000000-0000-0000-0000-000000000001'),
  '+27825550134', 'optional phone comes from sign-up data');
select is((select privacy_consent_at from public.profiles where id = 'b0000000-0000-0000-0000-000000000001'),
  now(), 'privacy_consent_at is set to the sign-up time');

-- Defaults when optional sign-up data is missing.
insert into auth.users (id, email, raw_user_meta_data) values (
  'b0000000-0000-0000-0000-000000000002', 'plain@example.com',
  '{"full_name": "Plain Person", "ward_id": "0000000a-0000-0000-0000-000000000101", "is_18_or_older": true, "phone": ""}'::jsonb
);
select is((select language::text from public.profiles where id = 'b0000000-0000-0000-0000-000000000002'),
  'en', 'language defaults to en when not given');
select is((select phone from public.profiles where id = 'b0000000-0000-0000-0000-000000000002'),
  null, 'an empty phone is saved as no phone');

-- Under-18 or missing age confirmation: the sign-up is rejected.
select throws_ok($$ insert into auth.users (id, email, raw_user_meta_data) values (
  'b0000000-0000-0000-0000-000000000003', 'young@example.com',
  '{"full_name": "Too Young", "ward_id": "0000000a-0000-0000-0000-000000000101", "is_18_or_older": false}'::jsonb) $$,
  '23514', null, 'a resident with is_18_or_older = false is rejected');
select throws_ok($$ insert into auth.users (id, email, raw_user_meta_data) values (
  'b0000000-0000-0000-0000-000000000004', 'noage@example.com',
  '{"full_name": "No Age", "ward_id": "0000000a-0000-0000-0000-000000000101"}'::jsonb) $$,
  '23514', null, 'a resident who did not confirm their age is rejected');
select throws_ok($$ insert into auth.users (id, email, raw_user_meta_data) values (
  'b0000000-0000-0000-0000-000000000005', 'noward@example.com',
  '{"full_name": "No Ward", "is_18_or_older": true}'::jsonb) $$,
  '23514', null, 'a resident without a home ward is rejected');
select is_empty($$ select 1 from auth.users where id in (
  'b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000005') $$,
  'rejected sign-ups do not create a login');

select * from finish();
rollback;
