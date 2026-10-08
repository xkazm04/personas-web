import { describe, expect, it } from "vitest";
import { attentionOf } from "../attention";
import { eligible, rangeIds, sortAgents } from "./fleetTable";
import { initSim } from "./sim";

const agents = initSim(99).agents;
const PILES = ["needs", "working", "resting", "off"];

describe("fleet table", () => {
  it("attention order: needs, working (furthest first), resting, off", () => {
    const sorted = sortAgents(agents, "attention", "asc");
    const piles = sorted.map((a) => PILES.indexOf(attentionOf(a)));
    expect(piles).toEqual([...piles].sort((x, y) => x - y));
    const working = sorted.filter((a) => attentionOf(a) === "working").map((a) => a.progress ?? 0);
    expect(working).toEqual([...working].sort((x, y) => y - x));
  });

  it("sorts numbers both ways and breaks ties by fleet order", () => {
    const desc = sortAgents(agents, "cost", "desc").map((a) => a.costTodayUsd);
    expect(desc).toEqual([...desc].sort((x, y) => y - x));
    const asc = sortAgents(agents, "runs", "asc").map((a) => a.runsToday);
    expect(asc).toEqual([...asc].sort((x, y) => x - y));
    expect(sortAgents(agents, "agent", "asc")[0].callsign.localeCompare(sortAgents(agents, "agent", "asc")[1].callsign)).toBeLessThanOrEqual(0);
  });

  it("bulk verbs apply where the agent's own controls would", () => {
    const running = agents.find((a) => a.state === "running")!;
    const off = agents.find((a) => !a.enabled)!;
    const waiting = agents.find((a) => a.state === "input_required")!;
    expect(eligible("cancel", running)).toBe(true);
    expect(eligible("run", running)).toBe(false);
    expect(eligible("resume", off)).toBe(true);
    expect(eligible("pause", off)).toBe(false);
    expect(eligible("run", waiting)).toBe(false);
  });

  it("a shift-click range covers the rows between, either direction", () => {
    const order = agents.slice(0, 10);
    expect(rangeIds(order, order[2].id, order[5].id)).toEqual(order.slice(2, 6).map((a) => a.id));
    expect(rangeIds(order, order[5].id, order[2].id)).toEqual(order.slice(2, 6).map((a) => a.id));
    expect(rangeIds(order, "missing", order[3].id)).toEqual([order[3].id]);
  });
});
