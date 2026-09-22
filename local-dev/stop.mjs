#!/usr/bin/env node
// npm run dev:stop   (aliases: tests:stop, server:stop)
//
// Kill tracked DETACHED processes (cmd tree, force). Pass --db to also stop
// the Docker container (volume kept). --wipe additionally deletes the volume.
import process from "node:process";
import { COMPOSE_FILE, killTree, readPid, run } from "./lib.mjs";

const args = process.argv.slice(2);
const withDb = args.includes("--db");
const wipe = args.includes("--wipe");
const names = args.filter((a) => !a.startsWith("--"));
const targets = names.length ? names : ["dev", "server", "tests"];

for (const name of targets) {
  const pid = readPid(name);
  if (pid) killTree(pid);
  console.log(`${name}: ${pid ? `killed tree ${pid}` : "no pid"}`);
}

if (withDb || wipe) {
  const opts = wipe ? ["down", "-v"] : ["down"];
  console.log(`▶ docker compose ${opts.join(" ")}`);
  await run("docker", ["compose", "-f", COMPOSE_FILE, ...opts]);
  console.log(wipe ? "✓ volume deleted (fresh DB next start)" : "✓ container stopped (volume kept)");
}