/**
 * WHICH mono console line runs under "One Face" at every beat. Pure: the copy
 * arrives as a parameter. The first and last lines are the live section's own.
 */

import type { Translations } from "@/i18n/en";
import { BEATS, OPENS } from "./data";

type Lab = Translations["athenaLab"]["oneMind"]["v3"]["status"];
type Live = Translations["athenaPage"]["oneMind"]["status"];

export function statusAt(phase: number, c: Lab, live: Live, short: boolean): string {
  const pick = (full: string, brief: string) => (short ? brief : full);
  if (phase < BEATS.REGISTER_AT) return pick(live.live, live.liveShort);
  if (phase < OPENS[0].open) return pick(c.face, c.faceShort);
  if (phase < OPENS[0].reply) return pick(c.ask, c.askShort);
  if (phase < BEATS.CHORUS_AT) return pick(c.there, c.thereShort);
  return pick(live.samePerson, live.samePersonShort);
}
