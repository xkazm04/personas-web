/**
 * WHICH mono console line runs under the field — the only words in the scene
 * that are neither a place you opened, a piece of work, nor the dial's own
 * setting.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, never the reverse.
 *
 * The words themselves live in `src/i18n`; what is left here is only the
 * beat→line mapping. These stay pure phase functions — the copy arrives as a
 * parameter from the component, which is the thing that holds `t`.
 *
 * The voice is a person describing their own workshop, not a system reporting
 * a policy. It never says what she is prevented from doing; it says what you
 * decided, and then it lets the picture show that the decision held.
 */

import type { Translations } from "@/i18n/en";
import { BEATS } from "./data";

/** Full line — one plain claim per act of the story. */
export function statusAt(
  phase: number,
  c: Translations["athenaPage"]["workshop"]["status"],
): string {
  if (phase < BEATS.LINE_AT) return c.line;
  if (phase < BEATS.BEDS_AT) return c.draw;
  if (phase < BEATS.HER_AT) return c.places;
  if (phase < BEATS.FIRST_TURN) return c.inside;
  if (phase < BEATS.LAST_TURN) return c.turnUp;
  if (phase < BEATS.OUTSIDE_AT) return c.unmoved;
  if (phase < BEATS.STOP_AT) return c.stops;
  if (phase < BEATS.CALM_AT) return c.waits;
  return c.free;
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(
  phase: number,
  c: Translations["athenaPage"]["workshop"]["status"],
): string {
  if (phase < BEATS.LINE_AT) return c.lineShort;
  if (phase < BEATS.BEDS_AT) return c.drawShort;
  if (phase < BEATS.HER_AT) return c.placesShort;
  if (phase < BEATS.FIRST_TURN) return c.insideShort;
  if (phase < BEATS.LAST_TURN) return c.turnUpShort;
  if (phase < BEATS.OUTSIDE_AT) return c.unmovedShort;
  if (phase < BEATS.STOP_AT) return c.stopsShort;
  if (phase < BEATS.CALM_AT) return c.waitsShort;
  return c.freeShort;
}
