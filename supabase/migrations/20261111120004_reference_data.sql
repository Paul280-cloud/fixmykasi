-- Reference data from PRD 10.4 and 8.4. Change it only through a PR with a new migration.

insert into public.wards (name) values
  ('Ward A: Orlando West'),
  ('Ward B: Diepkloof'),
  ('Ward C: Braamfontein');

-- auto_urgent = true for the fault types marked * in PRD 10.4 (BR19).
insert into public.fault_types (category, name, auto_urgent) values
  ('roads', 'Pothole', false),
  ('roads', 'Sinkhole', true),
  ('roads', 'Broken traffic light', true),
  ('roads', 'Damaged or missing road sign', false),
  ('roads', 'Faded road markings', false),
  ('roads', 'Blocked stormwater drain', false),
  ('roads', 'Missing drain cover', true),

  ('clean_water', 'Burst clean water pipe', true),
  ('clean_water', 'Leaking pipe', false),
  ('clean_water', 'Leaking fire hydrant', false),
  ('clean_water', 'No water', false),
  ('clean_water', 'Low water pressure', false),
  ('clean_water', 'Dirty water', false),

  ('sewer', 'Burst sewer pipe', false),
  ('sewer', 'Blocked manhole', false),
  ('sewer', 'Overflowing manhole', false),
  ('sewer', 'Missing manhole cover', true),
  ('sewer', 'Sewage running in the street', false),

  ('electricity', 'Faulty streetlight', false),
  ('electricity', 'Faulty high-mast light', false),
  ('electricity', 'Power outage', false),
  ('electricity', 'Open electricity box', true),
  ('electricity', 'Fallen or exposed wires', true),
  ('electricity', 'Damaged pole', false),
  ('electricity', 'Cable theft', false),
  ('electricity', 'Illegal connection', false),

  ('waste', 'Missed refuse collection', false),
  ('waste', 'Illegal dumping', false),
  ('waste', 'Overflowing public bin', false),
  ('waste', 'Dead animal on public land', false),

  ('public_spaces', 'Overgrown park or verge', false),
  ('public_spaces', 'Fallen tree', false),
  ('public_spaces', 'Broken park equipment', false),
  ('public_spaces', 'Damaged public tap or toilet', false);

-- Field teams from PRD 8.4. contact_phone is left empty: the PRD gives no
-- numbers, and the admin adds them in the Supabase dashboard.
insert into public.field_teams (name, kind, category) values
  ('Municipal water team', 'municipal', 'clean_water'),
  ('Sample Plumbing Services (Pty) Ltd', 'contractor', 'clean_water'),
  ('Municipal sewer team', 'municipal', 'sewer'),
  ('Municipal roads team', 'municipal', 'roads'),
  ('Sample Electrical Works (Pty) Ltd', 'contractor', 'electricity');
