# FixMyKasi: Implementation Plan

**Built from PRD version v0.4** ([docs/PRD.md](docs/PRD.md)) · **Plan version v1.1** · Team Grok · Last updated 11 Nov 2026

This is the build plan the team and our AI coding assistants follow, phase by phase. It follows Section 14, Step 2 of the course PRD template. The course names this file `IMPLEMENTATION_PLAN.md` instead of `MASTER.md`. Every ID (F#, US#, S#, M#, BR#, T-) comes from the PRD, and nothing is added that is not in the PRD.

**How to use it:** pick your Issue on the [board](https://github.com/users/Paul280-cloud/projects/1), read the matching phase below and the PRD sections it points to, build it on your own branch with tests first, and tick the Definition of Done in your PR.

## Clarifications needed

The PRD's own open questions (13.3) were all answered in v0.3. The questions below were found while planning. **Answered** rows are decisions to build to. **Open** rows block the phase in the "Blocks" column until the human answers them; other phases may go ahead.

**Answered decisions**

| # | Question | Where | Blocks | Answer | Status |
| --- | --- | --- | --- | --- | --- |
| 2 | The app needs `@supabase/supabase-js` to talk to Supabase, and PRD 9.1 names Lucide icons, but neither package is in the PRD stack table or `package.json`. May they be added? | PRD 9.1, 11.1, 11.3 |  | Yes. `@supabase/supabase-js` (v2) and `lucide-react` are approved and added to the stack (Section 2). Decided by the human, 11 Nov 2026. | Answered |
| 3 | BR2 allows HEIC photos and requires the browser to resize, compress and strip EXIF. Only Safari can decode HEIC natively; Chrome on Android cannot draw HEIC to a canvas. Should we add a HEIC-decoding library (which one), or accept HEIC only where the browser can decode it? | BR2, S6, M3, US3 |  | Accept JPG and PNG only for now. If a HEIC/HEIF file is chosen, the photo util and S6 show "Please choose a JPG or PNG photo." and do not upload. Tests T-BR2-5 (photo util, #14) and T-S6-3 (S6, #13). HEIC/HEIF and WebP are deferred (Section 1). Decided by the human, 11 Nov 2026. | Answered |
| 9 | Checkpoint 3 needs F1 end to end, and T-US3-1 lands on S5 after submitting. But S5 is in #17 (Bao992, milestone Final). Who builds the S5 needed for Checkpoint 3? | #13, #17, US3, PRD 13.4 M4 | Phase 2 (#13) | A read-only S5 base is built in #13 (Phase 2) for Checkpoint 3; the full S5 (timeline, role actions) stays in #17 (Phase 5). Decided in this follow-up, 11 Nov 2026. | Answered |

**Open questions to answer**

| # | Question | Where | Blocks | Answer | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | PRD 11.1 says "React Router 6", but the repo uses React Router 7.18.x (PR #28), and the README tech stack table also still says 6. #32 will also move Vite and Vitest past "Vite 5". PRD 11.1 and 11.7 also do not mention pgTAP, which #9 uses. Should PRD 11.1 / 11.7 and the README be updated (with a change log row) now, and again when #32 lands? | PRD 11.1, 11.7; README; #32 | none (docs) |  | Open |
| 4 | The edge case "A field team is removed while it has assigned faults" says the ward admin sees "This field team no longer exists. Please reassign." on S5, but the same row says the database blocks deleting a field team with faults that are not Closed. If the delete is blocked, when can the message appear? Should it be dropped, or should removal be a "deactivate" flag instead of a delete? | PRD 6.2, 10.1 FieldTeam | Phase 4 (#18, #19) |  | Open |
| 5 | BR6 says the S4 search matches "a street address containing the typed words". Must the address contain all typed words in any order, the exact phrase, or any one of the words? | BR6, S4, T-US5-2 | Phase 2 (#12) |  | Open |
| 6 | Delete account (PRD 5, M5) must delete the user's **login**. That needs the service role key, which may never be in the browser (PRD 11.5). PRD 11.3 only mentions an Edge Function for AI. May we add an Edge Function `delete-account` (takes the user from the request token, deletes the Auth user; the cascade does the rest)? | PRD 5, 11.3, 11.5, M5, US4 | Phase 3 (#23) |  | Open |
| 7 | BR12 "delayed": when is `is_delayed` cleared (on the next status change, on Fixed, on reassign, or never)? Can a fault be marked delayed while Assigned and Scheduled, or only In progress (BR12 says "an assigned fault", US8-2 shows In progress)? | BR12, M3, US8 | Phase 5 (#16) |  | Open |
| 8 | Creating a fault and uploading its photos are two steps. If the fault row is saved but the photo upload fails (US3-4 keeps the form for "Try again"), what happens to the saved row? Nobody may delete faults in the app (PRD 11.4), and a half-saved fault would also count towards the 5-a-day limit (BR17). Proposed options: upload photos first to a temporary path, or let a database function delete the reporter's own fault only when it has no photos and was created in the last few minutes. | US3-4, BR17, PRD 11.4 | Phase 2 (#13) |  | Open |
| 10 | PRD 12.4 says the reporter's phone number is kept "so a ward admin can contact a resident about a fault", and the ward admin can read reporters' name and email (12.4, 11.4). But the S5 spec (8.2) shows no reporter details in the ward admin block. Should S5 show the reporter's name and phone to the ward admin of the ward? If yes, where and with what label? | PRD 8.2 S5, 11.4, 12.4 | Phase 4 (#19) |  | Open |
| 11 | PRD 8.4 says the Ward A dashboard seed includes 'one Electricity fault "Streetlight flickering" (Viewed)'. "Streetlight flickering" is not a fault type in 10.4. Is it fault type "Faulty streetlight" with that text as its description? | PRD 8.4, 10.4, T-US11-1 | Phase 2 (#11 seed) |  | Open |
| 12 | Design file names: Issue #6 says `S1.png`, `M2.png`, but `docs/designs/STITCH_PROMPTS.md` says `S01-welcome.png`, `M02-assign-fault.png`. Which naming should be used (and how are the desktop versions of S8 and S9 named)? | #6, `docs/designs/STITCH_PROMPTS.md` | Phase 1 (#6) |  | Open |
| 13 | PRD 10.4 says the seed faults come "with their photos". Who supplies the sample photos (free to use, no faces or number plates), and by when? | PRD 10.4, 12.4 | Phase 2 (#14 seed) |  | Open |
| 14 | "CI required" cannot be switched on in branch protection until #8 (Paul280-cloud) is merged. Who changes the branch protection, and by when? Until then, is a pasted local `npm run check` enough to merge? | #8, PRD 13.4 M3 | none (process) |  | Open |
| 15 | #15, #21, #22, #23, #24, #25, #26 and #32 have no assignee on GitHub (#8 is already Paul280-cloud's). This plan proposes: Paul280-cloud #15, #26, #32; Mikel17croc #21, #22 (reassign if no response by 13 Nov); Bafana-Ndlovu #23; SIJABULILE-NCUBE #24; Bao992 #25. Please confirm or change them on the board. | Board, Section 12 | Phase 2 (#15), 3 (#23), 6 (#21, #22), 7 (#24, #25, #26, #32) |  | Open |
| 16 | BR17 says "at most 5 faults in any 24 hours" (a rolling window), but the message says "Please try again tomorrow." Is the limit a rolling 24 hours, or per calendar day in SAST? | BR17, T-US3-3 | Phase 2 (#11) |  | Open |
| 17 | BR1 says the number restarts "each year" using "the year it was reported". Is that the year in SAST (proposed) or UTC? It only matters between 22:00 and 24:00 UTC on 31 December. | BR1 | Phase 2 (#11) |  | Open |
| 18 | After a fault is Reopened, 10.3 only allows Reopened → Assigned. Should the old field team, due date and `is_delayed` be cleared on reopen? Should the old due date still make it "Overdue" while it sits in the "New" tab? | 10.3, BR7, BR11, BR14 | Phase 5 (#16) |  | Open |
| 19 | M7 must say where the data is stored, but the Supabase region is only recorded when the hosted project is created (PRD 12.4. Also, the contact "privacy@fixmykasi.example" is a placeholder domain. What is the region, and what contact address should M7 show? | M7, PRD 12.4 | Phase 3 (#23) |  | Open |
| 20 | BR18 says the first visit uses the browser's language if it is one of the four, and S1/S11 show all four languages. Until #24 adds af, zu and nso, should the picker show only the languages that exist (proposed), or all four with English text behind them? | BR18, S1, S11, #24 | Phase 3 (#23), Phase 7 (#24) |  | Open |
| 21 | Ward admins and field team members are "Created by the admin in the Supabase dashboard" (PRD 2.4). The sign-up trigger requires a home ward and 18+ for residents, and creates every login as a resident. What are the exact admin steps for a staff account (create login, then set role and ward / field team)? Should they be written in the README? | PRD 2.4, 2.5 | none (docs) |  | Open |
| 22 | S9 "View overdue faults" opens S8 with "Overdue only" on. Overdue faults can be in the "New" or "In progress" tab (BR7). Which tab should be active, or should the filter apply across tabs? | S9, S8, BR7, BR11 | Phase 6 (#22) |  | Open |
| 23 | US11-1 expects "Open faults 4, Overdue faults 1" with the seed data, using "today" = 12 Nov 2026. On the demo days (16 and 20 Nov) more seed faults will be overdue (FMK-2026-00123 is due 18 Nov). Should the seed dates be relative to the day the database is reset, so the demo always shows the PRD figures? | PRD 8.4, T-US11-1, final demo | Phase 2 (#11 seed), Phase 6 (#21) |  | Open |
| 24 | PRD 2.4 says a ward admin "can mark faults Viewed", and BR10 says it happens automatically on first open. Is there also a manual "Mark as viewed" action, or only the automatic one? | PRD 2.4, BR10 | Phase 4 (#19) |  | Open |
| 25 | BR15 "Average time to fix" counts faults "fixed in the last 30 days". Does that include faults that were later Closed or Reopened, and for a reopened fault, is the first or the latest `fixed_at` used? | BR15, S9 | Phase 6 (#21) |  | Open |
| 26 | F7 AI provider: PRD 11.2 says the Tech Lead chooses OpenAI or Anthropic "when F7 work starts". Which provider and model? | PRD 11.2, BR20 | Phase 7 (#26) |  | Open |
| 27 | Question #3 limits photos to JPG and PNG, but the PRD message for a too-big or unsupported photo is "This photo is too big or not a supported type. Use a JPG, PNG, HEIC or WebP under 10 MB.", which still names HEIC and WebP, and PRD BR2, S6 and M3 still list HEIC and WebP. What exact text should that message use now, and should BR2 / S6 / M3 in the PRD get a change log row? | BR2, S6, M3, PRD 6.2, question #3 | Phase 2 (#13, #14) |  | Open |

**Follow-ups for the PRD** (small mismatches found while building, to fix in a PRD PR with a change log row; they do not block any phase):
- 11.1 says React Router 6, but the scaffold (PR #28) upgraded to the patched React Router 7 for security.
- Section 5 requires email verification. Local `supabase/config.toml` has `enable_confirmations = false` for easy testing, so the **hosted** Supabase project must turn email confirmations on before the final submission.

---

## 1. Summary and scope

**Product:** FixMyKasi, a mobile-first web app where South African residents report community faults, see which municipal team or contractor is fixing each one, and track it until it is confirmed fixed (PRD 1).

**Users and roles (PRD 2.4):** Visitor, Resident, Ward admin, Field team. Staff accounts are created by the admin in the Supabase dashboard (2.5).

| Priority | Features |
| --- | --- |
| Must | F1 Account and report a fault · F2 Public fault list and upvotes · F3 Assign the work · F4 Track progress · F5 Ward dashboard |
| Should | F6 Proof of work · F7 AI help · F8 Map view |

**Non-goals (PRD 3.2):** no link to real municipal systems, no native app, no SMS/WhatsApp/push messages, no private-property faults, no chat between residents and field teams, no ward councillor accounts.

**Deferred: must NOT be built (PRD 4.3):** ward councillor view, WhatsApp reporting, the other 7 official languages, voice notes and low-data mode, monthly PDF reports. Also deferred by decision #3: HEIC/HEIF and WebP photos (JPG and PNG only for now).

## 2. Tech stack, folders and setup

Stack from PRD 11.1, as set up in PR #28: React 18, Vite 5, TypeScript 5, React Router 7, Tailwind CSS 3, i18next, Supabase (Postgres, Auth, Storage, Edge Functions, pg_cron), Vitest + React Testing Library, pgTAP for database tests, Vercel hosting, **Node.js 22 LTS** (`.nvmrc`). Approved additions (decision #2), installed by the first PR that needs them: `@supabase/supabase-js` v2 (Supabase client) and `lucide-react` (Lucide icons, PRD 9.1).

Folder structure: PRD 11.6. Database work lives only in `supabase/migrations/` (one file per change, merged through a PR) and `supabase/tests/`.

```bash
git clone https://github.com/Paul280-cloud/fixmykasi.git
cd fixmykasi
npm install
cp .env.example .env          # fill in real values, never commit .env
npm run dev                   # http://localhost:5173
npm run check                 # lint + typecheck + tests + build (run before every PR)

# Local database (needs Docker Desktop running)
npx supabase start
npx supabase db reset         # migrations + seed
node --env-file=.env supabase/seed/seed.js   # test passwords
npx supabase test db          # pgTAP tests
```

## 3. Environment variables (`.env.example`, PRD 11.5)

| Name | Public or secret | Where it is used |
| --- | --- | --- |
| VITE_SUPABASE_URL | Public | The app |
| VITE_SUPABASE_ANON_KEY | Public | The app |
| SUPABASE_SERVICE_ROLE_KEY | **Secret** | Seed script only. Never in the app or GitHub. |
| AI_API_KEY | **Secret** | Supabase Edge Function secret only (F7) |

Real values are shared privately and set in the Vercel and Supabase dashboards. They are never written in this file or the repo.

## 4. Database (PRD 10)

Every change is a migration file merged through a PR. Never edit tables by hand in the dashboard.

| Step | Migration | Entities and rules | Issue | Status |
| --- | --- | --- | --- | --- |
| 1 | `…120001_core_tables.sql` | Ward, FaultType, FieldTeam, Profile with every field, default, unique and check rule from 10.1; one ward admin per ward; delete rules (login deleted → profile deleted; ward or field team in use → blocked) | #9 | ✅ Merged (PR #29) |
| 2 | `…120002_profile_triggers.sql` | Sign-up creates a resident profile; staff cannot change their ward | #9 | ✅ Merged |
| 3 | `…120003_rls_and_grants.sql` | RLS and grants for the four core tables (11.4); `field_team_contacts()` (BR16) | #9 | ✅ Merged |
| 4 | `…120004_reference_data.sql` | 3 wards, 34 fault types (7 auto urgent), 5 field teams (10.4) | #9 | ✅ Merged |
| 5 | Fault tables | **Fault** (all 10.1 fields incl. status, due date, delay, reopen_count, upvote_count, timestamps), **FaultPhoto** (before/after, up to 3 each), **Upvote** (unique per user and fault), **StatusChange**; reference number (BR1); `upvote_count` trigger and BR5 rules; public view without `reporter_id` and `municipal_reference` (BR16); RLS from 11.4; "ward admins can read profiles of reporters in their ward" | #11 | To do |
| 6 | Status rules | The 10.3 status changes as one database function; StatusChange row written by trigger on every change (BR9); Viewed on first open (BR10); overdue calculation (BR11); delay (BR12); fixed_at (BR13); confirm/reopen and the 02:00 SAST auto-close job (BR14) | #16 | To do |
| 7 | Assign | `assign_fault` function and ward admin permissions (BR8) | #18 | To do |
| 8 | Dashboard | Ward dashboard figures function (BR15) | #21 | To do |
| 9 | Storage | `fault-photos` bucket and policies (BR2) | #14 | To do |

**Relationships (10.2):** a Ward has many Faults and resident Profiles and one ward admin; a resident reports many Faults; a FaultType and a FieldTeam each have many Faults; a Fault has 1 to 6 FaultPhotos, many Upvotes and many StatusChanges.

**Status changes (10.3):** (new) → received → viewed → assigned → scheduled → in_progress → fixed → closed, with reassign (assigned/scheduled → assigned), reopen (fixed → reopened → assigned) and auto-close. Closed is final.

## 5. Permissions (PRD 11.4)

One rule per row of 11.4, enforced in the database with RLS, column grants and database functions, and each covered by an ALLOW and a DENY pgTAP test.

| Entity | Rule | Issue |
| --- | --- | --- |
| Profile | Read own; ward admins read reporters in their ward; create by sign-up trigger only; update own allowed columns; residents delete own | #9 ✅, #11 |
| Ward, FaultType, FieldTeam | Everyone reads; admin-only writes; contact_phone only for ward admins | #9 ✅ |
| Fault | Everyone reads the public view; full row for reporter, ward admin of its ward and its field team; verified residents create (reporter = themselves, max 5 per 24 h); status and assignment change only through the 10.3 functions; nobody deletes | #11, #16, #18 |
| FaultPhoto | Everyone reads; reporter adds before photos; field team adds after photos; no update or delete | #11, #14, #25 |
| Upvote | Counts public; verified residents create (not own fault, not Closed); owner deletes | #11 |
| StatusChange | Everyone reads; written by trigger only; no update or delete | #11, #16 |

## 6. Business rules (PRD 4.4)

| BR | Where it runs | Logic |
| --- | --- | --- |
| BR1 | Database trigger on Fault insert | year := current year (SAST); n := atomically increment that year's counter; reference := 'FMK-' + year + '-' + n padded to 5 digits; never changes |
| BR2 | Browser (S6, M3) + Storage policy | accept 1 to 3 files, **JPG/PNG only** (decision #3; a HEIC/HEIF file shows "Please choose a JPG or PNG photo." and is not uploaded), ≤ 10 MB each; resize to ≤ 1600 px, compress < 500 KB, strip EXIF; if "not safe" ticked, 0 photos allowed and description ≥ 30 chars |
| BR3 | Browser (S6) + check constraints | ward required (default home ward); street 5 to 120 chars; landmark ≤ 60; ask GPS once, save lat/long if allowed |
| BR4 | Database query (S6 → M6) | same ward, same fault type, not Closed, last 30 days; if both have GPS, within 200 m; up to 5, closest first (else newest first); none → skip M6 |
| BR5 | Database (RLS + trigger) | one upvote per resident per fault; removable; not own fault; not Closed; trigger keeps upvote_count in step |
| BR6 | Database query (S4) | 20 per page, newest first; filters ward/category/status; sort Newest or Most upvoted; search exact reference or address contains |
| BR7 | Database query (S8) | ward admin's ward, not Closed; urgent first, then upvotes desc, then oldest; tabs New / In progress / Fixed |
| BR8 | Database function `assign_fault` | caller is ward admin of the fault's ward; team category = fault category; due date today..today+90 (SAST); estimated_days 1..90; municipal ref ≤ 30; set status Assigned |
| BR9 | Database function + trigger | only 10.3 changes allowed; each writes StatusChange (from, to, by, note ≤ 200, time) |
| BR10 | Database function (S5 open) | ward admin of the ward opens a Received fault → Viewed |
| BR11 | Calculated on read | overdue := today (SAST) > due_date and status not Fixed/Closed; never stored |
| BR12 | Database function (M3) | field team; reason 10..200; new date > current and ≤ today+90; is_delayed := true; status unchanged |
| BR13 | Database function (M3) | Fixed sets fixed_at; once F6 is built, ≥ 1 after photo required |
| BR14 | Database function + pg_cron 02:00 SAST | reporter only, while Fixed: confirm → Closed; reopen with reason 10..200 → Reopened (max 2); no response 7 days → Closed |
| BR15 | Database function (S9) | open = not Closed; overdue per BR11; average days reported→fixed for faults fixed in last 30 days, 1 decimal, "No data" if none; open per category |
| BR16 | Public view + column grants | public screens never show reporter name/email/phone; field team name and contractor company shown; worker names and phones only to the fault's ward admin |
| BR17 | Database (RLS check) + form | max 5 faults per resident per 24 h; description 10..500 |
| BR18 | Browser (i18next) | en/af/zu/nso; first visit uses browser language if supported else English; saved in profile; English first, other languages one PR each |
| BR19 | Database trigger + form | fault types with auto_urgent force is_urgent = true; others: resident may tick "This is dangerous" |
| BR20 | Edge Function (F7) | after photo + ≥ 10 chars, suggest type and urgency as a chip; > 8 s or error → nothing shown; non-English descriptions translated for staff, labelled "Translated by AI" |
| BR21 | Browser (F8, Leaflet) | pins only for faults with GPS, coloured by status; note says how many are hidden; pin shows reference, type, status, link to S5 |

## 7. Accounts (PRD 5)

Email and password via Supabase Auth; anyone 18+ signs up as a Resident on S2; staff accounts created by the admin; email verification required before reporting, upvoting, confirming or reopening; password ≥ 8 characters with a letter and a number; forgot password via M1, link valid 1 hour, opens S12; the session renews itself; log out on S11 goes to S1; delete account via M5 removes login, profile and upvotes, and faults stay but become anonymous; email cannot be changed in v1.

## 8. Navigation (PRD 7.2, 8.1)

| Route | Screen | Who | Tab bar |
| --- | --- | --- | --- |
| `/` | S1 Welcome | Logged out | No |
| `/sign-up` | S2 Sign Up | Logged out | No |
| `/log-in` | S3 Log In | Logged out | No |
| `/faults` | S4 Fault List | Everyone | Yes |
| `/faults/:reference` | S5 Fault Details | Everyone | Yes |
| `/report` | S6 Report a Fault | Resident | Yes |
| `/my-reports` | S7 My Reports | Resident | Yes |
| `/queue` | S8 Ward Queue | Ward admin | Yes |
| `/dashboard` | S9 Ward Dashboard | Ward admin | Yes |
| `/my-jobs` | S10 My Jobs | Field team | Yes |
| `/profile` | S11 Profile and Settings | Any logged-in role | Yes |
| `/reset-password` | S12 Set New Password | Valid reset link | No |

Modals (no tab bar): M1 Forgot Password, M2 Assign Fault, M3 Update Status, M4 Reopen Fault, M5 Delete Account, M6 Similar Reports, M7 Privacy Notice.

**Tabs by role:** Visitor: Faults, Log in · Resident: Faults, Report, My reports, Profile · Ward admin: Queue, Dashboard, Faults, Profile · Field team: My jobs, Faults, Profile. Bottom bar on phones, left menu over 1024 px. Home after log-in: S4 (Resident), S8 (Ward admin), S10 (Field team).

## 9. Design tokens and shared components (PRD 9, 8.3)

Tokens are in `src/styles/tokens.ts` and Tailwind (PR #28): Coat of Arms Green `primary` #005D28, Heritage Brown `secondary` #531A17, Gold `accent` #D8A851, Orange `urgent` #EF4718, `background` #FFFFFF, `surface` #F8F6F1, `text` #1C1C1C / #5C5650, `error` #B42318, `success` #1E7B34, `warning` #87451A, and the eight status colours. Inter font; sizes 24/18/16/16/13 px; 8 px spacing; radius cards 12 px, inputs and buttons 8 px, chips pill; button height 48 px; Lucide icons 24 px. No Coat of Arms, flag or department logo.

Shared components to build once in `src/components/` and reuse: Header, Tab bar, Primary/Secondary/Danger button, Text field, Fault card, Job card, Status chip, Labels (Urgent/Overdue/Delayed), Stat card, Toast, Confirmation pop-up, Empty-state block, Loading placeholder, Offline banner.

Designs: Stitch screens in [docs/designs/](docs/designs/) (Issue #6). Screens are built to match them.

## 10. Notifications, errors, quality, security and privacy

- **Notifications (4.5):** only the two Supabase Auth emails (confirm email, reset password), with the exact text from 4.5. No in-app, push or SMS.
- **Error messages (12.2):** use the exact shared messages ("You're offline. Changes will not be saved.", "Something went wrong. Try again.", "Please log in again.", "You don't have access to this.", "Please confirm your email first. Check your inbox.") and the field errors in 8.2.
- **Quality (12.1):** content or a loading placeholder within 3 s on mobile data; photos < 500 KB; lists 20 at a time; offline banner and disabled saves; Android 10+/Safari 16+/latest desktop browsers from 360 px; dates "12 Nov 2026", 24-hour SAST, stored in UTC.
- **Accessibility (9.4):** 16 px body, 4.5:1 contrast, 44 × 44 px targets, never colour alone, labels on every icon and image, keyboard only works.
- **Security (12.3):** passwords only in Supabase Auth; no secrets in the repo; every "Cannot do" enforced by RLS; status changes only through the 10.3 function; EXIF stripped; tables changed only by migrations.
- **Privacy (12.4):** POPIA table, consent checkbox with time saved, Privacy Notice M7, 18+ only, data stored outside South Africa stated in M7.

## 11. Seed data and test accounts (PRD 10.4)

Reference data is a migration (✅ #9). Sample users are in `supabase/seed.sql` (✅ #9); passwords are set by `supabase/seed/seed.js`. Sample faults from 8.4 are added to the seed with #11 and #16.

| Role | Email | Password (test only) |
| --- | --- | --- |
| Resident | thandeka.m@example.com | TestResident1 |
| Resident (empty states) | nomsa.s@example.com | TestResident2 |
| Ward admin (Ward A) | zanele.k@example.com | TestWardAdmin1 |
| Field team (Sample Plumbing Services) | kagiso.m@example.com | TestFieldTeam1 |

---

## 12. Build phases

Each phase ends with an app that runs. All Must features come before any Should. Every Issue: own branch `feature/<issue#>-name`, tests first, PR with `Closes #<issue>`, a teammate's review, CI green, squash and merge.

### Phase 1: Setup, tokens, database and one running screen (Checkpoint 2, Thu 12 Nov)

| Issue | Work | Owner | Status |
| --- | --- | --- | --- |
| #5 | Project scaffold, folders, tokens, `.env.example`, home screen | Bheki | ✅ PR #28 |
| #8 | GitHub Actions CI: lint, typecheck, test, build on every PR | Bheki | To do |
| #7 | Test plan, manual checklist and test accounts | Bao | To do |
| #6 | Stitch style guide and all screens S1 to S12, M1 to M7 | Bafana | In progress |

**Definition of Done**
- [x] `npm run check` passes (lint, typecheck, test, build)
- [x] The app runs and shows the FixMyKasi home screen
- [ ] CI runs on every PR and is required to pass on `main`
- [ ] Designs in `docs/designs/` and the Stitch link in the README

### Phase 2: F1 Account and report a fault + F2 list and upvotes (Checkpoint 3, Mon 16 Nov)

Covers F1 (account and report), F2 (list, upvotes, similar reports) · US1, US2, US3, US5, US6 · S2, S3, S4, S5 (read-only base), S6, S12, M1, M6 · BR1, BR2, BR3, BR4, BR5, BR6, BR16, BR17, BR19. Checkpoint 3 needs log-in, the database and at least one Must feature on the live link, with every member having merged at least one PR.

| Issue | Work | Owner | Status |
| --- | --- | --- | --- |
| #9 | Core tables, RLS and reference data, seed users | Bheki | ✅ PR #29 |
| #10 | Auth screens S2, S3, M1, S12 | Bheki | To do |
| #11 | Fault tables, reference number, upvote_count, public view, RLS | Sijabulile | To do |
| #14 | `fault-photos` bucket, policies and photo resizing (JPG/PNG only, decision #3) | Bafana | To do |
| #12 | S4 Fault list: search, filters, sort, infinite scroll, upvote | Sijabulile | To do |
| #13 | S6 Report a fault + M6 Similar reports + **read-only S5 base** (photos, fault type, status chip and labels, location, description, "Not assigned yet", upvote button, Received row) so a resident lands on S5 after submitting. The full S5 (timeline, role actions) stays in #17. | Bafana | To do |
| #15 | Deploy to Vercel, env vars, auto-redeploy on merge | Bheki (proposed) | To do |

**Definition of Done**
- [ ] **T-US1-1** (manual): Given I am on S2, when I enter my full name, email, a password like "kasi2026", tick both checkboxes and tap "Create account", then I go to S3 with the banner "Check your email to confirm your account."
- [ ] **T-US1-2** (automated + manual): Given the email already has an account, when I tap "Create account", then S2 shows "This email already has an account. Log in instead." under the email field.
- [ ] **T-US1-3** (automated + manual): Given my password is "kasikasi" (no number), when I tap "Create account", then the password field shows "Use at least 8 characters with a letter and a number."
- [ ] **T-US2-1** (manual): Given I have a confirmed account, when I log in on S3, then I go to S4 Fault List.
- [ ] **T-US2-2** (manual): Given I type the wrong password, when I tap "Log in", then S3 shows "Wrong email or password." and keeps my email.
- [ ] **T-US2-3** (manual): Given I tap "Forgot password?" and enter my email on M1, when I tap "Send link", then M1 shows "If this email has an account, we've sent a reset link."
- [ ] **T-US2-4** (manual): Given my reset link is older than 1 hour, when I open it, then S12 shows "This link has expired. Request a new one." with a "Send new link" button that opens M1.
- [ ] **T-US3-1** (manual): Given I am logged in and verified, when I complete S6 and tap "Submit report", then I see "Fault reported. Your reference number is FMK-2026-00125." and go to S5 for that fault, with status Received.
- [ ] **T-US3-2** (automated + manual): Given I have not added a photo or ticked "It is not safe to take a photo", when I tap "Submit report", then S6 shows "Add at least 1 photo."
- [ ] **T-US3-3** (automated + manual): Given I have already reported 5 faults in the last 24 hours, when I tap "Submit report", then S6 shows "You can report up to 5 faults a day. Please try again tomorrow." and keeps my form.
- [ ] **T-US3-4** (manual): Given my upload fails, when I tap "Submit report", then S6 shows "Upload failed. Check your connection." with "Try again", and keeps my photos and text.
- [ ] **T-US5-1** (manual): Given there are faults, when I open S4, then I see up to 20 fault cards, newest first.
- [ ] **T-US5-2** (automated + manual): Given I type "FMK-2026-00123" in search, when I tap search, then only that fault is shown.
- [ ] **T-US5-3** (manual): Given my filters match nothing, when the list loads, then S4 shows "No faults match your filters." with a "Clear filters" button.
- [ ] **T-US6-1** (manual): Given a Scheduled burst pipe exists 80 m away in my ward, when I tap "Next" on S6, then M6 shows it with the title "Is this the same fault?"
- [ ] **T-US6-2** (manual): Given M6 is open, when I tap "Upvote instead", then the upvote is saved, I go to S5 for that fault, and I see the toast "Thanks, your upvote was added."
- [ ] **T-US6-3** (automated + manual): Given I reported the fault myself, when I view it on S5, then the upvote button is disabled with the text "You reported this fault".
- [ ] **T-BR2-5** (automated, #14, `tests/unit/photo.test.ts`): a HEIC or HEIF file (MIME type `image/heic` / `image/heif`, or a `.heic` / `.heif` extension when the type is empty) is rejected by the photo util with "Please choose a JPG or PNG photo.", and the upload function is never called.
- [ ] **T-S6-3** (automated, #13, `tests/screens/ReportFault.test.tsx`): choosing a HEIC/HEIF photo on S6 shows "Please choose a JPG or PNG photo.", the photo is not added, nothing is uploaded, and photos already added stay.
- [ ] Core migrations apply and all pgTAP tests pass (#9 ✅; #11 and #14 still to add theirs)
- [ ] Live link works in a private window

### Phase 3: F1 completed

Covers F1 · US4 · S1, S11, M5, M7 · BR18. (S4, M6, US5 and US6 moved to Phase 2 for Checkpoint 3.)

| Issue | Work | Owner |
| --- | --- | --- |
| #23 | S1 Welcome, S11 Profile, M5 Delete account, M7 Privacy notice | Bafana (proposed) |

**Definition of Done**
- [ ] **T-US4-1** (manual): Given I am on S11, when I change Language to "isiZulu", then every label on every screen changes to isiZulu, and the choice is kept after I log out and in again.
- [ ] **T-US4-2** (manual): Given I tap "Delete account" on S11 and confirm on M5, when the deletion finishes, then I go to S1 with the message "Your account has been deleted." and my faults show no link to me.
- [ ] **T-US4-3** (manual): Given the deletion fails, when I confirm on M5, then M5 shows "Something went wrong. Try again." and my account stays.

### Phase 4: F3 Assign the work

Covers F3 · US7 · S5, S8, M2 · BR7, BR8, BR10, BR11.

| Issue | Work | Owner |
| --- | --- | --- |
| #18 | `assign_fault` function and ward admin permissions | Bheki |
| #19 | S8 Ward queue + M2 Assign fault | Bheki |

**Definition of Done**
- [ ] **T-US7-1** (automated + manual): Given a Received fault in my ward, when I open it on S5, then its status becomes Viewed.
- [ ] **T-US7-2** (manual): Given I fill in M2 and tap "Assign", then the status becomes Assigned and S5 shows the field team name, due date and estimated time.
- [ ] **T-US7-3** (automated + manual): Given I pick a due date 120 days away, when I tap "Assign", then M2 shows "Choose a date within the next 90 days."
- [ ] **T-US7-4** (automated + manual): Given I am a ward admin for another ward, when I try to assign this fault, then the database refuses it and I see "You can only manage faults in your ward."

### Phase 5: F4 Track progress

Covers F4 · US8, US9, US10 · S5, S7, S10, M3, M4 · BR9, BR11, BR12, BR13, BR14.

| Issue | Work | Owner |
| --- | --- | --- |
| #16 | Status change rules, overdue, auto-close job and status history | Bao |
| #17 | S5 Fault details + timeline + confirm/reopen (M4) + S7 My reports | Bao |
| #20 | S10 My jobs + M3 Update status | Sijabulile |

**Definition of Done**
- [ ] **T-US8-1** (manual): Given an Assigned fault on S10, when I choose "Scheduled" on M3 and save, then the status changes and the history on S5 shows the date and time.
- [ ] **T-US8-2** (manual): Given an In progress fault, when I mark it delayed with a reason and a new date, then S5 shows "Delayed" and the new due date.
- [ ] **T-US8-3** (automated + manual): Given a fault is not assigned to my field team, when I try to change its status, then the database refuses it and I see "You can only update faults assigned to your team."
- [ ] **T-US9-1** (manual): Given my fault is Scheduled, when I open it on S5, then I see the status timeline with dates, the field team name, "Contractor: Sample Plumbing Services (Pty) Ltd", the due date and the estimated time.
- [ ] **T-US9-2** (manual): Given its due date has passed and it is not Fixed, when I open S5 or S7, then I see a red "Overdue" label.
- [ ] **T-US9-3** (manual): Given I have reported no faults, when I open S7, then I see "You haven't reported any faults yet." with a "Report a fault" button.
- [ ] **T-US10-1** (manual): Given my fault is Fixed, when I tap "Yes, it's fixed" on S5, then it becomes Closed and I see the toast "Thanks for confirming."
- [ ] **T-US10-2** (manual): Given my fault is Fixed, when I tap "No, still a problem" and enter a reason on M4, then it becomes Reopened.
- [ ] **T-US10-3** (automated + manual): Given my fault has already been reopened 2 times, when it is Fixed again, then the reopen button is replaced with "This fault can't be reopened again. Please report a new fault."
- [ ] **T-US10-4** (automated + manual): Given my fault has been Fixed for 7 days with no response, when the daily job runs, then it becomes Closed.

### Phase 6: F5 Ward dashboard

Covers F5 · US11 · S9 · BR11, BR15.

| Issue | Work | Owner |
| --- | --- | --- |
| #21 | Ward dashboard figures function (BR15) | Mhlengi (Mikel17croc, proposed; reassign if no response by 13 Nov) |
| #22 | S9 Ward dashboard | Mhlengi (Mikel17croc, proposed; reassign if no response by 13 Nov) |

**Definition of Done**
- [ ] **T-US11-1** (automated + manual): Given my ward has the sample data, when I open S9, then I see Open faults 4, Overdue faults 1 and Average time to fix 5.0 days, matching BR15.
- [ ] **T-US11-2** (automated + manual): Given no faults were fixed in the last 30 days, when I open S9, then Average time to fix shows "No data" with "No faults fixed in the last 30 days."
- [ ] All Must features (F1 to F5) work on the live link

### Phase 7: Should features F6, F7, F8 and languages (Final submission, Fri 20 Nov)

Covers F6, F7, F8 · US12, US13, US14 · S4, S5, S6, M3 · BR13, BR18, BR20, BR21. Only once Phases 1 to 6 are done.

| Issue | Work | Owner |
| --- | --- | --- |
| #25 | F6 Proof of work: after photos | Bao (proposed) |
| #26 | F7 AI help and F8 Map view | Bheki (proposed) |
| #24 | i18n setup and Afrikaans, isiZulu, Sepedi | Sijabulile (proposed) |
| #32 | Upgrade Vite and Vitest to patched major versions | Bheki (proposed) |

**Definition of Done**
- [ ] **T-US12-1** (manual): Given I choose "Fixed" on M3, when I add 1 after photo and save, then S5 shows "Before" and "After" photos side by side.
- [ ] **T-US12-2** (automated + manual): Given I choose "Fixed" with no photo, when I tap "Save", then M3 shows "Add at least 1 after photo."
- [ ] **T-US13-1** (manual): Given I add a photo of a pothole and type "big hole in the road", when the suggestion appears, then I see the chip "Suggested: Pothole" and tapping it fills in Fault type.
- [ ] **T-US13-2** (automated + manual): Given the AI fails or takes over 8 seconds, when I fill in S6, then no chip is shown and I can still pick the fault type myself.
- [ ] **T-US13-3** (manual): Given a description written in isiZulu, when the ward admin opens S5, then they see the English translation labelled "Translated by AI" with the original underneath.
- [ ] **T-US14-1** (manual): Given faults with GPS, when I tap "Map" on S4, then I see a pin for each one, and tapping a pin shows its reference number, fault type and status with a "View fault" link to S5.
- [ ] **T-US14-2** (automated + manual): Given 2 faults have no GPS, when the map loads, then a note under it says "2 faults without a map location are not shown."
- [ ] README complete (project brief Step 7), Loom recorded, live link tested in a private window

## 13. Testing checklist

Every acceptance criterion from PRD Section 6. **Automated** means a Vitest or pgTAP test as well as the manual check. Bao (QA / Test Lead) runs the full manual checklist on the live link before each checkpoint, and each feature owner writes the automated tests for their feature.

- [ ] **T-US1-1** (manual): Given I am on S2, when I enter my full name, email, a password like "kasi2026", tick both checkboxes and tap "Create account", then I go to S3 with the banner "Check your email to confirm your account."
- [ ] **T-US1-2** (automated + manual): Given the email already has an account, when I tap "Create account", then S2 shows "This email already has an account. Log in instead." under the email field.
- [ ] **T-US1-3** (automated + manual): Given my password is "kasikasi" (no number), when I tap "Create account", then the password field shows "Use at least 8 characters with a letter and a number."
- [ ] **T-US2-1** (manual): Given I have a confirmed account, when I log in on S3, then I go to S4 Fault List.
- [ ] **T-US2-2** (manual): Given I type the wrong password, when I tap "Log in", then S3 shows "Wrong email or password." and keeps my email.
- [ ] **T-US2-3** (manual): Given I tap "Forgot password?" and enter my email on M1, when I tap "Send link", then M1 shows "If this email has an account, we've sent a reset link."
- [ ] **T-US2-4** (manual): Given my reset link is older than 1 hour, when I open it, then S12 shows "This link has expired. Request a new one." with a "Send new link" button that opens M1.
- [ ] **T-US3-1** (manual): Given I am logged in and verified, when I complete S6 and tap "Submit report", then I see "Fault reported. Your reference number is FMK-2026-00125." and go to S5 for that fault, with status Received.
- [ ] **T-US3-2** (automated + manual): Given I have not added a photo or ticked "It is not safe to take a photo", when I tap "Submit report", then S6 shows "Add at least 1 photo."
- [ ] **T-US3-3** (automated + manual): Given I have already reported 5 faults in the last 24 hours, when I tap "Submit report", then S6 shows "You can report up to 5 faults a day. Please try again tomorrow." and keeps my form.
- [ ] **T-US3-4** (manual): Given my upload fails, when I tap "Submit report", then S6 shows "Upload failed. Check your connection." with "Try again", and keeps my photos and text.
- [ ] **T-US4-1** (manual): Given I am on S11, when I change Language to "isiZulu", then every label on every screen changes to isiZulu, and the choice is kept after I log out and in again.
- [ ] **T-US4-2** (manual): Given I tap "Delete account" on S11 and confirm on M5, when the deletion finishes, then I go to S1 with the message "Your account has been deleted." and my faults show no link to me.
- [ ] **T-US4-3** (manual): Given the deletion fails, when I confirm on M5, then M5 shows "Something went wrong. Try again." and my account stays.
- [ ] **T-US5-1** (manual): Given there are faults, when I open S4, then I see up to 20 fault cards, newest first.
- [ ] **T-US5-2** (automated + manual): Given I type "FMK-2026-00123" in search, when I tap search, then only that fault is shown.
- [ ] **T-US5-3** (manual): Given my filters match nothing, when the list loads, then S4 shows "No faults match your filters." with a "Clear filters" button.
- [ ] **T-US6-1** (manual): Given a Scheduled burst pipe exists 80 m away in my ward, when I tap "Next" on S6, then M6 shows it with the title "Is this the same fault?"
- [ ] **T-US6-2** (manual): Given M6 is open, when I tap "Upvote instead", then the upvote is saved, I go to S5 for that fault, and I see the toast "Thanks, your upvote was added."
- [ ] **T-US6-3** (automated + manual): Given I reported the fault myself, when I view it on S5, then the upvote button is disabled with the text "You reported this fault".
- [ ] **T-US7-1** (automated + manual): Given a Received fault in my ward, when I open it on S5, then its status becomes Viewed.
- [ ] **T-US7-2** (manual): Given I fill in M2 and tap "Assign", then the status becomes Assigned and S5 shows the field team name, due date and estimated time.
- [ ] **T-US7-3** (automated + manual): Given I pick a due date 120 days away, when I tap "Assign", then M2 shows "Choose a date within the next 90 days."
- [ ] **T-US7-4** (automated + manual): Given I am a ward admin for another ward, when I try to assign this fault, then the database refuses it and I see "You can only manage faults in your ward."
- [ ] **T-US8-1** (manual): Given an Assigned fault on S10, when I choose "Scheduled" on M3 and save, then the status changes and the history on S5 shows the date and time.
- [ ] **T-US8-2** (manual): Given an In progress fault, when I mark it delayed with a reason and a new date, then S5 shows "Delayed" and the new due date.
- [ ] **T-US8-3** (automated + manual): Given a fault is not assigned to my field team, when I try to change its status, then the database refuses it and I see "You can only update faults assigned to your team."
- [ ] **T-US9-1** (manual): Given my fault is Scheduled, when I open it on S5, then I see the status timeline with dates, the field team name, "Contractor: Sample Plumbing Services (Pty) Ltd", the due date and the estimated time.
- [ ] **T-US9-2** (manual): Given its due date has passed and it is not Fixed, when I open S5 or S7, then I see a red "Overdue" label.
- [ ] **T-US9-3** (manual): Given I have reported no faults, when I open S7, then I see "You haven't reported any faults yet." with a "Report a fault" button.
- [ ] **T-US10-1** (manual): Given my fault is Fixed, when I tap "Yes, it's fixed" on S5, then it becomes Closed and I see the toast "Thanks for confirming."
- [ ] **T-US10-2** (manual): Given my fault is Fixed, when I tap "No, still a problem" and enter a reason on M4, then it becomes Reopened.
- [ ] **T-US10-3** (automated + manual): Given my fault has already been reopened 2 times, when it is Fixed again, then the reopen button is replaced with "This fault can't be reopened again. Please report a new fault."
- [ ] **T-US10-4** (automated + manual): Given my fault has been Fixed for 7 days with no response, when the daily job runs, then it becomes Closed.
- [ ] **T-US11-1** (automated + manual): Given my ward has the sample data, when I open S9, then I see Open faults 4, Overdue faults 1 and Average time to fix 5.0 days, matching BR15.
- [ ] **T-US11-2** (automated + manual): Given no faults were fixed in the last 30 days, when I open S9, then Average time to fix shows "No data" with "No faults fixed in the last 30 days."
- [ ] **T-US12-1** (manual): Given I choose "Fixed" on M3, when I add 1 after photo and save, then S5 shows "Before" and "After" photos side by side.
- [ ] **T-US12-2** (automated + manual): Given I choose "Fixed" with no photo, when I tap "Save", then M3 shows "Add at least 1 after photo."
- [ ] **T-US13-1** (manual): Given I add a photo of a pothole and type "big hole in the road", when the suggestion appears, then I see the chip "Suggested: Pothole" and tapping it fills in Fault type.
- [ ] **T-US13-2** (automated + manual): Given the AI fails or takes over 8 seconds, when I fill in S6, then no chip is shown and I can still pick the fault type myself.
- [ ] **T-US13-3** (manual): Given a description written in isiZulu, when the ward admin opens S5, then they see the English translation labelled "Translated by AI" with the original underneath.
- [ ] **T-US14-1** (manual): Given faults with GPS, when I tap "Map" on S4, then I see a pin for each one, and tapping a pin shows its reference number, fault type and status with a "View fault" link to S5.
- [ ] **T-US14-2** (automated + manual): Given 2 faults have no GPS, when the map loads, then a note under it says "2 faults without a map location are not shown."

**Demo script:** PRD 11.7 (6 steps, about 5 minutes).

## Change log

| Plan version | Date | What changed | Why |
| --- | --- | --- | --- |
| v1.0 | 11 Nov 2026 | First version | PR #37 (Issue #35), from PRD v0.4 |
| v1.1 | 11 Nov 2026 | Owners: #8 Paul280-cloud (as on GitHub); proposed Paul280-cloud for #15, #26, #32; Mikel17croc for #21 and #22 only (reassign if no response by 13 Nov); Bafana-Ndlovu #23; SIJABULILE-NCUBE #24; Bao992 #25. Phase 2 (Checkpoint 3) now holds #9, #12 (S4), M6/US5/US6 and a read-only S5 base in #13; Phase 3 keeps only F1 completion. Stack adds `@supabase/supabase-js` v2 and `lucide-react` (decision #2). Photos JPG/PNG only, HEIC/HEIF/WebP deferred, tests T-BR2-5 and T-S6-3 (decision #3). Clarifications now list 3 answered decisions and 24 open questions with the phase each blocks. | Follow-up to #37 |
