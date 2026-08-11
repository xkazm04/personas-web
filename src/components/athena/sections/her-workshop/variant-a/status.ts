/**
 * The one mono console line under the wall — the only words in the scene that
 * are neither a screen's name, its output, nor its verdict.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, never the reverse.
 *
 * Three things it is careful about. It never says the screens tell her
 * anything — she reads them, which is the actual direction the information
 * travels. It never suggests she started any of this work: it is already
 * running when the section opens and she is watching it, not launching it. And
 * it never treats a quiet screen as a stuck one — the whole middle of the
 * section exists to say that a screen still writing is a screen still working.
 */

import { BEATS } from "./data";

/** Full line — one plain claim per act of the story. */
export function statusAt(phase: number): string {
  if (phase < BEATS.ALIVE_AT) return "everything you have running, on one screen";
  if (phase < BEATS.LOOK_AT) return "all of it already going, none of it started here";
  if (phase < BEATS.ANSWER_AT) return "one pass over every one of them";
  if (phase < BEATS.NARROW_AT) return "she reads them all in the same breath";
  if (phase < BEATS.SPLIT_AT) return "still writing means still working";
  if (phase < BEATS.ABSTAIN_AT) return "nothing on screen is not one answer";
  if (phase < BEATS.FIRST_OUT) return "and when she cannot tell, she says so";
  if (phase < BEATS.REPORT_AT) return "three pieces of one job, finishing apart";
  if (phase < BEATS.CALM_AT) return "you hear once, when the last one lands";
  return "three want you — the rest is still running";
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(phase: number): string {
  if (phase < BEATS.ALIVE_AT) return "everything running, one screen";
  if (phase < BEATS.LOOK_AT) return "all of it already going";
  if (phase < BEATS.ANSWER_AT) return "one pass over all of them";
  if (phase < BEATS.NARROW_AT) return "read in the same breath";
  if (phase < BEATS.SPLIT_AT) return "still writing, still working";
  if (phase < BEATS.ABSTAIN_AT) return "quiet is not one answer";
  if (phase < BEATS.FIRST_OUT) return "she says when she cannot tell";
  if (phase < BEATS.REPORT_AT) return "one job, three pieces";
  if (phase < BEATS.CALM_AT) return "you hear once, at the end";
  return "three want you";
}
