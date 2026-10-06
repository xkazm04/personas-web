/**
 * WHICH mono console line runs under "One Day" at every beat. Pure: the copy
 * arrives as a parameter. The last line is the live section's own.
 */

import type { Translations } from "@/i18n/en";
import { BEATS } from "./data";

type Lab = Translations["athenaLab"]["oneMind"]["v2"]["status"];
type Live = Translations["athenaPage"]["oneMind"]["status"];

export function statusAt(phase: number, c: Lab, live: Live, short: boolean): string {
  const pick = (full: string, brief: string) => (short ? brief : full);
  if (phase < BEATS.KEPT_AT) return pick(c.morning, c.morningShort);
  if (phase < BEATS.MIDDAY_AT) return pick(c.kept, c.keptShort);
  if (phase < BEATS.PICKED_AT) return pick(c.midday, c.middayShort);
  if (phase < BEATS.EVENING_AT) return pick(c.picked, c.pickedShort);
  if (phase < BEATS.BOTH_AT) return pick(c.evening, c.eveningShort);
  if (phase < BEATS.HOLD_AT) return pick(c.both, c.bothShort);
  return pick(live.samePerson, live.samePersonShort);
}
