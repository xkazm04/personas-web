/**
 * "Quiet until it matters" (/athena section 2, born as hero lab v3 "The
 * Quiet Line") - choreography as data. No JSX.
 *
 * Your day streams right to left along one long line of light; Athena is the
 * bright point at its centre ("now"). Every event crosses her. Most she lets
 * pass - newsletters, green builds, calendar syncs - and the line stays flat.
 * Three times a loop something matters: it arrives amber, she takes it in,
 * and the line swells into her voice for one short sentence.
 *
 * One tick = 1s, 30-tick loop of three 10-tick moments. Within a moment:
 *
 *   0-4   quiet    passing events cross her; the line stays flat
 *   5     arrive   the event that matters reaches her and is taken in
 *   6-9   speak    the line becomes a voice; one sentence, then quiet
 *
 * Events take TRAVEL ticks to cross the whole line, so each one is at the
 * centre TRAVEL/2 ticks after it is born. Ages wrap modulo the loop, so the
 * stream never empties at the top of a loop. Reduced motion pins
 * INITIAL_TICK - mid-sentence, the passing events caught on the line.
 */

export const TICK_MS = 1000;
export const MOMENT = 10;
export const ARRIVE = 5;
export const CYCLE = MOMENT * 3;
export const INITIAL_TICK = 7;
export const TRAVEL = 8;

export type StreamEvent = { id: string; born: number; kind: "pass" | "matter"; copy: number };

/** Per moment m: the event that matters (reaches her at s=5), and two that pass
 *  (born late in the moment, so they cross her in the next moment's quiet). */
export const EVENTS: StreamEvent[] = [0, 1, 2].flatMap((m) => [
  { id: `m${m}`, born: m * MOMENT + ARRIVE - TRAVEL / 2, kind: "matter" as const, copy: m },
  { id: `p${m}a`, born: m * MOMENT + 6, kind: "pass" as const, copy: m * 2 },
  { id: `p${m}b`, born: m * MOMENT + 8, kind: "pass" as const, copy: m * 2 + 1 },
]);

const wrap = (n: number) => ((n % CYCLE) + CYCLE) % CYCLE;

/** How far an event has travelled, 0 (right edge) .. 1 (left edge); null when
 *  it is not on the line. A matter event stops at her (0.5) and is taken in. */
export function travelAt(e: StreamEvent, phase: number): number | null {
  const age = wrap(phase - e.born);
  if (e.kind === "matter") return age <= TRAVEL / 2 ? age / TRAVEL : null;
  return age <= TRAVEL ? age / TRAVEL : null;
}

export function momentAt(phase: number) {
  const m = Math.floor(phase / MOMENT) % 3;
  const s = phase % MOMENT;
  return { m, arriving: s === ARRIVE, speaking: s > ARRIVE, spoken: 4 + m + (s > ARRIVE ? 1 : 0) };
}

export const eventsAt = (phase: number) => 1184 + phase * 3;

/** Voice bars: a gaussian envelope around her, so the swell reads as speech
 *  coming out of one point rather than an equaliser. */
export const BARS = Array.from({ length: 88 }, (_, i) => {
  const x = (i - 43.5) / 43.5;
  return { env: Math.exp(-x * x * 3.2), jitter: 0.55 + 0.45 * Math.abs(Math.sin(i * 2.31)) };
});

/** The river of small things: lanes of tiny lights drifting along the line,
 *  denser and brighter close to it. `f` is the lane's offset from the line as
 *  a fraction of the voice height, so the river scales with the stage. */
export const LANES = Array.from({ length: 22 }, (_, i) => {
  const side = i % 2 === 0 ? -1 : 1;
  const rank = Math.floor(i / 2); // 0 = nearest the line
  return {
    f: side * (0.06 + rank * 0.08 + (i % 3) * 0.012),
    period: 38 + ((i * 17) % 41),
    size: rank < 3 ? 2.2 : 1.6,
    alpha: Math.max(12, 62 - rank * 5),
    seconds: 3.2 + ((i * 7) % 9) * 0.55,
  };
});
