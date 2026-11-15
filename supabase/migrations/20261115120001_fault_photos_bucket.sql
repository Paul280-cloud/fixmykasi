-- Issue #14: the fault-photos bucket and its storage policies (PRD 11.4, BR2).
--
-- Paths:  before/<random-uuid>.jpg  resident photos taken when reporting
--         after/<random-uuid>.jpg   field team photos taken when the job is done
-- The path never holds a user id, so a photo is not linked to a person by its
-- name (PRD 12.4). Who uploaded it is kept in storage.objects.owner_id.
-- Linking a photo to a fault is the fault_photos table (#11), not this file.

-- Bucket -------------------------------------------------------------------------
-- Public: everyone, visitors included, can view fault photos on S4 and S5
-- (PRD 2.4). The browser compresses photos to under 500 KB before upload
-- (BR2), so 2 MB is a safe ceiling. JPG and PNG only (decision #3).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fault-photos', 'fault-photos', true, 2097152, array['image/jpeg', 'image/png']);

-- Upload ---------------------------------------------------------------------------
-- No SELECT, UPDATE or DELETE policies: photos are read through their public
-- URL, and nobody may change or delete a photo from the app (PRD 2.4).

create policy "Residents can upload before photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'fault-photos'
    and (storage.foldername(name))[1] = 'before'
    and owner_id = (select auth.uid())::text
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'resident'
    )
  );

create policy "Field teams can upload after photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'fault-photos'
    and (storage.foldername(name))[1] = 'after'
    and owner_id = (select auth.uid())::text
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'field_team'
    )
  );
