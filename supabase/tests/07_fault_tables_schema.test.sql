-- Issue #11: the four fault tables, the public view and their grants (PRD 10.1, 11.4).
-- I wrote these tests before the migration, so they failed first and then passed.
begin;
create extension if not exists pgtap with schema extensions;

select plan(34);

-- Tables and the view exist ------------------------------------------------------
select has_table('public', 'faults', 'faults table exists');
select has_table('public', 'fault_photos', 'fault_photos table exists');
select has_table('public', 'upvotes', 'upvotes table exists');
select has_table('public', 'status_changes', 'status_changes table exists');
select has_table('public', 'fault_reference_counters', 'fault_reference_counters table exists (BR1)');
select has_view('public', 'faults_public', 'faults_public view exists');

-- RLS is on for every new table -----------------------------------------------------
select ok((select relrowsecurity from pg_class where oid = 'public.faults'::regclass), 'RLS is enabled on faults');
select ok((select relrowsecurity from pg_class where oid = 'public.fault_photos'::regclass), 'RLS is enabled on fault_photos');
select ok((select relrowsecurity from pg_class where oid = 'public.upvotes'::regclass), 'RLS is enabled on upvotes');
select ok((select relrowsecurity from pg_class where oid = 'public.status_changes'::regclass), 'RLS is enabled on status_changes');
select ok((select relrowsecurity from pg_class where oid = 'public.fault_reference_counters'::regclass), 'RLS is enabled on fault_reference_counters');

-- The public view must not get around RLS ------------------------------------------
select ok(
  (select coalesce('security_invoker=true' = any(reloptions), false) from pg_class where oid = 'public.faults_public'::regclass),
  'faults_public runs with the caller''s rights (security_invoker), so it cannot bypass RLS');
select hasnt_column('public', 'faults_public', 'reporter_id', 'faults_public has no reporter_id (BR16)');
select hasnt_column('public', 'faults_public', 'municipal_reference', 'faults_public has no municipal_reference (BR16)');
select has_column('public', 'faults_public', 'is_overdue', 'faults_public works out is_overdue on read (BR11)');

-- Table-wide grants: nobody gets a blanket grant on faults --------------------------
select table_privs_are('public', 'faults', 'anon', array[]::text[], 'anon has no table-wide grant on faults (column grants only)');
select table_privs_are('public', 'faults', 'authenticated', array[]::text[], 'authenticated has no table-wide grant on faults (column grants only)');
select table_privs_are('public', 'fault_reference_counters', 'anon', array[]::text[], 'anon has no access to the reference counters');
select table_privs_are('public', 'fault_reference_counters', 'authenticated', array[]::text[], 'authenticated has no access to the reference counters');
select table_privs_are('public', 'status_changes', 'authenticated', array['SELECT'], 'authenticated can only read status_changes (the trigger writes them)');
select table_privs_are('public', 'upvotes', 'anon', array[]::text[], 'anon has no access to upvotes');
select table_privs_are('public', 'upvotes', 'authenticated', array['SELECT', 'DELETE'], 'authenticated: SELECT and DELETE on upvotes, INSERT only on fault_id');
select table_privs_are('public', 'faults_public', 'anon', array['SELECT'], 'anon can only SELECT faults_public');

-- Column grants: the hidden columns ----------------------------------------------------
select ok(not has_column_privilege('anon', 'public.faults', 'reporter_id', 'SELECT'), 'anon may not SELECT faults.reporter_id');
select ok(not has_column_privilege('authenticated', 'public.faults', 'reporter_id', 'SELECT'), 'authenticated may not SELECT faults.reporter_id directly');
select ok(not has_column_privilege('authenticated', 'public.faults', 'municipal_reference', 'SELECT'), 'authenticated may not SELECT faults.municipal_reference directly');
select ok(has_column_privilege('anon', 'public.faults', 'reference_number', 'SELECT'), 'anon may SELECT faults.reference_number');

-- Column grants: what a resident may fill in on S6 -----------------------------------
select ok(has_column_privilege('authenticated', 'public.faults', 'description', 'INSERT'), 'authenticated may INSERT faults.description');
select ok(has_column_privilege('authenticated', 'public.faults', 'id', 'INSERT'), 'authenticated may INSERT faults.id (the app makes the id first, decision #8)');
select ok(not has_column_privilege('authenticated', 'public.faults', 'reporter_id', 'INSERT'), 'authenticated may not INSERT faults.reporter_id (the trigger sets it)');
select ok(not has_column_privilege('authenticated', 'public.faults', 'status', 'INSERT'), 'authenticated may not INSERT faults.status');
select ok(not has_column_privilege('authenticated', 'public.faults', 'reference_number', 'INSERT'), 'authenticated may not INSERT faults.reference_number');
select ok(not has_column_privilege('authenticated', 'public.faults', 'upvote_count', 'INSERT'), 'authenticated may not INSERT faults.upvote_count');
select ok(not has_column_privilege('authenticated', 'public.faults', 'status', 'UPDATE'), 'authenticated may not UPDATE faults.status (only the 10.3 functions in #16 will)');

select * from finish();
rollback;
