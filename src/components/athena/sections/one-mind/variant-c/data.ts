/**
 * WHEN everything happens in "The Return" — section 6, variant C.
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM.
 *
 * The story the clock tells, beat by beat:
 *
 *   open      the conversations you have going arrive out of the outlines
 *             that were holding their shape, and go live all at once. Three
 *             of them carry the page's own earlier scenes, at texture scale.
 *   ask       one of them — the one you are standing in — opens beneath her,
 *             and you ask it something none of its own history can answer.
 *   return    she reaches, and every OTHER conversation gives up what it
 *             holds. The threads run inward, not outward: the page's motion
 *             arrives somewhere instead of fanning out.
 *   answer    the lines land, one per beat, each with the conversation it
 *             came from still attached to it.
 *   one voice every card and the answer breathe once, together — the only
 *             moment in the section where everything moves as one thing.
 *   hold      six beats of genuine stillness. Nothing new arrives, the
 *             sources stay traceable, and the last frame of the page is a
 *             calm one. A closing section is allowed to breathe.
 *
 * Stage vocabulary is the shared `stage/stages` one, so "this conversation
 * exists" is never a boolean: a card is at a STAGE, and stages are
 * cumulative. `chosen` on a card means it has GIVEN what it holds — the only
 * commit beat a conversation gets here.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";

export const TICK_MS = 900;
/** 24 x 900ms = 21.6s per loop, of which the last 5.4s are still. */
export const CYCLE = 24;

/** Every card is named and textured on the same beat — they are all going. */
const NAMED_AT = 4;
const LIVE_AT = 5;
/** The conversation you are standing in. */
const PANEL_AT = 6;
const ASK_AT = 7;
/** She reaches: one ring leaves her and touches all of them at once. */
const REACH_AT = 9;
const TRUNK_AT = 10;
/** Threads draw home two per beat. */
const GATHER_AT = 11;
const ROW_AT = 12;
const FOOTER_AT = 15;
/** The single synchronised breath — one beat wide, on purpose. */
const CHORUS_AT = 16;
const SOURCE_AT = 17;
const HOLD_AT = 18;

/**
 * Reduced-motion pinned frame: inside the hold. Everything is on screen at
 * once — every conversation open and lit, the question asked, all three lines
 * answered, and each one still joined to where it came from. It deliberately
 * does NOT rewind. This is the page's last frame either way, so the still and
 * the moving version end on the same image.
 */
export const INITIAL_TICK = HOLD_AT + 1;

/**
 * Where the clock sits before the section has ever been on screen. The hold
 * is the only assembled frame that is also a calm one, so a section scrolled
 * past without stopping still shows the ending rather than a half-drawn
 * gather.
 */
export const PARK_TICK = CYCLE - 1;

/** One conversation's whole life. They solidify in three scattered waves so
 *  the ring composes rather than switching on. */
export function planFor(i: number): StagePlan {
  return {
    shell: 1 + (i % 3),
    body: NAMED_AT,
    detail: LIVE_AT,
    chosen: GATHER_AT + Math.floor(i / 2),
  };
}

export const PANEL_PLAN: StagePlan = {
  shell: PANEL_AT,
  body: ASK_AT,
  detail: ROW_AT,
  chosen: FOOTER_AT,
};

export interface SceneState {
  cards: ModuleStage[];
  /** Her look, crossing every conversation at once. */
  reaching: boolean;
  /** The one thread that runs outward — her into the open conversation. */
  trunk: boolean;
  panel: ModuleStage;
  /** How many lines of the answer have landed. */
  rowsIn: number;
  /** The one beat where everything moves together. */
  chorus: boolean;
  /**
   * Everything in the frame is on the SAME cycle with no offset from here on.
   * It opens at the chorus rather than at the hold on purpose: the flash is
   * then not an effect but the instant six lights blinking out of step fall
   * into step, and it keeps that consequence for the rest of the loop.
   */
  together: boolean;
  /** Each answered line is joined to the conversation it came from. */
  sourced: boolean;
  /** The closing stillness — nothing new arrives at all. */
  holding: boolean;
  /** She is gathering or composing; her glow lifts. */
  working: boolean;
}

/** Everything the field needs at a phase tick, derived in one pure read. */
export function sceneAt(phase: number, count: number): SceneState {
  return {
    cards: Array.from({ length: count }, (_, i) => stageOf(planFor(i), phase)),
    reaching: phase >= REACH_AT && phase < GATHER_AT + 3,
    trunk: phase >= TRUNK_AT,
    panel: stageOf(PANEL_PLAN, phase),
    rowsIn: Math.max(0, Math.min(3, phase - ROW_AT + 1)),
    chorus: phase === CHORUS_AT,
    together: phase >= CHORUS_AT,
    sourced: phase >= SOURCE_AT,
    holding: phase >= HOLD_AT,
    working: phase >= REACH_AT && phase < FOOTER_AT,
  };
}

/** Beats the status line also narrates. Named here rather than read back off
 *  a `StagePlan` (whose `chosen` is nullable by design). */
export const BEATS = {
  LIVE_AT,
  PANEL_AT,
  ASK_AT,
  REACH_AT,
  ROW_AT,
  FOOTER_AT,
  CHORUS_AT,
  SOURCE_AT,
  HOLD_AT,
} as const;
