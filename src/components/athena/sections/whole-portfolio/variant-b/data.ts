/**
 * WHEN everything happens in "Worst First" — section 5, variant B.
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM.
 * The scene reads this every frame and renders whatever it says; no component
 * decides timing for itself.
 *
 * The argument the clock is making, beat by beat:
 *
 *   compose   the lattice arrives as one box and fills with readings — enough
 *             of them that scanning it yourself is visibly hopeless. This beat
 *             exists to make the "many" real before anything is claimed.
 *   survey    Athena rides down it, one project per beat. Every reading she
 *             passes goes from unchecked to checked, so the field fills in
 *             behind her and the progress is the picture, not a number. The
 *             few that are not fine flag as she reaches them — the flags land
 *             on four different beats because they are on four different rows.
 *   lift      those few — and only those few — rise out of the plane.
 *   land      they arrive in the list in the order she FOUND them. Which is
 *             not an order worth acting on, and the next beat says so.
 *   sort      they overtake each other into rank. This is the section: the
 *             thing that makes a hundred readings usable is not the finding,
 *             it is the ordering.
 *   open      the top one opens — what it is, how long it has been sliding,
 *             and the one sentence she actually found — with the rest of the
 *             list still under it, so the ordering stays the point.
 *   commit    and it closes on the one step that resolves it.
 *
 * Stage vocabulary is the shared `stage/stages` one, so "the list exists" is
 * never a boolean — a module is at a STAGE, and stages are cumulative.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";

export const TICK_MS = 900;
/** 26 × 900ms ≈ 23.4s per loop. */
export const CYCLE = 26;
/**
 * Reduced-motion pinned frame: the first tick at which the lattice is checked
 * end to end, four readings are ranked, the worst is open with its finding
 * showing and the one step has committed. The whole argument in one still.
 */
export const INITIAL_TICK = 24;

/** She sets off down the lattice here… */
const SURVEY_AT = 4;
/** …and takes this many beats to cross it, whatever its height. */
const SURVEY_TICKS = 9;

const LIFT_AT = SURVEY_AT + SURVEY_TICKS; // 13
const LAND_AT = LIFT_AT + 1; // 14
/** One whole beat sitting in found order, so the sort has something to undo. */
const SORT_AT = LIFT_AT + 3; // 16
const RANKED_AT = SORT_AT + 1; // 17
const OPEN_AT = RANKED_AT + 1; // 18
const ACTION_AT = OPEN_AT + 4; // 22
const COMMIT_AT = OPEN_AT + 5; // 23

export const LATTICE_PLAN: StagePlan = { shell: 1, body: 2, detail: 3, chosen: LIFT_AT };
export const LIST_PLAN: StagePlan = {
  shell: LIFT_AT,
  body: LAND_AT,
  detail: RANKED_AT,
  chosen: OPEN_AT,
};
export const CARD_PLAN: StagePlan = {
  shell: OPEN_AT,
  body: OPEN_AT + 1,
  detail: OPEN_AT + 2,
  chosen: COMMIT_AT,
};
/** The beat she says it in words, one after the drift has drawn itself. A
 *  shape is a claim; the sentence is the thing you can act on. */
const TOLD_AT = OPEN_AT + 3;

/** Beats the status line also narrates. */
export const BEATS = { SURVEY_AT, LIFT_AT, LAND_AT, SORT_AT, OPEN_AT, ACTION_AT, COMMIT_AT };

export type ActionState = "hidden" | "ready" | "done";

export interface Scene {
  lattice: ModuleStage;
  list: ModuleStage;
  card: ModuleStage;
  /** Fractional row the survey band is over; -1 before she sets off. */
  band: number;
  surveying: boolean;
  /** Rows she has finished — the lattice fills in behind her from this. */
  checkedRows: number;
  /** The few have left the plane. */
  lifted: boolean;
  /** They are in the list, in the order she found them. */
  landed: boolean;
  /** The beat they are overtaking each other on. */
  sorting: boolean;
  /** Rank order holds from here on. */
  sorted: boolean;
  opened: boolean;
  /** She has put the finding into words. */
  told: boolean;
  action: ActionState;
}

/**
 * Where the survey band is, as a fractional row index.
 *
 * Fixed in BEATS rather than in rows, so a nine-row field and a six-row field
 * take the same time to cross and the story keeps its shape at both
 * breakpoints — the wide one simply covers more ground per beat.
 */
export function bandAt(phase: number, rows: number): number {
  if (phase < SURVEY_AT) return -1;
  const t = Math.min(phase - SURVEY_AT, SURVEY_TICKS - 1);
  return (t / (SURVEY_TICKS - 1)) * (rows - 1);
}

function actionAt(phase: number): ActionState {
  if (phase >= COMMIT_AT) return "done";
  return phase >= ACTION_AT ? "ready" : "hidden";
}

/** Everything the field needs at a phase tick, derived in one pure read. */
export function sceneAt(phase: number, rows: number): Scene {
  const band = bandAt(phase, rows);
  return {
    lattice: stageOf(LATTICE_PLAN, phase),
    list: stageOf(LIST_PLAN, phase),
    card: stageOf(CARD_PLAN, phase),
    band,
    surveying: phase >= SURVEY_AT && phase < LIFT_AT,
    checkedRows: band < 0 ? 0 : Math.min(Math.floor(band) + 1, rows),
    lifted: phase >= LIFT_AT,
    landed: phase >= LAND_AT,
    sorting: phase === SORT_AT,
    sorted: phase >= SORT_AT,
    opened: phase >= OPEN_AT,
    told: phase >= TOLD_AT,
    action: actionAt(phase),
  };
}
