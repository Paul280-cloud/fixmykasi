-- Issue #11: the fault tables (PRD 10.1), their rules and Row-Level Security (PRD 11.4).
--
-- I copied the pattern from PR #29: create the tables with their checks, switch
-- RLS on, revoke everything Supabase grants by default, then grant back only
-- what the app needs. Tests: supabase/tests/07, 08 and 09.
--
-- What is in here:
--   faults, fault_photos, upvotes, status_changes (+ a small counter table for BR1)
--   faults_public view (the public columns, plus is_overdue for BR11)
--   triggers for BR1, BR5, BR9, BR17 and BR19
--   the "ward admins can read reporters in their ward" profile rule left over from #9
--
-- What is NOT in here (so nobody looks for it):
--   status changes after "received" (10.3) are #16, assigning is #18.
--   Until then nobody can update a fault from the app.

-- Types ----------------------------------------------------------------------------
create type public.fault_status as enum (
  'received', 'viewed', 'assigned', 'scheduled', 'in_progress', 'fixed', 'closed', 'reopened'
);
create type public.photo_kind as enum ('before', 'after');

-- Faults -----------------------------------------------------------------------------
create table public.faults (
  id uuid primary key default gen_random_uuid(),
  -- BR1: filled in by faults_before_insert(), never typed by a person.
  reference_number text not null
    constraint faults_reference_number_key unique
    constraint faults_reference_number_format_check check (reference_number ~ '^FMK-[0-9]{4}-[0-9]{5}$'),
  -- If the reporter deletes their account (M5) the fault stays, just anonymous.
  reporter_id uuid references public.profiles (id) on delete set null,
  ward_id uuid not null references public.wards (id) on delete restrict,
  fault_type_id uuid not null references public.fault_types (id) on delete restrict,
  is_urgent boolean not null default false,
  no_photo_safe boolean not null default false,
  description text not null,
  description_language text not null default 'en'
    constraint faults_description_language_check check (description_language in ('en', 'af', 'zu', 'nso', 'other')),
  description_en text
    constraint faults_description_en_length_check check (char_length(description_en) <= 1000),
  street_address text not null
    constraint faults_street_address_length_check check (char_length(btrim(street_address)) between 5 and 120),
  landmark text
    constraint faults_landmark_length_check check (char_length(landmark) <= 60),
  -- South Africa only (BR3).
  latitude numeric(9, 6)
    constraint faults_latitude_range_check check (latitude between -35 and -22),
  longitude numeric(9, 6)
    constraint faults_longitude_range_check check (longitude between 16 and 33),
  status public.fault_status not null default 'received',
  field_team_id uuid references public.field_teams (id) on delete restrict,
  due_date date,
  estimated_days integer
    constraint faults_estimated_days_range_check check (estimated_days between 1 and 90),
  municipal_reference text
    constraint faults_municipal_reference_length_check check (char_length(municipal_reference) <= 30),
  is_delayed boolean not null default false,
  delay_reason text
    constraint faults_delay_reason_length_check check (char_length(btrim(delay_reason)) between 10 and 200),
  reopen_count integer not null default 0
    constraint faults_reopen_count_range_check check (reopen_count between 0 and 2),
  upvote_count integer not null default 0
    constraint faults_upvote_count_check check (upvote_count >= 0),
  viewed_at timestamptz,
  assigned_at timestamptz,
  fixed_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- BR17 + BR2: 10 to 500 characters, or 30 to 500 when it was not safe to take a photo.
  constraint faults_description_length_check check (
    char_length(btrim(description)) between (case when no_photo_safe then 30 else 10 end) and 500
  ),
  -- A GPS point needs both halves.
  constraint faults_gps_pair_check check ((latitude is null) = (longitude is null))
);

-- The lists in S4 and S8 filter on these.
create index faults_ward_status_idx on public.faults (ward_id, status);
create index faults_reporter_created_idx on public.faults (reporter_id, created_at);
create index faults_field_team_idx on public.faults (field_team_id);

-- BR1 counter: one row per year, so numbering starts again at 00001 every January.
create table public.fault_reference_counters (
  year integer primary key,
  last_number integer not null default 0
);

-- Photos -----------------------------------------------------------------------------
-- The file itself lives in the fault-photos bucket (#14). Here I only keep its
-- path, for example before/<uuid>.jpg, and which fault it belongs to.
create table public.fault_photos (
  id uuid primary key default gen_random_uuid(),
  fault_id uuid not null references public.faults (id) on delete cascade,
  kind public.photo_kind not null default 'before',
  storage_path text not null
    constraint fault_photos_storage_path_key unique,
  uploaded_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),

  -- The path must sit in the folder that matches the kind, and be a JPG or PNG
  -- (decision #3 in the plan). This lines up with #14's storage policies.
  constraint fault_photos_path_matches_kind_check check (
    storage_path ~ ('^' || kind::text || '/[A-Za-z0-9-]+\.(jpg|jpeg|png)$')
  )
);

create index fault_photos_fault_idx on public.fault_photos (fault_id, kind);

-- Upvotes ----------------------------------------------------------------------------
create table public.upvotes (
  id uuid primary key default gen_random_uuid(),
  fault_id uuid not null references public.faults (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- BR5: one upvote per resident per fault.
  constraint upvotes_fault_user_key unique (fault_id, user_id)
);

-- Status history (the timeline on S5) --------------------------------------------------
create table public.status_changes (
  id uuid primary key default gen_random_uuid(),
  fault_id uuid not null references public.faults (id) on delete cascade,
  from_status public.fault_status,
  to_status public.fault_status not null,
  changed_by uuid references public.profiles (id) on delete set null,
  note text
    constraint status_changes_note_length_check check (char_length(note) <= 200),
  created_at timestamptz not null default now()
);

create index status_changes_fault_idx on public.status_changes (fault_id, created_at);

-- Helper: how am I connected to this fault? ----------------------------------------------
-- Policies need to know if the logged-in user is the fault's reporter, its ward
-- admin or its field team. reporter_id is hidden from app users (BR16), so a
-- normal policy cannot even look at it. This function can, but it only ever
-- answers about the person calling it, so it leaks nothing.
create function public.fault_role(p_fault_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when f.reporter_id = me.id then 'reporter'
    when me.role = 'ward_admin' and me.ward_id = f.ward_id then 'ward_admin'
    when me.role = 'field_team' and me.field_team_id = f.field_team_id then 'field_team'
  end
  from public.faults f
  join public.profiles me on me.id = (select auth.uid())
  where f.id = p_fault_id;
$$;

revoke all on function public.fault_role(uuid) from public, anon, authenticated;
grant execute on function public.fault_role(uuid) to authenticated;

-- Helper: is this person a reporter in my ward? (for ward admins, PRD 11.4 Profile Read)
create function public.is_reporter_in_my_ward(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.faults f
    join public.profiles me on me.id = (select auth.uid())
    where f.reporter_id = p_profile_id
      and me.role = 'ward_admin'
      and f.ward_id = me.ward_id
  );
$$;

revoke all on function public.is_reporter_in_my_ward(uuid) from public, anon, authenticated;
grant execute on function public.is_reporter_in_my_ward(uuid) to authenticated;

-- Trigger: before a fault is saved (BR1, BR17, BR19) ---------------------------------------
-- Security definer because it writes the counter table and counts the
-- resident's own faults, and app users can do neither directly.
create function public.faults_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  this_year integer := extract(year from now() at time zone 'Africa/Johannesburg')::integer;
  next_number integer;
begin
  if me is not null then
    -- A real person from the app. They only send the S6 fields (column grants),
    -- but I set these anyway so the rules are in one place.
    new.reporter_id := me;
    new.status := 'received';
    new.upvote_count := 0;
    new.reopen_count := 0;

    -- Default to the reporter's home ward (BR3) if the app did not send one.
    if new.ward_id is null then
      select p.ward_id into new.ward_id from public.profiles p where p.id = me;
    end if;

    -- BR17: at most 5 faults in 24 hours. The app shows its own friendly message
    -- when it sees 'too_many_reports'.
    if (select count(*) from public.faults f
        where f.reporter_id = me and f.created_at > now() - interval '24 hours') >= 5 then
      raise exception 'too_many_reports'
        using hint = 'BR17: a resident can report at most 5 faults in 24 hours.';
    end if;
  end if;

  -- BR19: some fault types are always urgent, whatever the resident ticked.
  if exists (select 1 from public.fault_types t where t.id = new.fault_type_id and t.auto_urgent) then
    new.is_urgent := true;
  end if;

  -- BR1: FMK-YYYY-NNNNN. The upsert locks this year's counter row, so two people
  -- reporting at the same second still get different numbers.
  if new.reference_number is null then
    insert into public.fault_reference_counters as c (year, last_number)
    values (this_year, 1)
    on conflict (year) do update set last_number = c.last_number + 1
    returning c.last_number into next_number;

    new.reference_number := 'FMK-' || this_year || '-' || lpad(next_number::text, 5, '0');
  end if;

  return new;
end;
$$;

revoke all on function public.faults_before_insert() from public, anon, authenticated;

create trigger faults_before_insert
  before insert on public.faults
  for each row execute function public.faults_before_insert();

-- Trigger: after a fault is saved, start its timeline (BR9) ---------------------------------
-- Security definer because nobody may write status_changes from the app.
-- #16 adds the same kind of row for every later status change.
create function public.faults_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.status_changes (fault_id, from_status, to_status, changed_by)
  values (new.id, null, new.status, new.reporter_id);
  return null;
end;
$$;

revoke all on function public.faults_after_insert() from public, anon, authenticated;

create trigger faults_after_insert
  after insert on public.faults
  for each row execute function public.faults_after_insert();

-- Trigger: keep upvote_count in step (BR5) ----------------------------------------------------
-- Security definer because residents have no UPDATE rights on faults.
create function public.sync_upvote_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.faults set upvote_count = upvote_count + 1 where id = new.fault_id;
  else
    update public.faults set upvote_count = greatest(upvote_count - 1, 0) where id = old.fault_id;
  end if;
  return null;
end;
$$;

revoke all on function public.sync_upvote_count() from public, anon, authenticated;

create trigger upvotes_sync_count
  after insert or delete on public.upvotes
  for each row execute function public.sync_upvote_count();

-- Row-Level Security ------------------------------------------------------------------------
alter table public.faults enable row level security;
alter table public.fault_reference_counters enable row level security;
alter table public.fault_photos enable row level security;
alter table public.upvotes enable row level security;
alter table public.status_changes enable row level security;

revoke all on table public.faults, public.fault_reference_counters, public.fault_photos,
  public.upvotes, public.status_changes
  from anon, authenticated;

-- fault_reference_counters: no grants and no policies. Only the trigger touches it.

-- Faults: read --------------------------------------------------------------------------------
-- Everyone can read every fault, but only these columns. reporter_id and
-- municipal_reference are never granted (BR16), so even select * fails.
-- Tip for the screens: always list the columns, or use faults_public.
grant select (
  id, reference_number, ward_id, fault_type_id, is_urgent, no_photo_safe,
  description, description_language, description_en, street_address, landmark,
  latitude, longitude, status, field_team_id, due_date, estimated_days,
  is_delayed, delay_reason, reopen_count, upvote_count,
  viewed_at, assigned_at, fixed_at, closed_at, created_at, updated_at
) on public.faults to anon, authenticated;

create policy "Anyone can read faults"
  on public.faults for select
  to anon, authenticated
  using (true);

-- Faults: create (S6) -------------------------------------------------------------------------
-- id is allowed so the app can make the id first and upload photos (decision #8).
grant insert (
  id, ward_id, fault_type_id, is_urgent, no_photo_safe, description, description_language,
  street_address, landmark, latitude, longitude
) on public.faults to authenticated;

-- Only residents report, and only as themselves. Email confirmation is switched
-- on in the hosted project, so a resident with a session is already verified.
create policy "Residents can report faults"
  on public.faults for insert
  to authenticated
  with check (
    reporter_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'resident'
    )
  );

-- Faults: no UPDATE or DELETE grants. Status changes come with #16 (10.3), and
-- nobody deletes a fault from the app (PRD 11.4).

-- Fault photos ----------------------------------------------------------------------------------
grant select on public.fault_photos to anon, authenticated;
grant insert (fault_id, kind, storage_path) on public.fault_photos to authenticated;

create policy "Anyone can read fault photos"
  on public.fault_photos for select
  to anon, authenticated
  using (true);

-- Before photos: only the reporter, only while they are reporting it (within an
-- hour of saving), never when they ticked "not safe" (BR2), and at most 3.
-- After photos: only the fault's field team, at most 3 (F6, #25).
create policy "Reporters add before photos, field teams add after photos"
  on public.fault_photos for insert
  to authenticated
  with check (
    uploaded_by = (select auth.uid())
    and (
      (
        kind = 'before'
        and public.fault_role(fault_id) = 'reporter'
        and exists (
          select 1 from public.faults f
          where f.id = fault_id
            and not f.no_photo_safe
            and f.created_at > now() - interval '1 hour'
        )
      )
      or (
        kind = 'after'
        and public.fault_role(fault_id) = 'field_team'
      )
    )
    and (
      select count(*) from public.fault_photos p
      where p.fault_id = fault_photos.fault_id and p.kind = fault_photos.kind
    ) < 3
  );

-- No UPDATE or DELETE on photos from the app.

-- Trigger: at most 3 photos per kind, even in one insert -------------------------------------
-- The policy above counts the photos that were already saved, but it cannot see
-- the other rows of the same insert. So one insert with 5 rows got through. This
-- row trigger runs once per photo and does see the rows before it, so the 4th
-- photo is always refused. Found while testing Bafana's S6 (#48).
create function public.fault_photos_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.fault_photos p
      where p.fault_id = new.fault_id and p.kind = new.kind) >= 3 then
    raise exception 'too_many_photos'
      using hint = 'BR2 and F6: at most 3 before photos and 3 after photos per fault.';
  end if;
  return new;
end;
$$;

revoke all on function public.fault_photos_limit() from public, anon, authenticated;

create trigger fault_photos_limit
  before insert on public.fault_photos
  for each row execute function public.fault_photos_limit();

-- Upvotes ---------------------------------------------------------------------------------------
-- Visitors see counts through faults.upvote_count, not the upvote rows.
grant select, delete on public.upvotes to authenticated;
grant insert (fault_id) on public.upvotes to authenticated;

create policy "Residents read their own upvotes"
  on public.upvotes for select
  to authenticated
  using (user_id = (select auth.uid()));

-- BR5: residents only, not on their own fault, not on a Closed fault.
create policy "Residents upvote other people's open faults"
  on public.upvotes for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'resident'
    )
    and public.fault_role(fault_id) is distinct from 'reporter'
    and exists (
      select 1 from public.faults f
      where f.id = fault_id and f.status <> 'closed'
    )
  );

create policy "Residents remove their own upvotes"
  on public.upvotes for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Status changes ---------------------------------------------------------------------------------
-- Everyone reads the timeline. Only the triggers write it.
grant select on public.status_changes to anon, authenticated;

create policy "Anyone can read status history"
  on public.status_changes for select
  to anon, authenticated
  using (true);

-- Profiles: the follow-up from #9 -------------------------------------------------------------------
create policy "Ward admins read reporters in their ward"
  on public.profiles for select
  to authenticated
  using (public.is_reporter_in_my_ward(id));

-- Public view ---------------------------------------------------------------------------------------
-- security_invoker means the view runs with the caller's rights, so RLS and the
-- column grants above still apply. It cannot be used to get around them.
-- is_overdue is BR11: worked out on read in SAST, never stored.
create view public.faults_public
with (security_invoker = true)
as
select
  f.id, f.reference_number, f.ward_id, f.fault_type_id, f.is_urgent, f.no_photo_safe,
  f.description, f.description_language, f.description_en, f.street_address, f.landmark,
  f.latitude, f.longitude, f.status, f.field_team_id, f.due_date, f.estimated_days,
  f.is_delayed, f.delay_reason, f.reopen_count, f.upvote_count,
  f.viewed_at, f.assigned_at, f.fixed_at, f.closed_at, f.created_at, f.updated_at,
  (
    f.due_date is not null
    and f.status not in ('fixed', 'closed')
    and f.due_date < (now() at time zone 'Africa/Johannesburg')::date
  ) as is_overdue
from public.faults f;

revoke all on public.faults_public from anon, authenticated;
grant select on public.faults_public to anon, authenticated;
