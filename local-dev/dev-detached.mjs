#!/usr/bin/env node
// npm run dev:detached
//
// Start the FULL local dev stack as a DETACHED background process:
//   1. prepareLocalDb → docker compose up -d + wait + prisma db push + seed-if-empty
//   2. next dev       → detached, logs to local-dev/logs/dev.log, PID in local-dev/.run/dev.pid
//
// Returns as soon as the server answers on http://localhost:3000. Nothing to
// keep open — `npm run dev:status` to check, `npm run dev:stop` to kill.
import path from "node:path";
import { isAlive, readPid, spawnDetached, tailLog, waitForHttp } from "./lib.mjs";
import { prepareLocalDb, prepareLogPath } from "./prepare.mjs";

const args = process.argv.slice(2);
const noSeed = args.includes("--no-seed");
const forceSeed = args.includes("--seed");
const port = process.env.PORT || "3000";
const url = `http://localhost:${port}`;

const existing = readPid("dev");
if (isAlive(existing)) {
  console.log(`▶ next dev is already running (pid ${existing}) on ${url}`);
  console.log("  status:  npm run dev:status   stop:  npm run dev:stop");
  process.exit(0);
}

await prepareLocalDb({ noSeed, forceSeed });

console.log(`▶ Starting next dev detached on ${url}…`);
const logFile = prepareLogPath("dev");
const pid = spawnDetached("dev", ["npx", "next", "dev", "-p", port], {
  logFile,
  env: { ...process.env, USE_LOCAL_DB: "true" },
});

process.stdout.write(`▶ Waiting for ${url} (first compile can take ~30s)`);
const tick = setInterval(() => process.stdout.write("."), 1000);
const ready = await waitForHttp(`${url}/api/health`, 240_000).finally(() => clearInterval(tick));
console.log(ready ? " ✓" : " ✗");

console.log("");
console.log("── Dev server (detached) ──────────────────────────────");
console.log(`  App:        ${url}`);
console.log(`  PID:        ${pid}   (${ready ? "up" : "NOT ready"})`);
console.log(`  Log:        ${path.relative(process.cwd(), logFile)}`);
console.log("  Status:     npm run dev:status");
console.log("  Stop:       npm run dev:stop");
console.log("───────────────────────────────────────────────────────");
if (!ready) {
  console.log("\n✗ Server never became ready. Last log lines:");
  console.log(tailLog(logFile, 30) ?? "(empty)");
  process.exit(1);
}