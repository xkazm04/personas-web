import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Reduced-motion reads in the Observability Charts & SLA context go through
 * `useStillMotion` (SSR-safe, live), never framer's `useReducedMotion` (samples
 * once on the client, answers null on the server). And the SLA breach log's
 * ongoing dot must not pick its CLASS from that JS answer: the pulse is gated in
 * CSS (`motion-safe:`), so markup is identical on server and client.
 *
 * Source scan with comments stripped, so a doc comment naming the old hook does
 * not trip it and a commented-out call does not satisfy it.
 */

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_m, lead: string) => lead);
}

function read(rel: string): string {
  return stripComments(readFileSync(path.join(REPO_ROOT, rel), "utf8"));
}

const GATED_FILES = [
  "src/app/dashboard/sla/sla-page/SLABreachLog.tsx",
  "src/app/dashboard/sla/sla-page/SLATargetGrid.tsx",
  "src/app/dashboard/observability/performance-view/CostAnomalyBanner.tsx",
  "src/app/dashboard/observability/performance-view/PerformanceHealthPanel.tsx",
  "src/lib/chart-theme.tsx",
];

describe("observability + SLA reduced-motion reads", () => {
  it.each(GATED_FILES)("%s does not call framer's useReducedMotion", (rel) => {
    expect(read(rel)).not.toMatch(/\buseReducedMotion\b/);
  });

  it.each(GATED_FILES)("%s reads the preference through useStillMotion", (rel) => {
    const src = read(rel);
    expect(src).toMatch(/import\s*\{[^}]*\buseStillMotion\b[^}]*\}\s*from\s*"@\/hooks\/useStillMotion"/);
    expect(src).toMatch(/\buseStillMotion\(\)/);
  });

  it("the breach log never derives a class name from the reduced-motion answer", () => {
    const log = read("src/app/dashboard/sla/sla-page/SLABreachLog.tsx");
    const row = read("src/app/dashboard/sla/sla-page/SLABreachRow.tsx");
    for (const src of [log, row]) {
      expect(src).not.toMatch(/\?\s*""\s*:\s*"animate-pulse"/);
      expect(src).not.toMatch(/\bpulse\b\s*[:=]/);
    }
    expect(row).toMatch(/motion-safe:animate-pulse/);
  });

  it("the cost-anomaly pulse (an ambient loop) also stops on a hidden tab", () => {
    const src = read("src/app/dashboard/observability/performance-view/CostAnomalyBanner.tsx");
    expect(src).toMatch(/\busePageVisibility\(\)/);
  });
});
