// Shared helpers for local-dev scripts.
// Loads .env + .env.local the same way Next.js does (.env.local wins),
// resolves the local-Docker vs Neon connection strings, and runs
// child processes with the right environment.
// Long-running commands (next dev / next start / playwright) can be started
// DETACHED — they survive the calling shell and stream to log files, so the
// agent/user never blocks on a terminal. PIDs are tracked in local-dev/.run/.
import { config as loadDotenv } from "dotenv";
import { spawn, execSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const COMPOSE_FILE = path.join(ROOT, "local-dev", "docker-compose.yml");
export const RUN_DIR = path.join(ROOT, "local-dev", ".run");
export const LOG_DIR = path.join(ROOT, "local-dev", "logs");

// Must match services.postgres in local-dev/docker-compose.yml and
// DATABASE_URL_LOCAL in .env.example.
export const DEFAULT_LOCAL_URL =
  "postgresql://novuslease:novuslease@localhost:5434/novuslease?sslmode=disable";

export function isTruthy(value) {
  return value === "true" || value === "1";
}

let envLoaded = false;

/** Load .env then .env.local (override) — mirrors Next.js precedence. */
export function loadEnv() {
  if (envLoaded) return;
  loadDotenv({ path: path.join(ROOT, ".env") });
  loadDotenv({ path: path.join(ROOT, ".env.local"), override: true });
  envLoaded = true;
}

/**
 * Resolve which database the app should use.
 * @returns {{ useLocal: boolean, localUrl: string, neonUrl: string | undefined, appUrl: string }}
 */
export function resolveDb() {
  loadEnv();
  const useLocal = isTruthy(process.env.USE_LOCAL_DB);
  const localUrl = process.env.DATABASE_URL_LOCAL || DEFAULT_LOCAL_URL;
  const neonUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  return { useLocal, localUrl, neonUrl, appUrl: useLocal ? localUrl : neonUrl };
}

/** Environment for child processes that must talk to the local Docker DB. */
export function localDbEnv() {
  const { localUrl } = resolveDb();
  return {
    ...process.env,
    USE_LOCAL_DB: "true",
    DATABASE_URL: localUrl,
    DATABASE_URL_LOCAL: localUrl,
  };
}

/** Run a command; resolve on exit code 0, reject otherwise. */
export function run(
  command,
  args,
  { env = process.env, cwd = ROOT, quiet = false } = {}
) {
  return new Promise((resolve, reject) => {
    // On Windows, npm/next/prisma are .cmd shims — they need cmd.exe.
    // Pass a single command line (shell:true + args array triggers the
    // DEP0190 deprecation: this callback runs once, so a joined string is fine).
    const shell = process.platform === "win32";
    const quote = (a) => (/[\s"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);
    const commandLine = [command, ...args].map(quote).join(" ");
    const child = spawn(commandLine, {
      cwd,
      env,
      stdio: quiet ? ["ignore", "pipe", "pipe"] : "inherit",
      shell,
    });
    let output = "";
    if (quiet) {
      child.stdout?.on("data", (d) => (output += d));
      child.stderr?.on("data", (d) => (output += d));
    }
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}\n${output}`));
    });
  });
}

/** Wait until a TCP port accepts connections (compose healthcheck backup). */
export function waitForPort(port, host = "localhost", timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.connect({ port, host });
      const retry = () => {
        socket.destroy();
        if (Date.now() > deadline) {
          reject(new Error(`Timed out after ${timeoutMs / 1000}s waiting for ${host}:${port}`));
        } else {
          setTimeout(attempt, 1000);
        }
      };
      socket.once("connect", () => {
        socket.end();
        resolve(undefined);
      });
      socket.once("error", retry);
      socket.setTimeout(3000, retry);
    };
    attempt();
  });
}

/** Extract the host port from a postgres connection string. */
export function portFromUrl(url, fallback = 5434) {
  try {
    const parsed = new URL(url);
    return parsed.port ? Number(parsed.port) : fallback;
  } catch {
    return fallback;
  }
}

// ───────────────────────────────────────────────────────────────────
// Detached process management
// ───────────────────────────────────────────────────────────────────

function ensureRunDirs() {
  fs.mkdirSync(RUN_DIR, { recursive: true });
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export function writePid(name, pid) {
  ensureRunDirs();
  fs.writeFileSync(path.join(RUN_DIR, `${name}.pid`), String(pid));
}

export function readPid(name) {
  try {
    return Number(fs.readFileSync(path.join(RUN_DIR, `${name}.pid`), "utf8"));
  } catch {
    return null;
  }
}

export function isAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/** Tail the last n lines of a log file (or undefined). */
export function tailLog(file, n = 20) {
  try {
    const text = fs.readFileSync(file, "utf8");
    return text.split(/\r?\n/).filter(Boolean).slice(-n).join("\n");
  } catch {
    return undefined;
  }
}

/**
 * Start a command DETACHED as a fully independent process so it survives the
 * calling shell AND any parent-process cleanup (uses PowerShell Start-Process,
 * not a child_process child). stdout/stderr stream to `local-dev/logs/<name>.log`
 * and the PID is stored in `local-dev/.run/<name>.pid`.
 * `argv` is [command, ...args]; tokens with spaces are quoted automatically.
 */
export function spawnDetached(name, argv, { logFile, env = process.env, cwd = ROOT } = {}) {
  ensureRunDirs();
  logFile = logFile || path.join(LOG_DIR, `${name}.log`);
  const pidFile = path.join(RUN_DIR, `${name}.pid`);
  const quote = (a) => (/[\s"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);
  const commandLine = argv.map(quote).join(" ");
  const script = path.join(ROOT, "local-dev", "launch.ps1");
  execSync(
    `powershell -NoProfile -ExecutionPolicy Bypass -File "${script}" ` +
      `-Name "${name}" -Command "${commandLine}" -LogFile "${logFile}" ` +
      `-PidFile "${pidFile}" -Cwd "${cwd}"`,
    { stdio: "ignore", env }
  );
  const pid = readPid(name);
  if (!pid || !isAlive(pid)) {
    throw new Error(
      `Failed to launch detached process "${name}" (${commandLine}). Check ${logFile}`
    );
  }
  return pid;
}

/** Force-kill a process tree (Windows). Safe no-op when already dead. */
export function killTree(pid) {
  if (!pid || !isAlive(pid)) return;
  try {
    execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
  } catch {
    /* already gone */
  }
}

/** Poll an HTTP URL until it answers with 2xx (or a final 4xx for route checks). */
export async function waitForHttp(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.status >= 200 && res.status < 500) return true;
    } catch {
      /* not ready yet */
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}
