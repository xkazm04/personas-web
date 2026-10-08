import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Health, Incidents, Director and the Observability Activity tab (Athena
 * cost/value) have no synced source: their data is a
 * standalone mock fetcher. Before the gate, the hooks called it in every mode,
 * so a signed-in real (non-demo) tenant saw invented host checks, incidents and
 * agents as if they were theirs. The gate keys the fetch on `isDemo`: demo gets
 * the fixture, real mode fetches nothing and the page shows an honest empty
 * state.
 */

vi.mock("@/stores/authStore", () => ({ useAuthStore: () => false }));

const { demoOnlyKey } = await import("./useDemoOnlySWR");

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_m, lead: string) => lead);
}

describe("demo-only data gate", () => {
  it("demo mode keeps the SWR key, so the mock fixture loads", () => {
    expect(demoOnlyKey("system-health", true)).toBe("system-health");
  });

  it("real mode yields a null key, so SWR never calls the mock fetcher", () => {
    expect(demoOnlyKey("system-health", false)).toBeNull();
  });

  it.each([
    "src/components/dashboard/views/health/health-page/useSystemHealth.ts",
    "src/components/dashboard/views/incidents/incidents-page/useAuditIncidents.ts",
    "src/components/dashboard/views/director/useDirectorData.ts",
    "src/components/dashboard/views/observability/activity-view/useActivityMetrics.ts",
  ])("%s fetches its mock only through the gate", (file) => {
    const src = stripComments(readFileSync(path.join(REPO_ROOT, file), "utf8"));
    expect(src).toMatch(/\buseDemoOnlySWR\(/);
    expect(src).not.toMatch(/\buseSWR\(/);
  });

  it.each([
    "src/components/dashboard/views/health/index.tsx",
    "src/components/dashboard/views/incidents/index.tsx",
    "src/components/dashboard/views/director/index.tsx",
    "src/components/dashboard/views/observability/ActivityMetricsView.tsx",
  ])("%s renders the live-unavailable empty state", (file) => {
    const src = stripComments(readFileSync(path.join(REPO_ROOT, file), "utf8"));
    expect(src).toMatch(/\bliveUnavailable\b/);
    expect(src).toMatch(/\bliveUnavailableTitle\b/);
  });
});
