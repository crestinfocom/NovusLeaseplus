import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaConn?: string;
};

// Must match services.postgres in local-dev/docker-compose.yml.
export const LOCAL_DB_FALLBACK =
  "postgresql://novuslease:novuslease@localhost:5434/novuslease?sslmode=disable";

const NEON_DB_FALLBACK =
  "postgresql://USER:PASSWORD@EP-XXXXXXXX.us-east-2.aws.neon.tech/novuslease?sslmode=require";

function isTruthy(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

/** True when .env.local sets USE_LOCAL_DB=true → all app traffic uses Docker. */
export const isLocalDb = isTruthy(process.env.USE_LOCAL_DB);

/** The connection string this process actually uses. */
export const activeConnectionString = isLocalDb
  ? process.env.DATABASE_URL_LOCAL || LOCAL_DB_FALLBACK
  : process.env.DATABASE_URL || NEON_DB_FALLBACK;

/**
 * Neon (source of truth) — used only by the explicit admin sync endpoint.
 * NEON_DATABASE_URL lets you point sync at the direct (un-pooled) string
 * while DATABASE_URL stays pooled, without extra calls in normal dev.
 */
export function neonConnectionString(): string | undefined {
  return process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
}

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: activeConnectionString });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaConn = activeConnectionString;
}
