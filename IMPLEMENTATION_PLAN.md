# IMPLEMENTATION_PLAN.md: FixMyKasi

---

## 0. Plan details

| Field | Value |
| --- | --- |
| App name | FixMyKasi |
| Built from PRD version | v0.4 (`docs/PRD.md`, 11 Nov 2026) |
| Screen designs | Not finished yet. Stitch prompts are in `docs/designs/STITCH_PROMPTS.md`. The exported screens (S1 to S12, M1 to M7, plus desktop versions of S8 and S9) will be saved in `docs/designs/` by Issue #6. Until then, every screen and token marked "TBD until docs/designs is merged" is not final (Section 7). |
| Plan version | v0.2 |
| Repository | https://github.com/Paul280-cloud/fixmykasi |
| Project board | https://github.com/users/Paul280-cloud/projects/1 |
| Status | Draft (waiting for the designs in #6 and the answers in Section 18) |
| Last updated | 11 Nov 2026 |

---

## 1. Start here (instructions for the coding agent)

Before writing any code:

1. Read this whole file from top to bottom.
2. Read `docs/PRD.md`.
3. Look at the screen designs listed in Section 7.3. If the design for a screen you need is not in `docs/designs/` yet, stop and ask the human (Section 7, design rule).
4. Check Section 18. If any clarification that blocks the phase you are about to start is still **Open**, stop and ask the human. Do not start that phase.
5. Check that the prerequisites in Section 4.2 are installed.
6. Find the phase the human asked for in Section 13. Check its "Starts when" line. Follow Section 2 at all times, and the team workflow in Section 13.1.

---

## 2. Rules for the coding agent (copy word for word, do not edit)

1. **One phase at a time.** Only work on the phase the human asked for. When that phase's Definition of Done is complete, stop and wait for the human to say "Start Phase <number>".
2. **Test-driven development (TDD) for every task.** Follow the cycle in Section 12.1:
    - Write the test.
    - Run it and see it fail for the right reason.
    - Write the smallest code that makes it pass.
    - Run all tests.
    - Refactor while all tests still pass.
3. **Never cheat a test.** Never delete, skip, weaken or change a test just to make it pass. If you believe a test is wrong, stop and explain why to the human.
4. **Never break earlier work.** Every test from earlier phases must still pass before a phase is done.
5. **Build only what is planned.** Build only what is in this file and `docs/PRD.md`. Never build anything in Section 3.3 (Deferred).
6. **Ask, don't guess.** If anything is missing, unclear or contradictory, stop, add it to Section 18, and ask the human.
7. **Match the designs.** Every screen must match its design in Section 7.3: layout, order, labels, text, colours and spacing. Use the design tokens in Section 7.1. Never hard-code colours, font sizes or spacing.
8. **Every state, every screen.** Each screen must handle every state listed for it in Section 7.3 (chosen from normal, empty, loading, error, offline, success, plus any screen-specific states).
9. **Exact wording.** Use the exact labels and messages from the PRD. Never invent wording.
10. **Security first.**
    - Never put secret keys in app code, logs, test files or Git.
    - Every permission rule in Section 9 must be enforced on the server or database, never only in the app.
    - Every permission rule must have a test.
11. **Full check before "done".** Run the full check command (Section 4.3) before saying a phase is done, then add a short summary of the results to the Progress log (Section 17).
12. **Record your progress.** After each phase:
    - tick the checkboxes for that phase in this file;
    - add a row to the Progress log;
    - commit using the commit message given in the phase.
13. **No surprise libraries.** Do not add, remove or upgrade any library or tool not listed in Section 4.1 without asking the human first.
14. **Stuck rule.** If the same problem is still failing after 3 attempts, stop and report:
    - what you tried;
    - the exact error;
    - what you need from the human.
15. **Clean code.** Follow the folder structure in Section 5. Use the PRD's key terms (Section 3.4) for names in code. Keep files small and focused.

---

## 3. Project summary and scope

### 3.1 Summary

FixMyKasi helps South African residents report community faults (potholes, burst water and sewer pipes, blocked manholes, broken streetlights) so that they can see who is fixing them, and when. A resident reports a fault with a photo, location and description and gets a reference number straight away. Before submitting, they see similar reports nearby and can upvote one instead. The ward admin assigns each fault to a municipal team or a named contractor with a due date. The field team updates the status, and everyone can follow the fault until the resident confirms it is fixed or reopens it.

**Platform:** Web app that works in a browser. Mobile-first at 390 px wide (screens from 360 px). S8 Ward Queue and S9 Ward Dashboard are also designed for desktop at 1440 px.

**Roles (PRD 2.4):** Visitor (logged out), Resident, Ward admin, Field team. Admin work is done in the Supabase dashboard, with no admin screens (PRD 2.5).

### 3.2 Features in scope

| ID | Feature | Priority | Issues | Built in phase | Status |
| --- | --- | --- | --- | --- | --- |
| Setup | Project scaffold, core tables and RLS | Must | #5, #9 | 1, 2 | **DONE** (PR #28, PR #29) |
| F1 | Account and report a fault | Must | #10, #11, #13, #14, #23, #24 | 5, 6, 8, 13, 14 | Not started |
| F2 | Public fault list and upvotes | Must | #11, #12, #13 | 6, 7, 8 | Not started |
| F3 | Assign the work | Must | #16, #18, #19 | 9, 10 | Not started |
| F4 | Track progress | Must | #16, #17, #20 | 9, 11 | Not started |
| F5 | Ward dashboard | Must | #21, #22 | 12 | Not started |
| F6 | Proof of work | Should | #25 | 16 | Not started (no milestone) |
| F7 | AI help | Should | #26 | 16 | Not started (no milestone) |
| F8 | Map view | Should | #26 | 16 | Not started (no milestone) |

F2's list (S4) is built before F1's report form (S6) on purpose: a resident lands on S4 after logging in (T-US2-1), and S6's similar-reports check (M6) reuses the fault card from S4.

**What is DONE today (11 Nov 2026):**

- **#5 Project scaffold (PR #28, merged):** Vite 5 + React 18 + TypeScript 5 + Tailwind 3 + React Router 7.18.x + i18next (English only) + ESLint + Vitest/RTL. `npm run check` runs lint, typecheck, tests and build. Node 22 pinned in `.nvmrc` and `engines`. Design tokens from PRD 9.1 in `src/styles/tokens.ts`. One placeholder screen (`src/screens/home/HomeScreen.tsx`) and one test (`tests/App.test.tsx`).
- **#9 Core tables and RLS (PR #29, merged):** local Supabase on ports 553xx; migrations for `wards`, `fault_types`, `field_teams`, `profiles`; `handle_new_user()` and `guard_profile_update()` triggers; RLS and column grants; `field_team_contacts()`; reference data (3 wards, 34 fault types, 5 field teams); seed users from PRD 8.4 (`supabase/seed.sql` + `supabase/seed/seed.js`); 7 pgTAP files, 271 tests passing.

**What remains:** everything else in this section, in the phases of Section 13.

### 3.3 Deferred: do NOT build

From PRD 3.2 and 4.3:

- Any link to real municipal systems
- Native Android or iPhone app
- SMS, WhatsApp or push messages, and in-app notifications (the only emails are the two Supabase Auth emails in PRD 4.5)
- Faults on private property
- Chat between residents and field teams
- Ward councillor accounts or a councillor view
- Reporting by WhatsApp
- The other 7 official languages (isiXhosa, Setswana, Sesotho, Xitsonga, siSwati, Tshivenda, isiNdebele)
- Voice note reports and a low-data mode
- Monthly PDF reports
- Admin screens (admin work is done in the Supabase dashboard, PRD 2.5)
- Changing email address (PRD 5)
- Sign-in methods other than email and password
- Dark mode (PRD 9.1)
- Editing or deleting a fault after it is submitted (PRD 2.4)
- Submitting a report while offline (the form is kept, but "Submit report" stays disabled, PRD 6.2)

### 3.4 Key terms (use these names in code)

| Term (PRD 1.7) | Name in code | Meaning |
| --- | --- | --- |
| Fault | `Fault`, table `faults` | One problem on public property that a resident reports. Never "issue", "complaint" or "ticket". |
| Reference number | `referenceNumber`, column `reference_number` | FMK-YYYY-NNNNN, unique, never changes (BR1) |
| Ward | `Ward`, table `wards` | The area a fault is in. One ward admin per ward. |
| Ward admin | role `ward_admin` | Municipal staff member who manages one ward's faults |
| Field team | `FieldTeam`, table `field_teams`, role `field_team` | A municipal team or a contractor company that repairs faults |
| Contractor | `kind = 'contractor'` | A private company. Its company name is always shown. |
| Upvote | `Upvote`, table `upvotes` | "This affects me too" on an existing fault |
| Status | `FaultStatus`, column `status` | received, viewed, assigned, scheduled, in_progress, fixed, closed, reopened (PRD 10.3) |
| Status change | `StatusChange`, table `status_changes` | One row of the status timeline |
| Fault photo | `FaultPhoto`, table `fault_photos` | A before or after photo of a fault |
| Fault type / category | `FaultType`, table `fault_types`; `FaultCategory` | roads, clean_water, sewer, electricity, waste, public_spaces |
| Profile | `Profile`, table `profiles` | One person with a login |
| Overdue | `isOverdue()` | Worked out each time, never saved (BR11) |
| Delayed | column `is_delayed` | Set by the field team with a reason and new date (BR12) |

---

## 4. Tech stack, prerequisites and commands

### 4.1 Stack

| Layer | Tool | Version | Used for | In the repo? |
| --- | --- | --- | --- | --- |
| Runtime | Node.js | 22 LTS (`.nvmrc` = 22, `engines` = 22.x) | Running tools | Yes |
| Frontend | React | 18 (`^18.3.1`) | Screens | Yes |
| Build tool | Vite | 5 (`^5.4.21`) | Dev server and build. Upgrade to a patched major is Issue #32 (Final). | Yes |
| Language | TypeScript (strict) | 5 (`~5.6.3`) | All app, test and script code | Yes |
| Routing | React Router (`react-router-dom`) | 7 (`^7.18.5`, v7.18.x) | Routes and redirect rules (Section 11). PRD 11.1 still says 6, see Section 18 #1. | Yes |
| Styling | Tailwind CSS | 3 (`^3.4.19`) | Styling from the design tokens | Yes |
| Translations | i18next + react-i18next | 23 / 15 | English first (`en.json`). `af`, `zu`, `nso` added later, one language per PR (BR18, #24). | Yes |
| Backend client | @supabase/supabase-js | v2 | Talking to Supabase from the browser | Approved (Section 18 #2, 11 Nov 2026). **Not installed yet: added in Phase 4 (#15) or Phase 5 (#10), whichever merges first** |
| Icons | lucide-react | Latest stable when added | Lucide outline icons, 24 px (PRD 9.1) | Approved (Section 18 #2, 11 Nov 2026). **Not installed yet: added in Phase 5 (#10)** |
| Map (F8) | Leaflet 1.9 + react-leaflet + OpenStreetMap tiles | 1.9 | Map view (BR21) | **No: added in Phase 16 (#26)** |
| Database | Supabase PostgreSQL | Supabase CLI (`npx supabase`) | Data, constraints, triggers, RLS | Yes |
| Log-in | Supabase Auth (email and password) | n/a | Sign-up, verification and reset emails | Yes (local config) |
| File storage | Supabase Storage, bucket `fault-photos` | n/a | Before and after photos | **No: added in Phase 6 (#14)** |
| Server functions | Supabase Edge Functions | Supabase CLI | AI help (F7). Account deletion if Section 18 #6 confirms it. | Folder only (`supabase/functions/`) |
| Scheduled jobs | Supabase pg_cron | n/a | Daily job at 02:00 SAST that closes faults Fixed for 7 days (BR14) | **No: added in Phase 9 (#16)** |
| Hosting | Vercel | n/a | Live link, redeploys on every merge to `main` | **No: Phase 4 (#15)** |
| Unit and component tests | Vitest + React Testing Library (+ jest-dom, jsdom) | Vitest 2 (`^2.1.9`), RTL 16 | Business rules, components, screens | Yes |
| Database and permission tests | pgTAP via `npx supabase test db` | Supabase CLI | Tables, triggers, RLS, database functions | Yes (271 tests) |
| Lint and type check | ESLint 9 + typescript-eslint, `tsc --noEmit` | Bundled | Code quality | Yes |
| CI | GitHub Actions | n/a | Lint, typecheck, test, build on every PR | **No: Phase 1 (#8)** |

Install packages with `npm install <package>`. Every version added is recorded in the Progress log (Section 17).

### 4.2 Prerequisites on the computer

- [ ] Node.js 22 LTS and npm (`nvm use` in the project folder reads `.nvmrc`)
- [ ] Git and a GitHub account with access to the repository
- [ ] Docker Desktop, running (the local Supabase needs it)
- [ ] Supabase CLI, run with `npx supabase`
- [ ] A `.env` file copied from `.env.example`, with the local values from `npx supabase status`
- [ ] Accounts: Supabase (hosted project, Phase 4) and Vercel (Phase 4). Only Mikel17croc (DevOps) and Paul280-cloud (Tech Lead) need these.
- [ ] Sample fault photos (JPG, your own or free to use, no faces or number plates) for the seed faults, see Section 18 #13

### 4.3 Commands

Local Supabase ports (from `supabase/config.toml`): API 55321, database 55322, shadow database 55320, pooler 55329, Studio 55323, Inbucket (local email inbox) 55324, analytics 55327.

| Purpose | Command |
| --- | --- |
| Install dependencies | `npm ci` (or `npm install` when adding a package) |
| Start the local backend | `npx supabase start` (API on http://127.0.0.1:55321, Studio on http://127.0.0.1:55323) |
| See local URLs and keys | `npx supabase status` |
| Reset the database (migrations + seed rows) | `npx supabase db reset` then `node --env-file=.env supabase/seed/seed.js` (sets the test passwords from PRD 10.4) |
| Read local emails (verification, reset) | Open Inbucket at http://127.0.0.1:55324 |
| Serve Edge Functions locally | `npx supabase functions serve` |
| Start the app | `npm run dev` (http://localhost:5173) |
| Unit and component tests | `npm test` (= `vitest run`) |
| Tests in watch mode | `npm run test:watch` (= `vitest`) |
| Database and permission tests | `npx supabase test db` |
| Lint | `npm run lint` (= `eslint .`) |
| Type check | `npm run typecheck` (= `tsc --noEmit`) |
| Build for release | `npm run build` (= `vite build`) |
| Preview the build | `npm run preview` |
| Stop the local backend | `npx supabase stop` |
| **Full check (run before every "done")** | `npm run check` (runs lint, typecheck, `npm test` and build, in that order) **and** `npx supabase test db` (with `npx supabase start` running and the database reset). Both must pass. |

`npm run check` does not include the pgTAP tests, because CI (#8) has no Docker by default. Every phase that changes `supabase/` must also run `npx supabase test db` and paste the result in the PR.

---

## 5. Folder structure

Follows PRD 11.6 and what the scaffold already has.

```
fixmykasi/
  .github/workflows/ci.yml          GitHub Actions: lint, typecheck, test, build (#8)
  .nvmrc                            22
  docs/
    PRD.md                          Source of truth
    FixMyKasi-Team-Brief.pdf        Original app idea
    designs/                        Stitch exports (#6) and STITCH_PROMPTS.md
  public/                           Logo and static images
  src/
    main.tsx                        App entry: router and i18n
    App.tsx                         Routes, redirect rules (Section 11) and role-based tab bar
    components/                     Shared components (Section 7.2), one file each
    screens/                        One folder per screen and modal
      welcome/                      S1 (replaces the scaffold's screens/home/)
      sign-up/                      S2 (+ M7 is opened from here)
      log-in/                       S3 and M1
      fault-list/                   S4
      fault-details/                S5, M2, M4
      report-fault/                 S6, M6
      my-reports/                   S7
      ward-queue/                   S8
      ward-dashboard/               S9
      my-jobs/                      S10, M3
      profile/                      S11, M5, M7
      set-new-password/             S12
    lib/
      supabase.ts                   Supabase client (public anon key only)
      api/                          One file per operation group (Section 10)
      rules/                        Pure business-rule functions (BR#), no network
      messages.ts                   Message keys for every user-facing message (text lives in i18n/en.json)
    hooks/                          useSession, useProfile, useOnlineStatus
    i18n/                           index.ts, en.json (af.json, zu.json, nso.json in #24)
    styles/                         index.css (Tailwind) and tokens.ts (design tokens)
  supabase/
    config.toml                     Local stack (ports 553xx) and Auth settings
    migrations/                     One file per change, never edited after merge (Section 8.6)
    functions/                      Edge Functions (Section 10)
    tests/                          pgTAP tests (00_ to 06_ exist; new files continue at 07_)
    seed.sql                        Seed users and faults from PRD 8.4
    seed/seed.js                    Sets test passwords (and uploads seed photos, #14)
    seed/README.md                  How to run the seed
    seed/photos/                    Sample fault photos for the seed faults (#14)
  tests/
    setup.ts                        jest-dom and test setup (exists)
    unit/                           Business rules (T-BR, T-AUTH)
    components/                     Shared components (T-C)
    screens/                        Screens, modals and navigation (T-US, T-S, T-M, T-NAV, T-EDGE)
    fixtures/                       Sample photos and fake data from PRD 8.4
  vercel.json                       Sends every route to index.html (single-page app, #15)
  IMPLEMENTATION_PLAN.md
  .env.example
  README.md
```

**Rule:** a new folder may only be created if it is added to this section first.

---

## 6. Environment variables and secrets

From PRD 11.5.

| Name | What it is | Where to get it | Public or secret | Used by |
| --- | --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL | Local: `http://127.0.0.1:55321` (from `npx supabase status`). Hosted: Supabase dashboard → Project Settings → API | Public | App, seed script |
| `VITE_SUPABASE_ANON_KEY` | Supabase public (anon) key | Same | Public. Safe only because RLS is on for every table and the bucket has policies. | App |
| `SUPABASE_SERVICE_ROLE_KEY` | Full-access key | Same | **Secret** | `supabase/seed/seed.js` only. Never in `src/`, never in Vercel. |
| `AI_API_KEY` | Key for the AI model (F7) | The AI provider's dashboard | **Secret** | Supabase Edge Function secret only (Phase 16) |
| `SEED_ALLOW_REMOTE` | Lets `seed.js` run against a non-local URL | You set it, only when seeding the hosted project | Not secret | `supabase/seed/seed.js` |

`.env.example` is already committed with placeholder values for the first four.

Rules:

- Real values go in `.env`, which is in `.gitignore` and never committed.
- Only variables starting with `VITE_` may be used in `src/`. T-NFR-6 fails if `SERVICE_ROLE` or `AI_API_KEY` appears in `src/`.
- Vercel gets only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Phase 4).
- If a new variable is needed, add it here and to `.env.example` first.

---

## 7. Design system and screens

**Design rule (applies to every phase):** the Stitch designs (Issue #6) are not finished. Before building any screen, modal or shared component, check that its design is in `docs/designs/` on `main`. **If the design is missing, stop and ask the human.** Do not build the screen from the PRD text alone, and do not guess layout, colours or spacing. Logic, rules, database work and tests that do not depend on the layout (for example `src/lib/rules/`) may go ahead.

### 7.1 Design tokens (`src/styles/tokens.ts`)

`tokens.ts` is the single source of truth, and `tailwind.config.ts` reads from it. The scaffold already holds the PRD 9.1 values below as a starting point. **Every token is "TBD until docs/designs is merged":** when #6 is merged, compare each value with the style guide export, and if they differ, stop and ask the human which one wins (and update PRD 9.1 with a change log row if the design wins). T-SETUP-1 then locks the final values.

| Token | PRD 9.1 value (provisional) | From PRD | Final value |
| --- | --- | --- | --- |
| `colors.primary` | #005D28 Coat of Arms Green | 9.1 Primary (buttons, links, active tabs) | TBD until docs/designs is merged |
| `colors.secondary` | #531A17 Heritage Brown | 9.1 Secondary (header bar, headings) | TBD until docs/designs is merged |
| `colors.accent` | #D8A851 Gold (dark text only) | 9.1 Accent (header line, icons) | TBD until docs/designs is merged |
| `colors.urgent` | #EF4718 Orange (dark text #1C1C1C) | 9.1 Urgent label | TBD until docs/designs is merged |
| `colors.background` / `colors.surface` | #FFFFFF / #F8F6F1 | 9.1 Background | TBD until docs/designs is merged |
| `colors.text.DEFAULT` / `colors.text.secondary` | #1C1C1C / #5C5650 | 9.1 Main text | TBD until docs/designs is merged |
| `colors.error` / `colors.success` / `colors.warning` | #B42318 / #1E7B34 / #87451A | 9.1 | TBD until docs/designs is merged |
| `colors.status.*` | received #5C5650 · viewed #825B32 · assigned #531A17 · scheduled #87451A · in-progress #B46E12 · fixed #005D28 · closed #1C1C1C · reopened #B42318 | 9.1 Status colours | TBD until docs/designs is merged |
| `colors.disabled` / `colors.onDisabled` | #D0D5DD / #667085 | 8.3 Primary button disabled | TBD until docs/designs is merged (not in `tokens.ts` yet) |
| `fontFamily.sans` | Inter | 9.1 Font | TBD until docs/designs is merged |
| `fontSize.title` / `heading` / `label` / `body` / `small` | 24 bold / 18 semibold / 16 semibold / 16 regular / 13 regular (min 12) | 9.1 Text sizes | TBD until docs/designs is merged (not in `tokens.ts` yet) |
| `spacing` | 4, 8, 16, 24, 32 px (unit 8) | 9.1 Spacing | TBD until docs/designs is merged (not in `tokens.ts` yet) |
| `screenMargin.phone` / `tablet` / `desktop` | 16 / 24 / 32 px | 9.1 Screen side margin | TBD until docs/designs is merged (not in `tokens.ts` yet) |
| `borderRadius.card` / `input` / `button` / `photo` / chip | 12 / 8 / 8 / 8 px / pill | 9.1 Corner radius | TBD until docs/designs is merged |
| `boxShadow.card` | 0 1px 3px rgba(16, 24, 40, 0.1) | 9.1 Shadows | TBD until docs/designs is merged |
| `size.button` / `size.touchMin` | 48 px / 44 px | 9.1, 9.4 | TBD until docs/designs is merged (not in `tokens.ts` yet) |
| `size.contentMax` / `size.modalDesktop` | 1200 px / 480 px | 9.3 | TBD until docs/designs is merged (not in `tokens.ts` yet) |
| `size.headerLine` | 3 px gold line under the header | 8.3 Header | TBD until docs/designs is merged (not in `tokens.ts` yet) |
| `screens.tablet` / `screens.desktop` | 640 px / 1024 px | 9.3 Breakpoints | TBD until docs/designs is merged (not in `tokens.ts` yet) |
| `focus.ring` | 2 px primary, 2 px gap | 9.3 | TBD until docs/designs is merged (not in `tokens.ts` yet) |

### 7.2 Shared components

From PRD 8.3. Each is built in the first phase that needs it, and only after its design exists.

| Component | File | Variants and states | Used on | Tests | Phase |
| --- | --- | --- | --- | --- | --- |
| Header | `components/Header.tsx` | Heritage Brown bar, white back arrow (optional), white title, optional right button, 3 px gold line; sticky | All screens | T-C-1 | 5 |
| TabBar | `components/TabBar.tsx` | Role-based tabs (Section 11); Lucide icon + label; active tab primary colour and bold; bottom bar under 1024 px, left side menu over 1024 px | S4 to S11 | T-C-2 | 5 |
| Button | `components/Button.tsx` | primary, secondary, danger, text; disabled (#D0D5DD / #667085); loading (spinner replaces label); 48 px | All | T-C-3 | 5 |
| TextField | `components/TextField.tsx` | text, email, phone, number, date, textarea with counter, password with show/hide eye; normal, focused (2 px primary border), error (error border, icon, message; keeps text) | All forms | T-C-4 | 5 |
| SelectField | `components/SelectField.tsx` | dropdown with label and placeholder; error | S2, S6, S11, M2 | T-C-5 | 5 |
| Checkbox | `components/Checkbox.tsx` | unticked, ticked, locked (BR19); label may contain a link | S2, S6, M3 | T-C-6 | 5 |
| Toast | `components/Toast.tsx` | one line, white text on near-black, disappears after 3 seconds | S1, S5, S6, S8, S10, S11 | T-C-7 | 5 |
| OfflineBanner | `components/OfflineBanner.tsx` | grey bar "You're offline. Changes will not be saved." (S6 passes its own text) | All screens | T-C-8 | 5 |
| Modal | `components/Modal.tsx` | bottom sheet on phones, centred 480 px on desktop; closes on Cancel and tap outside, except M5 (Cancel only) | M1 to M7 | T-C-9 | 5 |
| EmptyState | `components/EmptyState.tsx` | line illustration, message, optional button, centred | S4, S7, S8, S9, S10 | T-C-10 | 7 |
| LoadingPlaceholder | `components/LoadingPlaceholder.tsx` | grey cards, rows, lines or stat cards; gentle pulse | S4, S5, S7 to S11 | T-C-11 | 7 |
| StatusChip | `components/StatusChip.tsx` | coloured dot + status name (never colour alone) | S4, S5, S7, S8, S10, M3, M6 | T-C-12 | 7 |
| FaultLabels | `components/FaultLabels.tsx` | "Urgent" (warning icon, orange), "Overdue" (clock icon, red), "Delayed" (hourglass icon) | S4, S5, S7, S8, S10 | T-C-13 | 7 |
| FaultCard | `components/FaultCard.tsx` | 72 px thumbnail, fault type bold, StatusChip, labels, address and ward, reference, upvotes ("1 upvote", hidden at 0), date "12 Nov 2026"; optional distance ("80 m away") and "Please confirm the fix" | S4, S7, S8, M6 | T-C-14 | 7 |
| PhotoPicker | `components/PhotoPicker.tsx` | up to 3 tiles, "Add photo" (camera or gallery), remove; type/size error; "Uploading photos…" progress | S6, M3 | T-C-15 | 8 |
| StatusTimeline | `components/StatusTimeline.tsx` | one row per status change, newest first: status, "12 Nov 2026, 14:05", note | S5 | T-C-16 | 11 |
| JobCard | `components/JobCard.tsx` | photo, fault type, StatusChip, labels, address and landmark, "Due 18 Nov 2026", "Update" button | S10 | T-C-17 | 11 |
| StatCard | `components/StatCard.tsx` | big number, label, caption; overdue variant uses error colour and icon | S9 | T-C-18 | 12 |

### 7.3 Screens

Design files are "TBD until docs/designs is merged". File names will be fixed by #6 (see Section 18 #12). Routes are proposed by this plan.

| ID | Screen | Route / folder | Design | Who can open it (else redirect to) | Tab bar | Required states (PRD 8.2) | Phase | Issue |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | Welcome | `/` (`screens/welcome/`) | TBD until docs/designs is merged | Logged out (else role home) | No | Normal, Offline, Success (account deleted toast) | 13 | #23 |
| S2 | Sign Up | `/sign-up` (`screens/sign-up/`) | TBD until docs/designs is merged | Logged out (else role home) | No | Normal, Loading, Error, Offline, Success | 5 | #10 |
| S3 | Log In | `/log-in` (`screens/log-in/`) | TBD until docs/designs is merged | Logged out (else role home) | No | Normal (with banners), Loading, Error (wrong password, too many attempts, unverified + "Resend email"), Offline, Success | 5 | #10 |
| S4 | Fault List | `/faults` (`screens/fault-list/`) | TBD until docs/designs is merged | Everyone | Yes | Normal, Empty, Filtered empty, Loading, Loading more, Error, Offline (Map toggle in 16) | 7 | #12 |
| S5 | Fault Details | `/faults/:referenceNumber` (`screens/fault-details/`) | TBD until docs/designs is merged | Everyone; actions by role | Yes | Normal, Loading, Error, Not found, Offline (actions disabled), Success toasts; role blocks: reporter (Fixed), ward admin, field team | 8 (read-only base), 11 (full) | #13 / #17, see Section 18 #9 |
| S6 | Report a Fault | `/report` (`screens/report-fault/`) | TBD until docs/designs is merged | Verified resident (visitor → S3; unverified → message, PRD 5) | Yes | Normal, Loading ("Uploading photos…"), Error (upload failed, daily limit), Offline (form kept), Success | 8 | #13 |
| S7 | My Reports | `/my-reports` (`screens/my-reports/`) | TBD until docs/designs is merged | Resident (else role home) | Yes | Normal, Empty (Open), Empty (Closed), Loading, Error, Offline | 11 | #17 |
| S8 | Ward Queue | `/ward/queue` (`screens/ward-queue/`) | TBD until docs/designs is merged (phone and 1440 px) | Ward admin (else role home) | Yes / side menu | Normal (cards on phone, table on desktop), Empty (New / other tabs), Loading, Error, Offline, Success | 10 | #19 |
| S9 | Ward Dashboard | `/ward/dashboard` (`screens/ward-dashboard/`) | TBD until docs/designs is merged (phone and 1440 px) | Ward admin (else role home) | Yes / side menu | Normal, Empty (no open faults; no average), Loading, Error, Offline ("Last updated …") | 12 | #22 |
| S10 | My Jobs | `/my-jobs` (`screens/my-jobs/`) | TBD until docs/designs is merged | Field team (else role home) | Yes | Normal, Empty, Loading, Error, Offline ("Update" disabled), Success | 11 | #20 |
| S11 | Profile and Settings | `/profile` (`screens/profile/`) | TBD until docs/designs is merged | Any logged-in role (else S3) | Yes | Normal, Loading, Error, Offline, Success | 13 (log out in 5) | #23 |
| S12 | Set New Password | `/set-new-password` (`screens/set-new-password/`) | TBD until docs/designs is merged | Anyone with a reset link | No | Normal, Loading, Error (expired link + "Send new link"; other), Offline, Success | 5 | #10 |
| M1 | Forgot Password | Modal on S3 | TBD until docs/designs is merged | Logged out | n/a | Normal, Loading, Error, Offline, Success | 5 | #10 |
| M2 | Assign Fault | Modal on S5 | TBD until docs/designs is merged | Ward admin of the fault's ward | n/a | Normal, Empty (no matching teams), Loading, Error (incl. "You can only manage faults in your ward."), Offline, Success | 10 | #19 |
| M3 | Update Status | Modal on S10 and S5 | TBD until docs/designs is merged | Field team of the fault | n/a | Normal, Loading, Error (incl. "You can only update faults assigned to your team."), Offline, Success; after photos in 16 | 11 | #20 |
| M4 | Reopen Fault | Modal on S5 | TBD until docs/designs is merged | Reporter, status Fixed | n/a | Normal, Loading, Error, Offline, Success | 11 | #17 |
| M5 | Delete Account | Modal on S11 | TBD until docs/designs is merged | Resident | n/a | Normal, Loading, Error, Offline, Success | 13 | #23 |
| M6 | Similar Reports | Modal on S6 | TBD until docs/designs is merged | Resident, when BR4 finds matches | n/a | Normal, Loading, Error ("We couldn't check for similar faults."), Success | 8 | #13 |
| M7 | Privacy Notice | Modal on S2 and S11 | TBD until docs/designs is merged | Everyone | n/a | Normal | 5 (on S2), 13 (on S11) | #10 / #23 |

---

## 8. Data model and database

All tables live in the `public` schema. `profiles.id` is the Supabase Auth user id. Every function sets `search_path = ''`. Times are stored in UTC and shown in SAST.

### 8.1 Tables

**DONE in #9** (migrations `20261111120001` to `20261111120004`): `wards`, `fault_types`, `field_teams`, `profiles` exactly as in PRD 10.1, with enums `user_role`, `language_code`, `fault_category`, `field_team_kind`, check constraints for every length and format rule, `profiles_one_ward_admin_per_ward` (partial unique index), and the role checks (`ward_id` required for resident and ward_admin, `field_team_id` required for field_team, residents 18+). Do not edit those migrations; any change is a new migration.

**To build in #11 (Phase 6):**

**Table: `faults`**: one reported problem (PRD 10.1 Fault).

| Column | Type | Null? | Default | Constraints | Notes |
| --- | --- | --- | --- | --- | --- |
| id | uuid | No | gen_random_uuid() | primary key | |
| reference_number | text | No | set by trigger (BR1) | unique; check format `^FMK-[0-9]{4}-[0-9]{5}$`; cannot be updated | BR1 |
| reporter_id | uuid | Yes | auth.uid() | FK → `profiles.id` on delete set null | Cleared when the reporter deletes their account (PRD 5) |
| ward_id | uuid | No | — | FK → `wards.id` on delete restrict | Defaults to the reporter's home ward in the app |
| fault_type_id | uuid | No | — | FK → `fault_types.id` on delete restrict | |
| is_urgent | boolean | No | false | forced true by trigger when the fault type is `auto_urgent` | BR19 |
| no_photo_safe | boolean | No | false | | BR2 |
| description | text | No | — | 10 to 500 characters, or 30 to 500 when `no_photo_safe` | BR2, BR17 |
| description_language | enum en, af, zu, nso, other | No | reporter's language | | BR18 |
| description_en | text | Yes | — | up to 1000 characters | AI translation (F7) |
| street_address | text | No | — | 5 to 120 characters | BR3 |
| landmark | text | Yes | — | up to 60 characters | BR3 |
| latitude / longitude | numeric | Yes | — | −35 to −22 / 16 to 33; both or neither | BR3 |
| status | enum `fault_status` | No | 'received' | changes only through the status function (8.3) | BR9 |
| field_team_id | uuid | Yes | — | FK → `field_teams.id` on delete restrict | Edge case: field team with open faults cannot be deleted |
| due_date | date | Yes | — | | BR8, BR12 |
| estimated_days | integer | Yes | — | 1 to 90 | BR8 |
| municipal_reference | text | Yes | — | up to 30 characters | Ward admin only (not in the public view) |
| is_delayed | boolean | No | false | | BR12 |
| delay_reason | text | Yes | — | 10 to 200 characters | BR12 |
| reopen_count | integer | No | 0 | 0 to 2 | BR14 |
| upvote_count | integer | No | 0 | ≥ 0; kept by trigger on `upvotes` | BR5 |
| viewed_at, assigned_at, fixed_at, closed_at | timestamptz | Yes | — | | BR10, BR13, BR15 |
| created_at / updated_at | timestamptz | No | now() | `updated_at` set by trigger | "date reported" |

**Table: `fault_photos`**: PRD 10.1 FaultPhoto. Columns `id`, `fault_id` (FK on delete cascade), `kind` (enum before, after; default before), `storage_path` (text, path in bucket `fault-photos`), `uploaded_by` (FK → profiles on delete set null), `created_at`. At most 3 rows per fault per kind (trigger).

**Table: `upvotes`**: PRD 10.1 Upvote. Columns `id`, `fault_id` (FK on delete cascade), `user_id` (FK → profiles on delete cascade), `created_at`; unique (`fault_id`, `user_id`).

**Table: `status_changes`**: PRD 10.1 StatusChange. Columns `id`, `fault_id` (FK on delete cascade), `from_status` (nullable), `to_status`, `changed_by` (FK → profiles on delete set null; null for automatic changes), `note` (up to 200 characters), `created_at`.

**View: `faults_public`**: every fault column except `reporter_id` and `municipal_reference`, plus the fault type name and category, ward name, field team name and kind (PRD 11.4, BR16). Readable by `anon` and `authenticated`.

**Table: `fault_reference_counters`** (internal): one row per year with the last number used, so BR1 numbers restart at 00001 each year without gaps from concurrent inserts. No grants to app roles.

### 8.2 Relationships and delete behaviour

- One ward has many faults, many resident profiles and at most one ward admin profile (DONE).
- One field team has many faults and many field team profiles. Deleting a field team, ward or fault type that is in use is blocked (restrict).
- Deleting a login cascades to `profiles` (DONE) and to that user's `upvotes`; `faults.reporter_id`, `fault_photos.uploaded_by` and `status_changes.changed_by` are set to null (PRD 5, 6.2).
- Faults are never deleted in the app (PRD 11.4). Their photos and history cascade only if the admin deletes a fault in the dashboard.

### 8.3 Status changes (PRD 10.3)

| From | To | Who | Function |
| --- | --- | --- | --- |
| (new) | received | Resident submits S6 | insert trigger writes the first `status_changes` row |
| received | viewed | Ward admin of the ward, first open of S5 (BR10) | `mark_fault_viewed(fault_id)` |
| received, viewed, reopened | assigned | Ward admin of the ward (BR8) | `assign_fault(...)` |
| assigned, scheduled | assigned | Ward admin reassigns | `assign_fault(...)` |
| assigned | scheduled | Field team of the fault | `change_fault_status(...)` |
| assigned, scheduled | in_progress | Field team of the fault | `change_fault_status(...)` |
| in_progress | fixed | Field team of the fault (BR13) | `change_fault_status(...)` |
| fixed | closed | Reporter ("Yes, it's fixed") or the daily job (BR14) | `confirm_fault_fixed(fault_id)` / `auto_close_fixed_faults()` |
| fixed | reopened | Reporter, at most 2 times (BR14) | `reopen_fault(fault_id, reason)` |

Closed is final. A trigger on `faults` rejects any other change of `status`, and writes a `status_changes` row for every allowed change (BR9). App roles have no direct `update` grant on `faults.status`.

### 8.4 Indexes

- `faults (created_at desc)`: S4 newest first (BR6)
- `faults (upvote_count desc, created_at desc)`: S4 "Most upvoted"
- `faults (ward_id, status)`: S8 queue, S9 dashboard, filters
- `faults (fault_type_id, ward_id, created_at)`: BR4 similar reports
- `faults (reporter_id, created_at desc)`: S7, BR17 daily limit
- `faults (field_team_id, due_date)`: S10
- `faults (reference_number)`: unique, search (BR6)
- `upvotes (fault_id, user_id)`: unique; `status_changes (fault_id, created_at desc)`; `fault_photos (fault_id, kind)`

### 8.5 Automatic jobs and triggers

| Name | Runs when | What it does | BR# | Test | Status |
| --- | --- | --- | --- | --- | --- |
| `handle_new_user` | After insert on `auth.users` | Creates the profile from sign-up data; role is always resident. Security definer. | PRD 5 | pgTAP 02 | **DONE** (#9) |
| `guard_profile_update` | Before update on `profiles` | Stops non-residents changing `ward_id` from the app | PRD 11.4 | pgTAP 04 | **DONE** (#9) |
| `set_fault_reference_number` | Before insert on `faults` | FMK-YYYY-NNNNN from the counter table, year in SAST | BR1 | T-BR1-2 | #11 |
| `apply_fault_defaults` | Before insert on `faults` | Forces `is_urgent` for auto-urgent types; checks the reporter is a verified resident; enforces 5 per 24 hours | BR17, BR19, PRD 5 | T-BR17-2, T-BR19-2 | #11 |
| `record_status_change` | After insert, and after update of `status` on `faults` | Writes the `status_changes` row | BR9 | T-BR9-2 | #11 (insert), #16 (update) |
| `guard_fault_status` | Before update on `faults` | Allows only the changes in 8.3; Closed is final | BR9 | T-BR9-3 | #16 |
| `sync_upvote_count` | After insert or delete on `upvotes` | Keeps `faults.upvote_count` up to date | BR5 | T-BR5-3 | #11 |
| `guard_upvote` | Before insert on `upvotes` | Rejects own fault and Closed fault | BR5 | T-BR5-2 | #11 |
| `limit_fault_photos` | Before insert on `fault_photos` | At most 3 per kind; "after" only by the fault's field team | BR2, BR13 | T-BR2-4 | #11 / #14 |
| `set_updated_at` | Before update on `faults` | Sets `updated_at` | PRD 10.1 | T-DB-2 | #11 |
| `auto_close_fixed_faults` (pg_cron) | Daily at 02:00 SAST (00:00 UTC) | Closes faults Fixed for 7 days or more, `changed_by` null | BR14 | T-BR14-4 | #16 |

### 8.6 Migrations (in order)

Done (#9), never edit:

1. `20261111120001_core_tables.sql`
2. `20261111120002_profile_triggers.sql`
3. `20261111120003_rls_and_grants.sql`
4. `20261111120004_reference_data.sql`

To add (timestamps are set when the file is created with `npx supabase migration new <name>`):

5. `faults` (#11): `fault_status` and `description_language` enums, `faults`, `fault_reference_counters`, `fault_photos`, `upvotes`, `status_changes`, indexes, the #11 triggers in 8.5
6. `faults_rls` (#11): RLS, grants, `faults_public` view, upvote and photo policies (Section 9)
7. `fault_photos_storage` (#14): bucket `fault-photos` and storage policies
8. `status_rules` (#16): `guard_fault_status`, `change_fault_status`, `confirm_fault_fixed`, `reopen_fault`, `mark_fault_viewed`, pg_cron job
9. `assign_fault` (#18): `assign_fault` and the ward admin read policies
10. `ward_dashboard` (#21): `ward_dashboard_figures()`
11. Later migrations for F6, F7 and F8 only if needed (#25, #26)

### 8.7 Seed data and test accounts

- **DONE (#9):** `supabase/seed.sql` creates the 6 users from PRD 8.4 with confirmed emails; Zanele is ward admin of Ward A; Kagiso is in Sample Plumbing Services (Pty) Ltd. `supabase/seed/seed.js` sets the PRD 10.4 passwords through the Auth admin API and refuses non-local URLs unless `SEED_ALLOW_REMOTE=true`.
- **To add (#11):** the 5 faults from PRD 8.4 (FMK-2026-00123, 00121, 00118, 00115, 00109), plus one Closed Ward A fault fixed 5 days after it was reported and one Viewed Ward A electricity fault ("Streetlight flickering", Section 18 #11), with their upvotes and status history. Fixed reference numbers so tests can use them.
- **To add (#14):** seed photos uploaded by `seed.js` from `supabase/seed/photos/` (Section 18 #13).
- **Test accounts (PRD 10.4, test-only passwords):** thandeka.m@example.com / TestResident1 (resident, Ward A); nomsa.s@example.com / TestResident2 (resident, empty states); zanele.k@example.com / TestWardAdmin1 (ward admin, Ward A); kagiso.m@example.com / TestFieldTeam1 (field team, Sample Plumbing Services). Lerato and Johan exist as reporters but have no PRD password.
- **Demo date:** PRD 8.4 says "today" is 12 Nov 2026. Seed due dates are fixed dates, so overdue figures change after that date; tests that depend on "today" set a fixed date.

---

## 9. Security and permissions

Every rule below is enforced by the database or Storage, never only by hiding things on screen (PRD 2.4, 12.3). "Verified" means the login's email is confirmed (PRD 5).

### 9.1 Permission table

| ID | Table / resource | Action | Who is allowed | Rule | Enforced by | Tests (allow / deny) | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SEC1 | `profiles` | read | The user themselves | Own row only | RLS select policy | pgTAP 04 | **DONE** (#9) |
| SEC2 | `profiles` | update | The user themselves | Only `full_name`, `phone`, `language`, `ward_id`; `ward_id` only for residents | Column grants + RLS + `guard_profile_update` | pgTAP 04 | **DONE** (#9) |
| SEC3 | `profiles` | create | Nobody in the app | Created only by `handle_new_user`, role always resident | No insert grant | pgTAP 02, 04 | **DONE** (#9) |
| SEC4 | `profiles` | delete | Residents, own row | Staff accounts are removed by the admin | RLS delete policy | pgTAP 04 | **DONE** (#9); full account deletion is OP9 (Section 18 #6) |
| SEC5 | `wards`, `fault_types` | read / write | Everyone reads; nobody writes from the app | Admin changes only through migrations | Grants + RLS | pgTAP 05 | **DONE** (#9) |
| SEC6 | `field_teams` | read | Everyone, without `contact_phone`. Ward admins read contact numbers through `field_team_contacts()`. | BR16 | Column grants + security definer function | pgTAP 03, 05 | **DONE** (#9) |
| SEC7 | `profiles` | read | Ward admin: reporters of faults in their ward | PRD 11.4. Public screens never read profiles. | RLS select policy | T-SEC-7a / T-SEC-7b | #18 |
| SEC8 | `faults` | read | Everyone through `faults_public` (no `reporter_id`, no `municipal_reference`). Full row: the reporter, the ward admin of its ward, its field team. | BR16, PRD 11.4 | View grants + RLS select policy | T-SEC-8a / T-SEC-8b | #11 |
| SEC9 | `faults` | create | Verified residents | `reporter_id = auth.uid()`; at most 5 in 24 hours | RLS insert policy + `apply_fault_defaults` | T-SEC-9a / T-SEC-9b | #11 |
| SEC10 | `faults` | update (ward admin) | Ward admin of the fault's ward | Viewed (BR10), assign/reassign (BR8): `field_team_id`, `due_date`, `estimated_days`, `municipal_reference`, status | `mark_fault_viewed`, `assign_fault` (no direct update grant) | T-SEC-10a / T-SEC-10b | #16, #18 |
| SEC11 | `faults` | update (field team) | Field team of the fault | Status scheduled / in_progress / fixed; delayed with reason and date (BR12) | `change_fault_status` | T-SEC-11a / T-SEC-11b | #16 |
| SEC12 | `faults` | update (reporter) | The reporter, status Fixed | Fixed → Closed or Reopened (max 2) | `confirm_fault_fixed`, `reopen_fault` | T-SEC-12a / T-SEC-12b | #16 |
| SEC13 | `faults` | delete | Nobody in the app | | No delete grant | T-SEC-13b (deny only) | #11 |
| SEC14 | `fault_photos` | read / create | Everyone reads. Reporter creates "before" while creating the fault; its field team creates "after". Nobody updates or deletes. | BR2, BR13 | RLS + `limit_fault_photos` | T-SEC-14a / T-SEC-14b | #11, #14 |
| SEC15 | Storage bucket `fault-photos` | upload / read | Upload: logged-in user into a path that belongs to a fault they may add photos to; under 10 MB; JPG, PNG, HEIC, WebP. Read: everyone. | BR2 | Storage policies + bucket limits | T-SEC-15a / T-SEC-15b | #14 |
| SEC16 | `upvotes` | create / delete / read | Verified residents create, not on their own or a Closed fault; delete their own; read their own (counts are public via `upvote_count`) | BR5 | RLS + `guard_upvote` | T-SEC-16a / T-SEC-16b | #11 |
| SEC17 | `status_changes` | read / write | Everyone reads; only the trigger writes; nobody updates or deletes | BR9 | Grants + RLS | T-SEC-17a / T-SEC-17b | #11 |
| SEC18 | Dashboard figures | read | Ward admin, own ward only | BR15 | `ward_dashboard_figures()` checks the caller | T-SEC-18a / T-SEC-18b | #21 |
| SEC19 | All tables, functions and the bucket | any | Logged-out visitors | Only read S4/S5 data (public view, reference tables, photos, status history) | Grants to `anon` | T-SEC-19b (deny only) | #11 |

### 9.2 Always-on security checks (tested in Phase 2, Phase 6 and Phase 15)

- [x] Every table in `public` has RLS switched on (pgTAP 03, #9). New tables must be added to that test.
- [x] Every function sets `search_path = ''`; only `handle_new_user` and `field_team_contacts` are security definer (pgTAP 03, #9). New security definer functions (e.g. `assign_fault`) must be added to that test with a reason.
- [ ] Input is checked in the app (`src/lib/rules/`) **and** in the database (constraints and triggers in Section 8).
- [ ] The 5-per-24-hours limit (BR17), the 1 upvote rule (BR5) and the 2 reopen rule (BR14) are enforced by the database, not only by disabling buttons.
- [ ] Photos are resized, compressed and stripped of EXIF in the browser (BR2), and checked again by the bucket's size and type limits.
- [ ] Status changes go only through database functions that check 8.3 (PRD 12.3).
- [ ] No passwords, tokens or personal data are written to logs (T-NFR-7).
- [ ] No secret key in `src/` or Git (T-NFR-6).

---

## 10. Backend operations

All operations live in `src/lib/api/`. Each returns data or one of the exact messages from the PRD (through `src/lib/messages.ts` and `en.json`). Raw Supabase errors are never shown. If an error code below does not match what Supabase really returns, stop and ask (Rule 6).

| ID | Operation | Who can call it | Input | Output | Rules | Errors (exact message) | Built as | Tests | Issue |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OP1 | Sign up | Logged out | full name, email, phone, home ward, password, is18, agreedPrivacy | Account created, confirmation email sent, S3 with "Check your email to confirm your account." | PRD 5 | "This email already has an account. Log in instead."; "Use at least 8 characters with a letter and a number."; "Something went wrong. Try again." | Auth `signUp` with `options.data` = `full_name`, `phone`, `ward_id`, `language`, `is_18_or_older` (read by `handle_new_user`), `emailRedirectTo` = `/log-in`. An empty `identities` list also means "already has an account". | T-US1-1 to 3 | #10 |
| OP2 | Log in | Logged out | email, password | Session; go to the role's home (S4, S8 or S10) | PRD 5 | "Wrong email or password."; "Too many attempts. Please wait a few minutes and try again."; "Please confirm your email first. Check your inbox." | Auth `signInWithPassword`, then OP7 for the role | T-US2-1, T-US2-2, T-AUTH-2 | #10 |
| OP3 | Resend confirmation email | Logged out or unverified | email | Email sent again | PRD 5 | "Something went wrong. Try again." | Auth `resend({ type: 'signup' })` | T-S3-2 | #10 |
| OP4 | Request password reset | Logged out | email | Always "If this email has an account, we've sent a reset link." | PRD 5 | "Enter a valid email address." | Auth `resetPasswordForEmail`, `redirectTo` = `/set-new-password` | T-US2-3 | #10 |
| OP5 | Set new password | Holder of a reset link | new password | S3 with "Password changed. Please log in." | PRD 5 | "This link has expired. Request a new one."; "The passwords don't match." | Recovery session from the link, then `updateUser({ password })`, then sign out | T-US2-4 | #10 |
| OP6 | Log out | Logged in | none | S1 | PRD 5 (no confirmation) | none | Auth `signOut` | T-S11-2 | #10 |
| OP7 | Get my profile | Logged in | none | Profile with role, ward, field team, language | SEC1 | "Something went wrong. Try again." | Select own `profiles` row | T-AUTH-3 | #10 |
| OP8 | Update my profile | Logged in | full name, phone, home ward (residents), language | Saved profile, toast "Profile saved" | SEC2, BR18 | Field messages from S11; "Something went wrong. Try again." | Update own row (column grants) | T-US4-1, T-S11-1 | #23 |
| OP9 | Delete account | Resident | none | Login, profile and upvotes deleted; faults kept without reporter; S1 with "Your account has been deleted." | PRD 5, SEC4 | "Something went wrong. Try again." | **Open, Section 18 #6.** Deleting the Auth login needs the service role key, which must never be in the browser. | T-US4-2, T-US4-3 | #23 |
| OP10 | Reference data | Everyone | none | Wards, fault types (with category, auto_urgent), field teams (no contact) | SEC5, SEC6 | "Something went wrong. Try again." | Select from `wards`, `fault_types`, `field_teams` | T-S2-1, T-S6-1 | #10 / #13 |
| OP11 | List faults | Everyone | search, ward, category, status, sort, page | 20 faults per page | BR6, BR16 | "Something went wrong. Try again." | Select from `faults_public`; reference number exact match or `ilike` on street address; `range` for 20 per page | T-US5-1 to 3, T-BR6-1 | #12 |
| OP12 | Get fault details | Everyone (more for some roles) | reference number | Fault, photos, status history, responsibility block; for the ward admin also municipal reference and field team contact | BR16 | "We couldn't load this fault. Try again."; "We couldn't find this fault." | `faults_public` (or `faults` for permitted roles), `fault_photos`, `status_changes`, OP26 | T-US9-1, T-S5-1 | #13 (read-only) / #17 |
| OP13 | Find similar faults | Verified resident | ward, fault type, latitude, longitude | Up to 5 faults with distance | BR4 | "We couldn't check for similar faults." | Database function `similar_faults(...)` (distance in SQL) | T-BR4-1 to 3, T-US6-1 | #11 (function), #13 |
| OP14 | Upload fault photos | Verified resident (before), field team (after) | 1 to 3 files, fault id | Storage paths | BR2, SEC15 | "This photo is too big or not a supported type. Use a JPG, PNG, HEIC or WebP under 10 MB."; "Upload failed. Check your connection." | Resize to 1600 px, compress under 500 KB, strip EXIF in the browser; upload to `fault-photos/{fault id}/{photo id}.jpg`; insert `fault_photos` rows | T-BR2-1 to 4, T-US3-4 | #14 |
| OP15 | Create fault | Verified resident | photos or no-photo flag, fault type, urgent, ward, address, landmark, GPS, description | Saved fault with reference number; S5 with "Fault reported. Your reference number is FMK-2026-00125." | BR1, BR2, BR3, BR17, BR19 | "Add at least 1 photo."; "You can report up to 5 faults a day. Please try again tomorrow."; "Upload failed. Check your connection."; field messages from S6 | Insert into `faults` (id made by the app so photo paths can use it), then OP14. If photos fail, the fault and uploaded files are removed (Section 18 #8). | T-US3-1 to 4, T-BR17-1 to 2 | #13 |
| OP16 | Upvote / remove upvote | Verified resident | fault id | New count; toast "Thanks, your upvote was added." from M6 | BR5 | "This fault is closed and can't be upvoted."; "You reported this fault" (disabled button) | Insert / delete own `upvotes` row | T-US6-2, T-US6-3, T-BR5-1 to 3, T-EDGE-8 | #12 |
| OP17 | Mark fault viewed | Ward admin of the ward | fault id | Status Viewed (first open only) | BR10 | none shown | `mark_fault_viewed(fault_id)` | T-US7-1 | #16 (function), #19 (call) |
| OP18 | Assign / reassign fault | Ward admin of the ward | fault id, field team, due date, estimated days, municipal reference, note | Status Assigned; toast "Fault assigned" | BR8, SEC10 | "Choose a field team."; "Choose a date within the next 90 days."; "Enter a number of days from 1 to 90."; "Keep this under 30 characters."; "Keep the note under 200 characters."; "You can only manage faults in your ward." | `assign_fault(...)` | T-US7-2 to 4, T-BR8-1 to 2 | #18, #19 |
| OP19 | Update status / mark delayed | Field team of the fault | fault id, new status, note, delay reason, new due date | Status changed, toast "Status updated" | BR9, BR12, BR13, SEC11 | "Choose a new status."; "Explain the delay in at least 10 characters."; "Choose a later date within the next 90 days."; "You can only update faults assigned to your team." | `change_fault_status(...)` | T-US8-1 to 3, T-BR12-1 to 2 | #16, #20 |
| OP20 | Confirm fix / reopen | Reporter, status Fixed | fault id, reason (reopen) | Closed with toast "Thanks for confirming.", or Reopened with toast "Fault reopened" | BR14, SEC12 | "Tell us what's still wrong in at least 10 characters."; "This fault can't be reopened again. Please report a new fault." | `confirm_fault_fixed`, `reopen_fault` | T-US10-1 to 3, T-BR14-1 to 3 | #16, #17 |
| OP21 | Auto-close | pg_cron, daily 02:00 SAST | none | Faults Fixed for 7+ days become Closed | BR14 | none | `auto_close_fixed_faults()` | T-US10-4, T-BR14-4 | #16 |
| OP22 | Ward queue | Ward admin | tab, category, urgent only, overdue only | Faults in BR7 order with tab counts | BR7, BR11 | "Something went wrong. Try again." | Select own ward's faults not Closed, order urgent, upvotes desc, created_at asc | T-BR7-1, T-S8-1 | #19 |
| OP23 | My reports | Resident | tab (Open / Closed) | Own faults, newest first | SEC8 | "Something went wrong. Try again." | Select own faults | T-US9-2, T-US9-3 | #17 |
| OP24 | My jobs | Field team | tab (To do / Done) | Own team's faults, overdue first, then due date | SEC8 | "Something went wrong. Try again." | Select faults of own field team | T-S10-1 | #20 |
| OP25 | Ward dashboard figures | Ward admin | none | Open, overdue, average days to fix (1 decimal or no data), open by category | BR15, SEC18 | "Something went wrong. Try again." | `ward_dashboard_figures()` | T-US11-1, T-US11-2, T-BR15-1 | #21, #22 |
| OP26 | Field team contacts | Ward admin | none | Contact numbers | BR16 | none | `field_team_contacts()` | pgTAP 03, 05 | **DONE** (#9) |
| OP27 | After photos (F6) | Field team of the fault | 1 to 3 files | Before and after photos on S5 | BR13 | "Add at least 1 after photo." | OP14 with kind "after", required by `change_fault_status` once F6 is on | T-US12-1, T-US12-2 | #25 |
| OP28 | AI suggestion and translation (F7) | Verified resident (suggest); ward admin and field team (translation) | photo, description | Suggested type and urgency chip; `description_en` | BR20 | none (fails silently after 8 seconds) | Edge Function holding `AI_API_KEY` (provider chosen by the Tech Lead, PRD 11.2) | T-US13-1 to 3 | #26 |
| OP29 | Map faults (F8) | Everyone | filters | Faults with GPS as pins, count without GPS | BR21 | "2 faults without a map location are not shown." | Same query as OP11 | T-US14-1, T-US14-2 | #26 |

---

## 11. Navigation rules

- **Home by role (PRD 7.2):** Resident → S4. Ward admin → S8. Field team → S10. Visitor → S1.
- **Logged out:** can open S1, S2, S3, S4, S5 and S12, plus M1 (from S3) and M7 (from S2). The Report tab and "Affects me too" go to S3. Any other route goes to S1.
- **Logged in:** opening S1, S2 or S3 goes to the role's home. Screens for another role go to the role's home with "You don't have access to this." (PRD 12.2).
- **Unverified resident:** can browse S4 and S5. Report, upvote, confirm and reopen show "Please confirm your email first. Check your inbox." with "Resend email" (PRD 5).
- **Unknown routes:** go to S1 when logged out, otherwise the role's home.
- **Session expired:** show "Please log in again.", go to S3, then back to the same screen after logging in. S6 keeps its form in the browser (PRD 6.2, 12.2).
- **Tabs (bottom under 1024 px, left side menu over 1024 px):** Visitor: Faults (S4), Log in (S3). Resident: Faults (S4), Report (S6), My reports (S7), Profile (S11). Ward admin: Queue (S8), Dashboard (S9), Faults (S4), Profile (S11). Field team: My jobs (S10), Faults (S4), Profile (S11). The tab bar is hidden on S1, S2, S3, S12 and in modals.
- **Back button:** the header back arrow returns to the previous screen. Modals close with Cancel or the browser back button, and by tapping outside except M5.
- **Email links:** the confirmation link opens S3 with "Email confirmed. Please log in." The reset link opens S12.
- **Navigation map:** PRD 7.2 (the Mermaid chart there is the reference; do not copy it into code).

---

## 12. Testing strategy

### 12.1 The TDD cycle (every task, every phase)

1. **Red:** write one test for the behaviour, using the acceptance criterion or rule. Run it. It must **fail**, and fail for the expected reason (e.g. "screen not found", not "syntax error"). Commit it on its own (`test: ...`), as in #5 and #9.
2. **Green:** write the **smallest** amount of code that makes that test pass. Run **all** tests.
3. **Refactor:** clean up names, remove duplication, move code to the right folder. Run all tests again. They must still pass.
4. Repeat for the next test.

### 12.2 Test levels

| Level | What it proves | Tool | Folder | Command |
| --- | --- | --- | --- | --- |
| Unit | Business rules and helpers in `src/lib/rules/` | Vitest | `tests/unit/` | `npm test` |
| Component | Each shared component in every state | Vitest + React Testing Library (jsdom) | `tests/components/` | `npm test` |
| Screen | Each screen and modal in every state, with `src/lib/api` mocked; navigation rules | Vitest + React Testing Library | `tests/screens/` | `npm test` |
| Database and permissions | Constraints, triggers, functions and RLS allow and deny the right people | pgTAP | `supabase/tests/` | `npx supabase test db` |
| Manual | Screens match the designs; real phones; the acceptance checklist (Section 15) on the live link | Human (Bao992 leads, PRD 11.7) | Step 5 of each phase and Issue #7 | none |

### 12.3 Test IDs

Every new automated test name starts with its ID, for example `it('T-US1-2 shows the already-registered message', ...)`. Run one test with `npm test -- -t "T-US1-2"`. The pgTAP tests from #9 (files 00 to 06) have no IDs; new pgTAP files start at `07_` and put the ID in each test description.

| Prefix | Comes from | Example |
| --- | --- | --- |
| T-SETUP-# | Tooling, tokens, CI | T-SETUP-1 |
| T-US#-# | PRD acceptance criteria (Section 6.1) | T-US3-2 |
| T-AUTH-# | Account rules (PRD 5) | T-AUTH-1 |
| T-BR#-# | Business rules BR1 to BR21 | T-BR8-1 |
| T-SEC-#a / b | Permission rules (Section 9), allow / deny | T-SEC-9b |
| T-DB-# | Constraints and triggers not covered by a BR | T-DB-2 |
| T-C-# | Shared components (Section 7.2) | T-C-14 |
| T-S#-# / T-M#-# | Extra states or behaviour of one screen or modal | T-S5-1 |
| T-NAV-# | Navigation rules (Section 11) | T-NAV-1 |
| T-EDGE-# | Edge cases (PRD 6.2, in order: 1 offline on S6, 2 session expires on S6, 3 reporter deletes account, 4 ward admin changes, 5 field team removed, 6 location refused, 7 bad photo, 8 fault closed while open) | T-EDGE-6 |
| T-NFR-# | Quality requirements (PRD 12.1, 9.4) | T-NFR-3 |
| T-REL-# | Release checks | T-REL-1 |

### 12.4 Test data rules

- Tests never depend on each other or on the order they run in.
- pgTAP tests run inside a transaction and roll back, starting from the seed data. To act as a seed user: `set local role authenticated; select set_config('request.jwt.claims', json_build_object('sub', '<seed user id>', 'role', 'authenticated')::text, true);` (the seed user ids are fixed in `supabase/seed.sql`).
- Screen tests use the PRD 8.4 sample data as fake data and never make real network calls (`src/lib/api` is mocked).
- Tests that depend on "today" set a fixed date: 12 Nov 2026, 10:00 SAST (the PRD 8.4 demo date). SAST is UTC+2 with no daylight saving.
- No real personal data or real passwords anywhere in tests. Test passwords come only from PRD 10.4 through `seed.js`.

### 12.5 Coverage rules

- 100% of PRD acceptance criteria (T-US1-1 to T-US14-2) have an automated test, or a manual check where automation is not possible (marked "manual" in Section 15).
- 100% of business rules (BR1 to BR21) have unit or pgTAP tests. Rules for F6 to F8 only once those features are built.
- 100% of permission rules (SEC7 to SEC19) have an allow test and a deny test (SEC13 and SEC19 deny only). SEC1 to SEC6 are already covered by #9.
- 100% of PRD edge cases (T-EDGE-1 to T-EDGE-8) have a test.
- PRD 11.7 list: BR1, BR2, BR4, BR8, BR11, BR12, BR14, BR15, BR17 and the 10.3 status rules have Vitest unit tests for their app-side logic.

---

## 13. Phases

### 13.0 Phase overview

Milestones (PRD 13.4): **Checkpoint 2** Thu 12 Nov 2026, 10:00 · **Checkpoint 3** Mon 16 Nov 2026, 10:00 (mid-way demo) · **Final** Fri 20 Nov 2026, 10:00.

Checkpoint 3 must show, on the live link: **the live link itself, log-in, the database, and one Must feature end to end** (F1: a resident reports a fault and sees it on S5 with its reference number, and it appears on S4). The Colleague Zero hackathon on 13 and 14 Nov cuts build time (PRD 13.2), so Phases 4 to 6 aim to be merged by the night of Fri 13 Nov and Phases 7 and 8 by Sun 15 Nov, 18:00.

| Phase | Name | Issues | Owner (GitHub) | Milestone | Features | Screens | Main tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Foundation | #5, #8 | Paul280-cloud (#5), Mikel17croc (#8, proposed) | Checkpoint 2 | none | placeholder | T-SETUP-1 to 3 | #5 **DONE**, #8 open |
| 2 | Core data and security | #9 | Paul280-cloud | Checkpoint 3 | none | none | pgTAP 00 to 06 (271) | **DONE** |
| 3 | Designs and test plan | #6, #7 | Bafana-Ndlovu (#6), Bao992 (#7) | Checkpoint 2 | none | all (designs) | manual checklist | Open |
| 4 | Live link | #15 | Mikel17croc (proposed) | Checkpoint 3 | none | placeholder | T-REL-1, T-SETUP-4 | Open |
| 5 | Accounts | #10 | Paul280-cloud | Checkpoint 3 | F1 (account) | S2, S3, S12, M1, M7 (on S2); app shell | T-US1, T-US2, T-AUTH, T-C-1 to 9, T-NAV-1 | Open |
| 6 | Faults data and photo storage | #11, #14 | SIJABULILE-NCUBE (#11), Bafana-Ndlovu (#14) | Checkpoint 3 | F1, F2 (data) | none | T-BR1, BR5, BR9, BR17, BR19, T-SEC-8 to 17, T-SEC-19 | Open |
| 7 | Fault list and upvotes | #12 | SIJABULILE-NCUBE | Checkpoint 3 | F2 | S4 | T-US5, T-BR6, T-BR11, T-C-10 to 14 | Open |
| 8 | Report a fault | #13 | Bafana-Ndlovu | Checkpoint 3 | F1, F2 (M6) | S6, M6, S5 (read-only) | T-US3, T-US6, T-BR2 to 4, T-BR17, T-BR19 | Open |
| 9 | Status rules and auto-close | #16 | Bao992 | Final | F3, F4 (data) | none | T-BR9, BR10, BR12 to 14, T-SEC-10 to 12 | Open |
| 10 | Assign the work | #18, #19 | Paul280-cloud | Final | F3 | S8, M2, S5 (ward admin block) | T-US7, T-BR7, T-BR8, T-SEC-7 | Open |
| 11 | Track progress | #17, #20 | Bao992 (#17), SIJABULILE-NCUBE (#20) | Final | F4 | S5 (full), S7, M4, S10, M3 | T-US8 to 10 | Open |
| 12 | Ward dashboard | #21, #22 | Mikel17croc (proposed) | Final | F5 | S9 | T-US11, T-BR15, T-SEC-18 | Open |
| 13 | Welcome and profile | #23 | Bafana-Ndlovu (proposed) | Final | F1 | S1, S11, M5, M7 | T-US4, T-S1, T-S11 | Open |
| 14 | Languages | #24 | SIJABULILE-NCUBE (proposed) | Final | F1 (BR18) | all | T-BR18 | Open |
| 15 | Hardening and tooling | #32 | Mikel17croc (proposed) | Final | none | all | T-EDGE, T-NFR | Open |
| 16 | Should features | #25, #26 | Bao992 (#25, proposed), Paul280-cloud (#26, proposed) | none (after Final Must work) | F6, F7, F8 | M3, S5, S6, S4 | T-US12 to 14, T-BR20, T-BR21 | Open |
| 17 | Release | none (PRD 13.4 M5) | Bao992 (checklist), Mikel17croc (deploy) | Final | all | all | T-REL-2, T-REL-3 | Open |

"Proposed" means the Issue has no assignee on GitHub yet. The Tech Lead confirms the owner on the board (Section 18 #15).

**Every member has frontend and backend work, and a merged PR before 16 Nov:**

| Member | Frontend | Backend | Other | Merged PR before 16 Nov |
| --- | --- | --- | --- | --- |
| Paul280-cloud (Tech Lead) | #10 Auth screens, #19 Ward queue + M2 | #9 Core tables (done), #18 assign_fault | #5 scaffold (done), #26 (Should) | PR #28 and PR #29 (merged), then #10 |
| SIJABULILE-NCUBE (Product Owner) | #12 Fault list, #20 My jobs + M3, #24 languages | #11 faults tables | | PR #31 and earlier docs PRs (merged), then #11 and #12 |
| Bafana-Ndlovu (Designer) | #13 Report a fault, #23 Welcome and profile | #14 Storage and photo processing | #6 designs | #6 (12 Nov), then #14 |
| Bao992 (QA / Test Lead) | #17 Fault details + S7 | #16 Status rules | #7 test plan, #25 (Should), release checklist | #7 (12 Nov) |
| Mikel17croc (DevOps) | #22 Ward dashboard | #21 Dashboard figures | #8 CI, #15 Vercel, #32 tooling | #8 (12 Nov), then #15 |

### 13.1 Team workflow (every Issue)

1. **Pick up an Issue** assigned to you on the board and move it to "In progress". Read its acceptance criteria, the phase below, and the PRD sections it names.
2. **Branch** from an up-to-date `main`: `git checkout main && git pull`, then `git checkout -b feature/<issue#>-<short-name>` (e.g. `feature/13-report-fault`). Docs-only work may use `docs/<short-name>`.
3. **TDD per task** (Section 12.1). Commit the failing tests first (`test: ... (#N)`), then the code (`feat: ... (#N)`, `fix: ...`, `chore: ...`, `docs: ...`). Small commits, Issue number in every message.
4. **Full check** before pushing: `npm run check`, and `npx supabase test db` if `supabase/` changed.
5. **Pull request** into `main`:
    - title in the same style as the commits;
    - body: what changed and why, how it was tested (paste the check results), screenshots at 390 px (and 1440 px for S8, S9);
    - `Closes #N` in the body;
    - request a review from one teammate.
6. **Review:** at least **1 approval** from a teammate. Nobody approves their own PR. The reviewer checks the tests exist and fail without the code, the wording matches the PRD, and the screen matches the design.
7. **CI required:** the GitHub Actions check from #8 must be green. Until #8 is merged, paste the local `npm run check` output in the PR (Section 18 #14).
8. **Merge:** **squash and merge** once approved and green, then delete the branch. Never push to `main` directly (it is protected).
9. **After merging:** everyone pulls `main` before starting the next task. If your branch is behind, rebase on `origin/main` and push with `--force-with-lease`.
10. **Update this plan** in the same PR: tick the phase checkboxes and add a Progress log row (Rule 12).

---

### Phase 1: Foundation

**Goal:** The app builds and tests in one command on Node 22, and every PR is checked automatically.

**Covers:** Section 4 · Issues #5 (Paul280-cloud), #8 (Mikel17croc, proposed) · Milestone Checkpoint 2

**Starts when:** Started 11 Nov 2026. #8 can start now.

**Step 1: Write the failing tests first (Red)**

| Test ID | Level | File | What it checks |
| --- | --- | --- | --- |
| T-SETUP-1 | Unit | `tests/unit/tokens.test.ts` | Every value in `tokens.ts` matches Section 7.1 and `tailwind.config.ts` reads them (written once #6 is merged and the tokens are final) |
| T-SETUP-2 | Screen | `tests/App.test.tsx` | The app renders the name "FixMyKasi" (exists, from #5) |
| T-SETUP-3 | CI | `.github/workflows/ci.yml` | A PR with a failing test shows a red check; a clean PR shows green |

- [x] T-SETUP-2 written, run, and failed for the expected reason (commit `04c9af6`).
- [ ] T-SETUP-1 and T-SETUP-3 written.

**Step 2: Backend (Green)**

- [x] None in this phase (the database is Phase 2).

**Step 3: Frontend (Green)**

- [x] Vite + React 18 + TypeScript 5 (strict) + Tailwind 3 + React Router 7.18.x + i18next + ESLint + Vitest/RTL; scripts `lint`, `typecheck`, `test`, `test:watch`, `build`, `check` (#5).
- [x] Node 22 pinned (`.nvmrc`, `engines` 22.x); React Router upgraded to patched v7 (#5).
- [x] Design tokens from PRD 9.1 in `src/styles/tokens.ts`; folders `src/components`, `src/lib`, `src/screens`, `supabase/functions`, `supabase/migrations` (#5).
- [ ] `.github/workflows/ci.yml`: on every PR and push to `main`, Node from `.nvmrc`, `npm ci`, then `npm run check` (#8).
- [ ] Branch protection on `main` requires the CI check, 1 approval and squash merge (#8, done by the repo owner).

**Step 4: Refactor and full check**

- [x] `npm run check` passes on Node 22.21.1 (lint, typecheck, 1/1 tests, build) (#5).
- [ ] CI is green on the #8 PR itself.

**Step 5: Manual checks (human)**

- [x] `npm run dev` shows the FixMyKasi home screen (#5).
- [ ] Open a test PR with a failing test: CI goes red and the merge button is blocked (#8).

**Definition of Done**

- [x] #5 merged (PR #28).
- [ ] #8 merged; CI required on `main`.
- [ ] Progress log updated (Section 17).

**PR title / squash commit:** `ci: add GitHub Actions for lint, typecheck, test and build (#8)`

**STOP.** Wait for the human to say "Start Phase <number>".

---

### Phase 2: Core data and security

**Goal:** Profiles and reference data exist, with every permission enforced and tested, and the seed users load with two commands.

**Covers:** Section 8 (core tables) · SEC1 to SEC6 · Issue #9 (Paul280-cloud) · Milestone Checkpoint 3

**Starts when:** Done (PR #29 merged on 11 Nov 2026).

**Step 1: Write the failing tests first (Red)**

| Test file | Level | What it checks |
| --- | --- | --- |
| `supabase/tests/00_schema.test.sql` | Database | Tables, columns, types, defaults, enums, keys and indexes (99 tests) |
| `01_constraints.test.sql` | Database | Length, format and role checks (31) |
| `02_handle_new_user.test.sql` | Database | Sign-up creates a resident profile from metadata (18) |
| `03_security_setup.test.sql` | Database | RLS on every table, `search_path`, security definer list (36) |
| `04_profiles_rls.test.sql` | Database | SEC1 to SEC4 allow and deny (33) |
| `05_reference_rls.test.sql` | Database | SEC5, SEC6 allow and deny (42) |
| `06_reference_data.test.sql` | Database | 3 wards, 34 fault types (7 auto urgent), 5 field teams (12) |

- [x] All tests above are written, run, and fail for the expected reason (commit `5ccc075`).

**Step 2: Backend (Green)**

- [x] Local Supabase project on ports 553xx.
- [x] Migrations 1 to 4 from Section 8.6.
- [x] `supabase/seed.sql`, `supabase/seed/seed.js`, `supabase/seed/README.md`, `.env.example`.

**Step 3: Frontend (Green)**

- [x] None in this phase.

**Step 4: Refactor and full check**

- [x] `npx supabase db reset` then `npx supabase test db`: 7 files, 271 tests, all pass. `npm run check` passes.

**Step 5: Manual checks (human)**

- [x] Studio shows RLS on every table; the 6 seed users have profiles; Zanele is ward admin of Ward A.

**Definition of Done**

- [x] Every test passes. PR #29 reviewed and merged.
- [ ] Progress log updated (Section 17).

**PR title / squash commit:** `[Backend] Core tables and RLS (#9)`

**STOP.**

---

### Phase 3: Designs and test plan

**Goal:** Every screen has a design to build from, and QA has a written test plan and manual checklist.

**Covers:** PRD 8, 9, 11.7 · Issues #6 (Bafana-Ndlovu), #7 (Bao992) · Milestone Checkpoint 2

**Starts when:** Now, once Section 18 #12 (file names) is answered. No code, so no TDD; the "tests" are the review checks below.

**Step 1: Checks to agree first**

| Check | What it checks |
| --- | --- |
| D-1 | Every screen and modal in PRD 8.1 (S1 to S12, M1 to M7) is exported to `docs/designs/` with the agreed file names (Section 18 #12) |
| D-2 | S8 and S9 also exist at 1440 px |
| D-3 | Every state listed in Section 7.3 is shown for each screen, or the PR says which states reuse the normal layout |
| D-4 | The style guide matches PRD 9.1, or the differences are listed in the PR for the human to decide (Section 7.1) |
| Q-1 | `docs/TEST_PLAN.md` (or the location Bao chooses, added to Section 5 first) lists every T- criterion from PRD 6.1 and 6.2 as a manual check with steps and the test account to use |

- [ ] Checks agreed in the Issues.

**Step 2: Backend (Green)**

- [ ] None.

**Step 3: Frontend (Green)**

- [ ] #6: Stitch style guide and every screen exported; Stitch link added to the README (Links table) and to Section 0.
- [ ] #7: test plan and manual checklist; the 4 test accounts from PRD 10.4 listed with what each is for.

**Step 4: Refactor and full check**

- [ ] `npm run check` still passes (docs only).

**Step 5: Manual checks (human)**

- [ ] The team compares each design with its PRD 8.2 spec (exact wording, order).

**Definition of Done**

- [ ] #6 and #7 merged; Section 7.1 "Final value" column and Section 7.3 "Design" column filled in by the PR that merges #6 (or a follow-up).
- [ ] Progress log updated.

**PR titles:** `docs: add Stitch designs and style guide (#6)` · `docs: add test plan and manual checklist (#7)`

**STOP.**

---

### Phase 4: Live link

**Goal:** The app is live on a Vercel URL, connected to a hosted Supabase project with the migrations applied, and redeploys on every merge to `main`.

**Covers:** PRD 11.1 (hosting), 11.5, 12.4 (region) · Issue #15 (Mikel17croc, proposed) · Milestone Checkpoint 3

**Starts when:** Phase 1 #5 is done (it is). Section 18 #2 is answered (`@supabase/supabase-js` approved). Can run in parallel with Phases 3, 5 and 6.

**Step 1: Write the failing tests first (Red)**

| Test ID | Level | File | What it checks |
| --- | --- | --- | --- |
| T-SETUP-4 | Unit | `tests/unit/env.test.ts` | `src/lib/supabase.ts` reads only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` and throws a clear error if one is missing |
| T-NFR-6 | Unit | `tests/unit/secrets.test.ts` | No file in `src/` contains `SERVICE_ROLE` or `AI_API_KEY` |
| T-REL-1 | Manual | n/a | The hosted database has all migrations applied (`npx supabase migration list` shows local = remote) |

- [ ] All tests above are written, run, and fail for the expected reason.

**Step 2: Backend (Green)**

- [ ] The human (Tech Lead) creates the hosted Supabase project and records the region in the README (PRD 12.4).
- [ ] `npx supabase link`, then `npx supabase db push` (migrations only; no seed passwords).
- [ ] Hosted Auth settings: site URL = Vercel URL; redirect URLs include the Vercel URL with `/**` and `http://localhost:5173/**`; email confirmations on; reset link expiry 1 hour; the PRD 4.5 email subjects and texts.
- [ ] Seed the hosted project for the demo (`seed.sql` in the SQL editor, then `SEED_ALLOW_REMOTE=true node --env-file=.env.hosted supabase/seed/seed.js`, `.env.hosted` never committed).

**Step 3: Frontend (Green)**

- [ ] `src/lib/supabase.ts` (T-SETUP-4). Install `@supabase/supabase-js` v2 (approved, Section 18 #2) and record the exact version in the Progress log.
- [ ] Vercel project from GitHub; `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set in Vercel; `vercel.json` rewrites every route to `index.html`.
- [ ] Live link added to the README Links table.

**Step 4: Refactor and full check**

- [ ] `npm run check` passes; the Vercel build of the merge commit succeeds.

**Step 5: Manual checks (human)**

- [ ] The live URL opens on a phone and on a laptop; refreshing a deep link (e.g. `/faults`) does not 404.
- [ ] Merging a small PR redeploys the site within a few minutes.

**Definition of Done**

- [ ] Every test in Step 1 passes; all earlier tests still pass.
- [ ] Manual checks are ticked by the human.
- [ ] Progress log updated (Section 17).

**PR title / squash commit:** `chore: deploy to Vercel with hosted Supabase (#15)`

**STOP.**

---

### Phase 5: Accounts

**Goal:** A resident can sign up, confirm their email, log in to the right home screen by role, reset a forgotten password and log out, inside the role-based app shell.

**Covers:** Features F1 (account part) · Stories US1, US2 · Screens S2, S3, S12, M1, M7 (from S2), app shell (Header, TabBar, routes) · Operations OP1 to OP7, OP10 · PRD 5 · Issue #10 (Paul280-cloud) · Milestone Checkpoint 3

**Starts when:** Phase 2 is done (it is) and the designs for S2, S3, S12, M1, M7 and the shared components are in `docs/designs/` (Phase 3). Section 18 #2 is answered (`@supabase/supabase-js` v2 and lucide-react approved; install them here if Phase 4 has not, and record the versions in the Progress log). If a design is missing, stop and ask (Section 7).

**Step 1: Write the failing tests first (Red)**

| Test ID | Level | File | What it checks |
| --- | --- | --- | --- |
| T-AUTH-1 | Unit | `tests/unit/password.test.ts` | "kasi2026" and "abcdefg1" pass; "kasikasi" (no number), "12345678" (no letter) and "abc1" (too short) fail with "Use at least 8 characters with a letter and a number." |
| T-AUTH-2 | Screen | `tests/screens/LogIn.test.tsx` | Auth's rate-limit error shows "Too many attempts. Please wait a few minutes and try again." |
| T-AUTH-3 | Screen | `tests/screens/navigation.test.tsx` | After log-in, resident → S4, ward admin → S8, field team → S10 (from OP7's role) |
| T-AUTH-4 | Unit | `tests/unit/phone.test.ts` | "+27 82 123 4567" and "+27821234567" pass; "0821234567" and "+2782123456" fail with "Enter a South African number, like +27 82 123 4567." |
| T-US1-1 | Screen | `tests/screens/SignUp.test.tsx` | Valid form with both boxes ticked → S3 with "Check your email to confirm your account." |
| T-US1-2 | Screen | same | Existing email → "This email already has an account. Log in instead." under the email field |
| T-US1-3 | Screen | same | "kasikasi" → "Use at least 8 characters with a letter and a number." |
| T-S2-1 | Screen | same | Every field error from the S2 table (name, email, ward, 18+, privacy); loading spinner; offline disables the button; "Privacy Notice" opens M7 |
| T-US2-1 | Screen | `LogIn.test.tsx` | Confirmed account logs in and lands on S4 |
| T-US2-2 | Screen | same | Wrong password → "Wrong email or password." and the email is kept |
| T-US2-3 | Screen | `ForgotPassword.test.tsx` | M1 "Send link" always shows "If this email has an account, we've sent a reset link." |
| T-US2-4 | Screen | `SetNewPassword.test.tsx` | Expired link → "This link has expired. Request a new one." with "Send new link" opening M1; valid → S3 with "Password changed. Please log in."; mismatch → "The passwords don't match." |
| T-S3-1 | Screen | `LogIn.test.tsx` | Banners "Check your email…", "Email confirmed. Please log in.", "Password changed. Please log in." show when passed in |
| T-S3-2 | Screen | same | Unverified → "Please confirm your email first. Check your inbox." with "Resend email" calling OP3 |
| T-C-1 to T-C-9 | Component | `tests/components/*.test.tsx` | Header, TabBar (tabs per role, side menu over 1024 px), Button, TextField (eye toggle has a label), SelectField, Checkbox, Toast (3 s), OfflineBanner (exact text), Modal |
| T-NAV-1 | Screen | `navigation.test.tsx` | Section 11 rules: logged-out access, logged-in redirects, unknown routes, wrong role → "You don't have access to this." |
| T-S11-2 | Screen | `navigation.test.tsx` | "Log out" ends the session and goes to S1 with no confirmation (temporary log-out button on the S11 placeholder until Phase 13) |

- [ ] All tests above are written, run, and fail for the expected reason.

**Step 2: Backend (Green)**

- [ ] `supabase/config.toml` Auth: `site_url` and redirect URLs for `http://localhost:5173`; `enable_confirmations = true`; `minimum_password_length = 8`; reset link expiry 1 hour; email templates with the PRD 4.5 subjects, texts and buttons. Rate limits stay at their defaults (server side of T-AUTH-2).
- [ ] No new migration: `handle_new_user` from #9 already reads the sign-up metadata.

**Step 3: Frontend (Green)**

- [ ] `src/lib/supabase.ts` (if Phase 4 has not merged it yet), `src/lib/api/auth.ts` (OP1 to OP7), `src/lib/api/reference.ts` (OP10), `src/lib/rules/password.ts`, `phone.ts`, `src/lib/messages.ts`, every message in `en.json`.
- [ ] `useSession`, `useProfile`, `useOnlineStatus` hooks.
- [ ] Shared components T-C-1 to T-C-9, built to their designs.
- [ ] S2, S3 (+ M1), S12 and M7 (opened from S2) with every state in 7.3.
- [ ] `App.tsx`: every route from 7.3 (placeholders showing only the screen title for screens built later), redirect rules (Section 11), role-based TabBar. The scaffold's `screens/home/` is replaced by the S1 placeholder.

**Step 4: Refactor and full check**

- [ ] `npm run check` passes; `npx supabase test db` still 271/271.

**Step 5: Manual checks (human)**

- [ ] Sign up in a real browser, open the confirmation email in Inbucket (http://127.0.0.1:55324), log in.
- [ ] Log in as zanele.k@example.com → S8 placeholder; kagiso.m@example.com → S10 placeholder.
- [ ] Reset a password from the email link.
- [ ] S2, S3, S12, M1 and M7 match their designs at 390 px.
- [ ] Repeat sign-up and log-in on the live link once Phase 4 is done.

**Definition of Done**

- [ ] Every test in Step 1 passes; all earlier tests still pass.
- [ ] Every screen in this phase shows all its required states.
- [ ] Manual checks are ticked by the human.
- [ ] Progress log updated (Section 17).

**PR title / squash commit:** `feat: add sign up, log in and password reset screens (#10)`

**STOP.**

---

### Phase 6: Faults data and photo storage

**Goal:** Faults, photos, upvotes and status history exist in the database with the reference number, limits and permissions enforced and tested, and the seed faults load.

**Covers:** Section 8.1 (faults tables), 8.5 (#11 triggers), 9 (SEC8, SEC9, SEC13 to SEC17, SEC19) · Rules BR1, BR2 (bucket), BR4 (function), BR5, BR9 (history), BR16, BR17, BR19 · Issues #11 (SIJABULILE-NCUBE), #14 (Bafana-Ndlovu) · Milestone Checkpoint 3

**Starts when:** Phase 2 is done (it is), and Section 18 #11, #16, #17 and #23 are answered (#3 and #13 too, for #14). #14 starts when the #11 `faults` migration is merged (photo paths use the fault id). Can run in parallel with Phase 5.

**Step 1: Write the failing tests first (Red)**

All pgTAP files go in `supabase/tests/` starting at `07_`. Unit tests are for the app-side copy of each rule.

| Test ID | Level | File | What it checks |
| --- | --- | --- | --- |
| T-DB-1 | Database | `07_faults_schema.test.sql` | Every table, column, type, default, constraint and index from 8.1 and 8.4; `faults` added to the RLS-on and `search_path` tests |
| T-DB-2 | Database | same | `updated_at` changes on update; `reference_number` cannot be changed |
| T-BR1-1 | Unit | `tests/unit/referenceNumber.test.ts` | `formatReferenceNumber(2026, 123)` = "FMK-2026-00123"; `isReferenceNumber` accepts that and rejects "FMK-26-123" |
| T-BR1-2 | Database | `08_fault_rules.test.sql` | First fault of a year gets 00001, the next 00002; a new year restarts at 00001; numbers are unique |
| T-BR17-1 | Unit | `tests/unit/report.test.ts` | Description 10 to 500 characters, or 30 to 500 with `noPhotoSafe`; exact messages |
| T-BR17-2 | Database | `08_fault_rules.test.sql` | The 5th fault in 24 hours is accepted; the 6th is rejected with a known error code; another resident can still report |
| T-BR19-1 | Unit | `report.test.ts` | `isUrgentLocked(faultType)` is true for the 7 auto-urgent types |
| T-BR19-2 | Database | same | Inserting an auto-urgent type with `is_urgent = false` saves it as true |
| T-BR3-1 | Database | same | Address 4 and 121 characters rejected, 5 and 120 accepted; landmark 61 rejected; latitude −21 rejected; only one of latitude/longitude rejected |
| T-BR5-2 | Database | `09_upvotes.test.sql` | Second upvote by the same resident rejected; upvote on own fault rejected; upvote on a Closed fault rejected |
| T-BR5-3 | Database | same | `upvote_count` goes up on insert and down on delete |
| T-BR9-2 | Database | `08_fault_rules.test.sql` | Inserting a fault writes one `status_changes` row (null → received, `changed_by` = reporter) |
| T-BR4-1 | Database | `10_similar_faults.test.sql` | `similar_faults` returns same ward + type, not Closed, last 30 days; within 200 m when both have GPS; at most 5; closest first, or newest first without GPS |
| T-BR2-3 | Database | `11_storage.test.sql` | Bucket `fault-photos` exists; size limit 10 MB; JPG, PNG, HEIC, WebP only |
| T-BR2-4 | Database | same | A 4th "before" photo is rejected; an "after" photo by a resident is rejected |
| T-SEC-8a/b, 9a/b, 13b, 14a/b, 15a/b, 16a/b, 17a/b, 19b | Database | `12_faults_rls.test.sql`, `11_storage.test.sql` | One allow and one deny test per Section 9 row, acting as Thandeka, Nomsa, Zanele, Kagiso and anon; unverified resident cannot report or upvote |
| T-BR16-1 | Database | `12_faults_rls.test.sql` | `faults_public` has no `reporter_id` or `municipal_reference`; anon cannot select from `faults` or `profiles` |
| T-EDGE-3 | Database | same | Deleting Thandeka's login keeps her faults with `reporter_id` null and removes her upvotes |

- [ ] All tests above are written, run, and fail for the expected reason.

**Step 2: Backend (Green)**

- [ ] #11: migrations 5 and 6 from Section 8.6 (tables, counter, triggers, `similar_faults`, RLS, `faults_public`).
- [ ] #11: seed faults from PRD 8.4 in `supabase/seed.sql` (Section 8.7).
- [ ] #14: migration 7 (bucket and storage policies); `seed.js` uploads `supabase/seed/photos/` to the seed faults.
- [ ] #14: `src/lib/rules/photo.ts` (type and size checks, BR2) and `src/lib/api/photos.ts` (resize to 1600 px, compress under 500 KB, strip EXIF, upload: OP14), with unit tests T-BR2-1 and T-BR2-2 (below).

| Test ID | Level | File | What it checks |
| --- | --- | --- | --- |
| T-BR2-1 | Unit | `tests/unit/photo.test.ts` | JPG, PNG, HEIC, WebP up to 10 MB accepted; 10 MB + 1 byte, GIF and PDF rejected with the exact message |
| T-BR2-2 | Unit | `tests/unit/photoProcessing.test.ts` | Output longest side ≤ 1600 px, under 500 KB, and has no EXIF block (canvas mocked) |

**Step 3: Frontend (Green)**

- [ ] None beyond the `src/lib` files above.

**Step 4: Refactor and full check**

- [ ] Every new function has `search_path = ''`; new security definer functions are listed in pgTAP 03 with a reason.
- [ ] `npx supabase db reset`, `seed.js`, `npx supabase test db` all pass; `npm run check` passes.

**Step 5: Manual checks (human)**

- [ ] In Studio: the 7 seed faults show with their reference numbers, upvote counts and history.
- [ ] Studio shows bucket `fault-photos` with the seed photos.
- [ ] `npx supabase db push` to the hosted project (Phase 4) after merge.

**Definition of Done**

- [ ] Every test in Step 1 passes; all earlier tests still pass.
- [ ] Manual checks are ticked by the human.
- [ ] Progress log updated (Section 17).

**PR titles:** `feat: add faults, photos, upvotes and status history tables (#11)` · `feat: add fault-photos bucket and photo processing (#14)`

**STOP.**

---

### Phase 7: Fault list and upvotes

**Goal:** Anyone can browse, filter, sort and search faults 20 at a time, and a verified resident can upvote or remove an upvote.

**Covers:** Features F2 · Stories US5 · Screens S4 (list only; Map is Phase 16) · Rules BR5, BR6, BR11, BR16 · Operations OP11, OP16 · Issue #12 (SIJABULILE-NCUBE) · Milestone Checkpoint 3

**Starts when:** Phases 5 and 6 (#11) are merged, the S4 and FaultCard designs exist, and Section 18 #5 is answered.

**Step 1: Write the failing tests first (Red)**

| Test ID | Level | File | What it checks |
| --- | --- | --- | --- |
| T-BR11-1 | Unit | `tests/unit/overdue.test.ts` | Overdue when today (SAST) is after the due date and status is not Fixed or Closed; not overdue on the due date itself; 23:30 UTC on 18 Nov counts as 19 Nov |
| T-BR6-1 | Unit | `tests/unit/search.test.ts` | "FMK-2026-00123" is a reference search; "Vilakazi" is an address search; input stops at 60 characters |
| T-C-10 to T-C-14 | Component | `tests/components/*.test.tsx` | EmptyState, LoadingPlaceholder, StatusChip (name always written), FaultLabels (icon + word), FaultCard (fields in PRD order, "1 upvote", hidden at 0, "12 Nov 2026") |
| T-US5-1 | Screen | `tests/screens/FaultList.test.tsx` | Up to 20 cards newest first; scrolling to the end loads the next 20 with a spinner |
| T-US5-2 | Screen | same | Searching "FMK-2026-00123" shows only that fault |
| T-US5-3 | Screen | same | Filters with no match → "No faults match your filters." with "Clear filters" |
| T-S4-1 | Screen | same | No faults → "No faults reported yet. Be the first to report one." with "Report a fault" (→ S6, or S3 when logged out) |
| T-S4-2 | Screen | same | Loading shows 3 grey cards; error shows "Something went wrong. Try again." with "Try again"; offline keeps the cards with the banner |
| T-S4-3 | Screen | same | Sort "Most upvoted" orders by upvotes; ward, category and status filters work together |
| T-BR5-1 | Screen | `tests/screens/Upvote.test.tsx` | "Affects me too" adds and removes an upvote and updates the count; a visitor is sent to S3 |

- [ ] All tests above are written, run, and fail for the expected reason.

**Step 2: Backend (Green)**

- [ ] `src/lib/api/faults.ts`: OP11 (list) and `src/lib/api/upvotes.ts`: OP16 (no new migration).

**Step 3: Frontend (Green)**

- [ ] `src/lib/rules/overdue.ts`, `search.ts`, `dates.ts` (SAST formatting "12 Nov 2026" and "12 Nov 2026, 14:05").
- [ ] Components T-C-10 to T-C-14 and S4 with every state in 7.3. Replace the S4 placeholder. The upvote button lives in a small `UpvoteButton` used on S5 later.

**Step 4: Refactor and full check**

- [ ] `npm run check` passes; `npx supabase test db` passes.

**Step 5: Manual checks (human)**

- [ ] As a visitor on the live link: S4 lists the seed faults with no reporter names.
- [ ] S4 matches its design at 390 px and in 2 columns over 1024 px.

**Definition of Done**

- [ ] Every test in Step 1 passes; all earlier tests still pass.
- [ ] Every screen in this phase shows all its required states.
- [ ] Manual checks are ticked by the human.
- [ ] Progress log updated (Section 17).

**PR title / squash commit:** `feat: add fault list with search, filters and upvotes (#12)`

**STOP.**

---

### Phase 8: Report a fault (Checkpoint 3 end-to-end feature)

**Goal:** A verified resident reports a fault with photos, location and description, sees similar reports first, and lands on S5 with the reference number. The fault then appears on S4.

**Covers:** Features F1 (report), F2 (M6) · Stories US3, US6 · Screens S6, M6, S5 (read-only base: photos, type, status chip, labels, location, description, "Not assigned yet", upvote button, Received row) · Rules BR2, BR3, BR4, BR17, BR19 · Operations OP12 (read-only), OP13, OP14, OP15 · Issue #13 (Bafana-Ndlovu) · Milestone Checkpoint 3

**Starts when:** Phases 5, 6 and 7 are merged, the S6, M6 and S5 designs exist, and Section 18 #3, #8 and #9 are answered.

**Step 1: Write the failing tests first (Red)**

| Test ID | Level | File | What it checks |
| --- | --- | --- | --- |
| T-BR3-2 | Unit | `tests/unit/report.test.ts` | Address 5 to 120 characters ("Enter the street address."); landmark up to 60 ("Keep the landmark under 60 characters.") |
| T-BR4-2 | Unit | `tests/unit/distance.test.ts` | `distanceMetres` of two points 80 m apart is 80 ± 1; shown as "80 m away" |
| T-US3-1 | Screen | `tests/screens/ReportFault.test.tsx` | Completing S6 and tapping "Submit report" → S5 for the new fault with status Received and the toast "Fault reported. Your reference number is FMK-2026-00125." |
| T-US3-2 | Screen | same | No photo and "not safe" unticked → "Add at least 1 photo." |
| T-US3-3 | Screen | same | Daily limit error → "You can report up to 5 faults a day. Please try again tomorrow." and the form is kept |
| T-US3-4 | Screen | same | Upload failure → "Upload failed. Check your connection." with "Try again", photos and text kept |
| T-S6-1 | Screen | same | Category filters the fault types; an auto-urgent type ticks and locks "This is dangerous" (BR19); ward defaults to the home ward; character counter "0 / 500"; emergency notice and photo hint shown |
| T-S6-2 | Screen | same | "Not safe" ticked needs 30 characters ("Describe the fault in at least 10 characters." under 10) |
| T-US6-1 | Screen | `tests/screens/SimilarReports.test.tsx` | A matching fault 80 m away → M6 "Is this the same fault?" on "Next" |
| T-US6-2 | Screen | same | "Upvote instead" → upvote saved, S5 for that fault, toast "Thanks, your upvote was added." |
| T-US6-3 | Screen | `tests/screens/FaultDetails.test.tsx` | On own fault, the upvote button is disabled with "You reported this fault" |
| T-M6-1 | Screen | `SimilarReports.test.tsx` | No matches → M6 skipped and the button becomes "Submit report"; "No, report a new fault" → back to S6 with "Submit report"; error → "We couldn't check for similar faults." with "Continue reporting" |
| T-S5-1 | Screen | `FaultDetails.test.tsx` | Read-only S5: title is the reference number; no reporter name anywhere (BR16); loading; "We couldn't load this fault. Try again."; unknown reference → "We couldn't find this fault." with "Back to faults" |
| T-EDGE-1 | Screen | `ReportFault.test.tsx` | Offline → "You're offline. Your report will be saved when you're back online.", "Submit report" disabled, form kept |
| T-EDGE-6 | Screen | same | Location refused → "Location is off. Please type the street address." and the report saves without GPS |
| T-EDGE-7 | Screen | same | A 12 MB photo → "This photo is too big or not a supported type. Use a JPG, PNG, HEIC or WebP under 10 MB." and other photos stay |

- [ ] All tests above are written, run, and fail for the expected reason.

**Step 2: Backend (Green)**

- [ ] `src/lib/api/faults.ts`: OP12 (read-only), OP13, OP15 (uses OP14 from Phase 6). No new migration.

**Step 3: Frontend (Green)**

- [ ] `src/lib/rules/report.ts`, `distance.ts`.
- [ ] PhotoPicker (T-C-15), S6, M6 and the read-only S5 with every state in 7.3. The S6 form is kept in the browser (session storage) while offline or logged out.

**Step 4: Refactor and full check**

- [ ] `npm run check` passes; `npx supabase test db` passes.

**Step 5: Manual checks (human)**

- [ ] On a real Android phone on the live link: log in as Thandeka, take a photo, report a burst pipe, see M6 suggest FMK-2026-00123, choose "No, report a new fault", submit, get a reference number, see it on S4 (PRD 11.7 demo steps 1 and 2).
- [ ] Time it: under 3 minutes (G1).
- [ ] Check in Studio that the uploaded photo has no GPS EXIF and is under 500 KB.
- [ ] S6, M6 and S5 match their designs at 390 px.

**Definition of Done**

- [ ] Every test in Step 1 passes; all earlier tests still pass.
- [ ] Every screen in this phase shows all its required states.
- [ ] Manual checks are ticked by the human.
- [ ] Checkpoint 3 demo works on the live link: log-in, database, F1 end to end.
- [ ] Progress log updated (Section 17).

**PR title / squash commit:** `feat: add report a fault and similar reports (#13)`

**STOP.**

---

### Phase 9: Status rules and auto-close

**Goal:** Every status change in PRD 10.3 goes through database functions that check who may make it, every change is recorded, and Fixed faults close themselves after 7 days.

**Covers:** Section 8.3, 8.5 (#16 rows) · Rules BR9, BR10, BR12, BR13 (fixed_at), BR14 · Permissions SEC10 (viewed), SEC11, SEC12 · Operations OP17, OP19, OP20, OP21 (database side) · Issue #16 (Bao992) · Milestone Final

**Starts when:** Phase 6 (#11) is merged and Section 18 #7 and #18 are answered.

**Step 1: Write the failing tests first (Red)**

| Test ID | Level | File | What it checks |
| --- | --- | --- | --- |
| T-BR9-1 | Unit | `tests/unit/statusRules.test.ts` | `nextStatuses(role, status)` returns exactly the 10.3 changes (e.g. field team on assigned → scheduled, in_progress; on in_progress → fixed; nothing on closed) |
| T-BR9-3 | Database | `13_status_rules.test.sql` | Every change not in 10.3 is rejected (e.g. received → fixed, closed → anything); a direct `update faults set status` by any app role is rejected |
| T-BR9-4 | Database | same | Each allowed change writes one `status_changes` row with from, to, `changed_by` and the note (≤ 200 characters) |
| T-BR10-1 | Database | same | `mark_fault_viewed` by Ward A's admin moves Received → Viewed once and sets `viewed_at`; a second call changes nothing; another ward's admin is refused |
| T-BR12-1 | Unit | `tests/unit/delay.test.ts` | Reason 10 to 200 characters; new date after the current due date and within 90 days (SAST); exact messages |
| T-BR12-2 | Database | same | Marking delayed keeps the status, sets `is_delayed`, `delay_reason` and the new `due_date`; bad dates and reasons are rejected |
| T-BR13-1 | Database | same | Fixed sets `fixed_at` |
| T-BR14-1 | Unit | `tests/unit/reopen.test.ts` | `canReopen(reopenCount)` is true for 0 and 1, false for 2 |
| T-BR14-2 | Database | same | Only the reporter, only while Fixed: confirm → Closed (`closed_at` set); reopen with a 10 to 200 character reason → Reopened and `reopen_count + 1`; a third reopen is refused |
| T-BR14-3 | Unit | `reopen.test.ts` | `isAutoCloseDue(fixedAt, now)` is true from 7 full days after Fixed (SAST) |
| T-BR14-4 | Database | same | `auto_close_fixed_faults()` closes a fault Fixed 7 days ago with `changed_by` null, and leaves one Fixed 6 days ago; the pg_cron job exists with schedule `0 0 * * *` (02:00 SAST) |
| T-SEC-10a/b, 11a/b, 12a/b | Database | `14_status_rls.test.sql` | Ward admin of the ward / field team of the fault / reporter allowed; other ward admin, other field team, other resident and anon denied, with the exact error codes the app maps to "You can only manage faults in your ward." and "You can only update faults assigned to your team." |

- [ ] All tests above are written, run, and fail for the expected reason.

**Step 2: Backend (Green)**

- [ ] Migration 8 (Section 8.6): `guard_fault_status`, `record_status_change` on update, `mark_fault_viewed`, `change_fault_status`, `confirm_fault_fixed`, `reopen_fault`, `auto_close_fixed_faults`, pg_cron extension and job.

**Step 3: Frontend (Green)**

- [ ] `src/lib/rules/statusRules.ts`, `delay.ts`, `reopen.ts` (used by Phases 10 and 11). No screens.

**Step 4: Refactor and full check**

- [ ] `npx supabase test db` and `npm run check` pass.

**Step 5: Manual checks (human)**

- [ ] In Studio, run `select auto_close_fixed_faults();` on the seed data: FMK-2026-00109 (Fixed on 7 Nov 2026) stays Fixed before 14 Nov 2026 and is Closed from 14 Nov 2026.
- [ ] `npx supabase db push` to the hosted project; check the cron job is listed.

**Definition of Done**

- [ ] Every test in Step 1 passes; all earlier tests still pass.
- [ ] Manual checks are ticked by the human.
- [ ] Progress log updated (Section 17).

**PR title / squash commit:** `feat: add status change rules, overdue and auto-close job (#16)`

**STOP.**

---

### Phase 10: Assign the work

**Goal:** A ward admin sees their ward's queue, opens a fault (marking it Viewed), and assigns or reassigns it to a matching field team with a due date.

**Covers:** Features F3 · Stories US7 · Screens S8, M2, S5 (ward admin block) · Rules BR7, BR8, BR10, BR11, BR16 · Permissions SEC7, SEC10 · Operations OP17, OP18, OP22, OP26 · Issues #18 (backend), #19 (frontend), both Paul280-cloud · Milestone Final

**Starts when:** Phases 8 and 9 are merged, the S8 (phone and desktop) and M2 designs exist, and Section 18 #4, #10 and #24 are answered.

**Step 1: Write the failing tests first (Red)**

| Test ID | Level | File | What it checks |
| --- | --- | --- | --- |
| T-BR8-1 | Unit | `tests/unit/assign.test.ts` | Due date today to today + 90 (SAST); estimated days whole number 1 to 90; municipal reference ≤ 30; note ≤ 200; exact messages |
| T-BR8-2 | Database | `15_assign_fault.test.sql` | `assign_fault` by Ward A's admin sets team, dates and Assigned, sets `assigned_at`; team of another category refused; date 120 days away refused; other ward's admin refused; reassign from Assigned or Scheduled allowed |
| T-BR7-1 | Unit | `tests/unit/queue.test.ts` | Queue order: urgent first, then upvotes (most first), then oldest first; tabs New (received, viewed, reopened), In progress (assigned, scheduled, in_progress), Fixed |
| T-SEC-7a/b | Database | `15_assign_fault.test.sql` | Zanele can read the profiles of reporters in Ward A only; Thandeka cannot read Lerato's profile |
| T-US7-1 | Screen | `tests/screens/FaultDetails.test.tsx` | Ward admin opening a Received fault calls OP17 and shows Viewed |
| T-US7-2 | Screen | `tests/screens/AssignFault.test.tsx` | Filling M2 and tapping "Assign" → S5 shows the field team, due date and estimated time, toast "Fault assigned" |
| T-US7-3 | Screen | same | Date 120 days away → "Choose a date within the next 90 days." |
| T-US7-4 | Screen | same | Database refusal → "You can only manage faults in your ward." |
| T-M2-1 | Screen | same | Only matching teams listed with "Municipal team" / "Contractor"; none → "No field teams for Clean water yet. Ask the admin to add one."; "Reassign" label when already assigned |
| T-S8-1 | Screen | `tests/screens/WardQueue.test.tsx` | Title "Ward A: Orlando West"; tab counts; Category / "Urgent only" / "Overdue only" chips; empty texts "No new faults in your ward." and "Nothing here right now."; 5 grey rows while loading; table with the 7 columns over 1024 px |
| T-S5-2 | Screen | `FaultDetails.test.tsx` | Ward admin block shows "Assign" or "Reassign" by status, "Municipal reference: JW-778812", and the contractor's contact number |

- [ ] All tests above are written, run, and fail for the expected reason.

**Step 2: Backend (Green)**

- [ ] #18: migration 9 (`assign_fault`, ward admin read policies for reporters' profiles and full fault rows).
- [ ] `src/lib/api/ward.ts`: OP17, OP18, OP22.

**Step 3: Frontend (Green)**

- [ ] #19: `src/lib/rules/assign.ts`, `queue.ts`; S8 (cards and desktop table), M2, the ward admin block on S5, with every state in 7.3. Replace the S8 placeholder.

**Step 4: Refactor and full check**

- [ ] `npm run check` and `npx supabase test db` pass.

**Step 5: Manual checks (human)**

- [ ] Log in as Zanele on a laptop: open FMK-2026-00121 (it becomes Viewed), open M2 and check it lists only Sample Electrical Works (Pty) Ltd (the only Electricity team), then assign it with a due date within 90 days and see it move to the "In progress" tab.
- [ ] S8 and M2 match their designs at 390 px and 1440 px.

**Definition of Done**

- [ ] Every test in Step 1 passes; all earlier tests still pass.
- [ ] Every screen in this phase shows all its required states.
- [ ] Manual checks are ticked by the human.
- [ ] Progress log updated (Section 17).

**PR titles:** `feat: add assign_fault and ward admin permissions (#18)` · `feat: add ward queue and assign fault (#19)`

**STOP.**

---

### Phase 11: Track progress

**Goal:** Field teams update their jobs, residents see the full timeline and responsibility block, and the reporter confirms the fix or reopens the fault.

**Covers:** Features F4 · Stories US8, US9, US10 · Screens S5 (full), S7, M4 (#17, Bao992); S10, M3 (#20, SIJABULILE-NCUBE) · Rules BR11, BR12, BR13, BR14, BR16 · Operations OP12 (full), OP19, OP20, OP23, OP24 · Milestone Final

**Starts when:** Phases 8 and 9 are merged and the S5, S7, M4, S10 and M3 designs exist. #17 and #20 can run in parallel.

**Step 1: Write the failing tests first (Red)**

| Test ID | Level | File | What it checks |
| --- | --- | --- | --- |
| T-C-16 | Component | `tests/components/StatusTimeline.test.tsx` | One row per change, newest first, "12 Nov 2026, 14:05", note shown |
| T-C-17 | Component | `tests/components/JobCard.test.tsx` | Fields in PRD order, "Due 18 Nov 2026", "Update" opens M3 |
| T-US8-1 | Screen | `tests/screens/UpdateStatus.test.tsx` | Assigned job → "Scheduled" on M3 → saved, toast "Status updated", timeline shows date and time |
| T-US8-2 | Screen | same | In progress + delayed with reason and new date → S5 shows "Delayed" and the new due date |
| T-US8-3 | Screen | same | Database refusal → "You can only update faults assigned to your team." |
| T-M3-1 | Screen | same | Only next allowed statuses as radio options; "Choose a new status."; note ≤ 200; delay fields appear when "Mark as delayed" is ticked |
| T-S10-1 | Screen | `tests/screens/MyJobs.test.tsx` | Subtitle is the team name; To do / Done tabs; overdue first then soonest due; empty "No jobs assigned to your team right now."; offline disables "Update" |
| T-US9-1 | Screen | `tests/screens/FaultDetails.test.tsx` | Scheduled fault shows the timeline, team name, "Contractor: Sample Plumbing Services (Pty) Ltd", "Expected fix date: 18 Nov 2026", "Estimated time to fix: 2 days" |
| T-US9-2 | Screen | `FaultDetails.test.tsx`, `MyReports.test.tsx` | Past due and not Fixed → red "Overdue" label on S5 and S7 |
| T-US9-3 | Screen | `tests/screens/MyReports.test.tsx` | No faults → "You haven't reported any faults yet." with "Report a fault"; Closed tab empty → "No closed faults yet."; Fixed cards show "Please confirm the fix" |
| T-US10-1 | Screen | `FaultDetails.test.tsx` | Reporter on a Fixed fault taps "Yes, it's fixed" → Closed, toast "Thanks for confirming." |
| T-US10-2 | Screen | `tests/screens/ReopenFault.test.tsx` | "No, still a problem" → M4 → reason → "Reopen" → Reopened, toast "Fault reopened"; short reason → "Tell us what's still wrong in at least 10 characters." |
| T-US10-3 | Screen | `FaultDetails.test.tsx` | `reopen_count` 2 → "This fault can't be reopened again. Please report a new fault." instead of the button |
| T-US10-4 | Database | `13_status_rules.test.sql` | Same as T-BR14-4 (Phase 9), listed here for traceability |
| T-EDGE-8 | Screen | `FaultDetails.test.tsx` | Upvote refused because the fault closed → "This fault is closed and can't be upvoted." and S5 reloads as Closed |
| T-S5-3 | Screen | same | Offline keeps the details with all action buttons disabled; only one role block shows |

- [ ] All tests above are written, run, and fail for the expected reason.

**Step 2: Backend (Green)**

- [ ] `src/lib/api/faults.ts`: OP12 (full), OP20, OP23; `src/lib/api/jobs.ts`: OP19, OP24. No new migration.

**Step 3: Frontend (Green)**

- [ ] #17: StatusTimeline, full S5 (responsibility block, reporter block), S7, M4.
- [ ] #20: JobCard, S10, M3 (without after photos; they come in Phase 16).

**Step 4: Refactor and full check**

- [ ] `npm run check` and `npx supabase test db` pass.

**Step 5: Manual checks (human)**

- [ ] Run PRD 11.7 demo steps 3 to 5 on the live link with Zanele, Kagiso and Thandeka.
- [ ] S5, S7, M4, S10 and M3 match their designs at 390 px.

**Definition of Done**

- [ ] Every test in Step 1 passes; all earlier tests still pass.
- [ ] Every screen in this phase shows all its required states.
- [ ] Manual checks are ticked by the human.
- [ ] Progress log updated (Section 17).

**PR titles:** `feat: add fault details timeline, confirm and reopen, my reports (#17)` · `feat: add my jobs and update status (#20)`

**STOP.**

---

### Phase 12: Ward dashboard

**Goal:** A ward admin sees open faults, overdue faults, average time to fix and open faults by category for their ward.

**Covers:** Features F5 · Stories US11 · Screens S9 · Rules BR11, BR15 · Permissions SEC18 · Operations OP25 · Issues #21 (backend), #22 (frontend), Mikel17croc (proposed) · Milestone Final

**Starts when:** Phase 9 is merged, the S9 designs (phone and desktop) exist, and Section 18 #22, #23 and #25 are answered.

**Step 1: Write the failing tests first (Red)**

| Test ID | Level | File | What it checks |
| --- | --- | --- | --- |
| T-BR15-1 | Unit | `tests/unit/dashboard.test.ts` | Average days rounded to 1 decimal ("5.0 days"); "No data" when none fixed in the last 30 days |
| T-BR15-2 | Database | `16_ward_dashboard.test.sql` | `ward_dashboard_figures()` for Ward A on the seed data with "today" = 12 Nov 2026: open 4, overdue 1, average 5.0, by category Clean water 1, Electricity 3, others 0 |
| T-SEC-18a/b | Database | same | Zanele gets Ward A figures; a resident, a field team member and anon are refused |
| T-C-18 | Component | `tests/components/StatCard.test.tsx` | Number, label, caption; overdue variant uses the error colour and an icon |
| T-US11-1 | Screen | `tests/screens/WardDashboard.test.tsx` | Shows "Open faults" 4, "Overdue faults" 1, "Average time to fix" "5.0 days" with "Last 30 days", and the category bar list |
| T-US11-2 | Screen | same | No fixes → "No data" and "No faults fixed in the last 30 days."; no open faults → "No open faults in your ward. Well done!" |
| T-S9-1 | Screen | same | 3 grey stat cards while loading; error with "Try again"; offline shows "Last updated 12 Nov 2026, 10:15"; "View overdue faults" opens S8 with "Overdue only" on |

- [ ] All tests above are written, run, and fail for the expected reason.

**Step 2: Backend (Green)**

- [ ] #21: migration 10 (`ward_dashboard_figures()`, takes an optional "today" for tests); `src/lib/api/dashboard.ts` (OP25).

**Step 3: Frontend (Green)**

- [ ] #22: StatCard, S9 with every state in 7.3. Replace the S9 placeholder.

**Step 4: Refactor and full check**

- [ ] `npm run check` and `npx supabase test db` pass.

**Step 5: Manual checks (human)**

- [ ] Log in as Zanele on a laptop and a phone: figures match the seed data (PRD 11.7 demo step 6).
- [ ] S9 matches its designs at 390 px and 1440 px.

**Definition of Done**

- [ ] Every test in Step 1 passes; all earlier tests still pass.
- [ ] Every screen in this phase shows all its required states.
- [ ] Manual checks are ticked by the human.
- [ ] Progress log updated (Section 17).

**PR titles:** `feat: add ward dashboard figures function (#21)` · `feat: add ward dashboard screen (#22)`

**STOP.**

---

### Phase 13: Welcome and profile

**Goal:** Visitors get a welcome screen; logged-in users can edit their profile and language, read the Privacy Notice, log out, and residents can delete their account.

**Covers:** Features F1 · Stories US4 (T-US4-2, T-US4-3; T-US4-1 language part with Phase 14) · Screens S1, S11, M5, M7 (from S11) · Operations OP6, OP8, OP9 · PRD 5, 12.4 · Issue #23 (Bafana-Ndlovu, proposed) · Milestone Final

**Starts when:** Phase 5 is merged, the S1, S11, M5 and M7 designs exist, and Section 18 #6, #19 and #20 are answered.

**Step 1: Write the failing tests first (Red)**

| Test ID | Level | File | What it checks |
| --- | --- | --- | --- |
| T-S1-1 | Screen | `tests/screens/Welcome.test.tsx` | Title "Report it. Track it. Get it fixed.", the text, "Create account" → S2, "Log in" → S3, "Browse faults without an account" → S4; the language picker changes the text at once |
| T-S11-1 | Screen | `tests/screens/Profile.test.tsx` | Initials circle, name, email (not editable), role label; field errors from the S11 table; "Save changes" → toast "Profile saved"; home ward only for residents; "Delete account" only for residents |
| T-US4-2 | Screen | same | Confirming M5 → S1 with "Your account has been deleted." |
| T-US4-3 | Screen | same | Deletion failure → M5 shows "Something went wrong. Try again." and the account stays |
| T-M5-1 | Screen | same | M5 title and text exactly as PRD 8.2; closes only on "Cancel" |
| T-M7-1 | Screen | `tests/screens/PrivacyNotice.test.tsx` | The 6 sections from PRD 8.2 M7, including where data is stored (the region from Section 18 #19) |
| T-SEC-4c | Database or function test | depends on Section 18 #6 | Deleting an account removes the login, profile and upvotes; faults stay with no reporter; a user can only delete their own account |

- [ ] All tests above are written, run, and fail for the expected reason.

**Step 2: Backend (Green)**

- [ ] OP9 as decided in Section 18 #6. `src/lib/api/profile.ts` (OP8, OP9).

**Step 3: Frontend (Green)**

- [ ] S1 (replaces the placeholder), S11 (replaces the Phase 5 placeholder), M5, M7 on S11, with every state in 7.3.

**Step 4: Refactor and full check**

- [ ] `npm run check` and `npx supabase test db` pass.

**Step 5: Manual checks (human)**

- [ ] Delete a new test account and check in Studio that the login, profile and upvotes are gone and its fault shows no reporter.
- [ ] S1, S11, M5 and M7 match their designs at 390 px.

**Definition of Done**

- [ ] Every test in Step 1 passes; all earlier tests still pass.
- [ ] Every screen in this phase shows all its required states.
- [ ] Manual checks are ticked by the human.
- [ ] Progress log updated (Section 17).

**PR title / squash commit:** `feat: add welcome, profile, delete account and privacy notice (#23)`

**STOP.**

---

### Phase 14: Languages

**Goal:** The interface is available in English, Afrikaans, isiZulu and Sepedi, chosen on S1 and S11 and saved in the profile.

**Covers:** BR18 · Story US4 (T-US4-1) · All screens · Issue #24 (SIJABULILE-NCUBE, proposed) · Milestone Final (Should, PRD 13.2: if time runs out, ship English and list the rest under Known issues)

**Starts when:** Phase 13 is merged. Each language is its own PR, checked by a first-language speaker (BR18, PRD 13.2).

**Step 1: Write the failing tests first (Red)**

| Test ID | Level | File | What it checks |
| --- | --- | --- | --- |
| T-BR18-1 | Unit | `tests/unit/language.test.ts` | First visit uses the browser language if it is en, af, zu or nso (e.g. "zu-ZA" → zu), otherwise English |
| T-BR18-2 | Unit | `tests/unit/translations.test.ts` | `af.json`, `zu.json` and `nso.json` have exactly the same keys as `en.json` and no empty values |
| T-US4-1 | Screen | `tests/screens/Profile.test.tsx` | Choosing "isiZulu" on S11 changes the labels and saves `language = 'zu'`; after logging in again the choice is kept |
| T-BR18-3 | Screen | `tests/screens/FaultDetails.test.tsx` | Descriptions are shown exactly as typed, whatever the interface language |

- [ ] All tests above are written, run, and fail for the expected reason.

**Step 2: Backend (Green)**

- [ ] None (`profiles.language` exists since #9; `description_language` since #11).

**Step 3: Frontend (Green)**

- [ ] `af.json`, `zu.json`, `nso.json` (one PR each); language picker shows only languages that are merged (Section 18 #20).

**Step 4: Refactor and full check**

- [ ] `npm run check` passes.

**Step 5: Manual checks (human)**

- [ ] A first-language speaker checks every screen in each language and signs off in the PR.

**Definition of Done**

- [ ] Every test in Step 1 passes; all earlier tests still pass.
- [ ] Manual checks are ticked by the human.
- [ ] Progress log updated (Section 17).

**PR titles:** `feat: add Afrikaans translations (#24)` · `feat: add isiZulu translations (#24)` · `feat: add Sepedi translations (#24)`

**STOP.**

---

### Phase 15: Hardening and tooling

**Goal:** The app behaves correctly when things go wrong, meets the quality rules, and the dev tooling has no high or critical audit findings.

**Covers:** PRD 6.2 edge cases, 9.4, 12.1 to 12.4 · Issue #32 (Mikel17croc, proposed) · Milestone Final

**Starts when:** Phases 10 to 13 are merged.

**Step 1: Write the failing tests first (Red)**

| Test ID | Level | File | What it checks |
| --- | --- | --- | --- |
| T-SETUP-5 | CI | `npm audit` | No high or critical findings after upgrading Vite and Vitest to patched majors (#32 acceptance criteria) |
| T-EDGE-2 | Screen | `tests/screens/ReportFault.test.tsx` | Session expires on S6 → "Please log in again.", S3, then back to S6 with the form filled in |
| T-EDGE-4 | Database | `17_edge_cases.test.sql` | Moving Ward A to a new admin (admin action) keeps all open faults in Ward A; two ward admins for one ward are refused |
| T-EDGE-5 | Database | same | Deleting a field team with faults not Closed is refused |
| T-NFR-1 | Screen | `tests/screens/accessibility.test.tsx` | Every icon-only button and image has an accessible name (e.g. "Photo of the fault, 1 of 3") |
| T-NFR-2 | Screen | same | Touch targets at least 44 × 44 px (class check) and visible focus ring |
| T-NFR-3 | Unit | `tests/unit/messages.test.ts` | Every PRD 12.2 message exists in `en.json` with the exact text; one error handler maps backend errors to them |
| T-NFR-4 | Screen | `tests/screens/offline.test.tsx` | Every logged-in screen shows the offline banner and disables save buttons when offline |
| T-NFR-5 | Unit | `tests/unit/dates.test.ts` | Dates "12 Nov 2026", 24-hour time, SAST display of UTC values |
| T-NFR-6 | Unit | `tests/unit/secrets.test.ts` | From Phase 4, still passing |
| T-NFR-7 | Unit | `tests/unit/logging.test.ts` | The error handler never logs passwords, tokens, emails or phone numbers |

- [ ] All tests above are written, run, and fail for the expected reason (or are new checks that must pass).

**Step 2: Backend (Green)**

- [ ] Fix whatever the tests reveal, using new migrations only (never edit old ones).

**Step 3: Frontend (Green)**

- [ ] #32: upgrade Vite, `@vitejs/plugin-react` and Vitest to patched majors; fix config and test breakage. Update PRD 11.1 (Section 18 #1).
- [ ] Offline handling, accessibility labels, responsive rules from PRD 9.3 on every screen.

**Step 4: Refactor and full check**

- [ ] `npm run check`, `npx supabase test db` and `npm audit` pass; CI green.

**Step 5: Manual checks (human)**

- [ ] T-NFR-8: on a mid-range Android phone on mobile data, every screen shows content or a placeholder within 3 seconds.
- [ ] T-NFR-9: Chrome on Android 10+, Safari 16+ on iPhone, latest Chrome, Edge and Safari on desktop, from 360 px.
- [ ] T-NFR-10: every text colour passes 4.5:1 at webaim.org/resources/contrastchecker.
- [ ] T-NFR-11: go through S2, S3, S6 and S8 with the keyboard only.
- [ ] T-NFR-12: uploaded photos are under 500 KB and thumbnails under 50 KB.

**Definition of Done**

- [ ] Every test in Step 1 passes; all earlier tests still pass.
- [ ] Manual checks are ticked by the human.
- [ ] Progress log updated (Section 17).

**PR titles:** `chore: upgrade Vite and Vitest to patched majors (#32)` · `fix: hardening for edge cases and accessibility`

**STOP.**

---

### Phase 16: Should features (F6, F7, F8)

**Goal:** Field teams add after photos, the AI suggests the fault type and translates descriptions, and faults can be seen on a map. Only after every Must phase (1 to 15) is merged.

**Covers:** Features F6, F7, F8 · Stories US12, US13, US14 · Rules BR13, BR20, BR21 · Operations OP27, OP28, OP29 · Issues #25 (Bao992, proposed), #26 (Paul280-cloud, proposed) · No milestone

**Starts when:** Phases 1 to 15 are merged, the human says "Start Phase 16", and Section 18 #26 (AI provider) is answered for F7. Leaflet and react-leaflet are added only now (Section 4.1).

**Step 1: Write the failing tests first (Red)**

| Test ID | Level | File | What it checks |
| --- | --- | --- | --- |
| T-US12-1 | Screen | `tests/screens/UpdateStatus.test.tsx` | "Fixed" with 1 after photo → S5 shows "Before" and "After" side by side |
| T-US12-2 | Screen | same | "Fixed" with no photo → "Add at least 1 after photo." |
| T-BR13-2 | Database | `18_after_photos.test.sql` | Once F6 is on, `change_fault_status` to fixed needs at least 1 after photo |
| T-US13-1 | Screen | `tests/screens/ReportFault.test.tsx` | Photo + "big hole in the road" → chip "Suggested: Pothole"; tapping it fills Fault type |
| T-US13-2 | Screen | same | AI fails or takes over 8 seconds → no chip, form works |
| T-US13-3 | Screen | `FaultDetails.test.tsx` | isiZulu description → ward admin sees the English text labelled "Translated by AI" and "Original (isiZulu):"; residents see only the original |
| T-BR20-1 | Unit | `tests/unit/aiSuggestion.test.ts` | Suggestion asked only after a photo and 10+ characters; timeout 8 seconds |
| T-US14-1 | Screen | `tests/screens/FaultMap.test.tsx` | "Map" shows a pin per fault with GPS; tapping shows reference, type, status and "View fault" |
| T-US14-2 | Screen | same | 2 faults without GPS → "2 faults without a map location are not shown." |
| T-BR21-1 | Unit | `tests/unit/map.test.ts` | Pin colour equals the status chip colour |

- [ ] All tests above are written, run, and fail for the expected reason.

**Step 2: Backend (Green)**

- [ ] #25: after-photo rule in `change_fault_status` (new migration).
- [ ] #26: Edge Function for F7 with `AI_API_KEY` as a Supabase secret; writes `description_en`.

**Step 3: Frontend (Green)**

- [ ] #25: after photos on M3 and Before/After on S5.
- [ ] #26: suggestion chip on S6, translation on S5, Map toggle on S4.

**Step 4: Refactor and full check**

- [ ] `npm run check` and `npx supabase test db` pass.

**Step 5: Manual checks (human)**

- [ ] Real photos on a phone: after photo upload, AI chip, map pins.

**Definition of Done**

- [ ] Every test in Step 1 passes; all earlier tests still pass.
- [ ] Manual checks are ticked by the human.
- [ ] Progress log updated (Section 17).

**PR titles:** `feat: add after photos for proof of work (#25)` · `feat: add AI help and map view (#26)`

**STOP.**

---

### Phase 17: Release

**Goal:** The final version is live, every acceptance test has passed on the live link, and the Loom is recorded.

**Covers:** PRD 11.7 (demo script), 13.4 M5 · Sections 15 and 16 · Milestone Final (Fri 20 Nov 2026, 10:00)

**Starts when:** Every Must phase is merged (by Thu 19 Nov 2026, 18:00 at the latest).

**Step 1: Write the failing tests first (Red)**

| Test ID | Level | File | What it checks |
| --- | --- | --- | --- |
| T-REL-2 | Manual | Bao's checklist (#7) | Every T- criterion in Section 15 run on the live link with the 4 test accounts |
| T-REL-3 | Manual | n/a | The 6-step demo script in PRD 11.7 runs without errors on the live link on two devices |

- [ ] Checks scheduled.

**Step 2: Backend (Green)**

- [ ] Hosted database has every migration (`npx supabase migration list`), the cron job, and fresh seed data.

**Step 3: Frontend (Green)**

- [ ] README complete: live link, Stitch link, setup, commands, test logins, tests, deployment, Known issues.

**Step 4: Refactor and full check**

- [ ] Fresh clone, `npm ci`, `npx supabase start`, reset, seed, `npm run check` and `npx supabase test db` pass.

**Step 5: Manual checks (human)**

- [ ] T-REL-2 and T-REL-3.
- [ ] Loom recorded with the team.

**Definition of Done**

- [ ] Every box in Sections 15 and 16 is ticked, or the gap is listed under Known issues in the README.
- [ ] Progress log updated; plan Status set to Complete.

**PR title / squash commit:** `docs: final release notes and plan update`

**STOP.** The build is complete.

---

## 14. Traceability matrix

| Feature | Stories | Acceptance tests | Rule tests | Screens | Operations | Phase | Issues |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F1 Account and report a fault | US1, US2, US3, US4 | T-US1-1 to 3, T-US2-1 to 4, T-US3-1 to 4, T-US4-1 to 3 | T-AUTH-1 to 4, T-BR1-1 to 2, T-BR2-1 to 4, T-BR3-1 to 2, T-BR17-1 to 2, T-BR18-1 to 3, T-BR19-1 to 2, T-SEC-9, T-EDGE-1, 2, 6, 7 | S1, S2, S3, S6, S11, S12, M1, M5, M7 | OP1 to OP10, OP14, OP15 | 5, 6, 8, 13, 14 | #10, #11, #13, #14, #23, #24 |
| F2 Public fault list and upvotes | US5, US6 | T-US5-1 to 3, T-US6-1 to 3 | T-BR4-1 to 2, T-BR5-1 to 3, T-BR6-1, T-BR11-1, T-BR16-1, T-SEC-8, T-SEC-16, T-SEC-19, T-EDGE-8 | S4, S5, M6 | OP11, OP12, OP13, OP16 | 6, 7, 8 | #11, #12, #13 |
| F3 Assign the work | US7 | T-US7-1 to 4 | T-BR7-1, T-BR8-1 to 2, T-BR9-1 to 4, T-BR10-1, T-SEC-7, T-SEC-10, T-EDGE-4, T-EDGE-5 | S5, S8, M2 | OP17, OP18, OP22, OP26 | 9, 10 | #16, #18, #19 |
| F4 Track progress | US8, US9, US10 | T-US8-1 to 3, T-US9-1 to 3, T-US10-1 to 4 | T-BR9-1 to 4, T-BR11-1, T-BR12-1 to 2, T-BR13-1, T-BR14-1 to 4, T-SEC-11, T-SEC-12, T-SEC-17, T-EDGE-3 | S5, S7, S10, M3, M4 | OP12, OP19, OP20, OP21, OP23, OP24 | 9, 11 | #16, #17, #20 |
| F5 Ward dashboard | US11 | T-US11-1 to 2 | T-BR11-1, T-BR15-1 to 2, T-SEC-18 | S9 | OP25 | 12 | #21, #22 |
| F6 Proof of work | US12 | T-US12-1 to 2 | T-BR13-2 | S5, M3 | OP27 | 16 | #25 |
| F7 AI help | US13 | T-US13-1 to 3 | T-BR20-1 | S5, S6 | OP28 | 16 | #26 |
| F8 Map view | US14 | T-US14-1 to 2 | T-BR21-1 | S4 | OP29 | 16 | #26 |

Business rule coverage: BR1 (6) · BR2 (6, 8) · BR3 (6, 8) · BR4 (6, 8) · BR5 (6, 7) · BR6 (7) · BR7 (10) · BR8 (10) · BR9 (6, 9) · BR10 (9, 10) · BR11 (7) · BR12 (9, 11) · BR13 (9, 16) · BR14 (9, 11) · BR15 (12) · BR16 (6, 8, 10) · BR17 (6, 8) · BR18 (14) · BR19 (6, 8) · BR20 (16) · BR21 (16).

---

## 15. Acceptance test checklist

Bao992 runs this list on the live link before each checkpoint (PRD 11.7). Tick only when it passes on the live link.

- [ ] T-US1-1: sign up → S3 with "Check your email to confirm your account." (automated + manual)
- [ ] T-US1-2: email already has an account (automated)
- [ ] T-US1-3: password without a number (automated)
- [ ] T-US2-1: confirmed account logs in → S4 (automated + manual)
- [ ] T-US2-2: wrong password, email kept (automated)
- [ ] T-US2-3: reset link message never reveals accounts (automated)
- [ ] T-US2-4: expired reset link (automated + manual)
- [ ] T-US3-1: report a fault → S5 with reference number (automated + manual, Checkpoint 3)
- [ ] T-US3-2: no photo message (automated)
- [ ] T-US3-3: 5 a day limit (automated)
- [ ] T-US3-4: upload failed, form kept (automated)
- [ ] T-US4-1: language isiZulu kept after log-in (automated + manual)
- [ ] T-US4-2: delete account (automated + manual)
- [ ] T-US4-3: delete account fails (automated)
- [ ] T-US5-1: 20 cards newest first (automated + manual, Checkpoint 3)
- [ ] T-US5-2: search by reference number (automated)
- [ ] T-US5-3: filters with no match (automated)
- [ ] T-US6-1: M6 shows a fault 80 m away (automated + manual, Checkpoint 3)
- [ ] T-US6-2: "Upvote instead" (automated)
- [ ] T-US6-3: own fault cannot be upvoted (automated)
- [ ] T-US7-1: opening a Received fault → Viewed (automated)
- [ ] T-US7-2: assign → Assigned with team, date and time (automated + manual)
- [ ] T-US7-3: date 120 days away (automated)
- [ ] T-US7-4: other ward refused by the database (automated)
- [ ] T-US8-1: Scheduled with date and time in the history (automated + manual)
- [ ] T-US8-2: delayed with reason and new date (automated)
- [ ] T-US8-3: other team refused by the database (automated)
- [ ] T-US9-1: timeline and responsibility block (automated + manual)
- [ ] T-US9-2: Overdue label (automated)
- [ ] T-US9-3: My reports empty state (automated)
- [ ] T-US10-1: "Yes, it's fixed" → Closed (automated + manual)
- [ ] T-US10-2: reopen with a reason (automated)
- [ ] T-US10-3: reopen limit message (automated)
- [ ] T-US10-4: auto-close after 7 days (automated)
- [ ] T-US11-1: dashboard figures 4 / 1 / 5.0 days (automated + manual)
- [ ] T-US11-2: "No data" (automated)
- [ ] T-US12-1, T-US12-2: after photos (Should, automated)
- [ ] T-US13-1 to T-US13-3: AI help (Should, automated + manual)
- [ ] T-US14-1, T-US14-2: map view (Should, automated)
- [ ] T-EDGE-1 to T-EDGE-8: PRD 6.2 edge cases (automated)
- [ ] T-NFR-8 to T-NFR-12: speed, devices, contrast, keyboard, photo size (manual)
- [ ] G1: 8 of 10 testers report a fault in under 3 minutes (manual user test)
- [ ] G3: 9 of 10 testers find status, team and due date in under 30 seconds (manual user test)
- [ ] G4: 7 of 10 testers choose "Upvote instead" in the duplicate test (manual user test)

---

## 16. Final release checklist

- [ ] All Must phases complete; all automated tests pass; Section 15 automated items ticked.
- [ ] CI is green on `main` and required for every PR (#8).
- [ ] The Vercel URL works and is connected to the hosted Supabase project; the region is in the README and M7.
- [ ] Demo script from PRD 11.7 runs from start to finish on the live link (T-REL-3).
- [ ] README explains setup, every command, the test logins and how to run each test level.
- [ ] `.env.example` lists every variable; no secret appears in `src/` (T-NFR-6).
- [ ] `npm audit`: no high or critical findings (#32).
- [ ] Every member has merged at least one frontend and one backend PR.
- [ ] Final comparison of the app against PRD Sections 6, 8 and 9 shows no gaps, or the gaps are under Known issues.

---

## 17. Progress log (the coding agent updates this)

| Phase | Date | Status | Automated tests (passed / total) | Commit / PR | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 (#5) | 11 Nov 2026 | Complete (#8 CI still open) | Vitest 1/1 | PR #28 (`0d8073f`) | Node 22.21.1. Installed: react 18.3.1, vite 5.4.21, typescript 5.6.3, react-router-dom 7.18.5, tailwindcss 3.4.19, i18next 23.16.8, react-i18next 15.7.4, vitest 2.1.9, @testing-library/react 16.3.3. `npm audit --omit=dev`: 0 findings; dev findings tracked in #32. |
| 2 (#9) | 11 Nov 2026 | Complete | pgTAP 271/271 (7 files) · Vitest 1/1 | PR #29 (`f67e314`) | 4 migrations, seed users and passwords script. Local stack on ports 553xx. |
| 3 | | Not started | | | |
| 4 | | Not started | | | |
| 5 | | Not started | | | |
| 6 | | Not started | | | |
| 7 | | Not started | | | |
| 8 | | Not started | | | |
| 9 | | Not started | | | |
| 10 | | Not started | | | |
| 11 | | Not started | | | |
| 12 | | Not started | | | |
| 13 | | Not started | | | |
| 14 | | Not started | | | |
| 15 | | Not started | | | |
| 16 | | Not started | | | |
| 17 | | Not started | | | |

---

## 18. Clarifications needed

These are open questions found in the PRD (v0.4), the repo and the board while writing this plan. Row #2 was answered by the human on 11 Nov 2026; every other row is still **Open**. The coding agent must not change a row to Answered itself: the human writes the answer and the date, and if the answer changes the PRD, the PRD gets a change log row first. The "Blocks" column says which phase cannot start until the row is answered; other phases may go ahead.

| # | Question | Where (section / ID) | Blocks | Answer | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | PRD 11.1 says "React Router 6", but the repo uses React Router 7.18.x (PR #28), and the README tech stack table also still says 6. #32 will also move Vite and Vitest past "Vite 5". PRD 11.1 and 11.7 also do not mention pgTAP, which #9 uses. Should PRD 11.1 / 11.7 and the README be updated (with a change log row) now, and again when #32 lands? | PRD 11.1, 11.7; README; #32 | none (docs) | | Open |
| 2 | The app needs `@supabase/supabase-js` to talk to Supabase, and PRD 9.1 names Lucide icons, but neither package is in the PRD stack table or `package.json`. May they be added in Phase 4/5 (Rule 13)? | PRD 9.1, 11.1, 11.3 | 4, 5 | Yes. `@supabase/supabase-js` (v2) and `lucide-react` are approved and added to the Section 4.1 stack table. Decided by the human, 11 Nov 2026. | Answered |
| 3 | BR2 allows HEIC photos and requires the browser to resize, compress and strip EXIF. Only Safari can decode HEIC natively; Chrome on Android cannot draw HEIC to a canvas. Should we add a HEIC-decoding library (which one), or accept HEIC only where the browser can decode it? | BR2, S6, M3, US3 | 6 (#14), 8 | | Open |
| 4 | The edge case "A field team is removed while it has assigned faults" says the ward admin sees "This field team no longer exists. Please reassign." on S5, but the same row says the database blocks deleting a field team with faults that are not Closed. If the delete is blocked, when can the message appear? Should it be dropped, or should removal be a "deactivate" flag instead of a delete? | PRD 6.2, 10.1 FieldTeam | 10 | | Open |
| 5 | BR6 says the S4 search matches "a street address containing the typed words". Must the address contain all typed words in any order, the exact phrase, or any one of the words? | BR6, S4, T-US5-2 | 7 | | Open |
| 6 | Delete account (PRD 5, M5) must delete the user's **login**. That needs the service role key, which may never be in the browser (PRD 11.5). PRD 11.3 only mentions an Edge Function for AI. May we add an Edge Function `delete-account` (takes the user from the request token, deletes the Auth user; the cascade does the rest)? | PRD 5, 11.3, 11.5, M5, US4 | 13 | | Open |
| 7 | BR12 "delayed": when is `is_delayed` cleared (on the next status change, on Fixed, on reassign, or never)? Can a fault be marked delayed while Assigned and Scheduled, or only In progress (BR12 says "an assigned fault", US8-2 shows In progress)? | BR12, M3, US8 | 9 | | Open |
| 8 | Creating a fault and uploading its photos are two steps. If the fault row is saved but the photo upload fails (US3-4 keeps the form for "Try again"), what happens to the saved row? Nobody may delete faults in the app (PRD 11.4), and a half-saved fault would also count towards the 5-a-day limit (BR17). Proposed options: upload photos first to a temporary path, or let a database function delete the reporter's own fault only when it has no photos and was created in the last few minutes. | US3-4, BR17, PRD 11.4 | 8 | | Open |
| 9 | Checkpoint 3 needs F1 end to end, and T-US3-1 lands on S5 after submitting. But S5 is in #17 (Bao992, milestone Final). Who builds the read-only S5 base for Checkpoint 3: #13 (Bafana-Ndlovu, as this plan proposes in Phase 8), or should part of #17 move to Checkpoint 3? | #13, #17, US3, PRD 13.4 M4 | 8 | | Open |
| 10 | PRD 12.4 says the reporter's phone number is kept "so a ward admin can contact a resident about a fault", and the ward admin can read reporters' name and email (12.4, 11.4). But the S5 spec (8.2) shows no reporter details in the ward admin block. Should S5 show the reporter's name and phone to the ward admin of the ward? If yes, where and with what label? | PRD 8.2 S5, 11.4, 12.4 | 10 | | Open |
| 11 | PRD 8.4 says the Ward A dashboard seed includes 'one Electricity fault "Streetlight flickering" (Viewed)'. "Streetlight flickering" is not a fault type in 10.4. Is it fault type "Faulty streetlight" with that text as its description? | PRD 8.4, 10.4, T-US11-1 | 6 (seed) | | Open |
| 12 | Design file names: Issue #6 says `S1.png`, `M2.png`, but `docs/designs/STITCH_PROMPTS.md` says `S01-welcome.png`, `M02-assign-fault.png`. Which naming should be used (and how are the desktop versions of S8 and S9 named)? | #6, `docs/designs/STITCH_PROMPTS.md` | 3 | | Open |
| 13 | PRD 10.4 says the seed faults come "with their photos". Who supplies the sample photos (free to use, no faces or number plates), and by when? | PRD 10.4, 12.4 | 6 (#14 seed) | | Open |
| 14 | "CI required" cannot be switched on in branch protection until #8 is merged, and #8 has no assignee. Who does #8 (this plan proposes Mikel17croc) and who changes the branch protection? Until then, is a pasted local `npm run check` enough to merge? | #8, PRD 13.4 M3 | none (process) | | Open |
| 15 | These Issues have no assignee: #8, #15, #21, #22, #23, #24, #25, #26, #32. This plan proposes: Mikel17croc #8, #15, #21, #22, #32; Bafana-Ndlovu #23; SIJABULILE-NCUBE #24; Bao992 #25; Paul280-cloud #26. Please confirm or change them on the board. | Board, Section 13.0 | 1 (#8), 4, 12 to 16 | | Open |
| 16 | BR17 says "at most 5 faults in any 24 hours" (a rolling window), but the message says "Please try again tomorrow." Is the limit a rolling 24 hours, or per calendar day in SAST? | BR17, T-US3-3 | 6 | | Open |
| 17 | BR1 says the number restarts "each year" using "the year it was reported". Is that the year in SAST (this plan's assumption) or UTC? It only matters between 22:00 and 24:00 UTC on 31 December. | BR1 | 6 | | Open |
| 18 | After a fault is Reopened, 10.3 only allows Reopened → Assigned. Should the old field team, due date and `is_delayed` be cleared on reopen? Should the old due date still make it "Overdue" while it sits in the "New" tab? | 10.3, BR7, BR11, BR14 | 9 | | Open |
| 19 | M7 must say where the data is stored, but the Supabase region is only recorded when the hosted project is created (PRD 12.4, Phase 4). Also, the contact "privacy@fixmykasi.example" is a placeholder domain. What is the region, and what contact address should M7 show? | M7, PRD 12.4 | 13 | | Open |
| 20 | BR18 says the first visit uses the browser's language if it is one of the four, and S1/S11 show all four languages. Until #24 adds af, zu and nso, should the picker show only the languages that exist (this plan's assumption), or all four with English text behind them? | BR18, S1, S11, #24 | 13, 14 | | Open |
| 21 | Ward admins and field team members are "Created by the admin in the Supabase dashboard" (PRD 2.4). The sign-up trigger requires a home ward and 18+ for residents, and creates every login as a resident. What are the exact admin steps for a staff account (create login, then set role and ward / field team)? Should they be written in the README? | PRD 2.4, 2.5 | none (docs) | | Open |
| 22 | S9 "View overdue faults" opens S8 with "Overdue only" on. Overdue faults can be in the "New" or "In progress" tab (BR7). Which tab should be active, or should the filter apply across tabs? | S9, S8, BR7, BR11 | 12 | | Open |
| 23 | US11-1 expects "Open faults 4, Overdue faults 1" with the seed data, using "today" = 12 Nov 2026. On the demo days (16 and 20 Nov) more seed faults will be overdue (FMK-2026-00123 is due 18 Nov). Should the seed dates be relative to the day the database is reset, so the demo always shows the PRD figures? | PRD 8.4, T-US11-1, Phase 17 | 6 (seed), 12 | | Open |
| 24 | PRD 2.4 says a ward admin "can mark faults Viewed", and BR10 says it happens automatically on first open. Is there also a manual "Mark as viewed" action, or only the automatic one? | PRD 2.4, BR10 | 10 | | Open |
| 25 | BR15 "Average time to fix" counts faults "fixed in the last 30 days". Does that include faults that were later Closed or Reopened, and for a reopened fault, is the first or the latest `fixed_at` used? | BR15, S9 | 12 | | Open |
| 26 | F7 AI provider: PRD 11.2 says the Tech Lead chooses OpenAI or Anthropic "when F7 work starts". Which provider and model? | PRD 11.2, BR20 | 16 (F7) | | Open |

---

## 19. Change log

| Plan version | Date | What changed | Why |
| --- | --- | --- | --- |
| v0.1 | 11 Nov 2026 | First version | Generated from PRD v0.4, the repo after PR #28 and PR #29, and the GitHub Issues #5 to #26 and #32. Designs not ready yet, so tokens and screen designs are "TBD until docs/designs is merged". 26 open questions in Section 18. |
| v0.2 | 11 Nov 2026 | Sections 4.1, 18 and Phases 4 and 5 | Section 18 #2 answered: `@supabase/supabase-js` (v2) and `lucide-react` approved and added to the stack table. | Human decision |
