/**
 * The one mono console line under the field.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, the clock never
 * imports this.
 *
 * Deliberately count-free about how many conversations are open — the wide
 * field carries four and the compact one three, and the claim the section is
 * making ("as many as you like, and she is the same in all of them") is true
 * of both.
 */

import { BEATS } from "./data";

/** Full line — one plain claim per act of the story. */
export function statusAt(phase: number): string {
  if (phase < BEATS.THREADS_AT) return "as many conversations as you like";
  if (phase < BEATS.LEARN_AT) return "different subjects · the same mind";
  if (phase < BEATS.LIFT_AT) return "you tell one of them something new";
  if (phase < BEATS.SPREAD_AT) return "kept once, for all of them";
  if (phase < BEATS.ASK_AT) return "every conversation has it already";
  if (phase < BEATS.ANSWER_AT) return "asked here — never told here";
  if (phase < BEATS.ONE_AT) return "answered with what you said elsewhere";
  return "one mind, in every conversation";
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(phase: number): string {
  if (phase < BEATS.THREADS_AT) return "as many as you like";
  if (phase < BEATS.LEARN_AT) return "the same mind";
  if (phase < BEATS.LIFT_AT) return "you tell her something";
  if (phase < BEATS.SPREAD_AT) return "kept for all of them";
  if (phase < BEATS.ASK_AT) return "they all have it";
  if (phase < BEATS.ANSWER_AT) return "never told here";
  if (phase < BEATS.ONE_AT) return "answered anyway";
  return "one mind, everywhere";
}
