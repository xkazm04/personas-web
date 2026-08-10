/**
 * WHEN everything happens in "The Tide" — lasting memory, variant A.
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM. The
 * scene reads this every frame and renders whatever it says; no component
 * decides timing for itself.
 *
 * The rhythm the clock is making, beat by beat:
 *
 *   fill      talk collects. Unevenly — two beats in the middle bring nothing
 *             at all, and nothing happens on them either, which is the point:
 *             a quiet stretch is a quiet stretch.
 *   cross     the level reaches the line, and it starts. Nobody asked it to.
 *   reach     one pass can only take so much, so it takes the OLDEST part —
 *             the newest is marked and set aside, visibly, in place.
 *   settle    the part it took compresses down into the settled band. It is
 *             still there; it is simply quiet now.
 *   keep      and out of it, one at a time, come the few things worth keeping,
 *             each threaded back to where it came from.
 *   defer     what it could not reach drops onto the band. The level falls.
 *   note      it ends by writing one plain line about what it learned.
 *   refill    and the tide starts coming in again.
 *
 * The loop IS the product's rhythm, so the two ends have to meet: the level at
 * the last tick is exactly the level at the first (see MOUNTED), and the whole
 * basin therefore reads as continuous across the wrap.
 *
 * Stage vocabulary is the shared `stage/stages` one, so "this thing exists" is
 * never a boolean — a kept thing is at a STAGE, and stages are cumulative.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import { KEPT } from "./copy";

export const TICK_MS = 900;
/** 26 × 900ms = 23.4s per loop. */
export const CYCLE = 26;

/** How much talk the basin holds before there is enough to be worth sorting. */
export const FULL = 16;
/** How much of it one pass can reach. The remainder is the honest part. */
export const REACH = 13;

/**
 * How many rows of talk are on the field at each tick — the tide itself.
 *
 * Read as: fill unevenly to FULL, hold while the pass runs, then the tail
 * brings three more in. After the drop a row's slot is its index minus REACH,
 * so tick 25 shows six slots of talk and tick 0 shows six as well. The wrap
 * has nothing to hide.
 */
const MOUNTED = [
  6, 8, 9, 11, 11, 11, 13, 14, 15, 16,
  16, 16, 16, 16, 16, 16, 16, 16,
  16, 16, 16,
  17, 17, 18, 18, 19,
] as const;

/** The stretch where nothing arrives — and nothing runs. */
const QUIET_AT = 4;
const QUIET_END = 6;
const CROSS_AT = 10;
const REACH_AT = 11;
const SINK_AT = 12;
/** One kept thing per tick, so the eye can follow a single thread at a time. */
const KEEP_AT = 14;
const DEFER_AT = 18;
const NOTE_AT = 19;
const REFILL_AT = 21;

/**
 * Reduced-motion pinned frame: the beat after the account is written, where
 * every layer of the argument is on screen at once — the band holding what
 * settled, the four things it left, each thread back to its source, the part
 * it could not reach still marked and waiting, the level low, and the line it
 * has to climb to again. It deliberately does NOT rewind.
 */
export const INITIAL_TICK = 20;

/**
 * Where the clock sits before the section has ever been on screen. The last
 * tick of the loop is the calmest assembled frame AND the one whose level
 * matches tick 0 exactly, so the rewind on entry moves nothing but the shelf.
 */
export const PARK_TICK = CYCLE - 1;

/** A kept thing lands on its own tick and comes to rest on the next. What
 *  arrives inside that landing is framer's job, not the clock's. */
export const KEPT_PLANS: StagePlan[] = KEPT.map((_, i) => ({
  shell: KEEP_AT + i,
  body: KEEP_AT + i,
  detail: KEEP_AT + i,
  chosen: KEEP_AT + i + 1,
}));

export interface SceneState {
  /** How many rows of talk exist. Never falls — rows settle, they do not go. */
  mounted: number;
  /** How many of them are stacked above the band right now. */
  slots: number;
  /** Nothing is arriving, and nothing is running. */
  quiet: boolean;
  /** The level is at the line. */
  crossed: boolean;
  /** The oldest part is marked, and the newest set aside. Nothing has moved. */
  marked: boolean;
  /** …and the marked part is compressing into the band. */
  taken: boolean;
  /** What one pass could not reach has dropped onto it. */
  dropped: boolean;
  /** The line's own label steps aside once the pass it describes is running. */
  showThreshold: boolean;
  /**
   * A pass is holding at the depth it reached. This is one flag rather than
   * two because it is one fact: the line is drawn exactly while she is holding
   * it, and she leaves the surface for exactly as long as the line is there.
   */
  reaching: boolean;
  kept: ModuleStage[];
  note: boolean;
}

/** Everything the field needs at a phase tick, derived in one pure read. */
export function sceneAt(phase: number): SceneState {
  const mounted = MOUNTED[phase];
  const dropped = phase >= DEFER_AT;
  return {
    mounted,
    slots: dropped ? mounted - REACH : mounted,
    quiet: phase >= QUIET_AT && phase < QUIET_END,
    crossed: phase >= CROSS_AT,
    marked: phase >= REACH_AT && phase < REFILL_AT,
    taken: phase >= SINK_AT,
    dropped,
    // The line's label does its work twice: once while the tide is still
    // climbing to it, and again once the tide has fallen away from it, where
    // it is the only thing explaining the empty half of the basin.
    showThreshold: phase < REACH_AT || phase >= DEFER_AT,
    reaching: phase >= REACH_AT && phase < DEFER_AT,
    kept: KEPT_PLANS.map((p) => stageOf(p, phase)),
    note: phase >= NOTE_AT,
  };
}

/** Beats the status line and the captions also narrate. Named here rather than
 *  read back off a `StagePlan` (whose `chosen` is nullable by design). */
export const BEATS = {
  QUIET_AT,
  QUIET_END,
  CROSS_AT,
  REACH_AT,
  SINK_AT,
  KEEP_AT,
  DEFER_AT,
  NOTE_AT,
  REFILL_AT,
} as const;
