/**
 * WHICH mono console line runs under the field, and WHICH five-word caption
 * rides beside her, at every beat of the loop.
 *
 * Both read the same phase clock everything else does, but they are a
 * WORDING concern rather than a choreography one, so they live beside
 * `./data` instead of inside it. One-directional: this imports the clock,
 * the clock never imports this.
 *
 * The words themselves live in `src/i18n`; what is left here is only the
 * beat→line mapping. These stay pure phase functions — the copy arrives as
 * a parameter from the component, which is the thing that holds `t`.
 *
 * Deliberately count-free about the size of the portfolio — the wide field
 * carries twelve projects and the compact one eight, and the sentence the
 * section is making ("all of them, still in view") is true of both.
 */

import type { Translations } from "@/i18n/en";
import { BEATS } from "./data";

/** Full line — one plain claim per act of the story. */
export function statusAt(
  phase: number,
  c: Translations["athenaPage"]["portfolio"]["status"],
): string {
  if (phase < BEATS.SURVEY_AT) return c.view;
  if (phase < BEATS.SETTLE_AT) return c.checking;
  if (phase < BEATS.TRAVEL_AT) return c.needing;
  if (phase < BEATS.NEAR_AT) return c.travel;
  if (phase < BEATS.OPEN_AT) return c.quiet;
  if (phase < BEATS.LIFT_AT) return c.opened;
  if (phase < BEATS.HOME_AT) return c.back;
  return c.settled;
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(
  phase: number,
  c: Translations["athenaPage"]["portfolio"]["status"],
): string {
  if (phase < BEATS.SURVEY_AT) return c.viewShort;
  if (phase < BEATS.SETTLE_AT) return c.checkingShort;
  if (phase < BEATS.TRAVEL_AT) return c.needingShort;
  if (phase < BEATS.NEAR_AT) return c.travelShort;
  if (phase < BEATS.OPEN_AT) return c.quietShort;
  if (phase < BEATS.LIFT_AT) return c.openedShort;
  if (phase < BEATS.HOME_AT) return c.backShort;
  return c.settledShort;
}

/** What she says, where she is standing. Null wherever the art speaks for
 *  itself — a caption on every beat is a subtitle track, not narration. */
export function captionAt(
  phase: number,
  c: Translations["athenaPage"]["portfolio"]["caption"],
): string | null {
  if (phase >= BEATS.LIFT_AT) return null;
  if (phase >= BEATS.OPEN_AT) return c.opened;
  if (phase >= BEATS.NEAR_AT) return c.found;
  if (phase >= BEATS.MARK_AT) return c.worst;
  if (phase >= BEATS.SETTLE_AT) return c.surfaced;
  if (phase >= BEATS.SURVEY_AT) return c.survey;
  return null;
}
