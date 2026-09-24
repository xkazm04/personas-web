import { describe, expect, it } from "vitest";
import { FLEET, MOCK_AUDIT_INCIDENTS } from "./mock-dashboard-data";
import { MOCK_EVENTS, MOCK_EXECUTIONS } from "./mockData";
import { DEFAULT_ESCALATION_POLICY, countOverdue, orderByDue, slaState } from "./review-sla";
import type { ManualReviewItem, ReviewSeverity } from "./types";

// The review queue's seeds spill over into Home triage (useTriageQueue), the
// nav badge (DashboardNavigation), /m/overview and the mobile tab bar: all of
// them read the one pendingReviewCount / reviews the store derives from these
// events. These cases hold the seeds to the one-fleet-truth fixtures so those
// surfaces stay self-consistent with the agents page and the incident log.

const MIN = 60_000;
const REVIEWS = MOCK_EVENTS.filter((e) => e.eventType === "manual_review");
const PENDING = REVIEWS.filter((e) => e.status === "pending");
const SEEDED_PENDING = 5;

/** The store's projection (reviewStore.parseManualReview), minus persona join. */
function asItem(e: (typeof REVIEWS)[number]): ManualReviewItem {
  const payload = JSON.parse(e.payload ?? "{}") as { title: string; severity: ReviewSeverity };
  return {
    id: e.id,
    personaId: e.targetPersonaId ?? "",
    executionId: e.sourceId ?? "",
    eventType: e.eventType,
    content: payload.title,
    severity: payload.severity,
    status: e.status === "processed" ? "approved" : e.status === "failed" ? "rejected" : "pending",
    reviewerNotes: null,
    createdAt: e.createdAt,
    resolvedAt: e.processedAt,
    resolvedBy: null,
    escalatedAt: null,
  };
}
const ITEMS = REVIEWS.map(asItem);
const fleetName = (id: string) => FLEET.find((m) => m.id === id)?.name;

describe("guard: review seeds stay one fleet", () => {
  it("every manual_review names a persona on the fleet roster", () => {
    const roster = new Set(FLEET.map((m) => m.id));
    for (const e of REVIEWS) expect(roster.has(e.targetPersonaId ?? "")).toBe(true);
  });

  it("a review's source execution belongs to the same persona", () => {
    for (const e of REVIEWS) {
      if (!e.sourceId) continue;
      expect(MOCK_EXECUTIONS.find((x) => x.id === e.sourceId)?.personaId).toBe(e.targetPersonaId);
    }
  });

  it(`the pending manual_review count is the seeded ${SEEDED_PENDING} (what the nav badge, Home triage and /m/overview show)`, () => {
    expect(PENDING).toHaveLength(SEEDED_PENDING);
  });
});

describe("the demo queue has an order to show", () => {
  it("two are overdue and the most overdue leads, ahead of a critical that is merely due soon", () => {
    const now = Date.now();
    const order = orderByDue(ITEMS, DEFAULT_ESCALATION_POLICY, now).filter((r) => r.status === "pending");
    expect(countOverdue(ITEMS, DEFAULT_ESCALATION_POLICY, now)).toBe(2);
    expect(order.map((r) => slaState(r, DEFAULT_ESCALATION_POLICY, now).phase)).toEqual([
      "overdue",
      "overdue",
      "due-soon",
      "due-soon",
      "ok",
    ]);
    expect(order[0].severity).toBe("info");
  });

  it("inc_15 'warning review for PR Review Agent pending 3h, approaching its 4h SLA' is a real row", () => {
    const inc = MOCK_AUDIT_INCIDENTS.find((i) => i.id === "inc_15")!;
    expect(inc.status).toBe("open");
    const now = Date.now();
    const match = ITEMS.find(
      (r) => r.status === "pending" && r.severity === "warning" && fleetName(r.personaId) === inc.persona,
    );
    expect(match).toBeDefined();
    expect(Math.round((now - Date.parse(match!.createdAt)) / MIN)).toBe(180);
    expect(slaState(match!, DEFAULT_ESCALATION_POLICY, now).phase).toBe("due-soon");
  });

  it("inc_9 'critical review for Security Scanner sat past its 30-minute SLA' is a real row that breached when inc_9 was detected", () => {
    const inc = MOCK_AUDIT_INCIDENTS.find((i) => i.id === "inc_9")!;
    const now = Date.now();
    const match = ITEMS.find(
      (r) => r.status === "pending" && r.severity === "critical" && fleetName(r.personaId) === inc.persona,
    );
    expect(match).toBeDefined();
    const sla = slaState(match!, DEFAULT_ESCALATION_POLICY, now);
    expect(sla.phase).toBe("overdue");
    expect(Math.abs(sla.dueAt - Date.parse(inc.detectedAt))).toBeLessThan(MIN);
  });
});
