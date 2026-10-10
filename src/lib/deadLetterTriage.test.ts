import { describe, expect, it, vi } from "vitest";
import type { PersonaEvent } from "./types";

// Challenge event-B: the dead letter is triaged by cause. A failure story is
// a signature with its volatile parts stripped, the lane groups by it, and a
// bulk run's per-id result is summarised by reason with a reselect list.

vi.mock("swr", () => ({ mutate: vi.fn() }));

const { failureSignature, clusterByFailure, summarizeOutcome, NO_REASON_SIGNATURE } = await import(
  "./deadLetterTriage"
);

describe("failureSignature", () => {
  it("strips volatile numbers but keeps the status code", () => {
    const a = failureSignature("Rate limited by the PagerDuty API (429). Retry after 60s.");
    const b = failureSignature("Rate limited by the PagerDuty API (429). Retry after 15s.");
    const timeout = failureSignature("Handler timed out after 30000ms - persona never acknowledged the delivery");
    expect(a).toBe(b);
    expect(a).not.toBe(timeout);
    expect(a).toContain("429");
    expect(failureSignature("Downstream returned 502 from api-prod")).not.toBe(
      failureSignature("Downstream returned 503 from api-prod"),
    );
  });

  it("strips ids, hosts and quoted names", () => {
    expect(failureSignature("No webhook secret configured for endpoint we_1QfL2x")).toBe(
      failureSignature("No webhook secret configured for endpoint we_9ZzA7q"),
    );
    expect(failureSignature("Connection refused by api.eu.example.com")).toBe(
      failureSignature("Connection refused by hooks.acme.io"),
    );
    expect(failureSignature('Persona "Ops Bot" is paused')).toBe(failureSignature("Persona 'Billing' is paused"));
    expect(failureSignature("Lost 6c1f3f8e-1a2b-4c3d-9e8f-0a1b2c3d4e5f")).toBe(
      failureSignature("Lost 00000000-0000-4000-8000-000000000000"),
    );
  });

  it("a missing reason is its own signature that no message can produce", () => {
    expect(failureSignature(null)).toBe(NO_REASON_SIGNATURE);
    expect(failureSignature("   ")).toBe(NO_REASON_SIGNATURE);
    expect(failureSignature("no reason recorded")).not.toBe(NO_REASON_SIGNATURE);
  });
});

describe("clusterByFailure over the demo dead letter", () => {
  it("groups the lane by cause, largest first; the PagerDuty 429 cohort leads with 5", async () => {
    const { useAuthStore } = await import("@/stores/authStore");
    useAuthStore.setState({ isDemo: true });
    const { mockApi } = await import("./mockApi");
    // The lane the operator sees: the mock plays the desktop's auto-retry
    // sweep, so a `failed` fixture escalates to the dead letter on read.
    for (let tick = 0; tick < 3; tick++) await mockApi.listEvents();
    const lane = (await mockApi.listEvents()).filter((e) => e.status === "dead_letter");
    const clusters = clusterByFailure(lane);
    for (let i = 1; i < clusters.length; i++) {
      expect(clusters[i - 1].ids.length).toBeGreaterThanOrEqual(clusters[i].ids.length);
    }
    expect(clusters[0].ids).toHaveLength(5);
    const byId = new Map(lane.map((e) => [e.id, e]));
    for (const id of clusters[0].ids) expect(byId.get(id)?.sourceType).toBe("pagerduty");
    expect(clusters.reduce((n, c) => n + c.ids.length, 0)).toBe(lane.length);
  });

  it("a row with no recorded reason forms its own cluster", () => {
    const row = (id: string, errorMessage: string | null) => ({ id, errorMessage, sourceType: "x" }) as PersonaEvent;
    const clusters = clusterByFailure([
      row("a", "Handler timed out after 30000ms"),
      row("b", null),
      row("c", "Handler timed out after 12000ms"),
    ]);
    expect(clusters.map((c) => c.ids)).toEqual([["a", "c"], ["b"]]);
    expect(clusters[1].signature).toBe(NO_REASON_SIGNATURE);
    expect(clusters[1].sample).toBeNull();
  });
});

describe("summarizeOutcome", () => {
  it("counts by reason and offers the failures for reselect", () => {
    expect(
      summarizeOutcome({
        succeeded: ["a", "b"],
        failed: [
          { id: "c", reason: "retry_exhausted" },
          { id: "d", reason: "not_found" },
          { id: "e", reason: "retry_exhausted" },
        ],
      }),
    ).toEqual({ ok: 2, failedByReason: { retry_exhausted: ["c", "e"], not_found: ["d"] }, reselect: ["c", "d", "e"] });
  });
});
