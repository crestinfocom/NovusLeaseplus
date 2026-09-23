# Local development (Docker + Neon sync)

Everything a contributor needs to run NovusLease+ **entirely against a local
Docker Postgres** — no Neon calls during normal development or testing —
with an explicit one-way sync button to pull production-like data from Neon
when you want it.

## Quick start

```bash
# One command: start Docker DB → push schema → seed if empty → next dev
npm run start:local

# Open http://localhost:3000
```

`npm run local` is an alias. On first run Docker pulls `postgres:16-alpine`
(the only image involved).

### Detached background mode (recommended for automation / agents)

Everything can run **detached**: no terminal is held open, processes survive
the shell that launched them, and stdout/stderr stream to `local-dev/logs/*.log`
while PIDs are tracked in `local-dev/.run/*.pid` (gitignored). Great for CI
loops, watch tasks, or when long-lived servers should not block your agent.

```bash
# Dev stack (docker up + schema push + seed-if-empty) then `next dev`
# in the background. Returns the moment :3000 answers. Nothing to keep open.
npm run dev:detached

# E2E against a detached production server (builds once, then `next start`,
# then runs Playwright in the background). Returns immediately like above.
npm run test:e2e:local            # headless
npm run test:e2e:local:headed     # with a visible Chromium window + DevTools

# Check / wait / kill:
npm run dev:status       # shows pid + last log lines for dev/server/tests
npm run tests:status
node local-dev/watch.mjs tests            # wait until the E2E run finishes
npm run tests:stop                         # kill the test run only
npm run dev:stop                           # kill dev/server/tests
npm run dev:stop -- --db                   # also `docker compose down`
npm run dev:stop -- --wipe                 # also delete the volume
```

Notes on detached runs:

- `npm run test:e2e:local` reuses a server already listening on **:3000** (e.g. one
  started by `dev:detached`); otherwise it starts its own detached
  `next start`. It uses `playwright.local.config.ts`, which is the base config
  minus the managed webServer.
- Pass `--build` to `test:e2e:local` to force a rebuild, or any `tests/<file>.spec.ts`
  as the last argument to run a single spec, e.g.
  `node local-dev/e2e-detached.mjs --headed tests/admin.spec.ts`.
- Logs are append-only (`local-dev/logs/{dev,server,tests}.log`) — clear them
  with `npm run dev:stop`, or delete the files when they get noisy.

## What it does

| Step | Detail |
| --- | --- |
| 1. `docker compose up -d` | Postgres 16 in `novuslease-postgres`, host port **5434**, healthcheck via `pg_isready` |
| 2. Wait for readiness | TCP poll on `localhost:5434` (60 s timeout) |
| 3. `prisma db push` | Schema applied to the **local** DB only (`DATABASE_URL` overridden in the child env) |
| 4. Auto-seed | Only when the local DB has zero `User` rows (`--seed` forces, `--no-seed` skips) |
| 5. `next dev` | App boots with `USE_LOCAL_DB=true` → all traffic hits Docker |

## Environment variables

Set in **`.env.local`** (see `.env.example` §1b for the template):

```env
USE_LOCAL_DB="true"    # true → app, Prisma CLI, seed & tests use Docker
DATABASE_URL_LOCAL="postgresql://novuslease:novuslease@localhost:5434/novuslease?sslmode=disable"
# Optional: dedicated Neon string for the sync button (defaults to DATABASE_URL)
# NEON_DATABASE_URL="postgresql://…neon.tech/novuslease?sslmode=require"
```

`DATABASE_URL` in `.env` stays pointed at **Neon** — it is only read when
`USE_LOCAL_DB` is false, plus by the sync endpoint as its source.

Switching back to Neon is a one-liner: `USE_LOCAL_DB="false"` (or delete it).

## Data persistence

Data lives in the named Docker volume **`novuslease_pgdata`**, so it survives
container restarts, `npm run db:down`, image upgrades and reboots.

```bash
npm run db:down     # stop the container, keep the volume (data intact)
npm run db:reset    # stop AND delete the volume (fresh empty database)
```

Re-running `npm run start:local` after `db:down` reuses the same volume —
your local edits are still there (seed is skipped when data exists).

To clear **only** the records left behind by E2E signup tests (users whose email
contains `@example.com` / `@acme.in`, plus their bookings) — without wiping any
other data — re-seed locally:

```bash
npm run db:seed:local     # cleans test records only, then upserts demo data
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run start:local` | Full flow: Docker up → schema push → conditional seed → `next dev` (foreground) |
| `npm run dev:detached` | Same stack but `next dev` runs in the background (see Detached mode) |
| `npm run dev:status` | Show pid + log tail for dev / server / tests processes |
| `npm run dev:stop` | Kill dev/server/tests processes (`-- --db` stops Docker, `-- --wipe` deletes volume) |
| `npm run test:e2e:local` | Build + detached `next start` + headless Playwright suite |
| `npm run test:e2e:local:headed` | Same but with a visible browser (+ DevTools via F12) |
| `npm run tests:status` / `tests:stop` | Status / kill of the E2E run only |
| `npm run db:up` | Start the database only (`docker compose up -d --wait`) |
| `npm run db:down` | Stop the database (volume kept) |
| `npm run db:reset` | Stop and **delete the volume** (destroys local data) |
| `npm run db:push:local` | `prisma db push` against Docker |
| `npm run db:seed:local` | Seed demo data into Docker |
| `npm run db:studio:local` | Prisma Studio against Docker |

Every `*:local` command works by injecting `DATABASE_URL=<local>` +
`USE_LOCAL_DB=true` into the child process — Neon is never a fallback.

## Syncing data from Neon (Admin → Settings)

When you need realistic data locally:

1. Make sure `USE_LOCAL_DB=true` and the Neon string is in `.env`.
2. Sign in to `/admin` → **Settings**.
3. Click **“Sync from Neon”** in the *Local database sync* panel.
4. The full Neon dataset replaces the local DB contents (row counts + timing
   shown in a toast; “last synced” timestamp is kept per server process).

The panel only renders when local mode is on; the API returns `400`
otherwise, so you can never overwrite Neon by accident (the endpoint is
strictly **one-way: Neon → local**, guarded by the ADMIN session cookie).

### How Neon calls are minimised

Best practices baked into `src/lib/local-sync.ts`:

1. **Manual only** — no sync on boot, no scheduled jobs, no per-request reads.
   Neon is touched only when the admin button is clicked.
2. **One short-lived client** — a single `PrismaClient`/pool is created for the
   sync and disconnected in a `finally` block immediately after reading.
3. **11 queries total** — exactly one `findMany` per table, batched with
   `Promise.all` in two waves. No `include`/`select` nesting → no N+1.
4. **60-second cooldown** — in-process rate limit returns `429` for
   double-clicks / accidental refresh spam.
5. **Optional `NEON_DATABASE_URL`** — point the sync at Neon’s *direct*
   (un-pooled) endpoint for efficient bulk reads while the app’s pooled
   `DATABASE_URL` stays untouched.
6. **All writes stay local** — the destructive part (delete + `createMany`
   in FK order, chunked at 500 rows) runs in **one local transaction**;
   Neon is opened strictly read-only and never mutated.
7. **Same-URL guard** — if source and target resolve to the same connection
   string the sync refuses to run.

Normal development then runs **100 % against Docker**: page loads, admin CRUD,
signup/login, and Playwright suites issue zero Neon queries.

## Typical workflows

```bash
# Daily dev
npm run start:local

# Fresh database from scratch
npm run db:reset && npm run start:local

# Schema change during development
npm run db:push:local        # or just re-run start:local

# Pull today's Neon data for a realistic demo
#   → /admin → Settings → "Sync from Neon"

# Run Playwright against local Docker (USE_LOCAL_DB=true in .env.local)
npm run build && npm run test:e2e

# Same but HEADED — a real Chromium window opens on your desktop, and you
# can hit F12 / Cmd+Option+I to open Chrome DevTools mid-run. Great for
# debugging selectors and visual layout locally.
npm run build && npx playwright test --headed

# Interactive mode — Playwright Inspector + DevTools, pauses at each step:
npx playwright test --debug

# Single spec file during development:
npx playwright test tests/admin.spec.ts --headed
```

## When Neon is down (quota exhausted, etc.)

Local mode does **not** need Neon at all — pages, admin CRUD, auth, the seed
script and the Playwright suites all run against Docker only. Two things to
know:

1. `npm run start:local` never touches Neon (schema push + seed are
   force-routed to the local URL).
2. The **“Sync from Neon”** button is the only Neon-dependent feature. While
   Neon is unavailable the button returns “Could not read from Neon” — the
   local data stays intact and everything else keeps working. Once Neon is
   back, just re-run the sync.

Check which DB the running app is using:

```text
GET http://localhost:3000/api/health   → { "mode": "local-docker" | "neon" }
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `ECONNREFUSED localhost:5434` | `npm run db:up`; check Docker Desktop is running (`docker ps`) |
| Port 5434 already in use | Another project owns it — change the host side of `ports` in `docker-compose.yml` **and** `DATABASE_URL_LOCAL` |
| Sync button missing | Panel renders only when `USE_LOCAL_DB=true`; restart `next dev` after editing `.env.local` |
| Sync returns 429 | Cooldown — wait the remaining seconds shown in the message |
| Sync returns “Could not read from Neon” | Neon is down / quota exhausted — the app itself is unaffected; retry once Neon is reachable |
| Sync returns 400 “same database” | `DATABASE_URL` isn’t pointing at Neon (or `NEON_DATABASE_URL` equals the local URL) |
| Want Neon again | Set `USE_LOCAL_DB="false"` in `.env.local`, restart |
| Data disappeared | Someone ran `npm run db:reset` (deletes the volume) |

## Files

```
local-dev/
  docker-compose.yml   # Postgres 16, named volume novuslease_pgdata, healthcheck
  lib.mjs              # env loading (.env.local wins), port wait, process runner,
                       #   detached spawn + pid tracking + kill-tree helpers
  prepare.mjs          # shared DB prep: docker up → wait → db push → seed-if-empty
  start-local.mjs      # npm run start:local (interactive, foreground)
  dev-detached.mjs     # npm run dev:detached — background next dev
  e2e-detached.mjs     # npm run test:e2e:local[:headed] — background E2E
  status.mjs           # npm run dev:status / tests:status
  watch.mjs            # wait for a detached process + print log tail
  stop.mjs             # npm run dev:stop / tests:stop (taskkill tree, optional --db/--wipe)
  with-local-db.mjs    # run any command with DATABASE_URL pointed at Docker
  README.md            # this file
local-dev/.run/        # pid files (gitignored)
local-dev/logs/        # dev.log, server.log, tests.log (gitignored, append-only)
```
