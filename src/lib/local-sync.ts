import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import { activeConnectionString, isLocalDb, neonConnectionString, prisma } from "@/lib/prisma";

/**
 * One-way Neon → local Docker DB sync, used only by the explicit
 * Admin → Settings → “Sync from Neon” button.
 *
 * Neon-call minimisation practices (see local-dev/README.md):
 *  • Never runs automatically — only on the admin button click.
 *  • Exactly ONE short-lived Neon client, disconnected immediately.
 *  • One `findMany` per table (11 queries total), no includes / N+1.
 *  • All writes land in the local DB inside a single transaction.
 *  • A 60s in-process cooldown absorbs double-clicks / refresh spam.
 */

const COOLDOWN_MS = 60_000;
const BATCH_SIZE = 500;
const TRANSACTION_TIMEOUT_MS = 120_000;

let lastSyncedAt: number | null = null;

export class SyncError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "SyncError";
  }
}

export interface SyncCounts {
  users: number;
  cities: number;
  cars: number;
  leaseParams: number;
  carVariants: number;
  carAvailabilities: number;
  bookings: number;
  payments: number;
  promotions: number;
  carFavourites: number;
  reviews: number;
}

export interface SyncState {
  enabled: boolean;
  lastSyncedAt: string | null;
  cooldownRemainingMs: number;
}

/** Cheap local-only status. Never touches Neon. */
export function syncState(): SyncState {
  const remaining = lastSyncedAt ? COOLDOWN_MS - (Date.now() - lastSyncedAt) : 0;
  return {
    enabled: isLocalDb,
    lastSyncedAt: lastSyncedAt ? new Date(lastSyncedAt).toISOString() : null,
    cooldownRemainingMs: Math.max(0, remaining),
  };
}

function chunk<T>(items: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    out.push(items.slice(i, i + BATCH_SIZE));
  }
  return out;
}

async function fetchSnapshot(neon: PrismaClient): Promise<{
  users: Prisma.UserCreateManyInput[];
  cities: Prisma.CityCreateManyInput[];
  cars: Prisma.CarCreateManyInput[];
  leaseParams: Prisma.LeaseParamsCreateManyInput[];
  carVariants: Prisma.CarVariantCreateManyInput[];
  carAvailabilities: Prisma.CarAvailabilityCreateManyInput[];
  bookings: Prisma.BookingCreateManyInput[];
  payments: Prisma.PaymentCreateManyInput[];
  promotions: Prisma.PromotionCreateManyInput[];
  carFavourites: Prisma.CarFavouriteCreateManyInput[];
  reviews: Prisma.ReviewCreateManyInput[];
}> {
  // One query per table — no relation includes, so no N+1 amplification.
  const [users, cities, cars, leaseParams, carVariants, carAvailabilities] =
    await Promise.all([
      neon.user.findMany(),
      neon.city.findMany(),
      neon.car.findMany(),
      neon.leaseParams.findMany(),
      neon.carVariant.findMany(),
      neon.carAvailability.findMany(),
    ]);
  const [bookings, payments, promotions, carFavourites, reviews] =
    await Promise.all([
      neon.booking.findMany(),
      neon.payment.findMany(),
      neon.promotion.findMany(),
      neon.carFavourite.findMany(),
      neon.review.findMany(),
    ]);

  return {
    users,
    cities,
    cars,
    leaseParams,
    carVariants,
    carAvailabilities,
    bookings,
    payments,
    promotions,
    carFavourites,
    reviews,
  };
}

async function applySnapshot(snapshot: Awaited<ReturnType<typeof fetchSnapshot>>): Promise<SyncCounts> {
  const created = await prisma.$transaction(
    async (tx) => {
      // Wipe children → parents…
      await tx.review.deleteMany();
      await tx.carFavourite.deleteMany();
      await tx.payment.deleteMany();
      await tx.promotion.deleteMany();
      await tx.booking.deleteMany();
      await tx.carAvailability.deleteMany();
      await tx.carVariant.deleteMany();
      await tx.leaseParams.deleteMany();
      await tx.car.deleteMany();
      await tx.city.deleteMany();
      await tx.user.deleteMany();

      // …then insert parents → children, chunked createMany.
      for (const c of chunk(snapshot.users)) await tx.user.createMany({ data: c });
      for (const c of chunk(snapshot.cities)) await tx.city.createMany({ data: c });
      for (const c of chunk(snapshot.cars)) await tx.car.createMany({ data: c });
      for (const c of chunk(snapshot.leaseParams)) await tx.leaseParams.createMany({ data: c });
      for (const c of chunk(snapshot.carVariants)) await tx.carVariant.createMany({ data: c });
      for (const c of chunk(snapshot.carAvailabilities))
        await tx.carAvailability.createMany({ data: c });
      for (const c of chunk(snapshot.bookings)) await tx.booking.createMany({ data: c });
      for (const c of chunk(snapshot.payments)) await tx.payment.createMany({ data: c });
      for (const c of chunk(snapshot.promotions)) await tx.promotion.createMany({ data: c });
      for (const c of chunk(snapshot.carFavourites))
        await tx.carFavourite.createMany({ data: c });
      for (const c of chunk(snapshot.reviews)) await tx.review.createMany({ data: c });

      return {
        users: snapshot.users.length,
        cities: snapshot.cities.length,
        cars: snapshot.cars.length,
        leaseParams: snapshot.leaseParams.length,
        carVariants: snapshot.carVariants.length,
        carAvailabilities: snapshot.carAvailabilities.length,
        bookings: snapshot.bookings.length,
        payments: snapshot.payments.length,
        promotions: snapshot.promotions.length,
        carFavourites: snapshot.carFavourites.length,
        reviews: snapshot.reviews.length,
      };
    },
    { timeout: TRANSACTION_TIMEOUT_MS, maxWait: 10_000 }
  );

  return created;
}

export interface SyncResult {
  counts: SyncCounts;
  rows: number;
  durationMs: number;
  syncedAt: string;
}

/**
 * Pull the full Neon dataset into the local Docker DB.
 * Returns row counts per model. Throws SyncError with an HTTP status.
 */
export async function syncFromNeon(): Promise<SyncResult> {
  if (!isLocalDb) {
    throw new SyncError(
      400,
      "Local Docker mode is off (USE_LOCAL_DB ≠ true). Sync is only available when developing against the local database."
    );
  }

  const neonUrl = neonConnectionString();
  if (!neonUrl) {
    throw new SyncError(400, "NEON_DATABASE_URL / DATABASE_URL is not configured.");
  }
  if (neonUrl === activeConnectionString) {
    throw new SyncError(
      400,
      "Refusing to sync: the Neon source is the same database this app is running against."
    );
  }

  const sinceSync = lastSyncedAt ? Date.now() - lastSyncedAt : Infinity;
  if (sinceSync < COOLDOWN_MS) {
    throw new SyncError(
      429,
      `Please wait ${Math.ceil((COOLDOWN_MS - sinceSync) / 1000)}s before syncing again (rate-limit to keep Neon reads low).`
    );
  }

  const started = Date.now();

  // One short-lived Neon client; source of truth is never modified.
  const adapter = new PrismaPg({ connectionString: neonUrl });
  const neon = new PrismaClient({ adapter, log: ["error"] });

  let snapshot;
  try {
    snapshot = await fetchSnapshot(neon);
  } catch (error) {
    throw new SyncError(
      500,
      `Could not read from Neon: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    await neon.$disconnect().catch(() => {});
  }

  const counts = await applySnapshot(snapshot);
  const rows = Object.values(counts).reduce((sum, n) => sum + n, 0);
  lastSyncedAt = Date.now();

  return {
    counts,
    rows,
    durationMs: Date.now() - started,
    syncedAt: new Date(lastSyncedAt).toISOString(),
  };
}