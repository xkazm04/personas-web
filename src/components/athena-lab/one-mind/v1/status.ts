/**
 * WHICH mono console line runs under the field at every beat. Pure: the copy
 * arrives as a parameter, the clock is the only import. The words are the
 * live section's own, already shipped in fourteen languages.
 */

import type { Translations } from "@/i18n/en";
import { BEATS } from "./data";

type Status = Translations["athenaPage"]["oneMind"]["status"];

export function statusAt(phase: number, c: Status, short: boolean): string {
  const pick = (full: string, brief: string) => (short ? brief : full);
  if (phase < BEATS.LIVE_AT) return pick(c.live, c.liveShort);
  if (phase < BEATS.ASK_AT) return pick(c.open, c.openShort);
  if (phase < BEATS.REACH_AT) return pick(c.asked, c.askedShort);
  if (phase < BEATS.ROW_AT) return pick(c.answers, c.answersShort);
  if (phase < BEATS.CHORUS_AT) return pick(c.sources, c.sourcesShort);
  if (phase < BEATS.HOLD_AT) return pick(c.oneVoice, c.oneVoiceShort);
  return pick(c.samePerson, c.samePersonShort);
}
