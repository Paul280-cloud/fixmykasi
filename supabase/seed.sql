-- Local sample users from PRD 8.4. Loaded by `npx supabase db reset`.
-- All people are fictional test data.
--
-- No passwords here. After a reset, run supabase/seed/seed.js to set the
-- test passwords from PRD 10.4 (see supabase/seed/README.md).
--
-- Faults, photos, upvotes and status history from 8.4 are added with the
-- fault tables in later issues.

-- 1. Logins. Every column GoTrue reads is filled in: token columns must be ''
--    (not null) or GoTrue fails to load the user. Emails are already confirmed.
--    handle_new_user() creates each profile as a resident from the metadata.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
)
select
  '00000000-0000-0000-0000-000000000000',
  u.id::uuid,
  'authenticated',
  'authenticated',
  u.email,
  '',
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  jsonb_build_object(
    'full_name', u.full_name,
    'ward_id', (select w.id from public.wards w where w.name = u.ward_name),
    'language', u.language,
    'is_18_or_older', true,
    'phone', u.phone
  ),
  now(),
  now(),
  '', '', '', '',
  '', '', '', ''
from (values
  -- id                                    email                     full name           home ward               language phone
  ('5eed0000-0000-0000-0000-000000000001', 'thandeka.m@example.com', 'Thandeka Mokoena', 'Ward A: Orlando West', 'zu',  '+27825550134'),
  ('5eed0000-0000-0000-0000-000000000002', 'lerato.d@example.com',   'Lerato Dlamini',   'Ward B: Diepkloof',    'en',  null),
  ('5eed0000-0000-0000-0000-000000000003', 'johan.b@example.com',    'Johan Botha',      'Ward C: Braamfontein', 'af',  null),
  ('5eed0000-0000-0000-0000-000000000004', 'nomsa.s@example.com',    'Nomsa Sithole',    'Ward A: Orlando West', 'nso', null),
  ('5eed0000-0000-0000-0000-000000000005', 'zanele.k@example.com',   'Zanele Khumalo',   'Ward A: Orlando West', 'en',  null),
  -- Signs up like everyone else; becomes a field team member in step 3.
  ('5eed0000-0000-0000-0000-000000000006', 'kagiso.m@example.com',   'Kagiso Molefe',    'Ward A: Orlando West', 'en',  null)
) as u (id, email, full_name, ward_name, language, phone);

-- 2. Email identities, so the users can log in with email and password.
insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select
  u.id::text,
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email',
  now(), now(), now()
from auth.users u
where u.id::text like '5eed0000-%';

-- 3. Staff roles, set by the admin as in PRD 2.5 (the trigger always makes residents).
update public.profiles
set role = 'ward_admin'
where id = '5eed0000-0000-0000-0000-000000000005';  -- Zanele, ward admin of Ward A

update public.profiles
set role = 'field_team',
    field_team_id = (select id from public.field_teams where name = 'Sample Plumbing Services (Pty) Ltd'),
    ward_id = null
where id = '5eed0000-0000-0000-0000-000000000006';  -- Kagiso, Sample Plumbing Services
