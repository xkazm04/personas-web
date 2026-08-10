/**
 * The one mono console line under the field.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, the clock never
 * imports this.
 *
 * Deliberately count-free about how many conversations are open — the wide
 * field carries six and the compact one four, and the sentence the section is
 * making ("however many, the same her") is true of both. The last line is the
 * page's last word in this voice, so it stops making a claim and simply
 * states the thing the whole page has been for.
 */

import { BEATS } from "./data";

/** Full line — one plain claim per act of the story. */
export function statusAt(phase: number): string {
  if (phase < BEATS.LIVE_AT) return "every conversation you have going";
  if (phase < BEATS.ASK_AT) return "all of them open at the same time";
  if (phase < BEATS.REACH_AT) return "you asked in one of them";
  if (phase < BEATS.ROW_AT) return "she answers from everything she knows";
  if (phase < BEATS.CHORUS_AT) return "every line, and where it came from";
  if (phase < BEATS.HOLD_AT) return "one voice — you never hear two at once";
  return "the same person, in all of them";
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(phase: number): string {
  if (phase < BEATS.LIVE_AT) return "all your conversations";
  if (phase < BEATS.ASK_AT) return "all open at once";
  if (phase < BEATS.REACH_AT) return "you asked here";
  if (phase < BEATS.ROW_AT) return "she answers from all of it";
  if (phase < BEATS.CHORUS_AT) return "every line, and its source";
  if (phase < BEATS.HOLD_AT) return "one voice, never two";
  return "the same person, in all of them";
}
