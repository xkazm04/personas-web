import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { DASHBOARD_VIEW_IDS, viewTraits, type DashboardViewId } from "./views";

/**
 * A scope-bar control is a claim: "this view's rows follow me". Each view that
 * carries the bar names the data module that answers for it, and that module
 * must read the scope (`useDashboardScope`) and cut its rows with the view's
 * projection. The projections themselves are held to the fixtures in
 * `scope/scopeProjections.test.ts`. Before this test, eight views claimed the
 * scope and none read it.
 */

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (file: string) => readFileSync(path.join(SRC, file), "utf8");

const DATA_MODULE: Partial<Record<DashboardViewId, { file: string; projection: string }>> = {
  reviews: { file: "components/dashboard/views/reviews/useScopedReviews.ts", projection: "scopeReviews(" },
  executions: { file: "components/dashboard/views/executions/useExecutionsList.ts", projection: "scopeExecutions(" },
  events: { file: "components/dashboard/views/events/useScopedEvents.ts", projection: "scopeEvents(" },
  leaderboard: { file: "components/dashboard/views/leaderboard/useLeaderboardData.ts", projection: "scopeLeaderboard(" },
  sla: { file: "components/dashboard/views/sla/useSlaData.ts", projection: "scopeSla(" },
  knowledge: { file: "components/dashboard/views/knowledge/useKnowledgeData.ts", projection: "scopeKnowledge(" },
  messages: { file: "components/dashboard/views/messages/useMessagesData.ts", projection: "scopeMessages(" },
};

describe("scope honesty", () => {
  const scoped = DASHBOARD_VIEW_IDS.filter((id) => viewTraits(id).scope.length > 0);

  it("every view that carries the bar names its data module", () => {
    expect(scoped.sort()).toEqual(Object.keys(DATA_MODULE).sort());
  });

  it.each(Object.entries(DATA_MODULE))("%s reads the scope and cuts its rows", (_id, mod) => {
    const source = read(mod!.file);
    expect(source).toContain("useDashboardScope()");
    expect(source).toContain(mod!.projection);
  });

  it("Mission Control reads the window it states (it carries no bar)", () => {
    expect(viewTraits("home").scope).toEqual([]);
    const readings = read("components/dashboard/views/home/mission/useMissionReadings.ts");
    expect(readings).toContain("useDashboardScope()");
    expect(readings).toContain("scopeDaily(");
    expect(read("components/dashboard/views/home/index.tsx")).toContain("copy.windowNote[");
  });

  it("the leaderboard claims the persona only: its scores have no time", () => {
    expect(viewTraits("leaderboard").scope).toEqual(["persona"]);
  });

  it("Observability's one Compare control per tab is the store's flag, not a private one", () => {
    expect(viewTraits("observability").scope).toEqual([]);
    for (const tab of ["PerformanceView.tsx", "ActivityMetricsView.tsx"]) {
      const source = read(`components/dashboard/views/observability/${tab}`);
      expect(source).toContain("useDashboardFilterStore((s) => s.compareEnabled)");
      expect(source).not.toMatch(/useState\(false\)/);
      expect(source.match(/<CompareToggle/g)).toHaveLength(1);
    }
    // The bar no longer draws a Compare toggle of its own.
    expect(read("components/dashboard/DashboardScopeBar.tsx")).not.toContain("CompareToggle");
  });
});
