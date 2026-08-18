# Ujasiri Community Care

Website and staff admin for **Ujasiri Community Care (UCC)** — a Kenyan community health
NGO working in HIV and TB prevention, cancer awareness, gender-based violence response,
and health services for adolescent girls and young women.

The site has two jobs: help someone in need find care today, and give donors and partners
enough verifiable detail to trust the organisation with money.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| Database | Supabase (Postgres + Row Level Security) |
| Auth | Firebase Auth, verified by Supabase as a third-party JWT issuer |
| Validation | Zod 4 |
| Language | TypeScript, strict |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in, or leave blank — see below
npm run dev
```

Open http://localhost:3000.

### Running without any keys

The app is designed to run in three states, and never to throw on a missing key at import
time — a half-configured deployment degrades to a working public site rather than a white
screen. See `src/lib/env.ts`.

| State | What works |
|---|---|
| No keys | Every read falls back to `src/lib/fixtures`. The full site renders and can be demoed. Writes are refused with a clear message. |
| Supabase only | Real content, real pagination. Auth still stubbed. |
| Supabase + Firebase | Production. Login, roles and the admin are all live. |

### Database

```bash
# Apply migrations in order via the Supabase SQL editor or CLI
supabase/migrations/0001_init.sql          # schema + RLS policies
supabase/migrations/0002_seed_roles.sql    # roles and permissions
supabase/migrations/0003_hr.sql
supabase/migrations/0004_project_funders.sql
supabase/migrations/0005_project_detail.sql
supabase/migrations/0006_health_indicators.sql

npm run seed          # demonstration content
npm run check:rbac    # verifies every role's permissions resolve
```

Connecting the two services is a one-time step in the Supabase dashboard:
**Authentication → Sign In / Providers → Third Party Auth → Add Firebase**, entering your
Firebase project ID. That is what makes the RLS policies in `0001_init.sql` work.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run verify` | typecheck + lint — run before pushing |
| `npm run seed` | Load demonstration content into Supabase |
| `npm run check:rbac` | Verify role/permission wiring |

## Project structure

```
src/
  app/
    (public)/     Public site — programmes, projects, news, careers,
                  donate, get-help (HIV / TB / GBV / cancer), governance,
                  transparency, accountability
    (auth)/       Login, register, forgot password
    (admin)/      17 staff screens: users, roles, HR, donations,
                  applications, audit log, media, settings
    actions/      Server Actions — every write goes through one
  components/     site/ · admin/ · ui/ · media/ · charts/ · auth/ · seo/
  lib/
    env.ts            Key detection and graceful degradation
    site.ts           Single source of truth for organisation identity
    safeguarding.ts   Safeguarding policy, expressed as code
    fixtures/         Demonstration content used when Supabase is absent
  proxy.ts        Security headers + optimistic /admin redirect
supabase/migrations/
```

## Security model

- **`src/proxy.ts` is not an authorisation boundary.** It sets security headers and
  optimistically redirects away from `/admin` when no session cookie exists. It checks
  only that a cookie is *present* — never that it is valid. Verifying a Firebase session
  cookie means a network call, and the edge is the wrong place for it.
- **The Data Access Layer is the boundary.** Every admin page and Server Action goes
  through `src/lib/auth/dal.ts`, which is where the real check happens. A forged cookie
  gets you a redirect, never data.
- **`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS.** It is server-only, must never be prefixed
  `NEXT_PUBLIC_`, and must never be imported into a Client Component. Every use sits
  behind a permission check.
- **Never commit `.env.local`.** `.gitignore` excludes all `.env*` files except the
  template.

## Safeguarding

UCC works in HIV, TB and gender-based violence — areas where being publicly identified
carries real risk of stigma, violence or loss of employment. `src/lib/safeguarding.ts`
encodes the parts of the organisation's safeguarding policy that a content system can
enforce, and is called from the publishing paths. It produces warnings rather than silent
rewrites: a human decides what to publish, but does so having been told.

**Client stories must be published only with written informed consent**, and by default
de-identified — no full name, no photograph, no detail that locates a person to a village.

## Before launch

- [ ] Replace the placeholder impact figures in `src/lib/fixtures/content.ts` with numbers
      evidenced by your own M&E data or an audit. Publishing an unverifiable impact claim
      is the fastest way for a health NGO to lose the trust this site exists to earn.
- [ ] Replace the fictional people and stories in the fixtures. Nobody described there is
      real, and that is deliberate — see Safeguarding above.
- [ ] Connect a payment provider. `src/app/actions/donate.ts` records the gift and tells
      the donor plainly that no money was taken; the provider handoff is still `TODO`.
- [ ] Commission photography. `MediaSlot` renders a branded placeholder naming the
      photograph that belongs in each position.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real https origin, or canonical URLs, the sitemap
      and OG tags all break.
- [ ] Verify the registration and tax-exemption numbers in `src/lib/site.ts`. They are the
      strongest trust signals a visitor can check independently.

## Deployment

Deployed on Vercel, connected to this repository — every push to `main` deploys to
production, and every branch gets a preview URL.

Environment variables are set in **Vercel → Project → Settings → Environment Variables**,
matching the names in `.env.example`. `FIREBASE_PRIVATE_KEY` must be stored on one line
with literal `\n` sequences; `src/lib/env.ts` restores the real newlines.

## Licence

See [LICENSE](LICENSE).
