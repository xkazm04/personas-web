import { describe, expect, it } from "vitest";
import { attentionOf } from "../attention";
import { FLEET_EVENT_ID, initSim, simReducer, type SimState } from "./sim";
import { inFlightFor, isOpen, openControl, openFor, toAction, type Command } from "./useCommands";

const find = (s: SimState, id: string) => s.agents.find((a) => a.id === id)!;
const firstIn = (s: SimState, pred: (a: SimState["agents"][number]) => boolean) => s.agents.slice(0, s.scale).find(pred)!;

describe("toAction: what the machine does when a command arrives", () => {
  it("maps agent verbs, verdicts and fleet verbs onto sim actions", () => {
    expect(toAction({ verb: "pause", agentId: "p1" })).toEqual({ type: "pause", id: "p1" });
    expect(toAction({ verb: "approve", agentId: "p1", rid: "r1" })).toEqual({ type: "review", id: "p1", rid: "r1", approve: true });
    expect(toAction({ verb: "sendback", agentId: "p1", rid: "r1" })).toEqual({ type: "review", id: "p1", rid: "r1", approve: false });
    expect(toAction({ verb: "pauseAll", agentId: null, stop: true })).toEqual({ type: "pauseAll", stop: true });
    expect(toAction({ verb: "resumeAll", agentId: null })).toEqual({ type: "resumeAll" });
  });

  it("refuses a verdict without its review and an agent verb without an agent", () => {
    expect(toAction({ verb: "approve", agentId: "p1" })).toBeNull();
    expect(toAction({ verb: "pause", agentId: null })).toBeNull();
  });

  it("openFor finds the newest open command on an agent, never a finished one", () => {
    const cmds: Command[] = [
      { id: 3, verb: "run", agentId: "p1", status: "done" },
      { id: 2, verb: "pause", agentId: "p1", status: "acked" },
      { id: 1, verb: "approve", agentId: "p2", rid: "r", status: "undone" },
    ];
    expect(openFor(cmds, "p1")?.id).toBe(2);
    expect(openFor(cmds, "p2")).toBeUndefined();
    expect(cmds.filter(isOpen).map((c) => c.id)).toEqual([2]);
  });

  it("a held verdict neither holds the run controls nor counts as in flight", () => {
    const cmds: Command[] = [{ id: 1, verb: "approve", agentId: "p1", rid: "r", status: "held" }];
    expect(openFor(cmds, "p1")?.id).toBe(1);
    expect(openControl(cmds, "p1")).toBeUndefined();
    expect(inFlightFor(cmds, "p1")).toBeUndefined();
    const sent: Command[] = [{ id: 2, verb: "pause", agentId: "p1", status: "sending" }];
    expect(openControl(sent, "p1")?.id).toBe(2);
    expect(inFlightFor(sent, "p1")?.id).toBe(2);
  });
});

describe("agent verbs in the simulation", () => {
  it("pause lets a run in progress finish: still working, then off", () => {
    let s = initSim(99);
    const a = firstIn(s, (x) => x.state === "running");
    s = simReducer(s, { type: "pause", id: a.id });
    expect(find(s, a.id).enabled).toBe(false);
    expect(attentionOf(find(s, a.id))).toBe("working");
    expect(s.events[0]).toMatchObject({ agentId: a.id, kind: "decision", decision: { act: "pause" } });
  });

  it("pause dequeues a queued run, and resume switches it back on", () => {
    let s = initSim(99);
    const q = firstIn(s, (x) => x.state === "queued");
    s = simReducer(s, { type: "pause", id: q.id });
    expect(find(s, q.id)).toMatchObject({ enabled: false, state: "idle" });
    expect(attentionOf(find(s, q.id))).toBe("off");
    s = simReducer(s, { type: "resume", id: q.id });
    expect(find(s, q.id).enabled).toBe(true);
  });

  it("cancel stops the run and hands the slot to the next queued agent", () => {
    let s = initSim(99);
    const a = firstIn(s, (x) => x.state === "running" && !x.reviews.length);
    const queuedBefore = s.agents.slice(0, 99).filter((x) => x.state === "queued").length;
    s = simReducer(s, { type: "cancel", id: a.id });
    expect(find(s, a.id)).toMatchObject({ state: "idle", progress: null });
    expect(s.agents.slice(0, 99).filter((x) => x.state === "queued").length).toBe(queuedBefore - 1);
  });

  it("run starts a resting agent, and is a no-op on a paused or running one", () => {
    let s = initSim(99);
    const idle = firstIn(s, (x) => x.state === "idle" && x.enabled && !x.reviews.length);
    s = simReducer(s, { type: "run", id: idle.id });
    expect(["running", "queued"]).toContain(find(s, idle.id).state);
    const off = firstIn(s, (x) => !x.enabled);
    expect(simReducer(s, { type: "run", id: off.id })).toBe(s);
  });
});

describe("fleet verbs", () => {
  it("pause all switches every enabled agent off and resume all brings back only those", () => {
    let s = initSim(99);
    const offBefore = new Set(s.agents.slice(0, 99).filter((a) => !a.enabled).map((a) => a.id));
    s = simReducer(s, { type: "pauseAll", stop: false });
    expect(s.agents.slice(0, 99).every((a) => !a.enabled)).toBe(true);
    expect(s.agents.slice(0, 99).some((a) => a.state === "running")).toBe(true);
    expect(s.events[0]).toMatchObject({ agentId: FLEET_EVENT_ID, decision: { act: "pauseAll", n: 99 - offBefore.size, stopped: 0 } });
    s = simReducer(s, { type: "resumeAll" });
    for (const a of s.agents.slice(0, 99)) expect(a.enabled).toBe(!offBefore.has(a.id));
    expect(s.fleetPaused).toBeNull();
  });

  it("pause all with stop also ends every run in progress", () => {
    let s = initSim(30);
    const running = s.agents.slice(0, 30).filter((a) => a.state === "running").length;
    s = simReducer(s, { type: "pauseAll", stop: true });
    expect(s.agents.slice(0, 30).some((a) => a.state === "running")).toBe(false);
    expect(s.events[0]).toMatchObject({ decision: { act: "pauseAll", stopped: running } });
  });
});
