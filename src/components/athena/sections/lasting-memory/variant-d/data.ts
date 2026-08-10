/**
 * WHEN everything happens in "The Anatomy" — the lasting-memory section,
 * variant D.
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM.
 *
 * The story the clock tells, beat by beat:
 *
 *   settle    the three zones arrive in the order material moves through them:
 *             the working surface, then her, then the empty shelf.
 *   talk      scraps rewrite themselves in place. Nothing here accumulates —
 *             it is the surface she works from, not the record. What DOES
 *             accumulate is the ring around her, fed by talking not by time.
 *   rest      the ring closes and she rests. Not a schedule and not a switch:
 *             enough has piled up, so she stops, on her own. The field cools,
 *             the surface stops rewriting, her clip stops playing.
 *   draw      everything from that stretch streams down into her.
 *   distil    the work happens inwardly — rings contracting into her, and
 *             nothing else on the field moving at all.
 *   keep      a few durable things land on the shelf, each arriving with the
 *             scrap it came from lit behind it. On the second pass one
 *             candidate arrives with nothing behind it and is refused.
 *   wake      she comes back. The shelf is thicker than it was.
 *   quiet     a stretch where nothing is said and the ring does not move —
 *             the beat that proves the pass is not on a timer.
 *   hold      two passes in: the shelf twice as full, the surface churning at
 *             the rate it started at, the ring filling toward the next one.
 *
 * Stage vocabulary is the shared `stage/stages` one, so "the shelf exists" is
 * never a boolean — a zone is at a STAGE, and stages are cumulative.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import { KEPT, PER_PASS, SCRAPS, SUPERSEDED } from "./copy";

export const TICK_MS = 900;
/** 27 × 900ms = 24.3s per loop, of which the last 3.6s are completely still. */
export const CYCLE = 27;

const NOW_AT = 1;
const HER_AT = 2;
const SHELF_AT = 3;

/** The two passes. Same four beats each, hours apart. */
const REST = [6, 18] as const;
const DRAW = [7, 19] as const;
const DIST = [8, 20] as const;
const KEEP = [9, 21] as const;
const WAKE = [10, 22] as const;

/** The stretch where nothing is said. */
const QUIET_FROM = 11;
const QUIET_TO = 12;

const HOLD_AT = 23;

/**
 * Reduced-motion pinned frame: deep inside the hold. Both passes have run, the
 * shelf is at its fullest, the thing that went out of date is sitting there
 * quiet beside its replacement, and the ring is filling again. It deliberately
 * does NOT rewind — the still frame makes the whole argument at once.
 */
export const INITIAL_TICK = 25;

/** Where the clock sits before the section has ever been on screen. */
export const PARK_TICK = CYCLE - 1;

/** How much talking it takes before a pass runs. Not a clock: a quiet tick
 *  never advances it, which is the entire point of the quiet stretch. */
const FILLS_AT = 5;

/** How often one scrap of the working surface is rewritten, in talking ticks,
 *  and the authored stagger that keeps the surface from rewriting in stripes. */
const REWRITE_EVERY = 3;
const REWRITE_OFFSET = [0, 2, 1, 0, 2, 1, 1, 0, 2] as const;

export const NOW_PLAN: StagePlan = { shell: NOW_AT, body: NOW_AT, detail: HER_AT, chosen: null };
export const CHAMBER_PLAN: StagePlan = {
  shell: HER_AT,
  body: HER_AT,
  detail: SHELF_AT,
  chosen: REST[0],
};
/** The shelf's commit beat is the first thing landing on it — the only moment
 *  in the loop where something becomes permanent. */
export const SHELF_PLAN: StagePlan = {
  shell: SHELF_AT,
  body: SHELF_AT,
  detail: SHELF_AT + 1,
  chosen: KEEP[0],
};

/** Is this tick one of a two-entry beat list? */
const on = (beats: readonly number[], phase: number): boolean => beats.some((b) => b === phase);

export function restingAt(phase: number): boolean {
  return REST.some((r, i) => phase >= r && phase < WAKE[i]);
}

function quietAt(phase: number): boolean {
  return phase >= QUIET_FROM && phase <= QUIET_TO;
}

/** Talking is the input to everything: the surface only rewrites while it is
 *  true, and the ring only fills while it is true. */
export function talkingAt(phase: number): boolean {
  return phase >= NOW_AT && !restingAt(phase) && !quietAt(phase);
}

function talkTicksAt(phase: number): number {
  let n = 0;
  for (let t = 0; t <= phase; t++) if (talkingAt(t)) n += 1;
  return n;
}

/** How full the ring is, 0…1. It empties when a pass consumes it and fills
 *  only from talking — never from elapsed time. */
function pressureAt(phase: number): number {
  const from = phase >= WAKE[1] ? WAKE[1] : phase >= WAKE[0] ? WAKE[0] : 0;
  let n = 0;
  for (let t = from + 1; t <= phase; t++) if (talkingAt(t)) n += 1;
  return Math.min(1, n / FILLS_AT);
}

/** Which generation scrap `slot` is on. Pure in the talking count, so a rewind
 *  reproduces the surface exactly. */
export function genFor(slot: number, talkTicks: number): number {
  return Math.floor((talkTicks + REWRITE_OFFSET[slot % REWRITE_OFFSET.length]) / REWRITE_EVERY);
}

/** The bar widths one generation of one scrap is drawn with. Wraps on the
 *  negative side too — the crossfade asks for generation -1 on the first
 *  frame, which is the layer nobody has seen yet. */
export function scrapBars(slot: number, gen: number): readonly number[] {
  const n = SCRAPS.length;
  return SCRAPS[(((gen * 3 + slot * 2) % n) + n) % n];
}

function keptAt(phase: number): number {
  let n = 0;
  for (const k of KEEP) if (phase >= k) n += PER_PASS;
  return Math.min(KEPT.length, n);
}

/** How dark the field goes while she is resting. It eases back before she
 *  wakes so the landing is watchable — she is on her way back by then. */
function veilAt(phase: number): number {
  if (!restingAt(phase)) return 0;
  return on(KEEP, phase) ? 0.12 : 0.46;
}

export interface SceneState {
  now: ModuleStage;
  chamber: ModuleStage;
  shelf: ModuleStage;
  /** Which beat of a pass this tick is, if any. */
  resting: boolean;
  drawing: boolean;
  distilling: boolean;
  keeping: boolean;
  /** How full the ring is, and how many talking ticks are behind the surface. */
  pressure: number;
  talkTicks: number;
  /** How much is on the shelf, and how much of that landed this beat. */
  kept: number;
  keptPrev: number;
  /** The one that went out of date. It keeps its slot; it stops being recalled. */
  hushed: number | null;
  /** A candidate arriving with nothing behind it, turned away at the shelf. */
  refused: boolean;
  veil: number;
  holding: boolean;
}

/** Everything the field needs at a phase tick, derived in one pure read. */
export function sceneAt(phase: number): SceneState {
  const kept = keptAt(phase);
  return {
    now: stageOf(NOW_PLAN, phase),
    chamber: stageOf(CHAMBER_PLAN, phase),
    shelf: stageOf(SHELF_PLAN, phase),
    resting: restingAt(phase),
    drawing: on(DRAW, phase),
    distilling: on(DIST, phase),
    keeping: on(KEEP, phase),
    pressure: pressureAt(phase),
    talkTicks: talkTicksAt(phase),
    kept,
    keptPrev: keptAt(phase - 1),
    hushed: phase >= DIST[1] ? SUPERSEDED : null,
    refused: phase === KEEP[1],
    veil: veilAt(phase),
    holding: phase >= HOLD_AT,
  };
}

/** Beats the status line and the caption beside her also narrate. */
export const BEATS = { HER_AT, REST, DRAW, DIST, KEEP, WAKE, QUIET_FROM, QUIET_TO, HOLD_AT } as const;
