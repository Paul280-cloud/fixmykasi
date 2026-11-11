-- Core tables from PRD 10.1: wards, fault_types, field_teams and profiles.

-- Choice types -------------------------------------------------------------------
create type public.user_role as enum ('resident', 'ward_admin', 'field_team');
create type public.language_code as enum ('en', 'af', 'zu', 'nso');
create type public.fault_category as enum ('roads', 'clean_water', 'sewer', 'electricity', 'waste', 'public_spaces');
create type public.field_team_kind as enum ('municipal', 'contractor');

-- Ward: one ward the app covers ---------------------------------------------------
create table public.wards (
  id uuid primary key default gen_random_uuid(),
  municipality text not null default 'City of Johannesburg'
    constraint wards_municipality_length_check check (char_length(btrim(municipality)) between 1 and 60),
  name text not null
    constraint wards_name_key unique
    constraint wards_name_length_check check (char_length(btrim(name)) between 1 and 60),
  created_at timestamptz not null default now()
);
comment on table public.wards is 'Wards the app covers (PRD 10.1). Reference data, maintained by migrations only.';

-- FaultType: a kind of fault a resident can choose --------------------------------
create table public.fault_types (
  id uuid primary key default gen_random_uuid(),
  category public.fault_category not null,
  name text not null
    constraint fault_types_name_key unique
    constraint fault_types_name_length_check check (char_length(btrim(name)) between 1 and 60),
  auto_urgent boolean not null default false,
  created_at timestamptz not null default now()
);
comment on table public.fault_types is 'Fault types by category (PRD 10.1, 10.4). auto_urgent drives BR19.';

-- FieldTeam: a municipal team or contractor company ------------------------------
create table public.field_teams (
  id uuid primary key default gen_random_uuid(),
  name text not null
    constraint field_teams_name_key unique
    constraint field_teams_name_length_check check (char_length(btrim(name)) between 1 and 80),
  kind public.field_team_kind not null default 'municipal',
  category public.fault_category not null,
  contact_phone text
    constraint field_teams_contact_phone_format_check check (contact_phone ~ '^\+27[0-9]{9}$'),
  created_at timestamptz not null default now()
);
comment on table public.field_teams is 'Field teams that repair faults (PRD 10.1). contact_phone is for ward admins only (BR16).';
comment on column public.field_teams.contact_phone is 'Hidden from the app roles. Ward admins read it through public.field_team_contacts().';

-- Profile: one person with a login --------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null
    constraint profiles_full_name_length_check check (char_length(btrim(full_name)) between 2 and 60),
  email text not null
    constraint profiles_email_key unique
    constraint profiles_email_lowercase_check check (email = lower(email))
    constraint profiles_email_format_check check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone text
    constraint profiles_phone_format_check check (phone ~ '^\+27[0-9]{9}$'),
  role public.user_role not null default 'resident',
  ward_id uuid references public.wards (id) on delete restrict,
  field_team_id uuid references public.field_teams (id) on delete restrict,
  language public.language_code not null default 'en',
  is_18_or_older boolean not null default false,
  privacy_consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  -- Home ward for residents, managed ward for ward admins.
  constraint profiles_ward_required_check
    check (role not in ('resident', 'ward_admin') or ward_id is not null),
  constraint profiles_field_team_required_check
    check (role <> 'field_team' or field_team_id is not null),
  constraint profiles_resident_is_adult_check
    check (role <> 'resident' or is_18_or_older)
);
comment on table public.profiles is 'One row per login (PRD 10.1). Created by public.handle_new_user() on sign-up.';

-- One ward admin per ward.
create unique index profiles_one_ward_admin_per_ward
  on public.profiles (ward_id)
  where role = 'ward_admin';

-- Indexes for foreign keys used in joins and RLS checks.
create index profiles_ward_id_idx on public.profiles (ward_id);
create index profiles_field_team_id_idx on public.profiles (field_team_id);
