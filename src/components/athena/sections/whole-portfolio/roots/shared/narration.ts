/**
 * The mono status line and Athena's five-word captions, as pure phase
 * functions over a variant's own beat table. Every word comes from the
 * translated `athenaPage.portfolio` copy (14 locales); only the beat->line
 * mapping lives here, so the three lab directions narrate the same story in
 * the same words on their own clocks.
 */

import type { Translations } from "@/i18n/en";

type Copy = Translations["athenaPage"]["portfolio"];

export interface Beats {
  SURVEY_AT: number;
  SETTLE_AT: number;
  MARK_AT: number;
  TRAVEL_AT: number;
  NEAR_AT: number;
  OPEN_AT: number;
  LIFT_AT: number;
  HOME_AT: number;
}

/** One plain claim per act of the story - full and compact. */
export function statusAt(phase: number, b: Beats, c: Copy["status"]): { full: string; short: string } {
  if (phase < b.SURVEY_AT) return { full: c.view, short: c.viewShort };
  if (phase < b.SETTLE_AT) return { full: c.checking, short: c.checkingShort };
  if (phase < b.TRAVEL_AT) return { full: c.needing, short: c.needingShort };
  if (phase < b.NEAR_AT) return { full: c.travel, short: c.travelShort };
  if (phase < b.OPEN_AT) return { full: c.quiet, short: c.quietShort };
  if (phase < b.LIFT_AT) return { full: c.opened, short: c.openedShort };
  if (phase < b.HOME_AT) return { full: c.back, short: c.backShort };
  return { full: c.settled, short: c.settledShort };
}

/** What she says where she stands. Null wherever the art speaks for itself. */
export function captionAt(phase: number, b: Beats, c: Copy["caption"]): string | null {
  if (phase >= b.LIFT_AT) return null;
  if (phase >= b.OPEN_AT) return c.opened;
  if (phase >= b.NEAR_AT) return c.found;
  if (phase >= b.MARK_AT) return c.worst;
  if (phase >= b.SETTLE_AT) return c.surfaced;
  if (phase >= b.SURVEY_AT) return c.survey;
  return null;
}
