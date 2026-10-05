import { describe, it, expect } from "vitest";

import { worstStatus } from "@/lib/healthFormat";
import { MOCK_HEALTH_CHECKS, type HealthCheckItem, type HealthCheckSection } from "@/lib/mock-dashboard-data";

import { applyHealthResolutions, resolveHealthAction, type HealthResolutions } from "./healthActions";

/**
 * The System Health demo actions: Configure / Install must visibly settle the
 * row in-session (status -> ok, button gone, a localized "done" line), not
 * only fire a toast. Pure reducer + projection; demo-only, no real calls.
 */

const DETAIL = { configure: "configured (demo)", install: "enabled (demo)" };
const EMPTY: HealthResolutions = {};

function find(sections: HealthCheckSection[], id: string): HealthCheckItem {
  for (const section of sections) {
    const item = section.items.find((i) => i.id === id);
    if (item) return item;
  }
  throw new Error(`no item ${id}`);
}

describe("resolveHealthAction", () => {
  it("records the item's action under its id", () => {
    const slack = find(MOCK_HEALTH_CHECKS, "in_slack");
    expect(resolveHealthAction(EMPTY, slack)).toEqual({ in_slack: "configure" });
  });

  it("is a no-op (same reference) for an item with no action", () => {
    const node = find(MOCK_HEALTH_CHECKS, "rt_node");
    expect(resolveHealthAction(EMPTY, node)).toBe(EMPTY);
  });

  it("is idempotent: resolving twice returns the same state", () => {
    const gemini = find(MOCK_HEALTH_CHECKS, "in_gemini");
    const once = resolveHealthAction(EMPTY, gemini);
    expect(resolveHealthAction(once, gemini)).toBe(once);
  });
});

describe("applyHealthResolutions", () => {
  it("a configured row flips to ok, loses its button and shows the configured line", () => {
    const state = resolveHealthAction(EMPTY, find(MOCK_HEALTH_CHECKS, "in_slack"));
    const slack = find(applyHealthResolutions(MOCK_HEALTH_CHECKS, state, DETAIL), "in_slack");
    expect(slack.status).toBe("ok");
    expect(slack.action).toBeUndefined();
    expect(slack.detail).toBe(DETAIL.configure);
    expect(slack.name).toBe("Slack");
  });

  it("an installed row flips to ok with the install line", () => {
    const state = resolveHealthAction(EMPTY, find(MOCK_HEALTH_CHECKS, "in_gemini"));
    const gemini = find(applyHealthResolutions(MOCK_HEALTH_CHECKS, state, DETAIL), "in_gemini");
    expect(gemini).toMatchObject({ status: "ok", detail: DETAIL.install });
    expect(gemini.action).toBeUndefined();
  });

  it("the section header dot follows: resolving every action leaves no non-ok item behind it", () => {
    let state = EMPTY;
    for (const id of ["rt_gpu", "in_slack", "in_stripe", "in_gemini"]) {
      state = resolveHealthAction(state, find(MOCK_HEALTH_CHECKS, id));
    }
    const next = applyHealthResolutions(MOCK_HEALTH_CHECKS, state, DETAIL);
    expect(worstStatus(next.find((s) => s.key === "integrations")!.items)).toBe("ok");
    expect(worstStatus(next.find((s) => s.key === "runtime")!.items)).toBe("ok");
    expect(next.flatMap((s) => s.items).filter((i) => i.action)).toEqual([]);
  });

  it("leaves the fixture untouched and keeps untouched sections by reference", () => {
    const snapshot = JSON.stringify(MOCK_HEALTH_CHECKS);
    const state = resolveHealthAction(EMPTY, find(MOCK_HEALTH_CHECKS, "in_slack"));
    const next = applyHealthResolutions(MOCK_HEALTH_CHECKS, state, DETAIL);
    expect(JSON.stringify(MOCK_HEALTH_CHECKS)).toBe(snapshot);
    const services = MOCK_HEALTH_CHECKS.find((s) => s.key === "services");
    expect(next.find((s) => s.key === "services")).toBe(services);
  });

  it("with no resolutions it returns the input array itself", () => {
    expect(applyHealthResolutions(MOCK_HEALTH_CHECKS, EMPTY, DETAIL)).toBe(MOCK_HEALTH_CHECKS);
  });

  it("a resolution is keyed by id, so it survives a refetch that returns fresh objects", () => {
    const state = resolveHealthAction(EMPTY, find(MOCK_HEALTH_CHECKS, "rt_gpu"));
    const refetched: HealthCheckSection[] = JSON.parse(JSON.stringify(MOCK_HEALTH_CHECKS));
    expect(find(applyHealthResolutions(refetched, state, DETAIL), "rt_gpu").status).toBe("ok");
  });
});
