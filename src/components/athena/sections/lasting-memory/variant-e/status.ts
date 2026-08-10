/**
 * The one mono console line under the field.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, the clock never
 * imports this.
 *
 * Two things it is careful about. It never says she forgets, drops or clears
 * anything — a day that has gone quiet is still on the field, and the wording
 * never suggests otherwise. And it never says she does this on a schedule: the
 * quiet day is narrated as a day that did not earn a night, because that is
 * what it is.
 */

import { BEATS, QUIET_DAY, RECALL_INTO, dayStart, nightOf } from "./data";
import { DAYS } from "./layout";

/** Full line — one plain claim per act of the habit. */
export function statusAt(phase: number): string {
  if (phase < BEATS.DAY0_AT) return "one ordinary day of working together";
  if (phase < nightOf(0)) return "everything you two get through, building up";
  if (phase < dayStart(1)) return "enough has built up — she sleeps on it";
  if (phase < nightOf(1)) return "she wakes with a little more than she had";
  if (phase < dayStart(QUIET_DAY)) return "another night, another thing worth keeping";
  if (phase < nightOf(QUIET_DAY)) return "a quiet day — barely anything said";
  if (phase < dayStart(RECALL_INTO)) return "not enough to sleep on, so she doesn't";
  if (phase < BEATS.RECALL_AT) return "nothing is lost — that day is still there";
  if (phase < nightOf(RECALL_INTO)) return "and the first thing she kept is in use today";
  if (phase < dayStart(DAYS - 1)) return "she sleeps on this one too";
  if (phase < nightOf(DAYS - 1)) return "it costs her less than one ordinary reply";
  if (phase < BEATS.HOLD_AT) return "one more night, one more thing she carries";
  return "the longer you work together, the more she carries";
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(phase: number): string {
  if (phase < BEATS.DAY0_AT) return "one ordinary day";
  if (phase < nightOf(0)) return "the day's talk, building up";
  if (phase < dayStart(1)) return "she sleeps on it";
  if (phase < nightOf(1)) return "a little more than before";
  if (phase < dayStart(QUIET_DAY)) return "another thing worth keeping";
  if (phase < nightOf(QUIET_DAY)) return "a quiet day";
  if (phase < dayStart(RECALL_INTO)) return "not enough to sleep on";
  if (phase < BEATS.RECALL_AT) return "still there, nothing lost";
  if (phase < nightOf(RECALL_INTO)) return "day one's, in use today";
  if (phase < dayStart(DAYS - 1)) return "she sleeps on this one too";
  if (phase < nightOf(DAYS - 1)) return "less than one reply";
  if (phase < BEATS.HOLD_AT) return "one more thing she carries";
  return "the more she carries";
}
