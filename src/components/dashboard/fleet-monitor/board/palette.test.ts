import { describe, expect, it } from "vitest";
import { personasMonitorCopy } from "@/i18n/pending/personasMonitor";
import { FLEET } from "../fleet-data";
import { buildItems, parseVerb, rankItems, scoreItem, type PaletteDeps, type PaletteItem } from "./palette";
import { initSim } from "./sim";

const c = personasMonitorCopy.board;
const verbs = { pause: c.cmd.pause, resume: c.cmd.resume, run: c.cmd.run, cancel: c.cmd.cancel };
const noop = () => {};
const deps = (over: Partial<PaletteDeps> = {}): PaletteDeps => ({
  scope: initSim(99).agents, teams: FLEET.teams, copy: c, hostName: "Studio PC", offline: false, fleetPaused: 0, scale: 99, verb: "open",
  openAgent: noop, openTeam: noop, agentVerb: noop, nextNeeds: noop, startTriage: noop, pauseAll: noop, resumeAll: noop, showPile: noop, clearFocus: noop, toggleActivity: noop,
  ...over,
});
const item = (label: string, meta?: string): PaletteItem => ({ id: label, group: "agents", label, meta, run: noop });

describe("palette ranking", () => {
  it("needs every word, and ranks a label that starts with it first", () => {
    expect(scoreItem(item("IR01 Invoice Reconciler"), "ir01")).toBeGreaterThan(scoreItem(item("TT02 Ticket Triager", "ir01 mention"), "ir01"));
    expect(scoreItem(item("IR01 Invoice Reconciler"), "invoice legal")).toBe(0);
    expect(scoreItem(item("IR01 Invoice Reconciler", "Finance Ops · Running"), "finance run")).toBeGreaterThan(0);
  });

  it("keeps group order and caps each group", () => {
    const ranked = rankItems(buildItems(deps()), "", 3);
    const groups = ranked.map((x) => x.group);
    expect(groups.indexOf("agents")).toBeGreaterThan(groups.lastIndexOf("actions"));
    expect(groups.filter((g) => g === "agents").length).toBe(3);
  });

  it("lists the agents that need you first when nothing is typed", () => {
    const top = rankItems(buildItems(deps()), "", 3).find((x) => x.group === "agents")!;
    expect(top.tone === "critical" || top.tone === "warning").toBe(true);
  });
});

describe("verb commands", () => {
  it("reads a leading verb (3+ letters) and leaves the rest as the query", () => {
    expect(parseVerb("pause ir01", verbs)).toEqual({ verb: "pause", rest: "ir01" });
    expect(parseVerb("run ea10", verbs)).toEqual({ verb: "run", rest: "ea10" });
    expect(parseVerb("res legal", verbs)).toEqual({ verb: "resume", rest: "legal" });
    expect(parseVerb("ir01", verbs)).toEqual({ verb: "open", rest: "ir01" });
    expect(parseVerb("pa", verbs).verb).toBe("open");
  });

  it("offers a verb only where it applies, and none while offline", () => {
    const cancel = buildItems(deps({ verb: "cancel" })).filter((x) => x.group === "agents");
    const scope = initSim(99).agents;
    expect(cancel.length).toBe(scope.filter((a) => a.state === "running").length);
    expect(buildItems(deps({ verb: "resume" })).filter((x) => x.group === "agents").length).toBe(scope.filter((a) => !a.enabled).length);
    expect(buildItems(deps({ verb: "pause", offline: true })).filter((x) => x.group === "agents")).toEqual([]);
  });
});
