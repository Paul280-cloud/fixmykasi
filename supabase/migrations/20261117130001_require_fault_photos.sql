-- Issue #13 follow-up: the S6 photo gap (BR2).
--
-- Before: S6 saved the fault, then linked its photos in a second request. If
-- the second request failed, the fault stayed saved with no photo, and nothing
-- in the database stopped a fault without a photo.
--
-- Now:
-- 1. faults_require_photo: a fault must have at least 1 "before" photo unless
--    it is marked "not safe" (no_photo_safe). The check runs at the end of the
--    transaction, so a fault and its photos can be saved together.
-- 2. submit_fault(): saves the fault and links its photos in ONE transaction.
--    Either everything is saved, or nothing is, so "Try again" is safe and
--    never makes a second fault.

-- 1. The rule ------------------------------------------------------------------------------------
-- Security invoker (not definer): everyone may read fault_photos, so the
-- resident's own rights already see the new fault's photo rows. This keeps the
-- list of security definer functions in 03_security_setup unchanged.
create function public.faults_require_photo()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not new.no_photo_safe
     and not exists (
       select 1 from public.fault_photos p
       where p.fault_id = new.id and p.kind = 'before'
     ) then
    raise exception 'photo_required'
      using errcode = 'check_violation',
            hint = 'BR2: add 1 to 3 photos, or mark the fault "not safe to take a photo".';
  end if;
  return null;
end;
$$;

revoke all on function public.faults_require_photo() from public, anon, authenticated;

create constraint trigger faults_require_photo
  after insert on public.faults
  deferrable initially deferred
  for each row execute function public.faults_require_photo();

-- 2. Saving a report in one go (S6) ---------------------------------------------------------------
-- Security invoker: it runs with the resident's own rights, so the column
-- grants, RLS policies and triggers on faults and fault_photos (BR1, BR2,
-- BR17, BR19, the 3-photo limit) all still apply. It cannot be used to get
-- around them.
create function public.submit_fault(
  p_id uuid,
  p_ward_id uuid,
  p_fault_type_id uuid,
  p_is_urgent boolean,
  p_no_photo_safe boolean,
  p_description text,
  p_street_address text,
  p_landmark text,
  p_latitude numeric,
  p_longitude numeric,
  p_photo_paths text[] default '{}'
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_reference text;
begin
  -- Wait with the photo rule until the photos below are added, even if the
  -- caller switched it to "immediate" earlier in the same transaction.
  set constraints public.faults_require_photo deferred;

  insert into public.faults (
    id, ward_id, fault_type_id, is_urgent, no_photo_safe,
    description, street_address, landmark, latitude, longitude
  )
  values (
    p_id, p_ward_id, p_fault_type_id, p_is_urgent, p_no_photo_safe,
    p_description, p_street_address, p_landmark, p_latitude, p_longitude
  )
  returning reference_number into saved_reference;

  insert into public.fault_photos (fault_id, kind, storage_path)
  select p_id, 'before', path
  from unnest(coalesce(p_photo_paths, '{}')) as path;

  -- Check the photo rule now instead of at commit, so the app gets a clear
  -- 'photo_required' error from this call.
  set constraints public.faults_require_photo immediate;

  return saved_reference;
end;
$$;

revoke all on function public.submit_fault(uuid, uuid, uuid, boolean, boolean, text, text, text, numeric, numeric, text[])
  from public, anon, authenticated;
grant execute on function public.submit_fault(uuid, uuid, uuid, boolean, boolean, text, text, text, numeric, numeric, text[])
  to authenticated;
