import { describe, expect, it } from "vitest";
import { CHOOSE, DOCK, NEED, initialCycle, isDocked, isFinale, reduceCycle, type CycleState } from "./cycle";

const tick = (s: CycleState, n = 1) => {
  for (let i = 0; i < n; i++) s = reduceCycle(s, { type: "TICK" });
  return s;
};

describe("use-case cycle", () => {
  it("rests on one finished case and does not tick until armed", () => {
    const s = initialCycle(3);
    expect(s).toMatchObject({ caseIdx: 0, phase: DOCK, mode: "stopped" });
    expect(isDocked(s, 0)).toBe(true);
    expect(tick(s)).toBe(s);
  });

  it("arms once from the top, walks five beats per case, rests on the finale, then loops", () => {
    let s = reduceCycle(initialCycle(2), { type: "ARM" });
    expect(s).toMatchObject({ caseIdx: 0, phase: NEED, mode: "playing" });
    expect(isDocked(s, 0)).toBe(false);
    s = tick(s, 3);
    expect(s.phase).toBe(CHOOSE);
    s = tick(s, 2);
    expect(s).toMatchObject({ caseIdx: 1, phase: NEED });
    expect(isDocked(s, 0)).toBe(true);
    s = tick(s, 5);
    expect(isFinale(s)).toBe(true);
    expect(isDocked(s, 1)).toBe(true);
    const run = s.run;
    s = tick(s);
    expect(s).toMatchObject({ caseIdx: 0, phase: NEED, run: run + 1 });
  });

  it("a visitor's stop is never undone by ARM", () => {
    let s = reduceCycle(initialCycle(3), { type: "NEXT" });
    expect(s).toMatchObject({ caseIdx: 1, phase: DOCK, mode: "stopped" });
    s = reduceCycle(s, { type: "ARM" });
    expect(s.mode).toBe("stopped");
  });

  it("next finishes the case on stage first, then steps; prev wraps", () => {
    let s = tick(reduceCycle(initialCycle(3), { type: "ARM" }), 2);
    s = reduceCycle(s, { type: "NEXT" });
    expect(s).toMatchObject({ caseIdx: 0, phase: DOCK, mode: "stopped" });
    s = reduceCycle(s, { type: "NEXT" });
    expect(s.caseIdx).toBe(1);
    s = reduceCycle(reduceCycle(s, { type: "PREV" }), { type: "PREV" });
    expect(s.caseIdx).toBe(2);
  });

  it("play from the finale replays; pause keeps the position", () => {
    let s = tick(reduceCycle(initialCycle(1), { type: "ARM" }), 5);
    expect(isFinale(s)).toBe(true);
    s = reduceCycle(s, { type: "PAUSE" });
    expect(isFinale(s)).toBe(true);
    s = reduceCycle(s, { type: "PLAY" });
    expect(s).toMatchObject({ caseIdx: 0, phase: NEED, mode: "playing", userPlayed: true });
  });
});
