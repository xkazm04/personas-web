/**
 * Pure core of the scripted-demo engine. A run is a script plus a clock; every
 * frame is `frameAt(script, t)`, so pause, seek, speed and tests need no timers.
 */

export interface Beat {
  id: string;
  /** Virtual ms at which the beat becomes current. */
  start: number;
  /** Virtual ms the beat takes to settle; `settled` flips when it elapses. */
  duration: number;
}

export interface RunScript {
  /** Beats in ascending `start` order. */
  beats: readonly Beat[];
}

export interface Frame {
  /** Index of the latest started beat, or -1 before the first. */
  index: number;
  /** Virtual ms since that beat started (0 when index is -1). */
  elapsed: number;
  /** 0..1 through the current beat (0 when index is -1). */
  progress: number;
  /** The current beat has run its full duration. */
  settled: boolean;
  /** Every beat has settled. */
  finished: boolean;
}

/** Virtual ms at which the last beat settles. */
export function scriptEnd(script: RunScript): number {
  return script.beats.reduce((end, b) => Math.max(end, b.start + b.duration), 0);
}

export function frameAt(script: RunScript, t: number): Frame {
  const { beats } = script;
  let index = -1;
  for (let i = 0; i < beats.length && beats[i].start <= t; i++) index = i;
  const finished = t >= scriptEnd(script);
  if (index < 0) return { index, elapsed: 0, progress: 0, settled: false, finished };
  const b = beats[index];
  const elapsed = t - b.start;
  const progress = b.duration <= 0 ? 1 : Math.min(1, elapsed / b.duration);
  return { index, elapsed, progress, settled: progress >= 1, finished };
}

/** The next virtual time (> t) at which the frame's discrete fields change, or null. */
export function nextBoundary(script: RunScript, t: number): number | null {
  let next: number | null = null;
  for (const b of script.beats) {
    for (const edge of [b.start, b.start + b.duration]) {
      if (edge > t && (next === null || edge < next)) next = edge;
    }
  }
  return next;
}
