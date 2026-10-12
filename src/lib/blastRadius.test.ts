import { describe, expect, it } from "vitest";
import { blastRadius, INTEGRATION_PREFIXES } from "./blastRadius";
import { MOCK_TOOL_USAGE, MOCK_TOOL_USAGE_BY_PERSONA } from "./mockData";
import { MOCK_SLA_BREACHES } from "./mock-dashboard-data";

const radius = (id: string) =>
  blastRadius(id, MOCK_TOOL_USAGE_BY_PERSONA, INTEGRATION_PREFIXES, MOCK_SLA_BREACHES);

describe("blastRadius", () => {
  it("Slack: 4 agents, 98 invocations (= the summary row), 1 open SLA breach", () => {
    const r = radius("in_slack")!;
    expect(r.personas).toHaveLength(4);
    expect(r.invocations).toBe(98);
    expect(r.invocations).toBe(MOCK_TOOL_USAGE.find((t) => t.toolName === "slack_send_message")!.invocations);
    expect(r.slaAtRisk).toEqual(["br_1"]);
  });

  it("GitHub: 1 agent, 142 + 58 invocations", () => {
    const r = radius("in_github")!;
    expect(r.personas.map((p) => p.name)).toEqual(["PR Review Agent"]);
    expect(r.invocations).toBe(200);
  });

  it("an unconfigured integration with no callers has radius 0", () => {
    const r = radius("in_stripe")!;
    expect(r.personas).toEqual([]);
    expect(r.invocations).toBe(0);
    expect(r.slaAtRisk).toEqual([]);
  });

  it("a non-integration check has no radius", () => {
    expect(radius("rt_gpu")).toBeNull();
  });

  it("reports tools no integration claims instead of hiding them", () => {
    // pagerduty, datadog, zendesk, linear, email
    expect(radius("in_slack")!.unmappedTools).toBe(5);
  });

  it("ignores resolved breaches", () => {
    const r = blastRadius(
      "in_slack",
      MOCK_TOOL_USAGE_BY_PERSONA,
      INTEGRATION_PREFIXES,
      MOCK_SLA_BREACHES.map((b) => ({ ...b, resolvedAt: "2026-01-01T00:00:00Z" })),
    )!;
    expect(r.slaAtRisk).toEqual([]);
  });
});
