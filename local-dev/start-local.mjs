#!/usr/bin/env node
// npm run start:local
//
// One-command local development (interactive, FOREGROUND — Ctrl+C stops dev):
//   1. prepareLocalDb → docker compose up -d + wait + prisma db push + seed-if-empty
//   2. next dev → app runs with USE_LOCAL_DB=true
//
// For a DETACHED server that survives the terminal, use `npm run dev:detached`
// (starts the same stack in the background and logs to local-dev/logs/dev.log).
import process from "node:process";
import { prepareLocalDb } from "./prepare.mjs";
import { run } from "./lib.mjs";

const args = process.argv.slice(2);
const noSeed = args.includes("--no-seed");
const forceSeed = args.includes("--seed");

async function main() {
  const { port, seeded } = await prepareLocalDb({ noSeed, forceSeed });

  console.log("\n── Ready ─────────────────────────────────────────────");
  console.log("  App:        http://localhost:3000");
  console.log(`  Postgres:   localhost:${port} (user/pass/db: novuslease)`);
  console.log("  Mode:       USE_LOCAL_DB=true → all dev/test traffic hits Docker");
  if (!seeded && !forceSeed) console.log("  Seed:       npm run db:seed:local");
  console.log("  Sync data:  Admin → Settings → “Sync from Neon”");
  console.log("  Stop DB:    npm run db:down  (volume keeps your data)");
  console.log("──────────────────────────────────────────────────────\n");

  // Dev server (inherits USE_LOCAL_DB=true from the resolved env).
  // Ctrl+C reaches both processes via the console; the Docker volume keeps data.
  await run("npx", ["next", "dev"], { env: { ...process.env, USE_LOCAL_DB: "true" } });
}

main().catch((err) => {
  const message = String(err?.message ?? err);
  if (message.includes("SIGINT") || message.includes("exit code 130")) process.exit(0);
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
});