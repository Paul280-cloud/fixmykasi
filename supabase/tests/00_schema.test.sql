-- PRD 10.1: tables, columns, types, null rules, defaults, keys and constraints
-- for profiles, wards, fault_types and field_teams.
begin;
create extension if not exists pgtap with schema extensions;

select plan(99);

-- Choice types ---------------------------------------------------------------
select has_enum('public', 'user_role', 'user_role enum exists');
select enum_has_labels('public', 'user_role', array['resident', 'ward_admin', 'field_team'], 'user_role values');
select has_enum('public', 'language_code', 'language_code enum exists');
select enum_has_labels('public', 'language_code', array['en', 'af', 'zu', 'nso'], 'language_code values (BR18)');
select has_enum('public', 'fault_category', 'fault_category enum exists');
select enum_has_labels('public', 'fault_category',
  array['roads', 'clean_water', 'sewer', 'electricity', 'waste', 'public_spaces'], 'fault_category values');
select has_enum('public', 'field_team_kind', 'field_team_kind enum exists');
select enum_has_labels('public', 'field_team_kind', array['municipal', 'contractor'], 'field_team_kind values');

-- wards ----------------------------------------------------------------------
select has_table('public', 'wards', 'wards table exists');
select columns_are('public', 'wards', array['id', 'municipality', 'name', 'created_at'], 'wards has exactly the PRD columns');
select col_is_pk('public', 'wards', 'id', 'wards.id is the primary key');
select col_type_is('public', 'wards', 'id', 'uuid', 'wards.id is uuid');
select col_default_is('public', 'wards', 'id', 'gen_random_uuid()', 'wards.id is generated');
select col_type_is('public', 'wards', 'municipality', 'text', 'wards.municipality is text');
select col_not_null('public', 'wards', 'municipality', 'wards.municipality is required');
select col_default_is('public', 'wards', 'municipality', 'City of Johannesburg', 'wards.municipality defaults to City of Johannesburg');
select col_type_is('public', 'wards', 'name', 'text', 'wards.name is text');
select col_not_null('public', 'wards', 'name', 'wards.name is required');
select col_is_unique('public', 'wards', 'name', 'wards.name is unique');
select col_type_is('public', 'wards', 'created_at', 'timestamp with time zone', 'wards.created_at is timestamptz');
select col_not_null('public', 'wards', 'created_at', 'wards.created_at is required');
select col_default_is('public', 'wards', 'created_at', 'now()', 'wards.created_at defaults to now()');

-- fault_types ----------------------------------------------------------------
select has_table('public', 'fault_types', 'fault_types table exists');
select columns_are('public', 'fault_types', array['id', 'category', 'name', 'auto_urgent', 'created_at'], 'fault_types has exactly the PRD columns');
select col_is_pk('public', 'fault_types', 'id', 'fault_types.id is the primary key');
select col_type_is('public', 'fault_types', 'id', 'uuid', 'fault_types.id is uuid');
select col_default_is('public', 'fault_types', 'id', 'gen_random_uuid()', 'fault_types.id is generated');
select col_type_is('public', 'fault_types', 'category', 'fault_category', 'fault_types.category is fault_category');
select col_not_null('public', 'fault_types', 'category', 'fault_types.category is required');
select col_hasnt_default('public', 'fault_types', 'category', 'fault_types.category has no default');
select col_type_is('public', 'fault_types', 'name', 'text', 'fault_types.name is text');
select col_not_null('public', 'fault_types', 'name', 'fault_types.name is required');
select col_is_unique('public', 'fault_types', 'name', 'fault_types.name is unique');
select col_type_is('public', 'fault_types', 'auto_urgent', 'boolean', 'fault_types.auto_urgent is boolean');
select col_not_null('public', 'fault_types', 'auto_urgent', 'fault_types.auto_urgent is required');
select col_default_is('public', 'fault_types', 'auto_urgent', 'false', 'fault_types.auto_urgent defaults to false');
select col_type_is('public', 'fault_types', 'created_at', 'timestamp with time zone', 'fault_types.created_at is timestamptz');
select col_not_null('public', 'fault_types', 'created_at', 'fault_types.created_at is required');
select col_default_is('public', 'fault_types', 'created_at', 'now()', 'fault_types.created_at defaults to now()');

-- field_teams ----------------------------------------------------------------
select has_table('public', 'field_teams', 'field_teams table exists');
select columns_are('public', 'field_teams', array['id', 'name', 'kind', 'category', 'contact_phone', 'created_at'], 'field_teams has exactly the PRD columns');
select col_is_pk('public', 'field_teams', 'id', 'field_teams.id is the primary key');
select col_type_is('public', 'field_teams', 'id', 'uuid', 'field_teams.id is uuid');
select col_default_is('public', 'field_teams', 'id', 'gen_random_uuid()', 'field_teams.id is generated');
select col_type_is('public', 'field_teams', 'name', 'text', 'field_teams.name is text');
select col_not_null('public', 'field_teams', 'name', 'field_teams.name is required');
select col_is_unique('public', 'field_teams', 'name', 'field_teams.name is unique');
select col_type_is('public', 'field_teams', 'kind', 'field_team_kind', 'field_teams.kind is field_team_kind');
select col_not_null('public', 'field_teams', 'kind', 'field_teams.kind is required');
select col_default_is('public', 'field_teams', 'kind', 'municipal', 'field_teams.kind defaults to municipal');
select col_type_is('public', 'field_teams', 'category', 'fault_category', 'field_teams.category is fault_category');
select col_not_null('public', 'field_teams', 'category', 'field_teams.category is required');
select col_type_is('public', 'field_teams', 'contact_phone', 'text', 'field_teams.contact_phone is text');
select col_is_null('public', 'field_teams', 'contact_phone', 'field_teams.contact_phone is optional');
select col_type_is('public', 'field_teams', 'created_at', 'timestamp with time zone', 'field_teams.created_at is timestamptz');
select col_not_null('public', 'field_teams', 'created_at', 'field_teams.created_at is required');
select col_default_is('public', 'field_teams', 'created_at', 'now()', 'field_teams.created_at defaults to now()');

-- profiles -------------------------------------------------------------------
select has_table('public', 'profiles', 'profiles table exists');
select columns_are('public', 'profiles', array[
  'id', 'full_name', 'email', 'phone', 'role', 'ward_id', 'field_team_id',
  'language', 'is_18_or_older', 'privacy_consent_at', 'created_at'
], 'profiles has exactly the PRD columns');
select col_is_pk('public', 'profiles', 'id', 'profiles.id is the primary key');
select col_type_is('public', 'profiles', 'id', 'uuid', 'profiles.id is uuid');
select col_hasnt_default('public', 'profiles', 'id', 'profiles.id has no default (it is the auth user id)');
select fk_ok('public', 'profiles', 'id', 'auth', 'users', 'id', 'profiles.id references auth.users');
select col_type_is('public', 'profiles', 'full_name', 'text', 'profiles.full_name is text');
select col_not_null('public', 'profiles', 'full_name', 'profiles.full_name is required');
select col_type_is('public', 'profiles', 'email', 'text', 'profiles.email is text');
select col_not_null('public', 'profiles', 'email', 'profiles.email is required');
select col_is_unique('public', 'profiles', 'email', 'profiles.email is unique');
select col_type_is('public', 'profiles', 'phone', 'text', 'profiles.phone is text');
select col_is_null('public', 'profiles', 'phone', 'profiles.phone is optional');
select col_type_is('public', 'profiles', 'role', 'user_role', 'profiles.role is user_role');
select col_not_null('public', 'profiles', 'role', 'profiles.role is required');
select col_default_is('public', 'profiles', 'role', 'resident', 'profiles.role defaults to resident');
select col_type_is('public', 'profiles', 'ward_id', 'uuid', 'profiles.ward_id is uuid');
select col_is_null('public', 'profiles', 'ward_id', 'profiles.ward_id is nullable (required by role check)');
select fk_ok('public', 'profiles', 'ward_id', 'public', 'wards', 'id', 'profiles.ward_id references wards');
select col_type_is('public', 'profiles', 'field_team_id', 'uuid', 'profiles.field_team_id is uuid');
select col_is_null('public', 'profiles', 'field_team_id', 'profiles.field_team_id is nullable (required by role check)');
select fk_ok('public', 'profiles', 'field_team_id', 'public', 'field_teams', 'id', 'profiles.field_team_id references field_teams');
select col_type_is('public', 'profiles', 'language', 'language_code', 'profiles.language is language_code');
select col_not_null('public', 'profiles', 'language', 'profiles.language is required');
select col_default_is('public', 'profiles', 'language', 'en', 'profiles.language defaults to en');
select col_type_is('public', 'profiles', 'is_18_or_older', 'boolean', 'profiles.is_18_or_older is boolean');
select col_not_null('public', 'profiles', 'is_18_or_older', 'profiles.is_18_or_older is required');
select col_default_is('public', 'profiles', 'is_18_or_older', 'false', 'profiles.is_18_or_older defaults to false');
select col_type_is('public', 'profiles', 'privacy_consent_at', 'timestamp with time zone', 'profiles.privacy_consent_at is timestamptz');
select col_not_null('public', 'profiles', 'privacy_consent_at', 'profiles.privacy_consent_at is required');
select col_default_is('public', 'profiles', 'privacy_consent_at', 'now()', 'profiles.privacy_consent_at defaults to now()');
select col_type_is('public', 'profiles', 'created_at', 'timestamp with time zone', 'profiles.created_at is timestamptz');
select col_not_null('public', 'profiles', 'created_at', 'profiles.created_at is required');
select col_default_is('public', 'profiles', 'created_at', 'now()', 'profiles.created_at defaults to now()');

-- Foreign key delete rules (PRD 10.1 "If the linked record is deleted") ------
select is(
  (select confdeltype from pg_constraint where conrelid = 'public.profiles'::regclass and contype = 'f'
     and conkey = array[(select attnum from pg_attribute where attrelid = 'public.profiles'::regclass and attname = 'id')]),
  'c'::"char", 'deleting the login deletes the profile (on delete cascade)');
select is(
  (select confdeltype from pg_constraint where conrelid = 'public.profiles'::regclass and contype = 'f'
     and conkey = array[(select attnum from pg_attribute where attrelid = 'public.profiles'::regclass and attname = 'ward_id')]),
  'r'::"char", 'deleting a ward with profiles is blocked (on delete restrict)');
select is(
  (select confdeltype from pg_constraint where conrelid = 'public.profiles'::regclass and contype = 'f'
     and conkey = array[(select attnum from pg_attribute where attrelid = 'public.profiles'::regclass and attname = 'field_team_id')]),
  'r'::"char", 'deleting a field team with profiles is blocked (on delete restrict)');

-- One ward admin per ward: partial unique index ------------------------------
select has_index('public', 'profiles', 'profiles_one_ward_admin_per_ward', 'partial unique index for one ward admin per ward exists');
select ok(
  (select indisunique and indpred is not null from pg_index
     where indexrelid = 'public.profiles_one_ward_admin_per_ward'::regclass),
  'profiles_one_ward_admin_per_ward is unique and partial');

-- Named check constraints --------------------------------------------------
select ok(exists(select 1 from pg_constraint where conrelid = 'public.profiles'::regclass and conname = 'profiles_ward_required_check'),
  'profiles_ward_required_check exists');
select ok(exists(select 1 from pg_constraint where conrelid = 'public.profiles'::regclass and conname = 'profiles_field_team_required_check'),
  'profiles_field_team_required_check exists');
select ok(exists(select 1 from pg_constraint where conrelid = 'public.profiles'::regclass and conname = 'profiles_resident_is_adult_check'),
  'profiles_resident_is_adult_check exists');

select * from finish();
rollback;
