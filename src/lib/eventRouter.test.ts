import { describe, expect, it } from "vitest";
import { MOCK_EVENTS, MOCK_PERSONAS, MOCK_SUBSCRIPTIONS } from "./mockData";
import { isFutile, isRetryable, route } from "./eventRouter";
import type { PersonaEvent, PersonaEventSubscription } from "./types";

const subs = Object.values(MOCK_SUBSCRIPTIONS).flat();
const byId = (id: string): PersonaEvent => {
  const e = MOCK_EVENTS.find((x) => x.id === id);
  if (!e) throw new Error(`fixture ${id} missing`);
  return e;
};
const verdictOf = (e: PersonaEvent) => route(e, subs, MOCK_PERSONAS);

describe("route over the dead-letter fixtures", () => {
  const lane = MOCK_EVENTS.filter((e) => e.status === "dead_letter" || e.status === "failed");

  it("gives every dead/failed fixture a verdict", () => {
    expect(lane.length).toBeGreaterThanOrEqual(8);
    for (const e of lane) expect(verdictOf(e).kind).toBeTruthy();
  });

  it("the gitlab merge request would deliver to PR Review Agent via sub_2", () => {
    const v = verdictOf(MOCK_EVENTS.find((e) => e.eventType === "gitlab_merge_request")!);
    expect(v).toMatchObject({ kind: "would_deliver", subscriptionId: MOCK_SUBSCRIPTIONS[MOCK_PERSONAS[0].id][1].id });
  });

  // The fixtures' error text and the roster disagree: the "no longer exists"
  // event targets p4, which is in the roster (paused), and the "is paused"
  // event targets p3, which is enabled. That is the contradiction the
  // simulator exists to surface, so the verdicts are pinned to the roster and
  // the error texts are exercised against a roster that matches them.
  it("surfaces the fixtures' text-vs-roster contradictions", () => {
    const gone = MOCK_EVENTS.find((x) => x.errorMessage?.includes("no longer exists"))!;
    const paused = MOCK_EVENTS.find((x) => x.errorMessage?.includes("is paused"))!;
    expect(verdictOf(gone).kind).toBe("blocked_paused");
    expect(verdictOf(paused).kind).toBe("no_route");
  });

  it("a deleted target is futile and not retryable", () => {
    const e = MOCK_EVENTS.find((x) => x.errorMessage?.includes("no longer exists"))!;
    const v = route(e, subs, MOCK_PERSONAS.filter((x) => x.id !== e.targetPersonaId));
    expect(v.kind).toBe("futile_target_missing");
    expect(isFutile(v)).toBe(true);
    expect(isRetryable(v)).toBe(false);
  });

  it("a paused target is blocked, not futile", () => {
    const e = MOCK_EVENTS.find((x) => x.errorMessage?.includes("is paused"))!;
    const v = route(e, subs, MOCK_PERSONAS.map((x) => (x.id === e.targetPersonaId ? { ...x, enabled: false } : x)));
    expect(v.kind).toBe("blocked_paused");
    expect(isFutile(v)).toBe(false);
    expect(isRetryable(v)).toBe(false);
  });

  it("an alert from pagerduty routes through sub_3", () => {
    const v = verdictOf(byId(MOCK_EVENTS.find((e) => e.eventType === "alert_triggered" && e.status === "failed")!.id));
    expect(v.kind).toBe("would_deliver");
  });
});

describe("route rules", () => {
  const p = [{ id: "a", enabled: true }, { id: "b", enabled: true }];
  const ev = { eventType: "x", sourceType: "github", sourceId: "acme/web", targetPersonaId: null };
  const sub = (o: Partial<PersonaEventSubscription>): PersonaEventSubscription => ({
    id: "s", personaId: "a", eventType: "x", sourceFilter: null, enabled: true, useCaseId: null, createdAt: "", updatedAt: "", ...o,
  });

  it("matches the source filter on type or id, case-insensitively", () => {
    expect(route(ev, [sub({ sourceFilter: "GitHub" })], p).kind).toBe("would_deliver");
    expect(route(ev, [sub({ sourceFilter: "acme/web" })], p).kind).toBe("would_deliver");
    expect(route(ev, [sub({ sourceFilter: "gitlab" })], p).kind).toBe("no_route");
  });

  it("reports a disabled match so the operator can enable it", () => {
    expect(route(ev, [sub({ enabled: false })], p)).toEqual({ kind: "no_route", disabledMatchIds: ["s"] });
  });

  it("a targeted event ignores other personas' subscriptions", () => {
    expect(route({ ...ev, targetPersonaId: "b" }, [sub({})], p).kind).toBe("no_route");
  });

  it("an untargeted event skips a paused subscriber", () => {
    expect(route(ev, [sub({})], [{ id: "a", enabled: false }]).kind).toBe("no_route");
  });
});
