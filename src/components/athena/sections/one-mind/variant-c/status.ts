/**
 * WHICH mono console line runs under the field at every beat of the loop.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, the clock never
 * imports this.
 *
 * The words themselves live in `src/i18n`; what is left here is only the
 * beat→line mapping. These stay pure phase functions — the copy arrives as a
 * parameter from the component, which is the thing that holds `t`.
 *
 * The copy is deliberately count-free about how many conversations are open —
 * the wide field carries six and the compact one four, and the sentence the
 * section is making ("however many, the same her") is true of both. The last
 * line is the page's last word in this voice, so it stops making a claim and
 * simply states the thing the whole page has been for.
 */

import type { Translations } from "@/i18n/en";
import { BEATS } from "./data";

/** Full line — one plain claim per act of the story. */
export function statusAt(
  phase: number,
  c: Translations["athenaPage"]["oneMind"]["status"],
): string {
  if (phase < BEATS.LIVE_AT) return c.live;
  if (phase < BEATS.ASK_AT) return c.open;
  if (phase < BEATS.REACH_AT) return c.asked;
  if (phase < BEATS.ROW_AT) return c.answers;
  if (phase < BEATS.CHORUS_AT) return c.sources;
  if (phase < BEATS.HOLD_AT) return c.oneVoice;
  return c.samePerson;
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(
  phase: number,
  c: Translations["athenaPage"]["oneMind"]["status"],
): string {
  if (phase < BEATS.LIVE_AT) return c.liveShort;
  if (phase < BEATS.ASK_AT) return c.openShort;
  if (phase < BEATS.REACH_AT) return c.askedShort;
  if (phase < BEATS.ROW_AT) return c.answersShort;
  if (phase < BEATS.CHORUS_AT) return c.sourcesShort;
  if (phase < BEATS.HOLD_AT) return c.oneVoiceShort;
  return c.samePersonShort;
}
