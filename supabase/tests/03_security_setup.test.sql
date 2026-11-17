-- RLS is on for every table, table and column grants are exactly what the app
-- needs (Supabase grants ALL to anon and authenticated by default), and every
-- function is locked down.
begin;
create extension if not exists pgtap with schema extensions;

select plan(64);

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

-- Status history: team identifier is visible for the public timeline, but the
-- private reopen reason remains available only through the controlled function.
select ok(
  has_column_privilege('anon', 'public.status_changes', 'field_team_id', 'SELECT'),
  'anon may SELECT historical field_team_id'
);
select ok(
  has_column_privilege('authenticated', 'public.status_changes', 'field_team_id', 'SELECT'),
  'authenticated may SELECT historical field_team_id'
);
select ok(
  not has_column_privilege('anon', 'public.status_changes', 'reopen_reason', 'SELECT'),
  'anon may not SELECT private reopen_reason'
);
select ok(
  not has_column_privilege('authenticated', 'public.status_changes', 'reopen_reason', 'SELECT'),
  'authenticated may not SELECT private reopen_reason'
);

-- Functions --------------------------------------------------------------------
select is_empty($$
  select p.proname from pg_proc p
  where p.pronamespace = 'public'::regnamespace
    and not coalesce('search_path=""' = any(p.proconfig), false)
$$, 'every function in public sets search_path = ''''');
select is(
  (select array_agg(p.proname::text order by p.proname) from pg_proc p
   where p.pronamespace = 'public'::regnamespace and p.prosecdef),
  array[
    'assign_fault', 'auto_close_fixed_faults', 'change_fault_status', 'fault_role',
    'faults_after_insert', 'faults_after_update_status_history', 'faults_before_insert',
    'field_team_contacts', 'get_fault_reopen_reasons', 'handle_new_user',
    'is_reporter_in_my_ward', 'mark_fault_delayed', 'sync_upvote_count'
  ],
  'only these functions are security definer (each one is explained in its migration)');
select function_privs_are('public', 'handle_new_user', array[]::text[], 'anon', array[]::text[], 'anon cannot call handle_new_user');
select function_privs_are('public', 'handle_new_user', array[]::text[], 'authenticated', array[]::text[], 'authenticated cannot call handle_new_user');
select function_privs_are('public', 'field_team_contacts', array[]::text[], 'anon', array[]::text[], 'anon cannot call field_team_contacts');
select function_privs_are('public', 'field_team_contacts', array[]::text[], 'authenticated', array['EXECUTE'], 'authenticated can call field_team_contacts (it checks the role itself)');
select function_privs_are('public', 'guard_profile_update', array[]::text[], 'anon', array[]::text[], 'anon cannot call guard_profile_update');
select function_privs_are('public', 'guard_profile_update', array[]::text[], 'authenticated', array[]::text[], 'authenticated cannot call guard_profile_update');

-- Trigger functions cannot be called by anyone directly.
select function_privs_are('public', 'faults_before_insert', array[]::text[], 'anon', array[]::text[], 'anon cannot call faults_before_insert');
select function_privs_are('public', 'faults_before_insert', array[]::text[], 'authenticated', array[]::text[], 'authenticated cannot call faults_before_insert');
select function_privs_are('public', 'faults_after_insert', array[]::text[], 'anon', array[]::text[], 'anon cannot call faults_after_insert');
select function_privs_are('public', 'faults_after_insert', array[]::text[], 'authenticated', array[]::text[], 'authenticated cannot call faults_after_insert');
select function_privs_are('public', 'sync_upvote_count', array[]::text[], 'anon', array[]::text[], 'anon cannot call sync_upvote_count');
select function_privs_are('public', 'sync_upvote_count', array[]::text[], 'authenticated', array[]::text[], 'authenticated cannot call sync_upvote_count');
select function_privs_are('public', 'fault_photos_limit', array[]::text[], 'anon', array[]::text[], 'anon cannot call fault_photos_limit');
select function_privs_are('public', 'fault_photos_limit', array[]::text[], 'authenticated', array[]::text[], 'authenticated cannot call fault_photos_limit');
select function_privs_are('public', 'fault_role', array['uuid'], 'anon', array[]::text[], 'anon cannot call fault_role');
select function_privs_are('public', 'fault_role', array['uuid'], 'authenticated', array['EXECUTE'], 'authenticated can call fault_role (it only answers about the caller)');
select function_privs_are('public', 'is_reporter_in_my_ward', array['uuid'], 'anon', array[]::text[], 'anon cannot call is_reporter_in_my_ward');
select function_privs_are('public', 'is_reporter_in_my_ward', array['uuid'], 'authenticated', array['EXECUTE'], 'authenticated can call is_reporter_in_my_ward (it only answers about the caller)');

-- Issue #18: assignment function.
select function_privs_are('public', 'assign_fault', array['uuid', 'uuid', 'date', 'integer', 'text', 'text'], 'anon', array[]::text[], 'anon cannot call assign_fault');
select function_privs_are('public', 'assign_fault', array['uuid', 'uuid', 'date', 'integer', 'text', 'text'], 'authenticated', array['EXECUTE'], 'authenticated can call assign_fault (it checks the ward admin itself)');

-- Issue #16: application functions are authenticated-only; the scheduler and
-- trigger functions are not callable by app roles.
-- Use to_regprocedure so missing Issue #16 functions become ordinary
-- pgTAP failures in the red baseline rather than aborting this SQL file.
select ok(not coalesce(has_function_privilege('anon', pg_catalog.to_regprocedure('public.change_fault_status(uuid,public.fault_status,text,text)'), 'EXECUTE'), false), 'anon cannot call change_fault_status');
select ok(coalesce(has_function_privilege('authenticated', pg_catalog.to_regprocedure('public.change_fault_status(uuid,public.fault_status,text,text)'), 'EXECUTE'), false), 'authenticated can call change_fault_status');
select ok(not coalesce(has_function_privilege('anon', pg_catalog.to_regprocedure('public.mark_fault_delayed(uuid,text,date)'), 'EXECUTE'), false), 'anon cannot call mark_fault_delayed');
select ok(coalesce(has_function_privilege('authenticated', pg_catalog.to_regprocedure('public.mark_fault_delayed(uuid,text,date)'), 'EXECUTE'), false), 'authenticated can call mark_fault_delayed');
select ok(not coalesce(has_function_privilege('anon', pg_catalog.to_regprocedure('public.get_fault_reopen_reasons(uuid)'), 'EXECUTE'), false), 'anon cannot call get_fault_reopen_reasons');
select ok(coalesce(has_function_privilege('authenticated', pg_catalog.to_regprocedure('public.get_fault_reopen_reasons(uuid)'), 'EXECUTE'), false), 'authenticated can call get_fault_reopen_reasons (the function checks the relationship)');
select ok(not coalesce(has_function_privilege('anon', pg_catalog.to_regprocedure('public.auto_close_fixed_faults()'), 'EXECUTE'), false), 'anon cannot call auto_close_fixed_faults');
select ok(not coalesce(has_function_privilege('authenticated', pg_catalog.to_regprocedure('public.auto_close_fixed_faults()'), 'EXECUTE'), false), 'authenticated cannot call auto_close_fixed_faults');
select ok(not coalesce(has_function_privilege('anon', pg_catalog.to_regprocedure('public.faults_after_update_status_history()'), 'EXECUTE'), false), 'anon cannot call faults_after_update_status_history');
select ok(not coalesce(has_function_privilege('authenticated', pg_catalog.to_regprocedure('public.faults_after_update_status_history()'), 'EXECUTE'), false), 'authenticated cannot call faults_after_update_status_history');

select * from finish();
rollback;
