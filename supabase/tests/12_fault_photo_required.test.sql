-- Issue #13 follow-up: a fault needs a photo unless it is "not safe" (BR2), and
-- submit_fault() saves a fault and its photos together or not at all.
begin;
create extension if not exists pgtap with schema extensions;

select plan(17);

-- Test data (as postgres) -------------------------------------------------------------
insert into public.wards (id, name) values ('0000000a-0000-0000-0000-000000001101', 'Photo Rule Ward');

insert into auth.users (id, email, raw_user_meta_data)
values ('b0000000-0000-0000-0000-000000001101', 'photo.rule@test.local', jsonb_build_object(
  'full_name', 'Photo Rule Resident', 'ward_id', '0000000a-0000-0000-0000-000000001101', 'is_18_or_older', true));

create temp table t_ids as
select
  (select id from public.fault_types where name = 'Pothole') as pothole,
  '0000000a-0000-0000-0000-000000001101'::uuid as ward;
grant select on t_ids to authenticated, anon;

-- As the resident, the way the app calls it -----------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "b0000000-0000-0000-0000-000000001101", "role": "authenticated"}';

-- A report with 1 photo is saved, with its photo.
select matches(
  public.submit_fault(
    'f0000000-0000-0000-0000-000000001101', (select ward from t_ids), (select pothole from t_ids),
    false, false, 'Big pothole in front of number 12', '12 Vilakazi Street', null, null, null,
    array['before/a1111111-1111-4111-8111-111111111101.jpg']),
  '^FMK-[0-9]{4}-[0-9]{5}$',
  'submit_fault saves a report with 1 photo and returns its reference number');

-- BR2: no photo and not "not safe" -> refused, nothing saved.
select throws_ok(
  $$ select public.submit_fault(
       'f0000000-0000-0000-0000-000000001102', (select ward from t_ids), (select pothole from t_ids),
       false, false, 'Big pothole in front of number 14', '14 Vilakazi Street', null, null, null, '{}') $$,
  '23514', 'photo_required',
  'BR2: submit_fault refuses a report with no photo unless it is "not safe"');

-- BR2: "not safe" with a 30+ character description and no photo -> saved.
select lives_ok(
  $$ select public.submit_fault(
       'f0000000-0000-0000-0000-000000001103', (select ward from t_ids), (select pothole from t_ids),
       false, true, 'Live wires hanging over the road, not safe to stop.', '16 Vilakazi Street', null, null, null, '{}') $$,
  'BR2: submit_fault saves a "not safe" report with no photo');

-- A bad photo path fails the whole report: the fault is not saved without its photo.
select throws_ok(
  $$ select public.submit_fault(
       'f0000000-0000-0000-0000-000000001104', (select ward from t_ids), (select pothole from t_ids),
       false, false, 'Big pothole in front of number 18', '18 Vilakazi Street', null, null, null,
       array['after/a1111111-1111-4111-8111-111111111104.jpg']) $$,
  null, null,
  'if a photo cannot be linked, submit_fault fails as a whole');

-- The rule also holds for a fault saved directly, not through submit_fault.
set constraints public.faults_require_photo immediate;

select throws_ok(
  $$ insert into public.faults (id, ward_id, fault_type_id, description, street_address)
     values ('f0000000-0000-0000-0000-000000001105', (select ward from t_ids), (select pothole from t_ids),
             'Big pothole in front of number 20', '20 Vilakazi Street') $$,
  '23514', 'photo_required',
  'BR2: a fault saved directly with no photo is refused');

select lives_ok(
  $$ insert into public.faults (id, ward_id, fault_type_id, no_photo_safe, description, street_address)
     values ('f0000000-0000-0000-0000-000000001106', (select ward from t_ids), (select pothole from t_ids), true,
             'Burst pipe in the middle of a busy taxi rank, not safe.', '22 Vilakazi Street') $$,
  'BR2: a "not safe" fault saved directly with no photo is allowed');

-- submit_fault runs with the resident's own rights, so BR17 still applies.
-- 3 faults so far (1101, 1103, 1106); 2 more make 5.
select lives_ok(
  $$ select public.submit_fault(
       'f0000000-0000-0000-0000-000000001107', (select ward from t_ids), (select pothole from t_ids),
       false, false, 'Big pothole in front of number 24', '24 Vilakazi Street', null, null, null,
       array['before/a1111111-1111-4111-8111-111111111107.jpg']) $$,
  'a resident can submit their 4th report of the day');
select lives_ok(
  $$ select public.submit_fault(
       'f0000000-0000-0000-0000-000000001108', (select ward from t_ids), (select pothole from t_ids),
       false, false, 'Big pothole in front of number 26', '26 Vilakazi Street', null, null, null,
       array['before/a1111111-1111-4111-8111-111111111108.jpg']) $$,
  'a resident can submit their 5th report of the day');

select throws_ok(
  $$ select public.submit_fault(
       'f0000000-0000-0000-0000-000000001109', (select ward from t_ids), (select pothole from t_ids),
       false, false, 'Big pothole in front of number 28', '28 Vilakazi Street', null, null, null,
       array['before/a1111111-1111-4111-8111-111111111109.jpg']) $$,
  'P0001', 'too_many_reports',
  'BR17: the 6th report in 24 hours is refused through submit_fault too');

-- Visitors cannot call it.
reset role;
set local role anon;
set local request.jwt.claims to '{"role": "anon"}';
select throws_ok(
  $$ select public.submit_fault(
       'f0000000-0000-0000-0000-000000001110', (select ward from t_ids), (select pothole from t_ids),
       false, true, 'Live wires hanging over the road, not safe to stop.', '30 Vilakazi Street', null, null, null, '{}') $$,
  '42501', null,
  'a visitor (anon) cannot call submit_fault');

-- What was saved (as postgres) ------------------------------------------------------------
reset role;

select is(
  (select count(*)::int from public.fault_photos
   where fault_id = 'f0000000-0000-0000-0000-000000001101' and kind = 'before'),
  1, 'the first report has its photo linked');

select is(
  (select count(*)::int from public.faults where id in (
     'f0000000-0000-0000-0000-000000001102', 'f0000000-0000-0000-0000-000000001104',
     'f0000000-0000-0000-0000-000000001105', 'f0000000-0000-0000-0000-000000001109')),
  0, 'none of the refused reports were saved');

select is(
  (select count(*)::int from public.faults f
   where f.reporter_id = 'b0000000-0000-0000-0000-000000001101'
     and not f.no_photo_safe
     and not exists (select 1 from public.fault_photos p where p.fault_id = f.id and p.kind = 'before')),
  0, 'BR2: every saved fault of this resident has a photo or is "not safe"');

select is(
  (select count(*)::int from public.faults where reporter_id = 'b0000000-0000-0000-0000-000000001101'),
  5, 'exactly the 5 allowed reports were saved');

-- Who may call the new functions.
select function_privs_are('public', 'submit_fault',
  array['uuid', 'uuid', 'uuid', 'boolean', 'boolean', 'text', 'text', 'text', 'numeric', 'numeric', 'text[]'],
  'anon', array[]::text[], 'anon cannot call submit_fault');
select function_privs_are('public', 'submit_fault',
  array['uuid', 'uuid', 'uuid', 'boolean', 'boolean', 'text', 'text', 'text', 'numeric', 'numeric', 'text[]'],
  'authenticated', array['EXECUTE'], 'authenticated can call submit_fault (RLS decides what it may save)');
select function_privs_are('public', 'faults_require_photo', array[]::text[], 'authenticated', array[]::text[],
  'authenticated cannot call faults_require_photo directly');

select * from finish();
rollback;
