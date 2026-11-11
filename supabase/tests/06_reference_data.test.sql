-- PRD 10.4 reference data and 8.4 field teams, loaded by a migration.
begin;
create extension if not exists pgtap with schema extensions;

select plan(12);

select results_eq($$ select name, municipality from public.wards
    where name in ('Ward A: Orlando West', 'Ward B: Diepkloof', 'Ward C: Braamfontein') order by name $$,
  $$ values ('Ward A: Orlando West', 'City of Johannesburg'),
            ('Ward B: Diepkloof', 'City of Johannesburg'),
            ('Ward C: Braamfontein', 'City of Johannesburg') $$,
  'the 3 wards are loaded, all in the City of Johannesburg');

select is((select count(*)::int from public.fault_types), 34, '34 fault types are loaded');

select set_eq($$ select name from public.fault_types where category = 'roads' $$,
  array['Pothole', 'Sinkhole', 'Broken traffic light', 'Damaged or missing road sign',
        'Faded road markings', 'Blocked stormwater drain', 'Missing drain cover'],
  'roads fault types');
select set_eq($$ select name from public.fault_types where category = 'clean_water' $$,
  array['Burst clean water pipe', 'Leaking pipe', 'Leaking fire hydrant', 'No water',
        'Low water pressure', 'Dirty water'],
  'clean water fault types');
select set_eq($$ select name from public.fault_types where category = 'sewer' $$,
  array['Burst sewer pipe', 'Blocked manhole', 'Overflowing manhole', 'Missing manhole cover',
        'Sewage running in the street'],
  'sewer fault types');
select set_eq($$ select name from public.fault_types where category = 'electricity' $$,
  array['Faulty streetlight', 'Faulty high-mast light', 'Power outage', 'Open electricity box',
        'Fallen or exposed wires', 'Damaged pole', 'Cable theft', 'Illegal connection'],
  'electricity fault types');
select set_eq($$ select name from public.fault_types where category = 'waste' $$,
  array['Missed refuse collection', 'Illegal dumping', 'Overflowing public bin', 'Dead animal on public land'],
  'waste fault types');
select set_eq($$ select name from public.fault_types where category = 'public_spaces' $$,
  array['Overgrown park or verge', 'Fallen tree', 'Broken park equipment', 'Damaged public tap or toilet'],
  'public spaces fault types');

select set_eq($$ select name from public.fault_types where auto_urgent $$,
  array['Sinkhole', 'Broken traffic light', 'Missing drain cover', 'Burst clean water pipe',
        'Missing manhole cover', 'Open electricity box', 'Fallen or exposed wires'],
  'exactly the 7 fault types marked * in PRD 10.4 are auto urgent (BR19)');

select set_eq($$ select name, kind::text, category::text from public.field_teams
    where name in ('Municipal water team', 'Sample Plumbing Services (Pty) Ltd', 'Municipal sewer team',
                   'Municipal roads team', 'Sample Electrical Works (Pty) Ltd') $$,
  $$ values ('Municipal water team', 'municipal', 'clean_water'),
            ('Sample Plumbing Services (Pty) Ltd', 'contractor', 'clean_water'),
            ('Municipal sewer team', 'municipal', 'sewer'),
            ('Municipal roads team', 'municipal', 'roads'),
            ('Sample Electrical Works (Pty) Ltd', 'contractor', 'electricity') $$,
  'the 5 field teams from PRD 8.4 are loaded with their kind and category');

select is((select count(*)::int from public.wards), 3, 'only the 3 reference wards exist');
select is((select count(*)::int from public.field_teams), 5, 'only the 5 reference field teams exist');

select * from finish();
rollback;
