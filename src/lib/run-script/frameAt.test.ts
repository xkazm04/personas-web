import { describe, expect, it } from "vitest";
import { frameAt, nextBoundary, scriptEnd, type RunScript } from "./frameAt";

const script: RunScript = {
  beats: [
    { id: "a", start: 500, duration: 700 },
    { id: "b", start: 1200, duration: 300 },
  ],
};

describe("frameAt", () => {
  it("is before the first beat at t=0", () => {
    expect(frameAt(script, 0)).toMatchObject({ index: -1, progress: 0, settled: false, finished: false });
  });
  it("reports progress mid-beat", () => {
    const f = frameAt(script, 850);
    expect(f.index).toBe(0);
    expect(f.progress).toBeCloseTo(0.5);
    expect(f.settled).toBe(false);
  });
  it("settles a beat before a gap ends", () => {
    const gapped: RunScript = { beats: [{ id: "a", start: 0, duration: 100 }, { id: "b", start: 300, duration: 100 }] };
    expect(frameAt(gapped, 200)).toMatchObject({ index: 0, settled: true, finished: false });
  });
  it("switches beat exactly on the boundary", () => {
    expect(frameAt(script, 1200)).toMatchObject({ index: 1, elapsed: 0, settled: false });
  });
  it("finishes at the end and stays there", () => {
    expect(scriptEnd(script)).toBe(1500);
    expect(frameAt(script, 1500)).toMatchObject({ index: 1, settled: true, finished: true });
    expect(frameAt(script, 99999)).toMatchObject({ index: 1, finished: true });
  });
  it("seeks to the same frame regardless of path (pure)", () => {
    expect(frameAt(script, 1000)).toEqual(frameAt(script, 1000));
  });
});

describe("nextBoundary", () => {
  it("walks every start and settle edge in order", () => {
    const edges: number[] = [];
    for (let t: number | null = 0; t !== null; t = nextBoundary(script, t)) if (t > 0) edges.push(t);
    expect(edges).toEqual([500, 1200, 1500]);
  });
  it("is null past the end", () => {
    expect(nextBoundary(script, 1500)).toBeNull();
  });
});
