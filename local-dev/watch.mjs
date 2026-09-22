#!/usr/bin/env node
// Wait for a detached process to finish (by name from local-dev/.run/<name>.pid),
// then print the last lines of its log.
//
//   node local-dev/watch.mjs tests [--timeout 900]
//
// Polls every 2s; exits 0 on completion (or timeout) and prints the tail so the
// agent can parse the result without holding a terminal hostage.
import process from "node:process";
import path from "node:path";
import { isAlive, readPid, tailLog } from "./lib.mjs";

const name = process.argv[2];
const ti = process.argv.indexOf("--timeout");
const timeoutSec = ti > -1 ? Number(process.argv[ti + 1]) : 900;
const timeoutMs = (Number.isFinite(timeoutSec) ? timeoutSec : 900) * 1000;

if (!name) {
  console.error("Usage: node local-dev/watch.mjs <name> [--timeout <sec>]");
  process.exit(2);
}

const pid = readPid(name);
if (!pid) {
  console.log(`No pid recorded for "${name}" — nothing to watch.`);
  process.exit(1);
}
if (!isAlive(pid)) {
  console.log(`Process ${pid} for "${name}" is already finished.`);
  const tail = tailLog(path.join(process.cwd(), "local-dev", "logs", `${name}.log`), 60);
  if (tail) console.log(tail);
  process.exit(0);
}

const logFile = path.join(process.cwd(), "local-dev", "logs", `${name}.log`);
const deadline = Date.now() + timeoutMs;
process.stdout.write(`▶ Waiting for "${name}" (pid ${pid}, up to ${timeoutMs / 1000}s)`);
const tick = setInterval(() => process.stdout.write("."), 2000);

while (Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 2000));
  if (!isAlive(pid)) break;
}
clearInterval(tick);

if (isAlive(pid)) {
  console.log("\n✗ Timed out — still running. Log tail:");
} else {
  console.log("\n✓ Finished.");
}
const tail = tailLog(logFile, 80);
if (tail) {
  console.log("─".repeat(60));
  console.log(tail);
  console.log("─".repeat(60));
}
process.exit(isAlive(pid) ? 1 : 0);