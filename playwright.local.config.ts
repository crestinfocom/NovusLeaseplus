import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// Same settings as playwright.config.ts but WITHOUT the managed webServer.
// The detached runner (local-dev/e2e-detached.mjs) starts/reuses its own
// `next start` on :3000 so the long-lived server never blocks a terminal.
export default defineConfig({
  ...base,
  webServer: undefined,
});