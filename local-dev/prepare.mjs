// Reusable local-DB preparation shared by start-local.mjs and the
// detached scripts: docker up → port ready → prisma db push → seed-if-empty.
// Neon is never touched (DATABASE_URL/USE_LOCAL_DB are overridden).
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { COMPOSE_FILE, LOG_DIR, RUN_DIR, localDbEnv, portFromUrl, resolveDb, run, waitForPort } from "./lib.mjs";

export async function localDbHasData(localUrl) {
  const client = new pg.Client({ connectionString: localUrl, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    const { rows } = await client.query(
      `SELECT EXISTS (SELECT 1 FROM "User" LIMIT 1) AS has_data`
    );
    return Boolean(rows[0]?.has_data);
  } finally {
    await client.end().catch(() => {});
  }
}

export async function localDbRowCounts(localUrl) {
  const client = new pg.Client({ connectionString: localUrl, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    const tables = ["User", "City", "Car", "CarAvailability", "Booking", "Payment", "Promotion"];
    const counts = {};
    for (const t of tables) {
      try {
        const { rows } = await client.query(`SELECT COUNT(*)::int AS n FROM "${t}"`);
        counts[t] = rows[0].n;
      } catch {
        counts[t] = null;
      }
    }
    return counts;
  } finally {
    await client.end().catch(() => {});
  }
}

/**
 * Make sure the local Docker Postgres is up, schema is pushed and the DB is
 * seeded (only when empty). Returns resolved db info.
 */
export async function prepareLocalDb({ noSeed = false, forceSeed = false } = {}) {
  const { localUrl } = resolveDb();
  const port = portFromUrl(localUrl);

  console.log("▶ Starting local Postgres container…");
  await run("docker", ["compose", "-f", COMPOSE_FILE, "up", "-d"]);

  process.stdout.write("▶ Waiting for Postgres to accept connections");
  const portWait = waitForPort(port, "localhost", 60_000).then(() => {
    process.stdout.write(" ready\n");
  });
  const tick = setInterval(() => process.stdout.write("."), 1000);
  await portWait.finally(() => clearInterval(tick));

  console.log("▶ Pushing Prisma schema to the local database…");
  await run("npx", ["prisma", "db", "push"], { env: localDbEnv() });

  let seeded = false;
  if (forceSeed || !noSeed) {
    const hasData = await localDbHasData(localUrl).catch(() => null);
    if (forceSeed || hasData === false) {
      console.log("▶ Seeding demo data into the local database…");
      await run("node", ["prisma/seed.mjs"], { env: localDbEnv() });
      seeded = true;
    } else if (hasData === true) {
      console.log("▶ Local database already has data — skipping seed (use --seed to force).");
    } else {
      console.log("▶ Could not verify local data — skipping seed (use --seed to force).");
    }
  }

  return { localUrl, port, seeded };
}

export function prepareLogPath(name) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.mkdirSync(RUN_DIR, { recursive: true });
  return path.join(LOG_DIR, `${name}.log`);
}