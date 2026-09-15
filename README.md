# NovusLease+

Premium self-drive car rental & subscription platform in India — built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, and **Prisma ORM** on a **Neon PostgreSQL** database.

The homepage is a faithful React/Tailwind port of the design reference in [`Design/NovusLease-plus-homepage.html`](./Design/NovusLease-plus-homepage.html).

The app also ships a full account journey — **login**, **signup for four account types** (individual, corporate, personal driver, commercial driver) and **password reset** — backed by real auth APIs and seeded demo accounts.

## Tech stack

- **Next.js 16** — React framework (App Router, Server Components)
- **Tailwind CSS v4** — design tokens + component classes ported from the reference
- **Prisma 7** — ORM with a full car-rental domain schema
- **Neon PostgreSQL** — serverless Postgres, driver adapter `@prisma/adapter-pg`
- **Google Fonts** — Fraunces (display) + Inter (body), via `next/font`
- **Playwright** — E2E tests for homepage + auth flows

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
GET http://localhost:3000/api/health   → { "status": "ok", "database": "connected" }
```

## Auth & accounts

Login, signup and forgot-password pages live at `/login`, `/signup` and `/forgot-password`. Signup supports four account types, each with its own fields:

| Account type | Purpose | Key fields |
| --- | --- | --- |
| Individual | Self-drive rentals & subscriptions | Name, email, phone |
| Corporate | Company fleet & B2B billing | Company, contact, work email, GSTIN |
| Personal Driver | Drive NovusLease+ cars for your own use | Licence number & validity |
| Commercial Driver | Rent for commercial / transport use | Licence number, class, experience, city |

### Demo accounts

`npm run db:seed` upserts a demo account for each type (re-run anytime):

| Type | Email | Password |
| --- | --- | --- |
| Individual | `individual@novuslease.in` | `demo1234` |
| Corporate | `corporate@novuslease.in` | `demo1234` |
| Personal Driver | `personaldriver@novuslease.in` | `demo1234` |
| Commercial Driver | `commercialdriver@novuslease.in` | `demo1234` |

The login page also lists these under a **“Demo accounts”** panel for quick testing.

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
prisma/
  schema.prisma               # database schema (User, Car, Booking, Payment, Promotion…)
  seed.mjs                    # demo seed: cities, cars, lease params, promos, demo accounts
prisma.config.ts              # Prisma 7 config (schema path, migrate URL, seed command)
public/images/                # images extracted from the design reference
scripts/extract-images.mjs    # re-extract images from the design HTML
src/
  app/
    layout.tsx                # fonts + metadata
    page.tsx                  # homepage assembly
    globals.css               # design tokens & component CSS (Tailwind v4)
    api/health/route.ts       # Neon DB connectivity check
    api/auth/                 # signup / login / forgot-password APIs
    login/                    # login page + form
    signup/                   # signup with 4 account types
    forgot-password/          # password reset page
  components/                 # one component per homepage section
    Header (mobile hamburger menu), Hero, BookingWidget, FleetLogos, Usp,
    Offers, Models, LeaseCalculator, HowItWorks, Showcase, WhyUs,
    Testimonial, Faq, CtaFinal, Footer, TopBar, Reveal, AuthShell
  lib/
    prisma.ts                 # singleton PrismaClient (driver adapter + Neon)
    calc-bus.ts               # event bus: "Lease this car" → calculator prefill
    password.ts               # scrypt password hashing / verification
    account-type.ts           # client ⇄ Prisma account-type mapping
tests/
  homepage.spec.ts            # homepage E2E (sections, calculator, reveal, mobile menu)
  auth.spec.ts                # login / signup / forgot-password E2E
  ui.spec.ts                  # cross-viewport render checks + screenshots
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:push` | Push schema to Neon (create tables) |
| `npm run prisma:studio` | Browse data in Prisma Studio |
| `npm run db:seed` | Insert demo cities, cars, lease params, promos & demo accounts |
| `npm run test:e2e` | Run Playwright E2E tests (production build required) |
| `npm run test:e2e:ui` | Open the Playwright UI runner |

## Testing

E2E tests use **Playwright** against a production build (`npm run start`). Run once after a fresh database:

```bash
npm run prisma:push
npm run db:seed     # creates the demo accounts used by tests/auth.spec.ts
npm run build
npm run test:e2e
```

- `tests/auth.spec.ts` — login/signup/forgot-password flows incl. the seeded demo accounts
- `tests/homepage.spec.ts` — homepage sections, calculator, reveal animations, mobile hamburger menu
- `tests/ui.spec.ts` — renders every page at desktop/tablet/mobile sizes, asserts no horizontal overflow, and saves screenshots to `test-results/ui/`

## Features ported from the design

- Hero with trust stats & animated background
- Daily / monthly booking widget with live toggle
- Fleet partner logos
- USP strip, limited-time deals (NOVUS10/15/20)
- Best-selling models rail — **"Lease this car"** prefills the calculator
- Interactive **Lease vs Buy calculator** (EMI math ported 1:1 from the reference script)
- How-it-works steps, feature showcase, why-us, testimonial, FAQ accordion, app CTA, footer

## Also included

- **Login / Signup / Forgot-password** pages — each fits a single screen (no page scroll)
- **Mobile hamburger menu** — vertical stacked links with a slide-down panel
- **Real auth APIs** — signup/login/forgot-password backed by Postgres with scrypt hashing

## Database models (schema.prisma)

`User` (roles/KYC + `AccountType`) · `Car` (fleet + rental rates) · `CarVariant` · `CarAvailability` · `City` · `LeaseParams` · `Booking` (type/status/km-package/delivery) · `Payment` · `Promotion` · `CarFavourite` · `Review`