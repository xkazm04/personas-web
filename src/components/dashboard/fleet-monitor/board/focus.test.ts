import { describe, expect, it } from "vitest";
import { personasMonitorCopy } from "@/i18n/pending/personasMonitor";
import { attentionOf } from "../attention";
import { NO_FOCUS, inFocus, isFocusing, matchesQuery, togglePile } from "./focus";
import { initSim } from "./sim";

const c = personasMonitorCopy.board;
const agents = initSim(99).agents;
const ir01 = agents.find((a) => a.callsign === "IR01")!;

describe("find and focus", () => {
  it("matches every word against callsign, name, team, task and state, ignoring case", () => {
    expect(matchesQuery(ir01, "ir01", c)).toBe(true);
    expect(matchesQuery(ir01, "invoice  finance", c)).toBe(true);
    expect(matchesQuery(ir01, "invoices", c)).toBe(true); // its task line
    expect(matchesQuery(ir01, "running", c)).toBe(true); // its state
    expect(matchesQuery(ir01, "invoice legal", c)).toBe(false);
    expect(matchesQuery(ir01, "   ", c)).toBe(true);
  });

  it("pile filters combine with the query; no filter shows everyone", () => {
    expect(isFocusing(NO_FOCUS)).toBe(false);
    const needs = togglePile(NO_FOCUS, "needs");
    expect(isFocusing(needs)).toBe(true);
    const inNeeds = agents.filter((a) => inFocus(a, needs, c));
    expect(inNeeds.length).toBeGreaterThan(0);
    expect(inNeeds.every((a) => attentionOf(a) === "needs")).toBe(true);
    const legalNeeds = agents.filter((a) => inFocus(a, { ...needs, query: "legal" }, c));
    expect(legalNeeds.every((a) => a.team === "legal" && attentionOf(a) === "needs")).toBe(true);
    expect(togglePile(needs, "needs").piles).toEqual([]);
  });
});
