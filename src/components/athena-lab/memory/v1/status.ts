/**
 * WHICH mono console line runs under the field at every beat of the habit.
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
 * Two things the copy is careful about, for whoever translates it. It never
 * says she forgets, drops or clears anything — a day that has gone quiet is
 * still on the field, and the wording never suggests otherwise. And it never
 * says she does this on a schedule: the quiet day is narrated as a day that
 * did not earn a night, because that is what it is.
 */

import type { Translations } from "@/i18n/en";
import { BEATS, QUIET_DAY, RECALL_INTO, dayStart, nightOf } from "./data";
import { DAYS } from "./layout";

/** Full line — one plain claim per act of the habit. */
export function statusAt(
  phase: number,
  c: Translations["athenaPage"]["memory"]["status"],
): string {
  if (phase < BEATS.DAY0_AT) return c.day;
  if (phase < nightOf(0)) return c.building;
  if (phase < dayStart(1)) return c.sleeps;
  if (phase < nightOf(1)) return c.wakes;
  if (phase < dayStart(QUIET_DAY)) return c.keeping;
  if (phase < nightOf(QUIET_DAY)) return c.quiet;
  if (phase < dayStart(RECALL_INTO)) return c.notEnough;
  if (phase < BEATS.RECALL_AT) return c.nothingLost;
  if (phase < nightOf(RECALL_INTO)) return c.inUse;
  if (phase < dayStart(DAYS - 1)) return c.sleepsAgain;
  if (phase < nightOf(DAYS - 1)) return c.cost;
  if (phase < BEATS.HOLD_AT) return c.oneMore;
  return c.carries;
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(
  phase: number,
  c: Translations["athenaPage"]["memory"]["status"],
): string {
  if (phase < BEATS.DAY0_AT) return c.dayShort;
  if (phase < nightOf(0)) return c.buildingShort;
  if (phase < dayStart(1)) return c.sleepsShort;
  if (phase < nightOf(1)) return c.wakesShort;
  if (phase < dayStart(QUIET_DAY)) return c.keepingShort;
  if (phase < nightOf(QUIET_DAY)) return c.quietShort;
  if (phase < dayStart(RECALL_INTO)) return c.notEnoughShort;
  if (phase < BEATS.RECALL_AT) return c.nothingLostShort;
  if (phase < nightOf(RECALL_INTO)) return c.inUseShort;
  if (phase < dayStart(DAYS - 1)) return c.sleepsAgainShort;
  if (phase < nightOf(DAYS - 1)) return c.costShort;
  if (phase < BEATS.HOLD_AT) return c.oneMoreShort;
  return c.carriesShort;
}
