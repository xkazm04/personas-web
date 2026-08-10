/**
 * The one mono console line under the field.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, the clock never
 * imports this.
 *
 * The line the section is actually making is the last one, and every beat
 * before it is there to earn it. Nothing here says she forgets, drops or
 * clears anything — what she has not reached is waiting, and the wording never
 * suggests otherwise.
 */

import { BEATS } from "./data";

/** Full line — one plain claim per act of the story. */
export function statusAt(phase: number): string {
  if (phase < BEATS.WAVE_AT) return "everything you have said to her, in order";
  if (phase < BEATS.HEAD_AT) return "more piles up than one sitting can hold";
  if (phase < BEATS.STOP_AT) return "she starts at the oldest, always";
  if (phase < BEATS.NOTE_AT) return "she stops when she is full, and marks the spot";
  if (phase < BEATS.GAP_AT) return "what she left is deferred, not lost";
  if (phase < BEATS.RESUME_AT) return "hours later, she starts again";
  if (phase < BEATS.STOP2_AT) return "right at the marker — no gap, no overlap";
  if (phase < BEATS.HOLD_AT) return "the same again, and she says so plainly";
  return "she always tells you what she left";
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(phase: number): string {
  if (phase < BEATS.WAVE_AT) return "everything you said, in order";
  if (phase < BEATS.HEAD_AT) return "more than one sitting holds";
  if (phase < BEATS.STOP_AT) return "oldest first, always";
  if (phase < BEATS.NOTE_AT) return "she marks where she stopped";
  if (phase < BEATS.GAP_AT) return "deferred, not lost";
  if (phase < BEATS.RESUME_AT) return "hours later, again";
  if (phase < BEATS.STOP2_AT) return "no gap, no overlap";
  if (phase < BEATS.HOLD_AT) return "the same again, said plainly";
  return "she tells you what she left";
}
