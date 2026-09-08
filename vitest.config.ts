import { defineConfig } from "vitest/config";
import path from "path";

// Unit-test runner. The project's only other runner is Playwright e2e, which
// cannot reach the pure trust-boundary / scoring / parsing logic these specs
// cover. Coverage is scoped (per-area gate) to the modules currently under unit
// test so the threshold is meaningful and does not fail on the large untested
// surface; extend `coverage.include` as more batches land.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Next's `server-only` guard package isn't resolvable under vitest's node
      // resolution; it only throws in browser bundles, so stub it to a no-op.
      "server-only": path.resolve(__dirname, "src/test/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // Per-area gate: only the modules these batches cover comprehensively count
      // toward the threshold. sentry-pii / request / flow-composer have unit tests
      // that lock the Wave-1..3 fixes, but also large branches that are e2e- or
      // browser-bound (scrubEvent, parseJsonBody, the window-gated encodeFlow), so
      // gating their full surface would be coverage-for-coverage's-sake. Promote
      // them into the gate as their batches grow.
      // Two include sets, two consumers. `all` + the whole-tree include define what
      // the REPORT is measured over, so a module no test imports reads as 0% instead
      // of being absent from the denominator. Measured 2026-09-01: the scoped list
      // below shows 5 files at 95.74% lines; the whole tree shows 1171 files at
      // 4.32%, i.e. 1070 source files were invisible to this report, not visibly
      // untested. The GATE stays scoped — a threshold over the untested surface
      // would be red from day one and get deleted — so `thresholds` names its own
      // per-glob population and the top-level floors are off.
      // (vitest 4 removed the `all` option: covering every file matched by
      // `include`, rather than only the ones a test imported, is now the
      // built-in behaviour. Dropping the flag keeps the denominator described
      // above — it does not narrow it.)
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["**/*.test.{ts,tsx}", "**/*.d.ts", "src/test/**"],
      reporter: ["text-summary", "text", "json-summary"],
      thresholds: {
        "src/lib/validation.ts": { statements: 80, branches: 72, functions: 72, lines: 80 },
        "src/lib/url.ts": { statements: 80, branches: 72, functions: 72, lines: 80 },
        "src/lib/format-date.ts": { statements: 80, branches: 72, functions: 72, lines: 80 },
        "src/app/dashboard/leaderboard/leaderboard-page/leaderboardSort.ts": { statements: 80, branches: 72, functions: 72, lines: 80 },
        "src/app/dashboard/sla/sla-page/slaFormat.ts": { statements: 80, branches: 72, functions: 72, lines: 80 },
      },
    },
  },
});
