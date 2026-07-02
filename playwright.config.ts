import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  // One retry so trace-on-first-retry can actually produce a trace on failure.
  retries: 1,
  use: {
    baseURL: "http://localhost:3002",
    trace: "on-first-retry",
    navigationTimeout: 30_000,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
  webServer: {
    command: "npm run build && npm run start -- --port 3002",
    port: 3002,
    // Local convenience only — CI must never test against a stale server.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
