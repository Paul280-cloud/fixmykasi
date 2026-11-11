-- RLS is on for every table, table and column grants are exactly what the app
-- needs (Supabase grants ALL to anon and authenticated by default), and every
-- function is locked down.
begin;
create extension if not exists pgtap with schema extensions;

select plan(36);

-- RLS enabled on every table -------------------------------------------------
select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), 'RLS is enabled on profiles');
select ok((select relrowsecurity from pg_class where oid = 'public.wards'::regclass), 'RLS is enabled on wards');
select ok((select relrowsecurity from pg_class where oid = 'public.fault_types'::regclass), 'RLS is enabled on fault_types');
select ok((select relrowsecurity from pg_class where oid = 'public.field_teams'::regclass), 'RLS is enabled on field_teams');
select is_empty($$
  select c.relname from pg_class c
  where c.relnamespace = 'public'::regnamespace and c.relkind in ('r', 'p') and not c.relrowsecurity
$$, 'no table in public is missing RLS');

-- Table-level grants -----------------------------------------------------------
select table_privs_are('public', 'profiles', 'anon', array[]::text[], 'anon has no access to profiles');
select table_privs_are('public', 'profiles', 'authenticated', array['SELECT', 'DELETE'],
  'authenticated: SELECT and DELETE on profiles, no table-wide INSERT or UPDATE');
select table_privs_are('public', 'wards', 'anon', array['SELECT'], 'anon can only SELECT wards');
select table_privs_are('public', 'wards', 'authenticated', array['SELECT'], 'authenticated can only SELECT wards');
select table_privs_are('public', 'fault_types', 'anon', array['SELECT'], 'anon can only SELECT fault_types');
select table_privs_are('public', 'fault_types', 'authenticated', array['SELECT'], 'authenticated can only SELECT fault_types');
select table_privs_are('public', 'field_teams', 'anon', array[]::text[], 'anon has no table-wide grant on field_teams (column grants only)');
select table_privs_are('public', 'field_teams', 'authenticated', array[]::text[], 'authenticated has no table-wide grant on field_teams (column grants only)');

-- Column-level grants: profiles UPDATE --------------------------------------
select ok(has_column_privilege('authenticated', 'public.profiles', 'full_name', 'UPDATE'), 'authenticated may UPDATE profiles.full_name');
select ok(has_column_privilege('authenticated', 'public.profiles', 'phone', 'UPDATE'), 'authenticated may UPDATE profiles.phone');
select ok(has_column_privilege('authenticated', 'public.profiles', 'language', 'UPDATE'), 'authenticated may UPDATE profiles.language');
select ok(has_column_privilege('authenticated', 'public.profiles', 'ward_id', 'UPDATE'), 'authenticated may UPDATE profiles.ward_id (residents only, see guard trigger)');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE'), 'authenticated may not UPDATE profiles.role');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'field_team_id', 'UPDATE'), 'authenticated may not UPDATE profiles.field_team_id');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'email', 'UPDATE'), 'authenticated may not UPDATE profiles.email');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'id', 'UPDATE'), 'authenticated may not UPDATE profiles.id');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'is_18_or_older', 'UPDATE'), 'authenticated may not UPDATE profiles.is_18_or_older');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'privacy_consent_at', 'UPDATE'), 'authenticated may not UPDATE profiles.privacy_consent_at');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'created_at', 'UPDATE'), 'authenticated may not UPDATE profiles.created_at');

-- Column-level grants: field_teams SELECT (contact_phone hidden) ------------
select ok(has_column_privilege('anon', 'public.field_teams', 'name', 'SELECT'), 'anon may SELECT field_teams.name');
select ok(has_column_privilege('authenticated', 'public.field_teams', 'kind', 'SELECT'), 'authenticated may SELECT field_teams.kind');
select ok(not has_column_privilege('anon', 'public.field_teams', 'contact_phone', 'SELECT'), 'anon may not SELECT field_teams.contact_phone');
select ok(not has_column_privilege('authenticated', 'public.field_teams', 'contact_phone', 'SELECT'), 'authenticated may not SELECT field_teams.contact_phone directly');

-- Functions --------------------------------------------------------------------
select is_empty($$
  select p.proname from pg_proc p
  where p.pronamespace = 'public'::regnamespace
    and not coalesce('search_path=""' = any(p.proconfig), false)
$$, 'every function in public sets search_path = ''''');
select is(
  (select array_agg(p.proname::text order by p.proname) from pg_proc p
   where p.pronamespace = 'public'::regnamespace and p.prosecdef),
  array['field_team_contacts', 'handle_new_user'],
  'only handle_new_user and field_team_contacts are security definer');
select function_privs_are('public', 'handle_new_user', array[]::text[], 'anon', array[]::text[], 'anon cannot call handle_new_user');
select function_privs_are('public', 'handle_new_user', array[]::text[], 'authenticated', array[]::text[], 'authenticated cannot call handle_new_user');
select function_privs_are('public', 'field_team_contacts', array[]::text[], 'anon', array[]::text[], 'anon cannot call field_team_contacts');
select function_privs_are('public', 'field_team_contacts', array[]::text[], 'authenticated', array['EXECUTE'], 'authenticated can call field_team_contacts (it checks the role itself)');
select function_privs_are('public', 'guard_profile_update', array[]::text[], 'anon', array[]::text[], 'anon cannot call guard_profile_update');
select function_privs_are('public', 'guard_profile_update', array[]::text[], 'authenticated', array[]::text[], 'authenticated cannot call guard_profile_update');

select * from finish();
rollback;
