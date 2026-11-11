# Seed data

Sample users from PRD 8.4 for the **local** Supabase stack. All people are fictional.

| File | What it does |
| --- | --- |
| `../seed.sql` | Runs on `npx supabase db reset`. Creates the 6 logins (emails already confirmed). The sign-up trigger makes their profiles, then the script makes Zanele ward admin of Ward A and Kagiso a member of Sample Plumbing Services (Pty) Ltd. No passwords. |
| `seed.js` | Sets the test passwords from PRD 10.4 through the Auth admin API, so passwords never appear in SQL. |

Wards, fault types and field teams are reference data, so they live in a migration (`../migrations/*_reference_data.sql`), not here.

## Run it

```bash
npx supabase db reset                       # migrations + seed.sql
node --env-file=.env supabase/seed/seed.js  # test passwords
```

`.env` needs `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (see `.env.example`). For the local stack, `npx supabase status` prints both. The script refuses to run against anything except `127.0.0.1` or `localhost` unless `SEED_ALLOW_REMOTE=true` is set.

## Test logins

Test-only passwords from PRD 10.4, never real ones.

| Role | Email | Password |
| --- | --- | --- |
| Resident (Ward A) | thandeka.m@example.com | TestResident1 |
| Resident (Ward A, empty states) | nomsa.s@example.com | TestResident2 |
| Ward admin (Ward A) | zanele.k@example.com | TestWardAdmin1 |
| Field team (Sample Plumbing Services) | kagiso.m@example.com | TestFieldTeam1 |

Lerato Dlamini (Ward B) and Johan Botha (Ward C) are seeded as reporters for the sample faults. PRD 10.4 gives them no password, so they cannot log in.
