-- Triggers on profiles: create a profile on sign-up, and stop staff from
-- moving themselves to another ward.

-- handle_new_user ------------------------------------------------------------------
-- Runs when Supabase Auth inserts a new login. Security definer because the
-- auth service (supabase_auth_admin) has no rights on public.profiles.
-- It is the only security definer function apart from field_team_contacts().
-- role is never read from the sign-up data, so it always gets the default
-- 'resident' (PRD 5, 11.4). Staff roles are set afterwards by the admin.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (
    id, full_name, email, phone, ward_id, language, is_18_or_older, privacy_consent_at
  ) values (
    new.id,
    btrim(coalesce(meta ->> 'full_name', '')),
    lower(new.email),
    -- S2 shows "+27 82 123 4567", so spaces are removed before saving.
    nullif(regexp_replace(coalesce(meta ->> 'phone', ''), '[[:space:]]', '', 'g'), ''),
    nullif(meta ->> 'ward_id', '')::uuid,
    coalesce(nullif(meta ->> 'language', ''), 'en')::public.language_code,
    coalesce((meta ->> 'is_18_or_older')::boolean, false),
    -- S2 cannot be submitted without ticking the Privacy Notice box.
    now()
  );
  -- profiles_resident_is_adult_check and profiles_ward_required_check reject
  -- under-18 sign-ups and sign-ups without a home ward, which also cancels
  -- the login insert.
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- guard_profile_update -------------------------------------------------------------
-- Column grants let a user update ward_id because residents may change their
-- home ward (S11). PRD 11.4 says ward admins may not change theirs, and field
-- team members have no ward to manage, so only residents may change ward_id
-- from the app. The admin (postgres / service_role) is not limited.
create function public.guard_profile_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated')
     and old.role <> 'resident'
     and new.ward_id is distinct from old.ward_id then
    raise exception 'Only residents can change their ward. Ask the admin to move a staff account.'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

revoke execute on function public.guard_profile_update() from public, anon, authenticated;

create trigger guard_profile_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();
