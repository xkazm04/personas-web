/**
 * WHEN everything happens in "Vital signs" (lab v3). One deterministic cycle,
 * pure phase functions; the wall renders whatever `vitalsAt` says.
 *
 *   week      your week fills the top of the wall - a launch, an offsite,
 *             hiring, board prep. You are elsewhere.
 *   watch     her playhead sweeps the last two weeks across every project at
 *             once; each heartbeat draws as she passes. One of them slows on
 *             the third day and then just... stops. Nobody would hear it.
 *   sort      at today, the wall sorts itself: the healthy recede, three are
 *             not fine, one has been flat for eleven days.
 *   go        worst first: she leaves the playhead and pins the day it went
 *             quiet. What it stands on is named right there.
 *   open      the finding opens under it, and she opens the fix: past today,
 *             that lane starts beating again, emerald.
 *   back      she returns to the playhead. One handled, two still waiting.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";

export const TICK_MS = 900;
/** 26 x 900ms = 23.4s per loop. */
export const CYCLE = 26;

const WEEK_AT = 0;
const SWEEP_AT = 1;
const SURVEY_AT = 2;
const SETTLE_AT = 9;
const MARK_AT = 10;
const TRAVEL_AT = 11;
const NEAR_AT = 13;
const BECKON_AT = 17;
const OPEN_AT = 18;
const LIFT_AT = 20;
const HOME_AT = 23;

export const BEATS = { SURVEY_AT, SETTLE_AT, MARK_AT, TRAVEL_AT, NEAR_AT, OPEN_AT, LIFT_AT, HOME_AT } as const;

/** Reduced motion: the fix just taken - the flat line, the day it went quiet,
 *  what it stands on, the finding, and the beat coming back, all at once. */
export const INITIAL_TICK = OPEN_AT + 1;
export const PARK_TICK = CYCLE - 1;

const CARD_PLAN: StagePlan = { shell: NEAR_AT + 1, body: NEAR_AT + 2, detail: NEAR_AT + 3, chosen: OPEN_AT };

export type Where = "playhead" | "pin";

export interface VitalsState {
  /** Your week has filled in (one block per tick from WEEK_AT). */
  week: number;
  /** The playhead, 0..1 across the last two weeks. */
  sweep: number;
  /** The wall has been read: health colours are on. */
  sorted: boolean;
  /** The worst lane is singled out (rose). */
  marked: boolean;
  where: Where;
  /** The day it went quiet is pinned, its span lit, the cause named. */
  pinned: boolean;
  card: ModuleStage;
  open: boolean;
  beckon: boolean;
  healed: boolean;
  busy: boolean;
}

export function vitalsAt(phase: number): VitalsState {
  return {
    week: Math.max(0, Math.min(4, phase - WEEK_AT + 1)),
    sweep: phase < SWEEP_AT ? 0 : Math.min(1, (phase - SWEEP_AT + 1) / (SETTLE_AT - SWEEP_AT)),
    sorted: phase >= SETTLE_AT,
    marked: phase >= MARK_AT,
    where: phase >= TRAVEL_AT && phase < LIFT_AT ? "pin" : "playhead",
    pinned: phase >= NEAR_AT && phase < HOME_AT,
    card: stageOf(CARD_PLAN, phase),
    open: phase >= NEAR_AT + 1 && phase < LIFT_AT,
    beckon: phase >= BECKON_AT && phase < OPEN_AT,
    healed: phase >= OPEN_AT,
    busy: (phase >= SWEEP_AT && phase < SETTLE_AT) || (phase >= TRAVEL_AT && phase < NEAR_AT),
  };
}
