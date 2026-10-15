import { useResolvedCausesStore } from "@/stores/resolvedCausesStore";
import { projectDemoThreads, type ThreadFixtures } from "./settleThread";

/**
 * The SWR keys whose demo reads serve a thread member. A fix writes each one
 * (lib/demoCauseFix.ts), so every reader - including a view kept alive while
 * hidden - shows the settled thread without a reload. The hooks import these,
 * so a renamed key cannot silently drop out of the fix.
 */
export const DEMO_THREAD_KEYS = {
  systemHealth: "system-health",
  blastInputs: "health-blast-inputs",
  auditIncidents: "audit-incidents",
  incidentClusters: "incident-clusters",
  observability: "observability",
  healthIssues: "observability:health-issues",
} as const;

/** The demo fixtures as this session sees them, for the mock reads (demo-only callers). */
export function currentDemoThreads(): ThreadFixtures {
  return projectDemoThreads(useResolvedCausesStore.getState().resolved);
}
