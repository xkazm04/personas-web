import { describe, expect, it } from "vitest";
import { DEMO_HOST, readHost, slotCapacity } from "./host";
import { initSim, simReducer, type SimState } from "./sim";

const advance = (s: SimState, scale: number, n: number) => {
  for (let i = 0; i < n; i++) s = simReducer(s, { type: "advance", dt: 1000, scale, still: false });
  return s;
};

describe("readHost: the machine as the board shows it", () => {
  it("counts slots, queue and paused agents from the fleet it runs", () => {
    const s = initSim(99);
    const scope = s.agents.slice(0, 99);
    const h = readHost(scope, 99, 0, 0, "online");
    expect(h.slotsUsed).toBe(scope.filter((a) => a.state === "running").length);
    expect(h.slotsTotal).toBe(slotCapacity(99));
    expect(h.queued).toBe(scope.filter((a) => a.state === "queued").length);
    expect(h.paused).toBe(scope.filter((a) => !a.enabled).length);
    expect(h.slotsUsed).toBeLessThanOrEqual(h.slotsTotal);
  });

  it("is deterministic in sim time: the same beat gives the same load", () => {
    const scope = initSim(30).agents.slice(0, 30);
    expect(readHost(scope, 30, 4000, 3000, "online")).toEqual(readHost(scope, 30, 4000, 3000, "online"));
    expect(readHost(scope, 30, 4000, 3000, "online").beatAgeMs).toBe(1000);
  });

  it("offline reports no load and the age it was last seen at, never a fresh number", () => {
    const scope = initSim(99).agents.slice(0, 99);
    const h = readHost(scope, 99, 0, 0, "offline");
    expect(h.cpuPct).toBeNull();
    expect(h.memUsedGb).toBeNull();
    expect(h.latencyMs).toBeNull();
    expect(h.beatAgeMs).toBe(DEMO_HOST.offlineAgoMs);
  });
});

describe("the simulation respects the machine's run slots", () => {
  it("every tick is a sync pass: beatAt follows the last tick", () => {
    const s = advance(initSim(99), 99, 4);
    expect(s.beatAt).toBeGreaterThan(0);
    expect(s.beatAt).toBeLessThanOrEqual(s.simMs);
  });

  it("never runs more agents than there are slots, over a long stretch", () => {
    for (const scale of [10, 30, 99]) {
      let s = initSim(scale);
      for (let i = 0; i < 300; i++) {
        s = advance(s, scale, 1);
        const running = s.agents.slice(0, scale).filter((a) => a.state === "running").length;
        expect(running).toBeLessThanOrEqual(slotCapacity(scale));
      }
    }
  });

  it("a retry with every slot taken queues instead of overbooking the machine", () => {
    let s = initSim(10);
    // Fill every slot: start resting agents until the machine is full.
    s = { ...s, agents: s.agents.map((a, i) => (i < 10 && a.enabled && a.state !== "failed" ? { ...a, state: "running" as const, progress: 0.1, startSim: 0 } : a)) };
    const failed = s.agents.slice(0, 10).find((a) => a.state === "failed")!;
    s = simReducer(s, { type: "retry", id: failed.id });
    expect(s.agents.find((a) => a.id === failed.id)!.state).toBe("queued");
  });
});
