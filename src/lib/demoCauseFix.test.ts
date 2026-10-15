import { afterEach, describe, expect, it } from "vitest";
import { SWRConfig } from "swr";

import { useResolvedCausesStore } from "@/stores/resolvedCausesStore";
import { fixCause, undoCauseFix } from "./demoCauseFix";
import { DEMO_THREAD_KEYS } from "./demoThreads";
import { incidentContaining } from "./incidentCorrelate";
import {
  getAuditIncidents,
  getBlastRadiusInputs,
  getCorrelatedIncidents,
  getSystemHealth,
  mockApi,
} from "./mockApi";
import { healthAlertCount, openIncidentCount, projectDemoThreads } from "./settleThread";

/**
 * One fix, every read agrees (P21 risk mitigation): after the Slack cause is
 * fixed, every demo read that serves a member of its thread reports it
 * settled, and Undo restores every one of them. Reads go through the mock
 * layer exactly as the dashboard's hooks call them.
 */

const SLACK = "slack-circuit-break";
const AT = "2030-01-01T00:00:00.000Z";

async function readAll() {
  const [health, blast, observability, issues, audit, clusters] = await Promise.all([
    getSystemHealth(),
    getBlastRadiusInputs(),
    mockApi.getObservability(),
    mockApi.getObservabilityHealthIssues(),
    getAuditIncidents(),
    getCorrelatedIncidents(),
  ]);
  const sync = projectDemoThreads(useResolvedCausesStore.getState().resolved);
  return {
    check: health.sections.flatMap((s) => s.items).find((c) => c.id === "in_slack")!.status,
    healthBadge: healthAlertCount(health.sections),
    blastBreach: blast.breaches.find((b) => b.id === "br_1")!.resolvedAt,
    observabilityIssue: observability.healthIssues.find((i) => i.id === "hi_2")!.status,
    healingIssue: issues.find((i) => i.id === "hi_2")!.status,
    auditIncident: audit.find((i) => i.id === "inc_1")!.status,
    incidentsBadge: openIncidentCount(audit),
    cluster: incidentContaining(clusters, "inc_1")!.status,
    slaBreach: sync.slaBreaches.find((b) => b.id === "br_1")!.resolvedAt,
    slaTarget: sync.slaTargets.find((t) => t.id === "sla_5")!.activeBreach,
  };
}

/** The value a fix wrote into SWR's cache for a key (what a hidden view reads on return). */
const cached = (key: string) => SWRConfig.defaultValue.cache.get(key)?.data as unknown;

afterEach(() => {
  useResolvedCausesStore.setState({ resolved: {} });
});

describe("fixCause across the mock reads", () => {
  it("every read of the Slack thread agrees after a fix, and Undo restores all of them", async () => {
    const today = await readAll();
    expect(today).toMatchObject({
      check: "error",
      healthBadge: 1,
      blastBreach: null,
      observabilityIssue: "open",
      healingIssue: "open",
      auditIncident: "escalated",
      cluster: "escalated",
      slaBreach: null,
      slaTarget: true,
    });

    fixCause(SLACK, "configure", AT);
    const fixed = await readAll();
    expect(fixed).toEqual({
      check: "ok",
      healthBadge: 0,
      blastBreach: AT,
      observabilityIssue: "resolved",
      healingIssue: "resolved",
      auditIncident: "resolved",
      incidentsBadge: today.incidentsBadge - 1,
      cluster: "resolved",
      slaBreach: AT,
      slaTarget: false,
    });

    undoCauseFix(SLACK);
    expect(await readAll()).toEqual(today);
  }, 15_000);

  it("writes every thread key into the SWR cache at once, so kept-alive and unvisited views read the settled value", () => {
    fixCause(SLACK, "configure", AT);
    const health = cached(DEMO_THREAD_KEYS.systemHealth) as Awaited<ReturnType<typeof getSystemHealth>>;
    expect(health.sections.flatMap((s) => s.items).find((c) => c.id === "in_slack")?.status).toBe("ok");
    const issues = cached(DEMO_THREAD_KEYS.healthIssues) as { id: string; status: string }[];
    expect(issues.find((i) => i.id === "hi_2")?.status).toBe("resolved");
    for (const key of Object.values(DEMO_THREAD_KEYS)) expect(cached(key), key).toBeDefined();

    undoCauseFix(SLACK);
    const reopened = cached(DEMO_THREAD_KEYS.healthIssues) as { id: string; status: string }[];
    expect(reopened.find((i) => i.id === "hi_2")?.status).toBe("open");
  });

  it("a second fix of the same cause keeps the first fix time", () => {
    fixCause(SLACK, "configure", AT);
    fixCause(SLACK, "configure", "2031-01-01T00:00:00.000Z");
    expect(useResolvedCausesStore.getState().resolved[SLACK]?.at).toBe(AT);
  });
});
