#!/usr/bin/env node
// Run any command against the LOCAL Docker database by overriding
// DATABASE_URL / USE_LOCAL_DB in the child environment.
//
//   node local-dev/with-local-db.mjs prisma db push
//   node local-dev/with-local-db.mjs node prisma/seed.mjs
//   node local-dev/with-local-db.mjs prisma studio
import process from "node:process";
import { localDbEnv, resolveDb, run } from "./lib.mjs";

const [command, ...rest] = process.argv.slice(2);

if (!command) {
  console.error("Usage: node local-dev/with-local-db.mjs <command> [args…]");
  process.exit(1);
}

const { localUrl } = resolveDb();
console.log(`▶ Running against local Docker DB: ${localUrl.replace(/:[^:@/]+@/, ":***@")}`);

try {
  await run(command, rest, { env: localDbEnv() });
} catch (err) {
  console.error(`\n✗ ${err.message}\n`);
  process.exit(1);
}
