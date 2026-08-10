/**
 * WHEN everything happens in "One mind" — section 6, variant A.
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM. The
 * scene reads this every frame and renders whatever it says; no component
 * decides timing for itself.
 *
 * The argument the clock is making, beat by beat:
 *
 *   open      several conversations exist at once, each its own place with its
 *             own subject and its own state — one waiting on you, one working,
 *             one quiet, one the home for anything that has no other place.
 *             Every box is mounted from tick 0 as a dashed outline and
 *             SOLIDIFIES in place, so nothing ever reflows under a thread.
 *   join      one body of memory under all of them, and a thread from each.
 *   told      you tell ONE conversation something small and concrete.
 *   keep      the very words lift out of it and come to rest in that one body.
 *   spread    and the moment they land, every other conversation has them.
 *   asked     somewhere else entirely, you ask a question that needs it —
 *             a conversation that was never told.
 *   answered  she reaches for it and answers with it, and the answer carries
 *             the same words you typed in the other one.
 *   one       every thread lit at once: the conversations differ, she does not.
 *
 * Stage vocabulary is the shared `stage/stages` one, so "this conversation
 * exists" is never a boolean: it is at a STAGE, and stages are cumulative.
 * `chosen: null` on the two conversations that are scenery — only the one that
 * is told and the one that answers get a commit beat.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import { ASKED, CONVERSATIONS, TOLD, type Beat, type Conversation, type StateKey } from "./copy";

export const TICK_MS = 900;
/** 26 × 900ms ≈ 23.4s per loop. */
export const CYCLE = 26;

/** The conversations solidify one per tick, so each reads as its own place. */
const BAND_AT = 4;
const SPINE_AT = 5;
const BODY_AT = 6;
const THREADS_AT = 7;
const STATE_AT = 8;
const LEARN_AT = 10;
const LIFT_AT = 12;
const LAND_AT = 13;
const SPREAD_AT = 14;
const KEPT_AT = 16;
const ASK_AT = 17;
const REACH_AT = 18;
const ANSWER_AT = 19;
const MARK_AT = 20;
const ONE_AT = 22;
const HOME_AT = 24;

/**
 * Reduced-motion pinned frame: the beat after every thread lights together.
 * The whole chain is on screen at once — the fact still visible in the words
 * you typed, at rest among everything she knows, and inside the answer she
 * gave a conversation that was never told it. It deliberately does NOT rewind;
 * the still frame has to be the frame the story was for.
 */
export const INITIAL_TICK = ONE_AT + 1;

export const PANEL_PLANS: readonly StagePlan[] = [
  { shell: 1, body: BODY_AT, detail: STATE_AT, chosen: KEPT_AT },
  { shell: 2, body: BODY_AT, detail: STATE_AT, chosen: null },
  { shell: 3, body: BODY_AT, detail: STATE_AT, chosen: MARK_AT },
  { shell: 4, body: BODY_AT, detail: STATE_AT, chosen: null },
];

export const BAND_PLAN: StagePlan = {
  shell: BAND_AT,
  body: SPINE_AT,
  detail: SPINE_AT + 1,
  chosen: LAND_AT,
};

/** When each kind of line arrives. Lines are never removed — a conversation
 *  shows its most recent few, so the field stays legible while the history
 *  behind it stays true. */
const SAID_AT: Record<Beat, number> = {
  opening: BODY_AT,
  learn: LEARN_AT,
  kept: KEPT_AT,
  ask: ASK_AT,
  answer: ANSWER_AT,
};

/** What a conversation's chip says. Its resting state most of the time; the
 *  three exceptions are the three moments something actually happened in it —
 *  and "here" can only ever be true of ONE conversation at a time, which is
 *  the singular-ness stated as plainly as the scene can state it. */
export type ChipKey = StateKey | "here" | "caught" | "answered";

export interface SceneState {
  panels: ModuleStage[];
  band: ModuleStage;
  /** How many lines of each conversation are on screen. */
  said: number[];
  chips: ChipKey[];
  /** Threads exist between every conversation and the one memory. */
  threads: boolean;
  /** The words are in flight out of the conversation you told. */
  travel: boolean;
  /** …and at rest among everything she knows. */
  landed: boolean;
  /** The other conversations have it too — the instant it landed. */
  spread: boolean;
  /** She is reaching for it to answer somewhere it was never said. */
  reach: boolean;
  /** The answer carries it, and says where it came from. */
  marked: boolean;
  /** Every thread lit at once. */
  unified: boolean;
  /** Which conversation she is in; -1 when she is in none of them. */
  station: number;
  /** She is the one saying this beat's line. */
  speaking: boolean;
  /** The conversation that is working keeps working while she is elsewhere. */
  progress: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

/** How much of a conversation has been said by now. */
export function saidAt(conv: Conversation, phase: number): number {
  return conv.lines.filter((line) => phase >= SAID_AT[line.at]).length;
}

/** Where she is. One place at a time, always — there is only ever one of her
 *  in the scene, which is the point the section closes on. */
function stationAt(phase: number): number {
  if (phase >= HOME_AT) return -1;
  if (phase >= ASK_AT) return ASKED;
  if (phase >= LEARN_AT) return TOLD;
  return -1;
}

function chipAt(i: number, phase: number, station: number): ChipKey {
  if (i === station) return "here";
  if (i === TOLD && phase >= KEPT_AT) return "caught";
  if (i === ASKED && phase >= MARK_AT) return "answered";
  return CONVERSATIONS[i].state;
}

/** Everything the field needs at a phase tick, derived in one pure read. */
export function sceneAt(phase: number, count: number): SceneState {
  const station = stationAt(phase);
  return {
    panels: PANEL_PLANS.slice(0, count).map((plan) => stageOf(plan, phase)),
    band: stageOf(BAND_PLAN, phase),
    said: CONVERSATIONS.slice(0, count).map((conv) => saidAt(conv, phase)),
    chips: Array.from({ length: count }, (_, i) => chipAt(i, phase, station)),
    threads: phase >= THREADS_AT,
    travel: phase >= LIFT_AT && phase <= LAND_AT,
    landed: phase >= LAND_AT,
    spread: phase >= SPREAD_AT && phase < KEPT_AT,
    reach: phase >= REACH_AT && phase <= ANSWER_AT,
    marked: phase >= MARK_AT,
    unified: phase >= ONE_AT,
    station,
    speaking: phase === KEPT_AT || phase === ANSWER_AT,
    // Long work, quietly continuing in a conversation she is not currently in.
    // It never completes inside one loop — that is what makes it read as still
    // running rather than as a progress bar waiting for its cue.
    progress: clamp((phase - STATE_AT) / 20, 0, 0.86),
  };
}

/** Beats the status line also narrates. Named here rather than read back off a
 *  `StagePlan` (whose `chosen` is nullable by design). */
export const BEATS = {
  THREADS_AT,
  LEARN_AT,
  LIFT_AT,
  SPREAD_AT,
  ASK_AT,
  ANSWER_AT,
  ONE_AT,
} as const;
