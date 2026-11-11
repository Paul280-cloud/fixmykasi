# FixMyKasi

**A web app that lets South African residents report community faults like potholes, burst pipes and broken streetlights, see which municipal team or contractor has been assigned to fix each one, and track it until it is confirmed fixed.**

## The problem

Residents report potholes, burst water and sewer pipes, blocked manholes and broken streetlights, but many do not know where to report them. Reports get lost between call centres, WhatsApp groups and councillors, neighbours report the same fault again and again, and once a report is made people are left guessing.

FixMyKasi gives every fault one public record. Anyone can see what was reported, who is responsible for fixing it, when it should be fixed and whether the work was really done.

## Links

| Link | URL |
| --- | --- |
| Live app | Coming soon |
| Stitch project | FixMyKasi designs (https://stitch.withgoogle.com/projects/16313615270709945959) |
| Project board | [FixMyKasi board](https://github.com/users/Paul280-cloud/projects/1) |
| Team Loom | Coming soon |

## Team & Roles

| Name | GitHub username | Role(s) | Main features |
| --- | --- | --- | --- |
| Sijabulile Ncube | [@Sijabulile-Ncube](https://github.com/Sijabulile-Ncube) | Product Owner, Backend Dev | Report a fault |
| Bheki Buthelezi | [@Paul280-cloud](https://github.com/Paul280-cloud) | Tech Lead | Login and ward dashboard |
| Bafana Ndlovu | [@Bafana-Ndlovu](https://github.com/Bafana-Ndlovu) | Designer, Frontend Dev | Public fault list |
| Bao Kekana | [@Bao992](https://github.com/Bao992) | QA / Test Lead | Track progress |
| Mhlengi Ngwenya | [@Mikel17croc](https://github.com/Mikel17croc) | DevOps / Release | Assign the work |

Roles show who leads each area. Every member builds at least one screen and one backend piece, opens their own pull requests and reviews their teammates' pull requests.

## Features

### Must have

| Feature | Description | Status |
| --- | --- | --- |
| Report a fault | Log in and report a fault with a photo, location, category and description | 🚧 In progress |
| Public fault list | See all faults and upvote existing reports instead of reporting the same fault twice | 🚧 In progress |
| Assign the work | Ward admin assigns each fault to a municipal team or named contractor, with a due date | 🚧 In progress |
| Track progress | Follow each fault from Received to Closed, then confirm the fix or reopen it | 🚧 In progress |
| Ward dashboard | See open faults, overdue faults and the average time to fix | 🚧 In progress |

### Should have

| Feature | Description | Status |
| --- | --- | --- |
| Proof of work | Teams upload an after photo when the job is done | 🚧 In progress |
| AI help | AI suggests the fault category and urgency, and translates descriptions | 🚧 In progress |
| Map view | Faults shown as pins coloured by status | 🚧 In progress |

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 18, Vite 5, React Router 6, TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Database, log-in and storage | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Translations | i18next (English, Afrikaans, isiZulu, Sepedi) |
| Map | Leaflet with OpenStreetMap |
| Testing | Vitest and React Testing Library |
| Hosting | Vercel, redeploys on every merge to `main` |

**Architecture:** the React app runs in the browser and talks to Supabase directly. Row-Level Security (RLS) policies in the database decide what each role (resident, ward admin, field team) can read and change. AI help runs in a Supabase Edge Function so the AI key never reaches the browser. Full details are in the [PRD](docs/PRD.md), Section 11.

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

The local stack uses ports 553xx (API on http://127.0.0.1:55321, Studio on http://127.0.0.1:55323) so it can run next to another Supabase project. Stop it with `npx supabase stop`. Test logins are listed in [supabase/seed/README.md](supabase/seed/README.md).

## Test logins

Test accounts for each role will be added here. These are test accounts only, never real passwords.

## Tests

How to run the tests and what they cover will be added here.

## Deployment

Hosting details will be added once the app is deployed.

## Project documents

- [Product Requirements Document (PRD)](docs/PRD.md)
- [Designs](docs/designs/) (Stitch screens for S1 to S12 and M1 to M7)
- [Implementation plan](IMPLEMENTATION_PLAN.md)

## How we work

- **Issues:** every piece of work is an Issue on the project board, with acceptance criteria, an assignee and a label.
- **Branches:** branch from an up-to-date `main`, named after the Issue, for example `feature/12-report-fault` or `docs/prd`.
- **Commits:** small and clear, for example `feat: add report fault form (#12)`.
- **Pull requests:** each PR explains what changed and why, links its Issue (`Closes #12`), and shows screenshots and how it was tested.
- **Reviews:** at least one teammate reviews and approves every PR. Nobody approves their own work.
- **Merging:** `main` is protected. PRs are squash merged once approved and CI passes, then the branch is deleted.
- **Secrets:** `.env` is never committed. We commit `.env.example` and share real keys privately.
