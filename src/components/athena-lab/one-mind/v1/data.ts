/**
 * WHEN everything happens in "The Return", evolved (lab v1).
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM.
 * The story is the live section's, beat for beat, with two beats made
 * visible that it only implied:
 *
 *   open      the conversations you have going arrive out of the outlines
 *             holding their shape - typed ones and spoken ones, from today
 *             and from last week - and go live all at once.
 *   ask       the conversation you are standing in opens beneath her, and
 *             you ASK ALOUD: a voice bar first, then the words.
 *   return    she reaches, and every other conversation gives up what it
 *             holds. Each thread draws inward and a bead rides it home -
 *   memory    - where it lands as one light in the ring around her. That
 *             ring is the shared memory the live section only implied: six
 *             conversations, one place they all end up.
 *   answer    the lines come down the single thread, one per beat, and each
 *             one is joined to the conversation it came from AS it lands.
 *   one voice every surface washes with the same light at the same instant.
 *   hold      six beats of stillness; the page is allowed to end.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";

export const TICK_MS = 900;
/** 26 x 900ms = 23.4s per loop, of which the last 5.4s are still. */
export const CYCLE = 26;

const NAMED_AT = 4;
const LIVE_AT = 5;
const PANEL_AT = 6;
/** You start talking: the voice bar before the words. */
const SPEAK_AT = 7;
const ASK_AT = 8;
const REACH_AT = 9;
/** Threads draw home two per beat; each bead lands one beat later. */
const GATHER_AT = 10;
const TRUNK_AT = 13;
const ROW_AT = 14;
const FOOTER_AT = 17;
const CHORUS_AT = 18;
const HOLD_AT = 20;

/** Reduced motion pins a frame inside the hold - the page's last image either way. */
export const INITIAL_TICK = HOLD_AT + 1;
export const PARK_TICK = CYCLE - 1;

/** One conversation's whole life. They solidify in three scattered waves. */
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
  body: SPEAK_AT,
  detail: ROW_AT,
  chosen: FOOTER_AT,
};

export interface SceneState {
  cards: ModuleStage[];
  /** How many lights have landed in her ring - one per conversation given. */
  motes: number;
  /** You are speaking: the voice bar moves. */
  speaking: boolean;
  /** The words of your question are on screen. */
  asked: boolean;
  reaching: boolean;
  trunk: boolean;
  panel: ModuleStage;
  rowsIn: number;
  chorus: boolean;
  /** Everything on one shared breath from the one-voice beat on. */
  together: boolean;
  holding: boolean;
  /** She is gathering or composing; her ring turns and her glow lifts. */
  working: boolean;
  /** How far her memory ring has turned, in degrees - clock-driven, so it
   *  stops when the clock does. One full turn across her work, so in the
   *  hold every light sits back on the side its thread came in from. */
  spin: number;
}

export function sceneAt(phase: number, count: number): SceneState {
  const cards = Array.from({ length: count }, (_, i) => stageOf(planFor(i), phase));
  const motes = Array.from({ length: count }, (_, i) => planFor(i).chosen ?? CYCLE).filter(
    (at) => phase >= at + 1,
  ).length;
  return {
    cards,
    motes,
    speaking: phase >= SPEAK_AT && phase < REACH_AT,
    asked: phase >= ASK_AT,
    reaching: phase >= REACH_AT && phase < GATHER_AT + 2,
    trunk: phase >= TRUNK_AT,
    panel: stageOf(PANEL_PLAN, phase),
    rowsIn: Math.max(0, Math.min(3, phase - ROW_AT + 1)),
    chorus: phase === CHORUS_AT,
    together: phase >= CHORUS_AT,
    holding: phase >= HOLD_AT,
    working: phase >= REACH_AT && phase < FOOTER_AT,
    spin: Math.max(0, Math.min(phase, FOOTER_AT) - REACH_AT) * 45,
  };
}

export const BEATS = {
  LIVE_AT,
  PANEL_AT,
  ASK_AT,
  REACH_AT,
  ROW_AT,
  CHORUS_AT,
  HOLD_AT,
} as const;
