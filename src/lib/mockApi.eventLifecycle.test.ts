import { describe, expect, it, vi } from "vitest";
import type { PersonaEvent } from "./types";

// Acceptance case 6 + the critic's escalation case (challenge event-A): the
// demo plane is network-faithful. The retry count lives on the row and a
// `failed` row is never stranded: the mock plays the desktop's auto-retry
// sweep (../personas db/src/repos/communication/events.rs:1309-1350
// increment_retry_or_dead_letter, DEFAULT_MAX_RETRIES = 3 at :837).

vi.mock("swr", () => ({ mutate: vi.fn() }));

// The real `api` proxy routes to `mockApi` in demo mode, so the store under
// test writes through the same plane the dashboard demo uses.
const { useAuthStore } = await import("@/stores/authStore");
useAuthStore.setState({ isDemo: true });

const { mockApi } = await import("./mockApi");
const { MOCK_EVENTS } = await import("./mockData");
const { useEventStore } = await import("@/stores/eventStore");

type Row = PersonaEvent & { retryCount?: number | null };

describe("mock write-through of a retry (case 6)", () => {
  it("the next listEvents returns the same row pending with retryCount 2", async () => {
    const target = MOCK_EVENTS.find((e) => e.status === "dead_letter") as Row;
    expect(target).toBeDefined();
    const idx = MOCK_EVENTS.indexOf(target);
    MOCK_EVENTS[idx] = { ...target, retryCount: 1 } as Row;
    const before = MOCK_EVENTS.length;

    useEventStore.setState({ events: [MOCK_EVENTS[idx]], eventIds: new Set([target.id]) });
    await useEventStore.getState().replayEvent(MOCK_EVENTS[idx]);

    const listed = (await mockApi.listEvents()) as Row[];
    const again = listed.find((e) => e.id === target.id);
    expect(again?.status).toBe("pending");
    expect(again?.retryCount).toBe(2);
    expect(MOCK_EVENTS.length).toBe(before);
  });
});

describe("the mock never strands a failed row (critic revision a)", () => {
  it("every fixture carries a numeric retryCount", () => {
    for (const e of MOCK_EVENTS as Row[]) expect(typeof e.retryCount, e.id).toBe("number");
  });

  it("failed rows escalate to dead_letter once the auto-retry budget is spent", async () => {
    const failedIds = MOCK_EVENTS.filter((e) => e.status === "failed").map((e) => e.id);
    expect(failedIds.length).toBeGreaterThan(0);
    for (let tick = 0; tick < 3; tick++) await mockApi.listEvents();
    const listed = (await mockApi.listEvents()) as Row[];
    for (const id of failedIds) {
      const e = listed.find((x) => x.id === id);
      expect(e?.status, id).toBe("dead_letter");
      expect(e?.retryCount, id).toBeGreaterThanOrEqual(3);
    }
    expect(listed.some((e) => e.status === "failed")).toBe(false);
  });
});
