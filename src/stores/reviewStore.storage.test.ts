import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({ api: { listEvents: vi.fn(), updateEvent: vi.fn() } }));
vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn() }));
vi.mock("@/stores/personaStore", () => ({ usePersonaStore: { getState: () => ({ personas: [] }) } }));

const { useReviewStore } = await import("./reviewStore");
const { DEFAULT_ESCALATION_POLICY } = await import("@/lib/review-sla");

/** A browser with site data blocked: every storage call throws (Safari private
 *  mode, enterprise policy). The escalation switch must still work in memory. */
function blockStorage() {
  const boom = () => {
    throw new DOMException("blocked", "SecurityError");
  };
  vi.stubGlobal("localStorage", { getItem: boom, setItem: boom, removeItem: boom });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("reviewStore escalation prefs under blocked storage", () => {
  it("setEscalationEnabled does not throw and still updates the store", () => {
    blockStorage();
    expect(() => useReviewStore.getState().setEscalationEnabled(true)).not.toThrow();
    expect(useReviewStore.getState().escalationEnabled).toBe(true);
    useReviewStore.getState().setEscalationEnabled(false);
    expect(useReviewStore.getState().escalationEnabled).toBe(false);
  });

  it("setEscalationPolicy does not throw and still updates the store", () => {
    blockStorage();
    const next = { ...DEFAULT_ESCALATION_POLICY };
    expect(() => useReviewStore.getState().setEscalationPolicy(next)).not.toThrow();
    expect(useReviewStore.getState().escalationPolicy).toEqual(next);
  });
});
