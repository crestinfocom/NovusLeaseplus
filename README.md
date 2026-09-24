# NovusLease+

Premium self-drive car rental & subscription platform in India — built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, and **Prisma ORM** on a **Neon PostgreSQL** database.

The **marketing site** is a faithful React/Tailwind port of the design reference
[`Design/NovusLease-plus-complete.html`](./Design/NovusLease-plus-complete.html):
**Home** (`/`), **Fleet** (`/fleet`), **Lease vs Buy** (`/compare`) and **Get a Quote**
(`/quote`). A shared compare (up to 3 cars) + wishlist store (`src/lib/site-store.tsx`)
powers the ⇄ / ♡ actions across all four pages.

The app also ships a full account journey — **login**, **signup for four account types** (individual, corporate, personal driver, commercial driver) and **password reset** — backed by real auth APIs and seeded demo accounts.

Beyond the marketing pages, the product layer adds shareable **vehicle detail pages**
(`/fleet/<slug>` with JSON-LD + open-graph), a persistent **booking tracker** (`/track`,
backed by a public lookup API), **fees & charges guidance** on the quote page, an **offline
banner**, total-cost rows everywhere (36-month totals incl. GST), consistent product
terminology, and a **robots.txt / sitemap.xml**. A dedicated E2E suite
(`tests/ux.spec.ts`) guards all of it.

## Tech stack

- **Next.js 16** — React framework (App Router, Server Components)
- **Tailwind CSS v4** — design tokens + component classes ported from the reference
- **Prisma 7** — ORM with a full car-rental domain schema
- **Neon PostgreSQL** — serverless Postgres, driver adapter `@prisma/adapter-pg`
- **Google Fonts** — Fraunces (display) + Inter (body), via `next/font`
- **Playwright** — E2E tests for every marketing page, auth, admin and cross-viewport UI (123 tests)

## Prerequisites

- Node.js 20+
- A Neon project. Create one free at <https://console.neon.tech> → *New Project* → copy the connection string.

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    → replace DATABASE_URL with your Neon connection string (see below)

# 3. Generate the Prisma client
npm run prisma:generate

# 4. Create tables in your Neon database
npm run prisma:push

# 5. (optional) Seed demo fleet, cities, promos & demo accounts
npm run db:seed

# 6. Run the dev server
npm run dev
```

Then open <http://localhost:3000>.

## Neon connection string

```env
DATABASE_URL="postgresql://USER:PASSWORD@EP-XXXX.REGION.aws.neon.tech/novuslease?sslmode=require"
```

- Your connection string is shown in the Neon console (**Overview → Connection string**).
- For pooled production connections, append `&pgbouncer=true` (and use the `-pooler` host).
- `DATABASE_URL` is also what Prisma uses for migrations/`db push` (via `prisma.config.ts`).

Verify the DB connection at runtime:

```text
GET http://localhost:3000/api/health   → { "status": "ok", "database": "connected", "mode": "local-docker" | "neon" }
```

## Local development with Docker (recommended)

Development and testing can run **entirely against a local Docker Postgres**
— zero Neon calls in the normal workflow. Full guide: [`local-dev/README.md`](./local-dev/README.md).

```bash
# One command: start Docker DB → prisma db push → seed if empty → next dev
npm run start:local        # alias: npm run local

# Same stack, but everything runs DETACHED in the background (no terminal held
# open — logs to local-dev/logs/, pids in local-dev/.run/). Recommended when an
# agent/CI runs the app, and for E2E:
npm run dev:detached                 # background next dev on :3000
npm run test:e2e:local               # build + background server + headless E2E
npm run test:e2e:local:headed        # same, with a visible browser + DevTools
npm run dev:status                   # pid + log tail for dev/server/tests
node local-dev/watch.mjs tests       # wait for the E2E run, then print result
npm run dev:stop                     # kill everything (-- --db stops Docker too)
```

The switch lives in **`.env.local`**:

```env
USE_LOCAL_DB="true"     # true → app, Prisma CLI, seed & Playwright all use Docker
DATABASE_URL_LOCAL="postgresql://novuslease:novuslease@localhost:5434/novuslease?sslmode=disable"
```

- **Persistence** — data is stored in the named volume `novuslease_pgdata`, so it
  survives restarts (`npm run db:down` keeps it; `npm run db:reset` wipes it).
- **No Neon dependency** — local mode never calls Neon; `start:local`, seeding,
  admin CRUD and the Playwright suites all run against Docker. The only
  Neon-touching feature is the manual sync button.
- **Neon stays the source of truth** — `DATABASE_URL` still points at Neon and is
  only used when `USE_LOCAL_DB` is false, plus as the source for the sync below.
- **Sync button** — in local mode, `/admin → Settings` shows *“Sync from Neon”*:
  it pulls the full Neon dataset into Docker (one-way, read-only on Neon) with
  rate-limiting, a single short-lived Neon client, and 11 batched reads
  (one per table) to keep Neon usage minimal.

| Script | Purpose |
| --- | --- |
| `npm run start:local` | Docker DB up → schema push → conditional seed → `next dev` |
| `npm run db:up` / `db:down` | Start / stop the database (data kept) |
| `npm run db:reset` | Stop and delete the volume (fresh DB) |
| `npm run db:push:local` | Prisma `db push` against Docker |
| `npm run db:seed:local` | Seed demo data into Docker |
| `npm run db:studio:local` | Prisma Studio against Docker |

## Auth & accounts

Login, signup and forgot-password pages live at `/login`, `/signup` and `/forgot-password`. Signup supports four account types, each with its own fields:

| Account type | Purpose | Key fields |
| --- | --- | --- |
| Individual | Self-drive rentals & subscriptions | Name, email, phone |
| Corporate | Company fleet & B2B billing | Company, contact, work email, GSTIN |
| Personal Driver | Drive NovusLease+ cars for your own use | Licence number & validity |
| Commercial Driver | Rent for commercial / transport use | Licence number, class, experience, city |

### Demo accounts

`npm run db:seed` upserts a demo account for each type/role, each with its **own unique password** (re-run anytime):

| Type / Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@novuslease.in` | `Nova@admin1` |
| Operations | `operations@novuslease.in` | `Nova@ops2024` |
| Individual | `individual@novuslease.in` | `Nova@user1` |
| Corporate | `corporate@novuslease.in` | `Nova@corp1` |
| Personal Driver | `personaldriver@novuslease.in` | `Nova@pdrive1` |
| Commercial Driver | `commercialdriver@novuslease.in` | `Nova@cdrive1` |

The login page lists these under a **“Demo accounts”** panel for quick testing,
grouped into **Customers** (individual / corporate / personal driver / commercial driver)
and **Business & operations** (admin, operations). The admin console is clearly split from
the customer site: `/admin/login` links back to the site, and the admin shell shows a
“View public site ↗” link.

### Admin console

The admin portal lives at `/admin` (redirects to `/admin/dashboard`) with a separate login at `/admin/login`. It mirrors `Design/NovusLease-plus-admin.html` and is split into **Dashboard, Bookings, Fleet, Customers, Offers & Codes** and **Settings** views (all behind an ADMIN-role session cookie signed with `AUTH_SECRET`).

Sign in with `admin@novuslease.in` / `Nova@admin1`. The left sidebar is a **vertical** menu (Overview, Management, System) — a global `nav` reset is overridden in `admin.css` so it never renders horizontally.

### Auth API routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/auth/signup` | POST | Create an account (scrypt-hashed password) |
| `/api/auth/login` | POST | Verify email + password, return account type |
| `/api/auth/forgot-password` | POST | Demo reset flow — token logged server-side |

Passwords are hashed with **scrypt** (`src/lib/password.ts`) — no extra dependencies or email provider are wired up yet, so the reset flow is demo-only.

## Project structure

```
Design/                       # original design reference (HTML)
local-dev/
  docker-compose.yml          # local Postgres 16 + named volume novuslease_pgdata
  start-local.mjs             # npm run start:local orchestrator (docker → push → seed → dev)
  with-local-db.mjs           # run any command against the Docker DB
  lib.mjs                     # env loading (.env.local wins), port wait, process runner
  README.md                   # local dev + Neon sync guide
prisma/
  schema.prisma               # database schema (User, Car, Booking, Payment, Promotion…)
  seed.mjs                    # demo seed: cities, cars, lease params, promos, demo accounts
prisma.config.ts              # Prisma 7 config (schema path, migrate URL, seed command)
public/images/                # images extracted from the design reference
scripts/extract-images.mjs    # re-extract images from the design HTML
src/
  app/
    layout.tsx                # fonts + metadata
    globals.css               # design tokens & component CSS (Tailwind v4)
    (site)/                   # marketing + product pages (shared chrome + store)
      layout.tsx              # skip link + TopBar + Header + OfflineNotice + <main> + Footer
      site.css                # marketing-page CSS ported from the design reference
      page.tsx                # Home ("/"): hero, plans, models, how-it-works, FAQ, CTA
      fleet/                  # /fleet → FleetExplorer (search / filter / sort grid)
      fleet/[slug]/           # /fleet/<slug> → VehicleDetail (SSG per car, JSON-LD Product)
      compare/                # /compare → lease-vs-buy matrix, tax savings, decision guide
      quote/                  # /quote → QuoteBuilder + FeesGuide (fees & charges, glossary)
      track/                  # /track → TrackLookup (status journey by booking reference)
      _components/            # TopBar, Header (mobile menu), Footer, OfflineNotice, Reveal,
                              #   ModelCard, FleetExplorer, QuoteBuilder, VehicleDetail,
                              #   FeesGuide, ShareButtons, JsonLd
    robots.ts / sitemap.ts    # robots.txt + XML sitemap (static routes + all car slugs)
    api/health/route.ts       # DB connectivity check
    api/bookings/lookup/      # public GET /api/bookings/lookup?ref= (status + journey)
    api/auth/                 # signup / login / forgot-password APIs
    login/ signup/ forgot-password/     # account pages (each fits a single screen)
    admin/                    # admin console (mirrors Design/NovusLease-plus-admin.html)
      admin.css               # admin shell/login styles (scoped under .admin)
      login/                  # admin login page + form (ADMIN role only)
      (panel)/                # guarded shell: sidebar + topbar + global search + toasts
        dashboard/ bookings/ fleet/ customers/ offers/ settings/   # the six views
    api/admin/                # admin APIs (login/logout/session/stats/bookings/cars/
                              #   customers/promotions/meta/sync-local) — behind an ADMIN session
  components/
    AuthShell.tsx             # single-screen shell + footer shared by the auth pages
  lib/
    prisma.ts                 # singleton PrismaClient (Docker or Neon via USE_LOCAL_DB)
    local-sync.ts             # one-way Neon → Docker sync (admin button, rate-limited)
    catalog.ts                # client-side car catalogue + lease/loan/subscription params
                              #   (carSlug/carBySlug/termTotal helpers)
    terms.ts                  # single source of truth for plan terminology + labels
    site-store.tsx            # shared compare (max 3) + wishlist store (React context)
    password.ts               # scrypt password hashing / verification
    account-type.ts           # client ⇄ Prisma account-type mapping
    admin-auth.ts             # HMAC-signed admin session cookie (nl_admin)
    admin-format.ts           # INR/date/pill formatters for the console
    admin-api.ts              # requireAdmin guard for /api/admin/* routes
    search-bus.ts / toast-bus.tsx   # console-wide search + toast buses
tests/
  homepage.spec.ts            # homepage E2E (sections, compare/wishlist, reveal, FAQ, mobile menu)
  fleet.spec.ts               # /fleet search, filters, sort, clear, prefill → quote
  compare.spec.ts             # /compare matrix, tax savings, decision guide, FAQ, CTA
  quote.spec.ts               # /quote builder, plan toggles, validation, reference codes
  auth.spec.ts                # login / signup / forgot-password E2E
  ui.spec.ts                  # cross-viewport render checks + screenshots
  admin.spec.ts               # admin login/guard, all six views, seeded rows, logout
  admin-ui.spec.ts            # every admin view at desktop/tablet/mobile (no overflow)
  ux.spec.ts                  # UX/product-gap suite: skip link, Escape menu, footer track,
                              #   fleet a11y, offline banner, /track flow + lookup API, vehicle
                              #   SEO/JSON-LD/term totals, slug 404s, quote totals + sliders,
                              #   fees guide, customer-vs-business split, compare dialog rows
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server (uses Docker when `USE_LOCAL_DB=true`) |
| `npm run start:local` | Local Docker DB up → schema push → conditional seed → `next dev` |
| `npm run dev:detached` | Same, but `next dev` runs in the background (log + pid tracked) |
| `npm run dev:status` / `dev:stop` | Inspect / kill the detached dev & test processes |
| `npm run test:e2e:local[:headed]` | Playwright suite vs detached local server (headless or headed with DevTools) |
| `npm run tests:status` / `tests:stop` | Status / kill of the detached E2E run |
| `npm run db:up` / `db:down` / `db:reset` | Start / stop / wipe the local Docker database |
| `npm run db:push:local` / `db:seed:local` / `db:studio:local` | Prisma commands against Docker |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:push` | Push schema to the configured DB (Docker if `USE_LOCAL_DB=true`, else Neon) |
| `npm run prisma:studio` | Browse data in Prisma Studio |
| `npm run db:seed` | Clean test records, then upsert demo cities, cars, promos & accounts (always syncs) |
| `npm run test:e2e` | Run Playwright E2E tests (production build required) |
| `npm run test:e2e:ui` | Open the Playwright UI runner |

## Seed / data sync

Running `npm run db:seed` is idempotent and always safe to re-run:

1. **Cleans test records** — removes users created by E2E signup tests (`@example.com` / `@acme.in`) and their bookings; seeded demo accounts are preserved.
2. **Upserts demo data** — users, cars, lease params, cities and promotions are all synced so descriptions stay current without duplication.

## Testing

E2E tests use **Playwright** against a production build (`npm run start`). With
`USE_LOCAL_DB=true` in `.env.local` the test server and all tests run against
the local Docker DB — Neon is not required (even if its quota is exhausted).
Run once after a fresh database:

```bash
npm run prisma:push     # reaches Docker when USE_LOCAL_DB=true
npm run db:seed         # cleans test records, then creates demo accounts used by tests
npm run build
npm run test:e2e        # headless
npx playwright test --headed   # opened Chromium window; F12 opens DevTools
```

- `tests/auth.spec.ts` — login/signup/forgot-password flows incl. the seeded demo accounts (creates disposable `@example.com` / `@acme.in` accounts that `db:seed` cleans up next run)
- `tests/admin.spec.ts` — admin console: unauthenticated redirect, ADMIN-only login, operations-blocked (403), navigation across all six views, seeded rows, sign-out
- `tests/homepage.spec.ts` — homepage sections, compare/wishlist actions, reveal animations, FAQ accordion, mobile hamburger menu, no console errors after full scroll
- `tests/fleet.spec.ts` — `/fleet` search, category/fuel/transmission filters, sort, clear, model-card → quote prefill
- `tests/compare.spec.ts` — `/compare` matrix, tax savings, decision guide, FAQ, CTA → quote
- `tests/quote.spec.ts` — `/quote` builder, loan/lease/subscription toggles, validation + reference codes, `?car=` prefill, wishlist tab
- `tests/ui.spec.ts` — renders every public page at desktop/tablet/mobile sizes, asserts no horizontal overflow, saves screenshots to `test-results/ui/`
- `tests/admin-ui.spec.ts` — renders every admin view at desktop/tablet/mobile sizes, asserts no horizontal overflow (logged in as admin), saves screenshots to `test-results/ui/`
- `tests/ux.spec.ts` — UX / product-gap suite (see tree above) incl. the public booking-lookup API and vehicle-page SEO

## Admin console

Admin lives at `/admin` (redirects to `/admin/dashboard`; login at `/admin/login`). It uses an HMAC-signed session cookie (`nl_admin`, 7 days) signed with `AUTH_SECRET` — set it in `.env` for anything beyond local dev (a dev fallback exists). Only `ADMIN`-role accounts can open the console; `OPERATIONS` accounts are rejected with a 403 message. The console mirrors `Design/NovusLease-plus-admin.html` with **Dashboard, Bookings, Fleet, Customers, Offers & Codes** and **Settings** views, global search, and toast notifications.

## Marketing pages (ported from the design)

The four marketing pages port the flows of
[`Design/NovusLease-plus-complete.html`](./Design/NovusLease-plus-complete.html):

- **Home (`/`)** — hero with trust stats, USP strip, loan/lease/subscription
  plans, best-selling models, how-it-works steps, FAQ accordion, CTA
- **Fleet (`/fleet`)** — searchable, filterable (category / fuel / transmission)
  and sortable grid of every car
- **Vehicle detail (`/fleet/<slug>`)** — shareable per-car pages (breadcrumb,
  specs, plan estimates with 36-month totals, WhatsApp / X / copy-link share,
  JSON-LD `Product` + aggregate offer, canonical + open-graph). Links from every
  model card (`View details`) and the SEO sitemap.
- **Lease vs Buy (`/compare`)** — comparison matrix, employer-lease tax savings,
  decision guide and FAQ
- **Get a Quote (`/quote`)** — car picker + loan / lease / subscription builder
  with live monthly figures, personalised quote and send-for-approval flows,
  plus a **Fees & charges guide** and `data-testid="qb-term-total"` totals
- **Track a booking (`/track`)** — persistent status page + journey timeline for
  any booking by reference (public `GET /api/bookings/lookup?ref=`), reachable
  from the header ("Track a booking →") and footer
- **Compare + wishlist store** — ⇄ adds up to 3 cars to a compare tray, ♡ saves to a
  wishlist; both persist and stay in sync across all four pages
  (`src/lib/site-store.tsx`); the compare modal lists 36-month totals per plan
- **Site footer** — design-identical `.foot-grid` (brand, Explore, Company,
  Business & Operations, Support) + `.foot-terms` glossary (Rental / Lease /
  Subscription / Loan) + `.foot-bottom`
- **Offline banner** — dismissible "you're offline" notice while the browser
  reports no connection (`OfflineNotice.tsx`)
- **SEO plumbing** — `robots.ts` (disallow `/admin`, `/api`) and `sitemap.ts`
  (static routes + all 22 car-slug URLs); JSON-LD `Organization`/`FAQPage` on
  home and `ItemList` on `/fleet`

## Also included

- **Login / Signup / Forgot-password** pages — each fits a single screen (no page scroll)
- **Mobile hamburger menu** — vertical stacked links with a slide-down panel
- **Real auth APIs** — signup/login/forgot-password backed by Postgres with scrypt hashing

## Database models (schema.prisma)

`User` (roles/KYC + `AccountType`) · `Car` (fleet + rental rates) · `CarVariant` · `CarAvailability` · `City` · `LeaseParams` · `Booking` (type/status/km-package/delivery) · `Payment` · `Promotion` · `CarFavourite` · `Review`