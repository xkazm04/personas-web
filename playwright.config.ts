import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  // One retry so trace-on-first-retry can actually produce a trace on failure.
  // Dropping to 0 would delete the traces along with the retry, so the retry
  // stays and the silence it caused is fixed below instead.
  retries: 1,
  // A spec that fails then passes on the retry used to exit 0 with no record
  // anywhere: green run, no annotation, trace discarded because the artifact
  // upload is gated on failure(). The repo has no flake register, so the only
  // honest place to record a flake is the run itself — under CI a flaky result
  // is a failed result, which turns the run red AND ships the on-first-retry
  // trace as an artifact. Locally it stays off: the list reporter already
  // prints "flaky" to a developer who is watching, and failing their run
  // produces friction without producing a record.
  failOnFlakyTests: !!process.env.CI,
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
