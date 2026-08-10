/**
 * Elapsed time, expressed as light.
 *
 * The one thing this section has to make a visitor FEEL is the gap between
 * handing work over and coming back to it finished. No clock faces, no
 * timeline, no literal sky: the field simply gets later. Late afternoon warms
 * the ground while you are still here, the warmth drains as you leave, the
 * field goes deep and cool while the work runs on without you, and it comes
 * back up cool-bright as you return.
 *
 * Three brand tints carry the whole arc — amber (late), purple (deep), cyan
 * (morning) — crossfading against each other, plus one drifting light centre
 * that rides high through the night and low at either end. Nothing here is a
 * raw hex value; every colour is mixed from the theme's own brand tokens by
 * the components that consume these numbers.
 *
 * The clock ticks once every 900ms, so these are 26 samples of a curve rather
 * than a curve. The consuming layers carry a CSS transition longer than one
 * tick, which is what turns the samples back into a continuous drift.
 */

export interface FieldLight {
  /** Late-afternoon warmth. */
  warm: number;
  /** Depth of the night. */
  deep: number;
  /** The cool brightness of coming back. */
  dawn: number;
  /** Light centre, percent across the field. */
  x: number;
  /** Light centre, percent down the field. */
  y: number;
  /** How strongly the ground catches the light. */
  ground: number;
}

interface LightKey extends FieldLight {
  at: number;
}

/**
 * The arc, keyed to the story beats rather than to clock hours:
 *   0   you are still here, and it is late
 *   7   you step away; the warmth goes with you
 *   13  the one that needs you starts waiting — the field is deep by now
 *   16  the deepest point, and nobody has woken you
 *   20  you come back to a field already lifting
 *   25  full morning, tilting toward the next day so the loop closes gently
 */
const KEYS: readonly LightKey[] = [
  { at: 0, warm: 0.9, deep: 0.08, dawn: 0.0, x: 76, y: 66, ground: 0.36 },
  { at: 6, warm: 0.82, deep: 0.16, dawn: 0.0, x: 70, y: 68, ground: 0.34 },
  { at: 9, warm: 0.44, deep: 0.5, dawn: 0.0, x: 60, y: 56, ground: 0.24 },
  { at: 13, warm: 0.14, deep: 0.82, dawn: 0.0, x: 50, y: 38, ground: 0.15 },
  { at: 16, warm: 0.05, deep: 1.0, dawn: 0.03, x: 44, y: 31, ground: 0.11 },
  { at: 19, warm: 0.16, deep: 0.58, dawn: 0.32, x: 36, y: 42, ground: 0.19 },
  { at: 22, warm: 0.2, deep: 0.22, dawn: 0.82, x: 28, y: 58, ground: 0.3 },
  { at: 25, warm: 0.42, deep: 0.1, dawn: 0.6, x: 22, y: 64, ground: 0.34 },
] as const;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The field's light at a phase tick. Pure, deterministic, hex-free. */
export function lightAt(phase: number): FieldLight {
  const first = KEYS[0];
  if (phase <= first.at) return first;
  for (let i = 1; i < KEYS.length; i += 1) {
    const next = KEYS[i];
    if (phase > next.at) continue;
    const prev = KEYS[i - 1];
    const t = (phase - prev.at) / (next.at - prev.at);
    return {
      warm: lerp(prev.warm, next.warm, t),
      deep: lerp(prev.deep, next.deep, t),
      dawn: lerp(prev.dawn, next.dawn, t),
      x: lerp(prev.x, next.x, t),
      y: lerp(prev.y, next.y, t),
      ground: lerp(prev.ground, next.ground, t),
    };
  }
  return KEYS[KEYS.length - 1];
}

/**
 * How dark the field itself has gone. Drives the veil that sits under the
 * work lights, so the sky deepens without ever dimming the work — the lights
 * get brighter against it, which is the point: it kept going in the dark.
 */
export function duskAt(phase: number): number {
  const { deep, warm, dawn } = lightAt(phase);
  return Math.min(0.62, deep * 0.62 * (1 - Math.max(warm, dawn) * 0.55));
}
