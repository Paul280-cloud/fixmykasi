-- Row-Level Security and grants for PRD 2.4 and 11.4.
--
-- Supabase gives anon and authenticated ALL privileges on new tables in public
-- by default. Remove them first, then grant only what the app needs.

alter table public.profiles enable row level security;
alter table public.wards enable row level security;
alter table public.fault_types enable row level security;
alter table public.field_teams enable row level security;

revoke all on table public.profiles, public.wards, public.fault_types, public.field_teams
  from anon, authenticated;

-- Profiles ---------------------------------------------------------------------------
-- No INSERT: profiles are only made by handle_new_user().
-- UPDATE only on the columns a user may edit on S11. role, email, field_team_id,
-- is_18_or_older and privacy_consent_at are never updatable from the app.
-- ward_id is limited to residents by the guard_profile_update trigger.
grant select, delete on public.profiles to authenticated;
grant update (full_name, phone, language, ward_id) on public.profiles to authenticated;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

-- Follow-up for Issue #11: "Ward admins can read profiles of reporters in their
-- ward" needs the faults table, so it is added there.

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Residents can delete their own profile"
  on public.profiles for delete
  to authenticated
  using (id = (select auth.uid()) and role = 'resident');

-- Wards and fault types: everyone reads, nobody writes from the app ------------------
grant select on public.wards, public.fault_types to anon, authenticated;

create policy "Anyone can read wards"
  on public.wards for select
  to anon, authenticated
  using (true);

create policy "Anyone can read fault types"
  on public.fault_types for select
  to anon, authenticated
  using (true);

-- Field teams: everyone reads every column except contact_phone -----------------------
-- Column grants hide contact_phone from anon and authenticated. Because grants
-- belong to database roles, not app roles, ward admins (who are also
-- "authenticated") read it through field_team_contacts() below.
-- Note: select * on field_teams fails for app roles; list the columns.
grant select (id, name, kind, category, created_at) on public.field_teams to anon, authenticated;

create policy "Anyone can read field teams"
  on public.field_teams for select
  to anon, authenticated
  using (true);

-- field_team_contacts ------------------------------------------------------------------
-- Security definer so it can read contact_phone, which the caller cannot.
-- It first checks that the caller is a ward admin (BR16) and raises an error
-- for everyone else. search_path is empty and every name is schema-qualified.
create function public.field_team_contacts()
returns table (field_team_id uuid, contact_phone text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'ward_admin'
  ) then
    raise exception 'Only ward admins can see field team contact numbers.'
      using errcode = 'insufficient_privilege';
  end if;

  return query
    select ft.id, ft.contact_phone
    from public.field_teams ft
    order by ft.name;
end;
$$;

revoke execute on function public.field_team_contacts() from public, anon;
grant execute on function public.field_team_contacts() to authenticated;
