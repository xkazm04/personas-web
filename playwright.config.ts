import { defineConfig, devices } from "@playwright/test";

// The port is overridable because `reuseExistingServer` trusts whatever already
// listens on it: on a machine that runs other projects' dev servers, :3002 can
// be a different app entirely and every spec would run against it.
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3002);

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
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    navigationTimeout: 30_000,
  },
  projects: [
    // Desktop. Phone specs live in e2e/mobile/** and run only under "mobile",
    // so a default run does not execute them twice at the wrong viewport.
    { name: "chromium", use: { browserName: "chromium" }, testIgnore: "**/mobile/**" },
    // Phone verification instrument for the /m revival
    // (docs/concepts/mobile-revival/PLAN.md): iPhone 13 UA, touch, isMobile,
    // DPR 3, 390px wide. The descriptor's default engine is WebKit; it runs on
    // Chromium here because the WebKit build this Playwright pins is not
    // installed on the dev machine (`npx playwright install webkit` + dropping
    // the browserName override switches it). Run: `npx playwright test --project=mobile`.
    {
      name: "mobile",
      testDir: "./e2e/mobile",
      use: { ...devices["iPhone 13"], browserName: "chromium" },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    port: PORT,
    // Local convenience only — CI must never test against a stale server.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
