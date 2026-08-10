/**
 * The one mono console line under the field, and the five-word captions that
 * ride beside her.
 *
 * Both read the same phase clock everything else does, but they are a WORDING
 * concern rather than a choreography one, so they live beside `./data` instead
 * of inside it. One-directional: this imports the clock, the clock never
 * imports this.
 *
 * Two claims are carried here rather than in the art because the art cannot
 * make them: that a pass costs a fraction of an ordinary reply, and that
 * nothing was thrown away. Everything else the picture already says.
 */

import { BEATS } from "./data";
import { COPY } from "./copy";

/** Full line — one plain claim per beat of the rhythm. */
export function statusAt(phase: number): string {
  if (phase < BEATS.QUIET_AT) return "your talk collects · nothing runs yet";
  if (phase < BEATS.QUIET_END) return "a quiet stretch · nothing runs";
  if (phase < BEATS.CROSS_AT) return "enough is piling up";
  if (phase < BEATS.REACH_AT) return "it starts on its own";
  if (phase < BEATS.SINK_AT) return "the oldest part first";
  if (phase < BEATS.KEEP_AT) return "many become few · cheaper than one reply";
  if (phase < BEATS.DEFER_AT) return "every one keeps where it came from";
  if (phase < BEATS.NOTE_AT) return "the rest waits for next time";
  if (phase < BEATS.REFILL_AT) return "kept 4 · threw nothing away";
  return "quiet again · filling for next time";
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(phase: number): string {
  if (phase < BEATS.QUIET_AT) return "collecting · nothing runs";
  if (phase < BEATS.QUIET_END) return "quiet · nothing runs";
  if (phase < BEATS.CROSS_AT) return "enough is piling up";
  if (phase < BEATS.REACH_AT) return "starts on its own";
  if (phase < BEATS.SINK_AT) return "oldest first";
  if (phase < BEATS.KEEP_AT) return "many become few";
  if (phase < BEATS.DEFER_AT) return "each keeps its source";
  if (phase < BEATS.NOTE_AT) return "the rest waits";
  if (phase < BEATS.REFILL_AT) return "kept 4 · lost nothing";
  return "quiet again · filling";
}

/** What she says, where she is floating. Null wherever the art speaks for
 *  itself — a caption on every beat is a subtitle track, not narration. */
export function captionAt(phase: number): string | null {
  const c = COPY.caption;
  if (phase >= BEATS.REFILL_AT) return null;
  if (phase >= BEATS.NOTE_AT) return c.note;
  if (phase >= BEATS.DEFER_AT) return c.defer;
  if (phase >= BEATS.KEEP_AT) return c.keep;
  if (phase >= BEATS.SINK_AT) return c.settle;
  if (phase >= BEATS.REACH_AT) return c.reach;
  if (phase >= BEATS.CROSS_AT) return c.cross;
  if (phase >= BEATS.QUIET_AT && phase < BEATS.QUIET_END) return c.quiet;
  return null;
}
