/**
 * Choreography for "Presence, evolved" as data. One tick = 1s, 28-tick loop:
 *
 *   0-5    talk     her voice rings the disc
 *   6-11   tasks    the five task dots fill along their arc
 *   12-17  drag     drop brackets snap round the disc: she sits where you put her
 *   18-23  summon   arrival rings: she answers from any app
 *   24-27  quiet    every callout rests; only her breathing remains
 *
 * The quiet beat is the tagline acted out: she says nothing when nothing
 * needs saying. Reduced motion pins INITIAL_TICK, mid "talk" - the voice ring
 * held at rest length, its callout lit - a complete, calm frame.
 */

export const TICK_MS = 1000;
export const BEAT = 6;
export const CALLOUT_COUNT = 4;
export const QUIET = 4;
export const CYCLE = BEAT * CALLOUT_COUNT + QUIET;
export const INITIAL_TICK = 3;

/** Which callout the clock is showing, or null in the quiet beat. */
export function beatAt(phase: number): number | null {
  const i = Math.floor(phase / BEAT);
  return i < CALLOUT_COUNT ? i : null;
}

/** Tick within the current beat (0..BEAT-1). */
export function subAt(phase: number): number {
  return phase % BEAT;
}

/** Task dots lit during the "tasks" beat: one per tick, all five by its end. */
export function dotsLit(phase: number): number {
  return beatAt(phase) === 1 ? Math.min(5, subAt(phase) + 1) : 0;
}
