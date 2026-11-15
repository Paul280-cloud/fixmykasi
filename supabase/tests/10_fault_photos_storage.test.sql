-- Issue #14: fault-photos bucket settings and an ALLOW and a DENY test for each
-- storage action (PRD 2.4, 11.4, BR2).
begin;
create extension if not exists pgtap with schema extensions;

select plan(13);

-- Bucket settings -------------------------------------------------------------
select results_eq(
  $$ select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'fault-photos' $$,
  $$ values (true, 2097152::bigint, array['image/jpeg', 'image/png']) $$,
  'fault-photos bucket is public, 2 MB limit, JPG and PNG only');

-- Test data (as postgres) -------------------------------------------------------
insert into public.wards (id, name) values
  ('0000000a-0000-0000-0000-000000000701', 'Photo Ward');
insert into public.field_teams (id, name, category) values
  ('0000000f-0000-0000-0000-000000000701', 'Photo Team', 'roads');

insert into auth.users (id, email, raw_user_meta_data)
select id::uuid, email, jsonb_build_object(
  'full_name', full_name, 'ward_id', '0000000a-0000-0000-0000-000000000701', 'is_18_or_older', true)
from (values
  ('a0000000-0000-0000-0000-000000000701', 'photo.res@test.local', 'Photo Resident'),
  ('a0000000-0000-0000-0000-000000000702', 'photo.admin@test.local', 'Photo Admin'),
  ('a0000000-0000-0000-0000-000000000703', 'photo.team@test.local', 'Photo Team Member')
) as u (id, email, full_name);

update public.profiles set role = 'ward_admin'
  where id = 'a0000000-0000-0000-0000-000000000702';
update public.profiles set role = 'field_team', field_team_id = '0000000f-0000-0000-0000-000000000701', ward_id = null
  where id = 'a0000000-0000-0000-0000-000000000703';

-- ==== Upload: resident ===========================================================
set local role authenticated;
set local request.jwt.claims to '{"sub": "a0000000-0000-0000-0000-000000000701", "role": "authenticated"}';

select lives_ok($$ insert into storage.objects (bucket_id, name, owner_id)
  values ('fault-photos', 'before/res-photo.jpg', 'a0000000-0000-0000-0000-000000000701') $$,
  'ALLOW: a resident uploads a before photo');
select throws_ok($$ insert into storage.objects (bucket_id, name, owner_id)
  values ('fault-photos', 'after/res-photo.jpg', 'a0000000-0000-0000-0000-000000000701') $$,
  '42501', null, 'DENY: a resident cannot upload an after photo');
select throws_ok($$ insert into storage.objects (bucket_id, name, owner_id)
  values ('fault-photos', 'res-photo.jpg', 'a0000000-0000-0000-0000-000000000701') $$,
  '42501', null, 'DENY: a resident cannot upload outside the before folder');
select throws_ok($$ insert into storage.objects (bucket_id, name, owner_id)
  values ('fault-photos', 'before/spoof.jpg', 'a0000000-0000-0000-0000-000000000703') $$,
  '42501', null, 'DENY: a resident cannot upload as another user');

-- ==== Upload: ward admin =========================================================
set local request.jwt.claims to '{"sub": "a0000000-0000-0000-0000-000000000702", "role": "authenticated"}';
select throws_ok($$ insert into storage.objects (bucket_id, name, owner_id)
  values ('fault-photos', 'before/admin-photo.jpg', 'a0000000-0000-0000-0000-000000000702') $$,
  '42501', null, 'DENY: a ward admin cannot upload a before photo');
select throws_ok($$ insert into storage.objects (bucket_id, name, owner_id)
  values ('fault-photos', 'after/admin-photo.jpg', 'a0000000-0000-0000-0000-000000000702') $$,
  '42501', null, 'DENY: a ward admin cannot upload an after photo');

-- ==== Upload: field team =========================================================
set local request.jwt.claims to '{"sub": "a0000000-0000-0000-0000-000000000703", "role": "authenticated"}';
select lives_ok($$ insert into storage.objects (bucket_id, name, owner_id)
  values ('fault-photos', 'after/team-photo.jpg', 'a0000000-0000-0000-0000-000000000703') $$,
  'ALLOW: a field team member uploads an after photo');
select throws_ok($$ insert into storage.objects (bucket_id, name, owner_id)
  values ('fault-photos', 'before/team-photo.jpg', 'a0000000-0000-0000-0000-000000000703') $$,
  '42501', null, 'DENY: a field team member cannot upload a before photo');

-- ==== Update and delete: nobody ==================================================
set local request.jwt.claims to '{"sub": "a0000000-0000-0000-0000-000000000701", "role": "authenticated"}';
select is_empty($$ update storage.objects set name = 'before/renamed.jpg'
  where name = 'before/res-photo.jpg' returning id $$,
  'DENY: a resident cannot change their own photo');
-- Supabase blocks every direct DELETE on storage tables from SQL
-- (storage.protect_delete), so check the policies instead: none may allow
-- an update or delete in this bucket. Through the Storage API, RLS then denies it.
reset role;
select is_empty($$ select policyname from pg_policies
  where schemaname = 'storage' and tablename = 'objects'
    and cmd in ('UPDATE', 'DELETE', 'ALL')
    and (coalesce(qual, '') like '%fault-photos%' or coalesce(with_check, '') like '%fault-photos%') $$,
  'DENY: no policy lets anyone change or delete a fault photo');

-- ==== Visitor ====================================================================
reset role;
set local role anon;
set local request.jwt.claims to '{"role": "anon"}';
select throws_ok($$ insert into storage.objects (bucket_id, name)
  values ('fault-photos', 'before/anon.jpg') $$,
  '42501', null, 'DENY: a visitor (anon) cannot upload a photo');

-- Both photos are still there (checked as postgres) --------------------------------
reset role;
select results_eq($$ select count(*)::int from storage.objects where bucket_id = 'fault-photos' $$,
  $$ values (2) $$, 'The two allowed photos were saved and the rename was blocked');

select * from finish();
rollback;
