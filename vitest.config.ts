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
      include: [
        "src/lib/validation.ts",
        "src/lib/url.ts",
        "src/lib/format-date.ts",
        "src/app/dashboard/leaderboard/leaderboard-page/leaderboardSort.ts",
        "src/app/dashboard/sla/sla-page/slaFormat.ts",
      ],
      thresholds: { statements: 80, branches: 72, functions: 72, lines: 80 },
    },
  },
});
