# FixMyKasi

**A web app that lets South African residents report community faults like potholes, burst pipes and broken streetlights, see which municipal team or contractor has been assigned to fix each one, and track it until it is confirmed fixed.**

## The problem

Residents report potholes, burst water and sewer pipes, blocked manholes and broken streetlights, but many do not know where to report them. Reports get lost between call centres, WhatsApp groups and councillors, neighbours report the same fault again and again, and once a report is made people are left guessing.

FixMyKasi gives every fault one public record. Anyone can see what was reported, who is responsible for fixing it, when it should be fixed and whether the work was really done.

## Links

| Link | URL |
| --- | --- |
| Live app | [fixmykasi.vercel.app](https://fixmykasi.vercel.app) |
| Stitch project | [FixMyKasi designs](https://stitch.withgoogle.com/projects/16313615270709945959) |
| Project board | [FixMyKasi board](https://github.com/users/Paul280-cloud/projects/1) |
| Team Loom | Sijabulile [part 1](https://www.loom.com/share/d66e9a741ddf457bb3377f6507aa66d8), [part 2](https://www.loom.com/share/0aaa02a3d0264536a93282c4dbfbf19f) · [Bheki](https://www.loom.com/share/1651cae60b88483380c108b87c188347) · [Bafana](https://www.loom.com/share/978885b80ef341198ac702563d04555f) · [Bao](https://www.loom.com/share/d24f4bebb1f14eca874224d0c2aaddde) |

## Team & Roles

| Name | GitHub username | Role(s) | Main work (merged, or in progress) |
| --- | --- | --- | --- |
| Sijabulile Ncube | [@Sijabulile-Ncube](https://github.com/Sijabulile-Ncube) | Product Owner, Backend Dev | Merged: #11 Fault tables and RLS (PR #45). Since Checkpoint 3: CI follow-ups (PR #56) · #18 `assign_fault` (PR #57) · M2 Assign fault (PR #61) · Assign button on S8 (PR #62) · #20 My jobs + Update status (PR #64) · note privacy hint (PR #67) · #12 Fault list (PR #68) · #23 Profile tab (PR #69) |
| Bheki Buthelezi | [@Paul280-cloud](https://github.com/Paul280-cloud) | Tech Lead | Merged: #10 Log-in screens (PR #41) · #15 Deploy (PR #50). Since Checkpoint 3: #19 Ward queue (PR #58) · #23 Welcome screen links (PR #63) |
| Bafana Ndlovu | [@Bafana-Ndlovu](https://github.com/Bafana-Ndlovu) | Designer, Frontend Dev | Merged: #13 Report a fault screen (PR #48) · #14 Photo storage (PRs #43, #44). Since Checkpoint 3: BR2 photo checks (PR #53) · photo rule in the database (PR #59) |
| Bao Kekana | [@Bao992](https://github.com/Bao992) | QA / Test Lead, DevOps / Release | Merged: #7 Test plan (PR #54) · #47 Database tests in CI (PR #55) · #16 Status change rules (PR #60) · #17 Fault details and timeline (PR #65) |

Roles show who leads each area. Every member builds at least one screen and one backend piece, opens their own pull requests and reviews their teammates' pull requests.

## Features

### Must have

| Feature | Description | Status |
| --- | --- | --- |
| Log in / Sign up | Create an account, confirm the email, log in and reset a forgotten password | ✅ Done (#41). The home screen links to Create account, Log in and Browse faults (#63). |
| Report a fault | Log in and report a fault with a photo, location, category and description | ✅ Done: report with up to 3 photos, a reference number straight away (#41, #43, #44, #45, #48). The database refuses a report with no photo unless "not safe" is ticked, and saves the fault and its photos all or nothing (#59). |
| Public fault list | See all faults and upvote existing reports instead of reporting the same fault twice | 🚧 In progress. Done: the Fault list for everyone, newest first, 20 at a time (#68). Not built yet: search, filters, the upvote button and load more. The upvote rules are already in the database (#45). |
| Assign the work | Ward admin assigns each fault to a municipal team or named contractor, with a due date | ✅ Done: Ward queue in BR7 order (#58), Assign / Reassign on each card (#62), M2 Assign fault (#61) and `assign_fault` with the BR8 rules (#57). |
| Track progress | Follow each fault from Received to Closed, then confirm the fix or reopen it | 🚧 In progress. Done: status rules, timeline, overdue, reopen and auto-close in the database (#60), the field team's My jobs + Update status (#64), and Fault details with the public timeline (#65). Not built yet: Confirm / Reopen (M4), My reports (S7), delay and after photos. |
| Ward dashboard | See open faults, overdue faults and the average time to fix | ⏳ Not started (#21, #22) |

### Should have

| Feature | Description | Status |
| --- | --- | --- |
| Proof of work | Teams upload an after photo when the job is done | ⏳ Not started |
| AI help | AI suggests the fault category and urgency, and translates descriptions | ⏳ Not started |
| Map view | Faults shown as pins coloured by status | ⏳ Not started |

Statuses: ✅ Done (merged and on the live app) · 🚧 In progress (code in an open pull request) · ⏳ Not started

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 18, Vite 5, React Router 7, TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Database, log-in and storage | Supabase (PostgreSQL, Auth, Storage, Edge Functions (planned)) |
| Translations | i18next (English; Afrikaans, isiZulu, Sepedi (planned)) |
| Map | Leaflet with OpenStreetMap (planned) |
| Testing | Vitest and React Testing Library |
| Hosting | Vercel, redeploys on every merge to `main` |

**Architecture:** the React app runs in the browser and talks to Supabase directly. Row-Level Security (RLS) policies in the database decide what each role (resident, ward admin, field team) can read and change. AI help runs in a Supabase Edge Function so the AI key never reaches the browser (planned). Full details are in the [PRD](docs/PRD.md), Section 11.

## Run it locally

You need Node.js 22 LTS and npm. The version is pinned in `.nvmrc`, so with nvm run `nvm use` in the project folder.

```bash
git clone https://github.com/Paul280-cloud/fixmykasi.git
cd fixmykasi
npm install
cp .env.example .env   # then fill in real values (never commit .env)
npm run dev            # opens the app at http://localhost:5173
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm run lint` | Checks the code with ESLint |
| `npm run typecheck` | Checks TypeScript types |
| `npm test` | Runs the Vitest tests once |
| `npm run build` | Builds the app into `dist/` |
| `npm run check` | Runs lint, typecheck, test and build in that order (run this before opening a PR) |

**CI:** GitHub Actions runs `npm run check` on every pull request to `main` (and on every push to `main`).

### Local database

The database runs locally with the Supabase CLI. **You also need:** Docker Desktop (running).

```bash
npx supabase start                          # start the local stack (first run downloads the Docker images)
npx supabase db reset                       # apply supabase/migrations and load supabase/seed.sql
cp .env.example .env                        # then paste the URL and keys from: npx supabase status
node --env-file=.env supabase/seed/seed.js  # set the test passwords (PRD 10.4)
npx supabase test db                        # run the pgTAP tests in supabase/tests
```

The local stack uses ports 553xx (API on http://127.0.0.1:55321, Studio on http://127.0.0.1:55323) so it can run next to another Supabase project. Stop it with `npx supabase stop`.

## Test logins

**Local only (`npx supabase db reset`, then `seed.js`). These accounts do NOT exist on the live site.** They are fictional people from PRD 10.4 with test-only passwords (details in [supabase/seed/README.md](supabase/seed/README.md)).

| Role | Email | Password |
| --- | --- | --- |
| Resident (Ward A) | thandeka.m@example.com | TestResident1 |
| Resident (Ward A, empty states) | nomsa.s@example.com | TestResident2 |
| Ward admin (Ward A) | zanele.k@example.com | TestWardAdmin1 |
| Field team (Sample Plumbing Services) | kagiso.m@example.com | TestFieldTeam1 |

**On the live site:** demo accounts for a ward admin and a field team exist on the live project. Their credentials are shared privately, never in this README. Residents can sign up with their own email and confirm it.

## Tests



| Kind | Where | How to run | What it covers |
| --- | --- | --- | --- |
| App tests (Vitest + React Testing Library) | `tests/` | `npm test` | Screens, components and form validation |
| Database tests (pgTAP) | `supabase/tests/` | `npx supabase start` then `npx supabase test db` | Tables, constraints, triggers, grants, Row-Level Security and storage policies. These tests also run automatically in GitHub Actions on every pull request and push to main. |
| Full check | | `npm run check` | Lint, typecheck, app tests and build. CI runs this on every pull request. |

For most PRs, tests are written first, then the code that makes them pass. The manual test checklist is in the [Implementation plan](IMPLEMENTATION_PLAN.md), Section 13.

## Deployment

- **App:** Vercel. Every merge to `main` redeploys [fixmykasi.vercel.app](https://fixmykasi.vercel.app).
- **Database, log-in and storage:** a hosted Supabase project. Migrations from `supabase/migrations` are pushed with `npx supabase db push`.
- **Settings:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel. The live address is in the hosted project's Auth redirect URLs so confirm-email and reset-password links come back to the app.

## Screenshots

Screenshots of each screen will be added here as it is merged. Until then, the designs for every screen are in [docs/designs](docs/designs/).

## Known issues

- The photo bucket limit is 2 MB in the code (and on the live database) but 10 MB in the PRD and #27. The decision is tracked in #51.
- My reports (S7), Confirm / Reopen (M4) and the Dashboard (#21, #22) are not built yet, so those tabs open the home screen. The Profile tab (#69) only shows your details for now; editing, changing the language and Delete account come later in #23.
- Notes on the timeline (from M2 and M3) are public, so they must not contain personal details. The Update status form now warns the field team about this (#67), but nothing checks the text yet (#51).
- A ward admin can't read the reporter of faults in their ward yet (#51).
- There is no two-connection race test for the report limits yet; the lock is only checked in one session (#51).
- Photo rows are not yet checked against who uploaded the file (#51).
- The local Supabase stack has email confirmation switched off to make testing easier. The hosted project needs it on (PRD 5).
- Photos are JPG or PNG only for now (plan decision #3). HEIC and WebP from the PRD come later.
- Similar reports, infinite scroll and upvotes were moved to after Checkpoint 3 so we could finish one feature end to end.
- The app is in English only for now. Afrikaans, isiZulu and Sepedi come with #24.
- Open follow-ups are tracked in Issue #51.

## Project documents

- [Product Requirements Document (PRD)](docs/PRD.md)
- [Designs](docs/designs/) (Stitch screens for S1 to S12 and M1 to M7)
- [Implementation plan](IMPLEMENTATION_PLAN.md)

## How we work

- **Issues:** every piece of work is an Issue on the project board, with acceptance criteria, an assignee and a label.
- **Branches:** branch from an up-to-date `main`, named after the Issue, for example `feature/12-report-fault` or `docs/prd`.
- **Commits:** small and clear, for example `feat: add report fault form (#12)`.
- **Pull requests:** each PR explains what changed and why, links its Issue (`Closes #12`), and shows screenshots and how it was tested.
- **Reviews:** at least one teammate reviews and approves every PR.
- **Merging:** `main` is protected. We use squash and merge once a PR is approved and CI passes, then the branch is deleted. Most code PRs so far (including #43, #45, #48 and #50) used merge commits.
- **Secrets:** `.env` is never committed. We commit `.env.example` and share real keys privately.
