import { describe, expect, it } from "vitest";
import { TourCueClock } from "./tour-cue-clock";

function setup(atMs: number[]) {
  const log: number[] = [];
  const clock = new TourCueClock(atMs.map((t) => ({ atMs: t, fire: () => log.push(t) })));
  return { clock, log };
}

describe("TourCueClock", () => {
  it("fires audio-clocked cues only as currentTime passes them, once each", () => {
    const { clock, log } = setup([2500, 5000]);
    clock.tick({ playing: true, nowMs: 0, audioMs: 0 });
    clock.tick({ playing: true, nowMs: 3000, audioMs: 2600 });
    clock.tick({ playing: true, nowMs: 3016, audioMs: 2616 });
    expect(log).toEqual([2500]);
    clock.tick({ playing: true, nowMs: 6000, audioMs: 5100 });
    expect(log).toEqual([2500, 5000]);
  });

  it("counts audio start latency: wall time before the clip plays does not advance cues", () => {
    const { clock, log } = setup([1000]);
    // 2 s of wall time elapse while the clip has not produced a sample yet.
    for (let t = 0; t <= 2000; t += 100) clock.tick({ playing: true, nowMs: t, audioMs: 0 });
    expect(log).toEqual([]);
    clock.tick({ playing: true, nowMs: 2100, audioMs: 1100 });
    expect(log).toEqual([1000]);
  });

  it("freezes while paused, even when wall time keeps moving", () => {
    const { clock, log } = setup([5000]);
    clock.tick({ playing: true, nowMs: 0, audioMs: 3000 });
    // Paused 3 s into the step: the audio clock stands still, cue at 5 s stays.
    for (let t = 100; t <= 10000; t += 100) clock.tick({ playing: false, nowMs: t, audioMs: 3000 });
    expect(log).toEqual([]);
    clock.tick({ playing: true, nowMs: 10100, audioMs: 5000 });
    expect(log).toEqual([5000]);
  });

  it("does not fire a due cue while paused", () => {
    const { clock, log } = setup([1000]);
    clock.tick({ playing: false, nowMs: 0, audioMs: 1500 });
    expect(log).toEqual([]);
    clock.tick({ playing: true, nowMs: 16, audioMs: 1500 });
    expect(log).toEqual([1000]);
  });

  it("drives silent steps from a virtual clock that only runs while playing", () => {
    const { clock, log } = setup([1000, 2000]);
    clock.tick({ playing: true, nowMs: 0, audioMs: null });
    clock.tick({ playing: true, nowMs: 900, audioMs: null });
    expect(log).toEqual([]);
    clock.tick({ playing: false, nowMs: 1900, audioMs: null }); // 1 s paused: ignored
    clock.tick({ playing: false, nowMs: 5000, audioMs: null });
    expect(log).toEqual([]);
    clock.tick({ playing: true, nowMs: 5200, audioMs: null }); // 900 + 200 = 1100
    expect(log).toEqual([1000]);
    clock.tick({ playing: true, nowMs: 6200, audioMs: null }); // 2100
    expect(log).toEqual([1000, 2000]);
  });

  it("fires several due cues in order in one sample", () => {
    const { clock, log } = setup([100, 200, 300]);
    clock.tick({ playing: true, nowMs: 0, audioMs: 1000 });
    expect(log).toEqual([100, 200, 300]);
  });
});
