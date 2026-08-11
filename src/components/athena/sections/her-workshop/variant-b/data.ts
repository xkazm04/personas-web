/**
 * WHEN everything happens in "The Workshop" — the her-workshop section,
 * variant B.
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM. The
 * field reads this every frame and renders whatever it says; no component
 * decides its own timing.
 *
 * The argument the clock is making, bench by bench:
 *
 *   the desk    lights first, alone, with five empty outlines around it.
 *               Whatever else arrives, it arrives HERE.
 *   hands on    several pieces of work already under way, each at its own pace.
 *               One of them lands.
 *   the queue   work waiting — and it keeps waiting. It moves only when you
 *               deliberately start it, and then it walks over to the bench.
 *   the dial    a rim crowded with standing orders, pointer working round.
 *   the watch   tracks with things arriving constantly, at no rhythm at all.
 *   next door   a second bench at the edge. It pairs — one code, both screens,
 *               the same instant — and then it stands there.
 *   it was time the beat the section exists for: an order comes round and a
 *               track trips, nobody presses anything, and the desk takes both.
 *
 * TRUTH CONSTRAINT, encoded here rather than left to taste: `next` is the one
 * bench whose plan has `chosen: null`. It has no commit beat, its cable never
 * carries traffic, and no lane, card, order or track ever belongs to it. The
 * second machine is built, paired and ready and has never had a piece of work
 * run on it — so the scene shows it present and shows it idle, and any change
 * that gives it something to do makes this section a lie. The same rule is why
 * nothing here runs on your backlog while you are away, and why the queue is
 * never started by anything but a press.
 *
 * Stage vocabulary is the shared `stage/stages` one, so "this bench is here" is
 * never a boolean — a bench is at a STAGE, and stages are cumulative.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import { HANDS } from "./copy";
import type { BenchId } from "./layout";

export const TICK_MS = 900;
/** 27 × 900ms = 24.3s per loop. */
export const CYCLE = 27;

/** The desk comes up before anything is plugged into it. */
const WAKE_AT = 1;
/** The lane she already had going that lands inside the loop. */
const LANDS_AT = 8;
/** The press. Nothing in the queue moves before this and nothing moves it but
 *  this — queued work is started deliberately, never picked up on its own. */
const START_AT = 9;
/** The started piece reaches the bench one tick later. */
const HANDOVER_AT = 10;
/** An order comes round, and then a track trips. Nobody is involved in either. */
const FIRE_AT = 20;
const TRIP_AT = 21;
/** She takes both — no ceremony, one beat. */
const ABSORB_AT = 22;
/** Stillness in the BEATS rather than in the motion: nothing new arrives after
 *  this, and every clock in the field keeps running. */
const HOLD_AT = 24;

/**
 * Every bench's whole life. Read down the `shell` column and you have the order
 * the shop floor composes in: the work she is doing, the work waiting, then the
 * two benches that need nobody, then the one at the edge.
 */
export const PLANS: Record<BenchId, StagePlan> = {
  hands: { shell: 2, body: 3, detail: 4, chosen: LANDS_AT },
  queue: { shell: 5, body: 6, detail: 7, chosen: START_AT },
  standing: { shell: 11, body: 12, detail: 13, chosen: FIRE_AT },
  watch: { shell: 14, body: 15, detail: 16, chosen: TRIP_AT },
  next: { shell: 17, body: 18, detail: 19, chosen: null },
};

/** Reduced-motion pinned frame: inside the hold. Every bench up, the queued
 *  piece on the bench, the order come round, the track tripped, the far bench
 *  paired and idle. The whole breadth in one still image, and it deliberately
 *  does NOT rewind. */
export const INITIAL_TICK = 25;

/** Each lane's own pace. Only the first is short enough to land inside the loop
 *  — the rest are still going when it ends, which is the honest shape of a
 *  bench with several things on it. Authored: a formula would finish them in a
 *  sweep. */
const LANE_SPAN = [4, 34, 26, 30] as const;
const LANE_FROM = [4, 4, 4, HANDOVER_AT] as const;

/** One full turn of the dial, in ticks. The pointer is a pure function of the
 *  clock rather than a spin of its own, so it is exactly on the mark that comes
 *  round at the instant it comes round. */
const SWEEP_TICKS = 12;

const sweepAt = (phase: number): number =>
  phase < PLANS.standing.detail ? 0 : ((phase - PLANS.standing.detail) / SWEEP_TICKS) * 360;

/** Where on the rim the order that comes round is sitting. */
export const FIRED_ANGLE = sweepAt(FIRE_AT);

/** How often each cable carries a report home, in seconds. Three different
 *  periods and two silences: the loom is a clock of its own. */
export const CABLE_PERIOD: Record<BenchId, number> = {
  hands: 2.2,
  queue: 0,
  standing: 5.4,
  watch: 3.8,
  next: 0,
};

export interface SceneState {
  awake: boolean;
  /** The five outlines are up, holding their places. */
  footprint: boolean;
  stages: Record<BenchId, ModuleStage>;
  /** 0…1 per lane; the fill tweens between ticks so work reads as continuous. */
  lanes: number[];
  handedOver: boolean;
  /** The press itself, and the emptied slot it leaves behind. */
  starting: boolean;
  started: boolean;
  sweep: number;
  firing: boolean;
  fired: boolean;
  tripping: boolean;
  tripped: boolean;
  paired: boolean;
  /** The desk takes something in, this tick. */
  taking: boolean;
  holding: boolean;
  /** Cables carrying a report home, and cables with a one-off signal this beat. */
  traffic: Record<BenchId, boolean>;
  spark: Record<BenchId, boolean>;
}

/** A one-off signal gets two ticks — a cable is two legs long. */
const sparkAt = (phase: number, at: number): boolean => phase === at || phase === at + 1;

function laneAt(i: number, phase: number): number {
  const from = LANE_FROM[i];
  if (phase < from) return 0;
  return Math.min(1, (phase - from) / LANE_SPAN[i]);
}

/** Everything the field needs at a phase tick, derived in one pure read. */
export function sceneAt(phase: number): SceneState {
  return {
    awake: phase >= WAKE_AT,
    footprint: phase >= WAKE_AT,
    stages: {
      hands: stageOf(PLANS.hands, phase),
      queue: stageOf(PLANS.queue, phase),
      standing: stageOf(PLANS.standing, phase),
      watch: stageOf(PLANS.watch, phase),
      next: stageOf(PLANS.next, phase),
    },
    lanes: Array.from({ length: HANDS.length + 1 }, (_, i) => laneAt(i, phase)),
    handedOver: phase >= HANDOVER_AT,
    starting: phase === START_AT,
    started: phase >= START_AT,
    sweep: sweepAt(phase),
    firing: phase === FIRE_AT,
    fired: phase >= FIRE_AT,
    tripping: phase === TRIP_AT,
    tripped: phase >= TRIP_AT,
    paired: phase >= PLANS.next.detail,
    taking: phase === HANDOVER_AT || phase === ABSORB_AT,
    holding: phase >= HOLD_AT,
    traffic: {
      hands: phase >= PLANS.hands.detail,
      // The queue reports nothing on its own — that is the point of it.
      queue: false,
      standing: phase >= ABSORB_AT,
      watch: phase >= ABSORB_AT,
      // TRUTH: never. Nothing has ever run on the bench next door.
      next: false,
    },
    spark: {
      hands: false,
      queue: sparkAt(phase, START_AT),
      standing: sparkAt(phase, FIRE_AT),
      watch: sparkAt(phase, TRIP_AT),
      next: false,
    },
  };
}

/** Beats the status line also narrates. Named here rather than read back off a
 *  `StagePlan` (whose `chosen` is nullable by design). */
export const BEATS = {
  WAKE_AT,
  LANDS_AT,
  START_AT,
  HANDOVER_AT,
  FIRE_AT,
  TRIP_AT,
  ABSORB_AT,
  HOLD_AT,
} as const;
