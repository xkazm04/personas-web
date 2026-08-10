/**
 * The one mono console line under the field — the only words in this section
 * that are neither the title trio, a project's name, nor the report.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, never the reverse.
 *
 * It is written in the second person on purpose. The section is about a
 * feeling — that you cannot hold six things in your head at once and should
 * not have to — and the status line is the only place the scene is allowed to
 * say that out loud.
 */

import { BEATS } from "./data";

/** Full line — one plain claim per act. */
export function statusAt(phase: number): string {
  if (phase < BEATS.AWAY_AT) return "you built this one and it worked";
  if (phase < BEATS.DRIFT_FROM + 2) return "then you were needed somewhere else";
  if (phase < BEATS.NOTICE_AT) return "nothing breaks. it just quietly slides";
  if (phase < BEATS.SURFACE_AT) return "Athena never stopped looking at it";
  if (phase < BEATS.DIMS_AT) return "the worst one, brought to you first";
  if (phase < BEATS.REPAIR_AT) return "exactly what she found, in plain words";
  if (phase < BEATS.WATCH_AT) return "caught long before it got expensive";
  return "you never had to remember to check";
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(phase: number): string {
  if (phase < BEATS.AWAY_AT) return "it worked";
  if (phase < BEATS.DRIFT_FROM + 2) return "you moved on";
  if (phase < BEATS.NOTICE_AT) return "it quietly slid";
  if (phase < BEATS.SURFACE_AT) return "she was looking";
  if (phase < BEATS.DIMS_AT) return "worst one first";
  if (phase < BEATS.REPAIR_AT) return "what she found";
  if (phase < BEATS.WATCH_AT) return "caught early";
  return "no need to check";
}
