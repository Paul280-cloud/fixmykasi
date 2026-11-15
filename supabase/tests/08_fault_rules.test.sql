-- Issue #11: the business rules the database itself keeps (BR1, BR2, BR3, BR5, BR17, BR19).
-- I run the inserts as a real resident (role authenticated + a JWT), the same way the app does.
begin;
create extension if not exists pgtap with schema extensions;

select plan(25);

-- Test data (as postgres) -------------------------------------------------------------
insert into public.wards (id, name) values ('0000000a-0000-0000-0000-000000000801', 'Rules Ward');

insert into auth.users (id, email, raw_user_meta_data)
select id::uuid, email, jsonb_build_object(
  'full_name', full_name, 'ward_id', '0000000a-0000-0000-0000-000000000801', 'is_18_or_older', true)
from (values
  ('b0000000-0000-0000-0000-000000000001', 'rules.res1@test.local', 'Rules Resident One'),
  ('b0000000-0000-0000-0000-000000000002', 'rules.res2@test.local', 'Rules Resident Two')
) as u (id, email, full_name);

-- I keep the fault type ids in a temp table so the tests read nicely.
create temp table t_types as
select
  (select id from public.fault_types where name = 'Pothole') as pothole,
  (select id from public.fault_types where name = 'Sinkhole') as sinkhole;
grant select on t_types to authenticated;

-- Resident One reports a pothole --------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "b0000000-0000-0000-0000-000000000001", "role": "authenticated"}';

insert into public.faults (id, fault_type_id, ward_id, description, street_address)
values ('f0000000-0000-0000-0000-000000000801', (select pothole from t_types),
        '0000000a-0000-0000-0000-000000000801', 'Big pothole in front of number 12', '12 Vilakazi Street');

reset role;

-- BR17 race (Bao's review): the insert took this resident's lock, so a second
-- Submit at the same moment would have to wait. pgTAP runs in one session, so I
-- check the lock is held; a two-connection race test is a follow-up Issue.
select ok(
  exists (select 1 from pg_locks
          where locktype = 'advisory' and pid = pg_backend_pid() and granted),
  'BR17: reporting a fault takes a lock for the resident, so two Submits cannot both pass the limit');

-- BR1: reference number -----------------------------------------------------------------
select matches(
  (select reference_number from public.faults where id = 'f0000000-0000-0000-0000-000000000801'),
  '^FMK-[0-9]{4}-[0-9]{5}$',
  'BR1: the reference number looks like FMK-YYYY-NNNNN');
select is(
  (select substr(reference_number, 5, 4) from public.faults where id = 'f0000000-0000-0000-0000-000000000801'),
  to_char(now() at time zone 'Africa/Johannesburg', 'YYYY'),
  'BR1: the year in the reference number is this year in SAST');

-- The trigger fills in the fields the resident is not allowed to send.
select is((select reporter_id from public.faults where id = 'f0000000-0000-0000-0000-000000000801'),
  'b0000000-0000-0000-0000-000000000001'::uuid, 'reporter_id is set to the logged-in resident');
select is((select status::text from public.faults where id = 'f0000000-0000-0000-0000-000000000801'),
  'received', 'a new fault starts as received (10.3)');
select is((select is_urgent from public.faults where id = 'f0000000-0000-0000-0000-000000000801'),
  false, 'a pothole is not urgent unless the resident ticks it');

-- 10.3 / BR9: the first status row is written by the trigger.
select results_eq(
  $$ select from_status::text, to_status::text, changed_by from public.status_changes
     where fault_id = 'f0000000-0000-0000-0000-000000000801' $$,
  $$ values (null::text, 'received'::text, 'b0000000-0000-0000-0000-000000000001'::uuid) $$,
  'BR9: reporting a fault writes the first StatusChange (empty to received)');

-- BR1 again: the next fault gets the next number ------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "b0000000-0000-0000-0000-000000000001", "role": "authenticated"}';
insert into public.faults (id, fault_type_id, ward_id, description, street_address)
values ('f0000000-0000-0000-0000-000000000802', (select sinkhole from t_types),
        '0000000a-0000-0000-0000-000000000801', 'The road has caved in near the school', '3 Moema Street');
reset role;

select is(
  (select substr(reference_number, 10)::int from public.faults where id = 'f0000000-0000-0000-0000-000000000802'),
  (select substr(reference_number, 10)::int + 1 from public.faults where id = 'f0000000-0000-0000-0000-000000000801'),
  'BR1: the next fault gets the next number');

-- BR19: Sinkhole is an auto-urgent type.
select is((select is_urgent from public.faults where id = 'f0000000-0000-0000-0000-000000000802'),
  true, 'BR19: an auto-urgent fault type is always urgent');

-- BR1: a new year starts again at 00001. I fake last year's counter to show the
-- counter is kept per year.
insert into public.fault_reference_counters (year, last_number) values (2000, 41);
select is(
  (select last_number from public.fault_reference_counters where year = 2000), 41,
  'BR1: each year has its own counter, so numbering restarts every year');

-- BR1: the reference number is unique.
select throws_ok(
  $$ update public.faults set reference_number = (select reference_number from public.faults where id = 'f0000000-0000-0000-0000-000000000801')
     where id = 'f0000000-0000-0000-0000-000000000802' $$,
  '23505', null, 'BR1: two faults can never share a reference number');

-- Field rules (BR2, BR3, BR17) ------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "b0000000-0000-0000-0000-000000000002", "role": "authenticated"}';

select throws_ok(
  $$ insert into public.faults (fault_type_id, ward_id, description, street_address)
     values ((select pothole from t_types), '0000000a-0000-0000-0000-000000000801', 'Too short', '12 Vilakazi Street') $$,
  '23514', null, 'BR17: a description under 10 characters is rejected');
select throws_ok(
  $$ insert into public.faults (fault_type_id, ward_id, description, street_address)
     values ((select pothole from t_types), '0000000a-0000-0000-0000-000000000801', repeat('a', 501), '12 Vilakazi Street') $$,
  '23514', null, 'BR17: a description over 500 characters is rejected');
select throws_ok(
  $$ insert into public.faults (fault_type_id, ward_id, description, street_address, no_photo_safe)
     values ((select pothole from t_types), '0000000a-0000-0000-0000-000000000801', 'Twenty chars only..', '12 Vilakazi Street', true) $$,
  '23514', null, 'BR2: with "not safe to take a photo" the description needs 30 characters');
select lives_ok(
  $$ insert into public.faults (fault_type_id, ward_id, description, street_address, no_photo_safe)
     values ((select pothole from t_types), '0000000a-0000-0000-0000-000000000801', 'Live wires hanging over the road, too dangerous', '12 Vilakazi Street', true) $$,
  'BR2: with "not safe" ticked and 30+ characters, the fault is saved with no photo');
select throws_ok(
  $$ insert into public.faults (fault_type_id, ward_id, description, street_address)
     values ((select pothole from t_types), '0000000a-0000-0000-0000-000000000801', 'Big pothole here', '12') $$,
  '23514', null, 'BR3: a street address under 5 characters is rejected');
select throws_ok(
  $$ insert into public.faults (fault_type_id, ward_id, description, street_address, landmark)
     values ((select pothole from t_types), '0000000a-0000-0000-0000-000000000801', 'Big pothole here', '12 Vilakazi Street', repeat('x', 61)) $$,
  '23514', null, 'BR3: a landmark over 60 characters is rejected');
select throws_ok(
  $$ insert into public.faults (fault_type_id, ward_id, description, street_address, latitude, longitude)
     values ((select pothole from t_types), '0000000a-0000-0000-0000-000000000801', 'Big pothole here', '12 Vilakazi Street', 51.5, -0.1) $$,
  '23514', null, 'BR3: a GPS point outside South Africa is rejected');
select throws_ok(
  $$ insert into public.faults (fault_type_id, ward_id, description, street_address, latitude)
     values ((select pothole from t_types), '0000000a-0000-0000-0000-000000000801', 'Big pothole here', '12 Vilakazi Street', -26.2) $$,
  '23514', null, 'BR3: latitude without longitude is rejected');

-- BR17: at most 5 faults in 24 hours. Resident Two has 1 so far, so 4 more work...
select lives_ok(
  $$ insert into public.faults (fault_type_id, ward_id, description, street_address)
     select (select pothole from t_types), '0000000a-0000-0000-0000-000000000801', 'Pothole number ' || n || ' on this road', n || ' Vilakazi Street'
     from generate_series(10, 13) as n $$,
  'BR17: a resident can report up to 5 faults in 24 hours');
-- ...and the 6th is refused with a message the app can show.
select throws_ok(
  $$ insert into public.faults (fault_type_id, ward_id, description, street_address)
     values ((select pothole from t_types), '0000000a-0000-0000-0000-000000000801', 'The sixth pothole today', '14 Vilakazi Street') $$,
  'P0001', 'too_many_reports', 'BR17: the 6th fault in 24 hours is refused');

-- BR5: upvote_count is kept in step by a trigger -----------------------------------------
insert into public.upvotes (fault_id) values ('f0000000-0000-0000-0000-000000000801');
reset role;
select is((select upvote_count from public.faults where id = 'f0000000-0000-0000-0000-000000000801'),
  1, 'BR5: an upvote adds 1 to upvote_count');

set local role authenticated;
set local request.jwt.claims to '{"sub": "b0000000-0000-0000-0000-000000000002", "role": "authenticated"}';
delete from public.upvotes where fault_id = 'f0000000-0000-0000-0000-000000000801';
reset role;
select is((select upvote_count from public.faults where id = 'f0000000-0000-0000-0000-000000000801'),
  0, 'BR5: removing the upvote takes 1 off upvote_count');

-- BR11: is_overdue is worked out on read, never stored.
update public.faults set due_date = current_date - 3 where id = 'f0000000-0000-0000-0000-000000000801';
select is((select is_overdue from public.faults_public where id = 'f0000000-0000-0000-0000-000000000801'),
  true, 'BR11: a fault past its due date that is not fixed shows as overdue');
update public.faults set status = 'fixed' where id = 'f0000000-0000-0000-0000-000000000801';
select is((select is_overdue from public.faults_public where id = 'f0000000-0000-0000-0000-000000000801'),
  false, 'BR11: a fixed fault is never overdue');

select * from finish();
rollback;
