import { describe, expect, it } from "vitest";
import { SLAB_DURATION, SLAB_GAP, SLAB_STEP, slabDelay, slabY } from "./slabMotion";

const COUNT = 6;
const TOTAL = slabDelay(0, COUNT) + SLAB_DURATION + 0.1;
/** The previous stagger (top slab first), kept as the counter-arm. */
const topFirst = (i: number) => 0.15 + i * SLAB_STEP;

/**
 * Frames in which a lower slab sits ABOVE the slab drawn in front of it on
 * screen (draw order is fixed: upper slab in front), so it would pass through it.
 */
function inversions(delay: (i: number) => number) {
  let frames = 0;
  let bad = 0;
  // Probe at the stagger boundaries (either side) and a fine uniform grid.
  const probes = new Set<number>();
  for (let i = 0; i < COUNT; i++) for (const d of [-0.004, 0, 0.004]) probes.add(delay(i) + d);
  for (let t = 0; t < TOTAL; t += 0.004) probes.add(t);
  for (const t of probes) {
    frames++;
    for (let i = 0; i < COUNT - 1; i++) {
      const upper = i * SLAB_GAP + slabY(i, t, delay);
      const lower = (i + 1) * SLAB_GAP + slabY(i + 1, t, delay);
      if (lower < upper) {
        bad++;
        break;
      }
    }
  }
  return { frames, bad };
}

describe("slab explode keeps the fixed draw order in every in-between frame", () => {
  it("bottom-first stagger never lets a lower slab pass above an upper one", () => {
    const { frames, bad } = inversions((i) => slabDelay(i, COUNT));
    expect(frames).toBeGreaterThan(100); // an instrument that examined nothing proves nothing
    expect(bad).toBe(0);
  });

  it("the previous top-first stagger did invert (counter-arm: the probe can fail)", () => {
    expect(inversions(topFirst).bad).toBeGreaterThan(0);
  });
});
