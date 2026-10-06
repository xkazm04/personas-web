/**
 * WHEN everything happens in "Roots" (lab v2). One deterministic cycle, pure
 * phase functions; the scene renders whatever `gardenAt` says.
 *
 *   grow      the garden composes: stems draw up out of the ground, leaves
 *             open, roots run down. One of them is already leaning a little -
 *             rot does not announce itself.
 *   survey    night. She crosses the whole garden with her light; each plant
 *             answers as the light reaches it - most are fine, a few are not.
 *   mark      worst first: she comes back over the one that is wilting.
 *   descend   she goes DOWN - along the stem, under the ground, and follows
 *             the bad run root by root, which lights rose behind her. Above
 *             ground you saw a wilting plant; down here you see why.
 *   open      at the end of the run is the cause. The finding opens beside it
 *             and she opens the fix: the run heals from the cause back up,
 *             emerald, and the plant lifts.
 *   rise      she comes back up. One handled, two still waiting their turn.
 */

import { atStage, stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import { ATTENTION_PLANTS, PLANTS, WORST_PLANT } from "./geometry";

export const TICK_MS = 900;
/** 26 x 900ms = 23.4s per loop. */
export const CYCLE = 26;

const GROW_AT = 0;
const SURVEY_AT = 5;
const SETTLE_AT = 9;
const MARK_AT = 10;
const TRAVEL_AT = 11;
const NEAR_AT = 14;
const BECKON_AT = 17;
const OPEN_AT = 18;
const LIFT_AT = 20;
const HOME_AT = 23;

export const BEATS = { SURVEY_AT, SETTLE_AT, MARK_AT, TRAVEL_AT, NEAR_AT, OPEN_AT, LIFT_AT, HOME_AT } as const;

/** Reduced motion: down at the cause, the fix just taken - the wilting, the
 *  run that went bad, the finding and the fix all on screen at once. */
export const INITIAL_TICK = OPEN_AT + 1;
/** Before first view: the last calm beat. */
export const PARK_TICK = CYCLE - 1;

const CARD_PLAN: StagePlan = { shell: NEAR_AT, body: NEAR_AT + 1, detail: NEAR_AT + 2, chosen: OPEN_AT };

export type Tone = "waiting" | "calm" | "attention" | "worst" | "handled";
export type Where = "dawn" | "survey" | "over" | "down" | "rest";

export interface GardenState {
  /** Per plant: grown (shell), leafed (body), read by her light (detail). */
  stages: ModuleStage[];
  tones: Tone[];
  /** 0 = upright, 1 = fully wilted. Per plant. */
  wilt: number[];
  settled: boolean;
  where: Where;
  /** Survey progress across the garden, 0..1 (her light's position). */
  sweep: number;
  /** The bad run is traced (she is reading it) / healed (the fix is in). */
  traced: boolean;
  healed: boolean;
  card: ModuleStage;
  open: boolean;
  beckon: boolean;
  /** She is looking (survey) or travelling - her halo swells. */
  busy: boolean;
}

function planFor(k: number): StagePlan {
  // Her light crosses left to right; a plant is read when the light reaches it.
  const read = SURVEY_AT + Math.min(3, Math.floor((k * 4) / PLANTS.length));
  return { shell: GROW_AT + (k % 3), body: 3, detail: read, chosen: k === WORST_PLANT ? OPEN_AT : null };
}

function toneOf(k: number, stage: ModuleStage, phase: number): Tone {
  if (atStage(stage, "chosen")) return "handled";
  if (!atStage(stage, "detail")) return "waiting";
  if (k === WORST_PLANT) return phase >= MARK_AT ? "worst" : "attention";
  return (ATTENTION_PLANTS as readonly number[]).includes(k) ? "attention" : "calm";
}

function wiltOf(k: number, phase: number): number {
  if (k === WORST_PLANT) {
    if (phase >= OPEN_AT) return 0;
    // Quiet at first - a lean you would not notice - then plain once read.
    return phase < SURVEY_AT ? Math.min(phase, 4) * 0.1 : phase < MARK_AT ? 0.65 : 1;
  }
  return (ATTENTION_PLANTS as readonly number[]).includes(k) && phase >= SURVEY_AT ? 0.3 : 0;
}

function whereAt(phase: number): Where {
  if (phase < SURVEY_AT) return "dawn";
  if (phase < MARK_AT) return "survey";
  if (phase < TRAVEL_AT) return "over";
  if (phase < LIFT_AT) return "down";
  return "rest";
}

export function gardenAt(phase: number): GardenState {
  const stages = PLANTS.map((_, k) => stageOf(planFor(k), phase));
  const card = stageOf(CARD_PLAN, phase);
  return {
    stages,
    tones: stages.map((s, k) => toneOf(k, s, phase)),
    wilt: PLANTS.map((_, k) => wiltOf(k, phase)),
    settled: phase >= SETTLE_AT,
    where: whereAt(phase),
    sweep: phase < SURVEY_AT ? 0 : Math.min(1, (phase - SURVEY_AT + 1) / 4),
    traced: phase >= TRAVEL_AT && phase < LIFT_AT + 1,
    healed: phase >= OPEN_AT,
    card,
    open: phase >= NEAR_AT && phase < LIFT_AT,
    beckon: phase >= BECKON_AT && phase < OPEN_AT,
    busy: (phase >= SURVEY_AT && phase < SETTLE_AT) || (phase >= MARK_AT && phase < NEAR_AT),
  };
}
