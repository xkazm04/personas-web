/**
 * "The Watch" (hero v2) - geometry and choreography as data. No JSX.
 *
 * The iris is a 1000x1000 viewBox centred on her (500, 500). Five rings are
 * five streams of your day (inbox, calendar, builds, your agents, shared
 * docs), each turning at its own pace. Things happen on them all the time -
 * small blips of light that arrive and fade, and that she lets pass.
 *
 * One tick = 1s, 30-tick loop of three 10-tick moments:
 *
 *   0-4   silence  blips come and go; she watches; nothing is said
 *   5     flare    one blip on one ring matters - it flares amber
 *   6-9   speak    the iris narrows on it, a line of light joins it to her,
 *                  and she says one short sentence, then lets it go
 *
 * Silence is the longer half of every moment on purpose: the claim is that
 * she says nothing when nothing needs saying. Reduced motion pins
 * INITIAL_TICK, mid-sentence in the first moment - the whole story in one
 * still frame.
 */

export const VB = 1000;
export const C = VB / 2;
export const TICK_MS = 1000;
export const MOMENT = 10;
export const FLARE = 5;
export const CYCLE = MOMENT * 3;
export const INITIAL_TICK = 7;

export const CORE_R = 54;

/** Ring k (0..4) = athenaLab.hero.watch.streams[k]. */
export const RINGS = [
  { r: 148, dash: "1.4 7", spin: 70, dir: 1 },
  { r: 212, dash: "1 11", spin: 95, dir: -1 },
  { r: 280, dash: "2 9", spin: 120, dir: 1 },
  { r: 352, dash: "1 14", spin: 150, dir: -1 },
  { r: 428, dash: "1.4 10", spin: 190, dir: 1 },
] as const;

/** Decorative bezels: her inner ring and the far edge. */
export const INNER_R = 92;
export const OUTER_R = 492;

/** Each moment: which ring it happens on, at what ring-local angle (deg),
 *  and which athenaLab.hero.moments line she says. */
export const MOMENTS = [
  { ring: 1, angle: -38, line: 0 },
  { ring: 2, angle: 152, line: 1 },
  { ring: 0, angle: 62, line: 2 },
] as const;

export function stateAt(phase: number) {
  const m = Math.floor(phase / MOMENT) % MOMENTS.length;
  const s = phase % MOMENT;
  return {
    moment: MOMENTS[m],
    flaring: s >= FLARE,
    speaking: s > FLARE,
    /** Moments already spoken this loop, for the status line. */
    spoken: m + (s > FLARE ? 1 : 0),
  };
}

/** Deterministic 0..1 hash - blips must be a pure function of the tick. */
function rand(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export type Blip = { key: string; ring: number; angle: number; age: number; size: number };

/** The blips alive at `tick`: four born every tick, each living three. */
export function blipsAt(tick: number): Blip[] {
  const out: Blip[] = [];
  for (let age = 0; age < 3; age++) {
    const born = tick - age;
    if (born < 0) continue;
    for (let j = 0; j < 4; j++) {
      const seed = born * 13 + j * 7;
      out.push({
        key: `${born}-${j}`,
        ring: Math.floor(rand(seed) * RINGS.length),
        angle: Math.round(rand(seed + 1) * 360),
        age,
        size: 2.5 + rand(seed + 2) * 2.5,
      });
    }
  }
  return out;
}

/** A point on ring `r` at ring-local angle `deg`. */
export function onRing(r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: C + Math.cos(a) * r, y: C + Math.sin(a) * r };
}

/** Label anchors: one per ring, stepped out along a ray toward the upper left. */
export const LABEL_DEG = 204;
export const labelAt = (k: number) => onRing(RINGS[k].r, LABEL_DEG);

/** "Seen today" runs up through the loop, so the status line is alive. */
export const seenAt = (tick: number) => 1184 + tick * 3;
