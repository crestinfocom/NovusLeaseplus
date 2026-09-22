#!/usr/bin/env node
// npm run test:e2e:local (headless)  ·  npm run test:e2e:local:headed
//
// Run the Playwright suite against the local Docker DB using DETACHED
// processes (nothing keeps a terminal open):
//   1. --build (or missing .next)  → `npm run build` first (finite, ~1 min)
//   2. Production `next start :3000` DETACHED  (reused if already up) → logs/
//   3. `playwright test` DETACHED → logs/tests.log, PID in .run/tests.pid
//   4. Exits immediately with PID + log paths.
//
// Check progress:  npm run tests:status    (shows PID + tail)
// Wait for finish: node local-dev/watch.mjs tests
// Kill everything:  npm run tests:stop     (or npm run dev:stop)
import fs from "node:fs";
import path from "node:path";
import { LOG_DIR, isAlive, readPid, run, spawnDetached, tailLog, waitForHttp } from "./lib.mjs";

const args = process.argv.slice(2);
const headed = args.includes("--headed");
const forceBuild = args.includes("--build");
const spec = args.find((a) => a.startsWith("tests/")) || "";
const port = process.env.PORT || "3000";
const url = `http://localhost:${port}`;

async function ensureBuild() {
  const built = fs.existsSync(path.join(process.cwd(), ".next", "BUILD_ID"));
  if (built && !forceBuild) return;
  console.log("▶ Building production bundle (once)…");
  await run("npm", ["run", "build"], {});
  console.log("✓ build complete");
}

async function ensureServer() {
  // Reuse anything already answering on :3000 (e.g. npm run dev:detached).
  const alive = await waitForHttp(`${url}/api/health`, 4000).catch(() => false);
  const existing = readPid("server");
  if (alive) {
    console.log(`▶ Reusing server already running on ${url} (pid ${existing ?? "n/a"}).`);
    return;
  }
  if (isAlive(existing)) {
    // tracked server still starting up — wait for it
    process.stdout.write(`▶ Waiting for tracked server (pid ${existing})…`);
    if (await waitForHttp(`${url}/api/health`, 120_000)) console.log(" ✓");
    return;
  }
  console.log(`▶ Starting production server detached on ${url}…`);
  const logFile = path.join(LOG_DIR, "server.log");
  const pid = spawnDetached("server", ["npx", "next", "start", "-p", port], { logFile });
  process.stdout.write(`▶ Waiting for server (pid ${pid})`);
  const tick = setInterval(() => process.stdout.write("."), 1000);
  const ready = await waitForHttp(`${url}/api/health`, 120_000).finally(() => clearInterval(tick));
  console.log(ready ? " ✓" : " ✗");
  if (!ready) {
    console.error("\n✗ Server never became ready. Last log lines:");
    console.error(tailLog(logFile, 30) ?? "(empty)");
    process.exit(1);
  }
}

await ensureBuild();
await ensureServer();

const mode = headed ? "headed" : "headless";
console.log(`\n▶ Starting Playwright (${mode}${spec ? `, spec ${spec}` : ""}) detached…`);
const logFile = path.join(LOG_DIR, "tests.log");
const pwArgs = ["npx", "playwright", "test", "-c", "playwright.local.config.ts"];
if (headed) pwArgs.push("--headed");
if (spec) pwArgs.push(spec);
const pid = spawnDetached("tests", pwArgs, { logFile });

console.log("");
console.log("── E2E suite (detached) ───────────────────────────────");
console.log(`  PID:        ${pid}`);
console.log(`  Log:        ${path.relative(process.cwd(), logFile)}`);
console.log("  Watch:      node local-dev/watch.mjs tests");
console.log("  Status:     npm run tests:status");
console.log("  Kill:       npm run tests:stop");
console.log("───────────────────────────────────────────────────────");