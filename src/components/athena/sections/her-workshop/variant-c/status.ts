/**
 * The one mono console line under the field — the only words in the scene that
 * are neither a place you opened, a piece of work, nor the dial's own setting.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, never the reverse.
 *
 * The voice is a person describing their own workshop, not a system reporting
 * a policy. It never says what she is prevented from doing; it says what you
 * decided, and then it lets the picture show that the decision held.
 */

import { BEATS } from "./data";

/** Full line — one plain claim per act of the story. */
export function statusAt(phase: number): string {
  if (phase < BEATS.LINE_AT) return "the line comes first";
  if (phase < BEATS.BEDS_AT) return "you draw it once";
  if (phase < BEATS.HER_AT) return "these are the places you opened";
  if (phase < BEATS.FIRST_TURN) return "she works inside it — all of it";
  if (phase < BEATS.LAST_TURN) return "turn it up — more at once, fewer questions";
  if (phase < BEATS.OUTSIDE_AT) return "the line doesn't move with it";
  if (phase < BEATS.STOP_AT) return "she stops where you stopped her";
  if (phase < BEATS.CALM_AT) return "and waits — that one is yours";
  return "as free as you like, inside your lines";
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(phase: number): string {
  if (phase < BEATS.LINE_AT) return "the line comes first";
  if (phase < BEATS.BEDS_AT) return "you draw it once";
  if (phase < BEATS.HER_AT) return "the places you opened";
  if (phase < BEATS.FIRST_TURN) return "she works inside";
  if (phase < BEATS.LAST_TURN) return "turn it up — more at once";
  if (phase < BEATS.OUTSIDE_AT) return "the line doesn't move";
  if (phase < BEATS.STOP_AT) return "she stops at the line";
  if (phase < BEATS.CALM_AT) return "that one is yours";
  return "free, inside your lines";
}
