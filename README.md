# NovusLease+

Premium self-drive car rental & subscription platform in India — built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, and **Prisma ORM** on a **Neon PostgreSQL** database.

The homepage is a faithful React/Tailwind port of the design reference in [`Design/NovusLease-plus-homepage.html`](./Design/NovusLease-plus-homepage.html).

## Tech stack

- **Next.js 16** — React framework (App Router, Server Components)
- **Tailwind CSS v4** — design tokens + component classes ported from the reference
- **Prisma 7** — ORM with a full car-rental domain schema
- **Neon PostgreSQL** — serverless Postgres, driver adapter `@prisma/adapter-pg`
- **Google Fonts** — Fraunces (display) + Inter (body), via `next/font`

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

# 5. (optional) Seed demo fleet, cities & promos
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
GET http://localhost:3000/api/health
```

Returns `{ "status": "ok", "database": "connected" }` when the Neon database responds.

## Project structure

```
Design/                       # original design reference (HTML)
prisma/
  schema.prisma               # database schema (User, Car, Booking, Payment, Promotion…)
  seed.mjs                    # demo seed: cities, cars, lease params, promos
prisma.config.ts              # Prisma 7 config (schema path, migrate URL, seed command)
public/images/                # images extracted from the design reference
scripts/extract-images.mjs    # re-extract images from the design HTML
src/
  app/
    layout.tsx                # fonts + metadata
    page.tsx                  # homepage assembly
    globals.css               # design tokens & component CSS (Tailwind v4)
    api/health/route.ts       # Neon DB connectivity check
  components/                 # one component per homepage section
    Header, Hero, BookingWidget, FleetLogos, Usp, Offers, Models,
    LeaseCalculator, HowItWorks, Showcase, WhyUs, Testimonial,
    Faq, CtaFinal, Footer, TopBar, Reveal
  lib/
    prisma.ts                 # singleton PrismaClient (driver adapter + Neon)
    calc-bus.ts               # event bus: "Lease this car" → calculator prefill
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
| `npm run db:seed` | Insert demo cities, cars, lease params & promo codes |

## Features ported from the design

- Hero with trust stats & animated background
- Daily / monthly booking widget with live toggle
- Fleet partner logos
- USP strip, limited-time deals (NOVUS10/15/20)
- Best-selling models rail — **"Lease this car"** prefills the calculator
- Interactive **Lease vs Buy calculator** (EMI math ported 1:1 from the reference script)
- How-it-works steps, feature showcase, why-us, testimonial, FAQ accordion, app CTA, footer

## Database models (schema.prisma)

`User` (roles/KYC) · `Car` (fleet + rental rates) · `CarVariant` · `CarAvailability` · `City` · `LeaseParams` · `Booking` (type/status/km-package/delivery) · `Payment` · `Promotion` · `CarFavourite` · `Review`