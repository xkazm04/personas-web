/**
 * The one mono console line under the field, and the five-word captions
 * that ride beside her.
 *
 * Both read the same phase clock everything else does, but they are a
 * WORDING concern rather than a choreography one, so they live beside
 * `./data` instead of inside it. One-directional: this imports the clock,
 * the clock never imports this.
 *
 * Deliberately count-free about the size of the portfolio — the wide field
 * carries twelve projects and the compact one eight, and the sentence the
 * section is making ("all of them, still in view") is true of both.
 */

import type { Translations } from "@/i18n/en";
import { BEATS } from "./data";

/** Full line — one plain claim per act of the story. */
export function statusAt(phase: number): string {
  if (phase < BEATS.SURVEY_AT) return "every project you own, in view";
  if (phase < BEATS.SETTLE_AT) return "checking all of them at once";
  if (phase < BEATS.TRAVEL_AT) return "3 need you · worst first";
  if (phase < BEATS.NEAR_AT) return "going straight to the worst one";
  if (phase < BEATS.OPEN_AT) return "payments api · quiet for 11 days";
  if (phase < BEATS.LIFT_AT) return "opened the thing that fixes it";
  if (phase < BEATS.HOME_AT) return "back out to the whole picture";
  return "1 handled · 2 still waiting";
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(phase: number): string {
  if (phase < BEATS.SURVEY_AT) return "all of them, in view";
  if (phase < BEATS.SETTLE_AT) return "checking all of them";
  if (phase < BEATS.TRAVEL_AT) return "3 need you";
  if (phase < BEATS.NEAR_AT) return "worst one first";
  if (phase < BEATS.OPEN_AT) return "quiet for 11 days";
  if (phase < BEATS.LIFT_AT) return "opened for you";
  if (phase < BEATS.HOME_AT) return "back out";
  return "1 handled · 2 waiting";
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
