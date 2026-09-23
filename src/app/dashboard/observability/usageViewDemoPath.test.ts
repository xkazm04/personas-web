import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { mockApi } from "@/lib/mockApi";
import * as usageViewData from "./usage-view/usageViewData";

/**
 * The Usage tab has ONE demo data source: `api.getUsageAnalytics`, which the
 * `api` proxy routes to `mockApi` whenever `isDemo` is set. That mock is never
 * empty, so a view-local "demo and no real data -> render our own fixtures"
 * fork is unreachable - and it was a second, contradictory tool set. The guard
 * case pins the reason; the rest pin that the fork stays gone.
 */

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_m, lead: string) => lead);
}

describe("Usage tab demo data path", () => {
  it("guard: the demo usage analytics are never empty (why a fallback cannot fire)", async () => {
    const data = await mockApi.getUsageAnalytics();
    expect(data.toolUsage.length).toBeGreaterThan(0);
    expect(data.toolUsageOverTime.length).toBeGreaterThan(0);
    expect(data.toolUsageByPersona.length).toBeGreaterThan(0);
  });

  it("usageViewData carries no fixtures of its own - only the name formatter", () => {
    expect(Object.keys(usageViewData).sort()).toEqual(["formatToolName"]);
  });

  it("UsageView renders what the api returns, with no demo fork", () => {
    const src = stripComments(
      readFileSync(path.join(REPO_ROOT, "src/app/dashboard/observability/UsageView.tsx"), "utf8"),
    );
    expect(src).not.toMatch(/\buseMock\b/);
    expect(src).not.toMatch(/\bMOCK_/);
    expect(src).not.toMatch(/\bexampleDataNotice\b/);
  });

  it("the orphaned exampleDataNotice key is gone from every locale", () => {
    const dir = path.join(REPO_ROOT, "src/i18n");
    const locales = readdirSync(dir).filter((f) => /^[a-z]{2}\.ts$/.test(f));
    expect(locales.length).toBe(14);
    const holders = locales.filter((f) =>
      /\bexampleDataNotice\b/.test(readFileSync(path.join(dir, f), "utf8")),
    );
    expect(holders).toEqual([]);
  });
});
