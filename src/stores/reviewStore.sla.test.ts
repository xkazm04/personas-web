import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PersonaEvent } from "@/lib/types";

const listEvents = vi.fn();
const updateEvent = vi.fn();
vi.mock("@/lib/api", () => ({ api: { listEvents, updateEvent } }));
vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn() }));
vi.mock("@/stores/personaStore", () => ({ usePersonaStore: { getState: () => ({ personas: [] }) } }));

const { useReviewStore } = await import("./reviewStore");
const sla = await import("@/lib/review-sla");
const store = () => useReviewStore.getState();

function ev(id: string, severity: string, minutesOld: number): PersonaEvent {
  return {
    id,
    projectId: "p",
    eventType: "manual_review",
    sourceType: "execution",
    sourceId: null,
    targetPersonaId: null,
    payload: JSON.stringify({ title: id, severity }),
    status: "pending",
    errorMessage: null,
    processedAt: null,
    useCaseId: null,
    createdAt: new Date(Date.now() - minutesOld * 60_000).toISOString(),
  };
}

async function load(events: PersonaEvent[]) {
  listEvents.mockResolvedValueOnce(events);
  await store().fetchReviews();
}

beforeEach(() => {
  listEvents.mockReset();
  updateEvent.mockReset();
  updateEvent.mockResolvedValue({});
  store().reset();
  useReviewStore.setState({ escalationPolicy: sla.DEFAULT_ESCALATION_POLICY, escalationEnabled: false });
});

describe("review store on the SLA rule", () => {
  it("decide() on the most urgent row -> the focus walk's head is the next most urgent", async () => {
    await load([ev("fresh", "warning", 1), ev("old", "info", 1440), ev("crit", "critical", 14)]);
    const { escalationPolicy } = store();
    expect(sla.focusQueue(store().reviews, escalationPolicy, Date.now())).toEqual(["old", "crit", "fresh"]);
    expect(store().decide(["old"], "approved")).toBe(true);
    expect(sla.focusQueue(store().reviews, escalationPolicy, Date.now())).toEqual(["crit", "fresh"]);
    store().undoDecision();
    expect(sla.focusQueue(store().reviews, escalationPolicy, Date.now())).toEqual(["old", "crit", "fresh"]);
  });

  it("checkEscalations never escalates a row whose verdict sits in the undo window", async () => {
    await load([ev("old", "info", 1440)]);
    useReviewStore.setState({ escalationEnabled: true });
    store().decide(["old"], "rejected");
    await store().checkEscalations();
    expect(updateEvent).not.toHaveBeenCalled();
    store().flushDecisions();
    await vi.waitFor(() => expect(updateEvent).toHaveBeenCalledTimes(1));
    expect(updateEvent).toHaveBeenCalledWith("old", { status: "failed", metadata: undefined });
  });

  it("checkEscalations escalates by the shared rule: overdue critical marked, due-soon critical untouched", async () => {
    await load([ev("late", "critical", 45), ev("soon", "critical", 14)]);
    useReviewStore.setState({ escalationEnabled: true });
    await store().checkEscalations();
    const byId = Object.fromEntries(store().reviews.map((r) => [r.id, r]));
    expect(byId.late.escalatedAt).not.toBeNull();
    expect(byId.soon.escalatedAt).toBeNull();
    expect(updateEvent).not.toHaveBeenCalled();
  });

  it("setEscalationPolicy enforces SLA >= urgency threshold on the policy actually used", () => {
    const stored: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => stored[k] ?? null,
      setItem: (k: string, v: string) => {
        stored[k] = v;
      },
    });
    try {
      store().setEscalationPolicy({ ...sla.DEFAULT_ESCALATION_POLICY, critical: { slaMinutes: 2, action: "auto_approve" } });
      expect(store().escalationPolicy.critical).toEqual({ slaMinutes: 30, action: "auto_approve" });
      expect(JSON.parse(stored["review-escalation-policy"]).critical.slaMinutes).toBe(30);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
