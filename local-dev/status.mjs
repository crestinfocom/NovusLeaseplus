#!/usr/bin/env node
// npm run dev:status   (aliases: tests:status)
//
// Show every tracked detached process (pid alive? + last log lines) without
// touching Docker/Neon. Exit code 0 when at least one tracked process is up.
import path from "node:path";
import { isAlive, readPid, tailLog } from "./lib.mjs";

const names = process.argv.slice(2);
const tracked = names.length ? names : ["dev", "server", "tests"];

let anyUp = false;
for (const name of tracked) {
  const pid = readPid(name);
  const up = isAlive(pid);
  if (up) anyUp = true;
  console.log("─".repeat(52));
  console.log(`${name.padEnd(8)} pid=${pid ?? "—"}   ${up ? "● RUNNING" : "○ stopped"}`);
  const tail = tailLog(path.join(process.cwd(), "local-dev", "logs", `${name}.log`), 8);
  if (tail) console.log(tail.split("\n").map((l) => `    │ ${l}`).join("\n"));
  if (!tail) console.log("    │ (no log yet)");
}
console.log("─".repeat(52));
process.exit(anyUp ? 0 : 1);