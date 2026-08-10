/**
 * WHEN everything happens in "The Marker" — the lasting-memory section,
 * variant C.
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM.
 *
 * The story the clock tells, beat by beat:
 *
 *   pile      everything you have said to her arrives in three waves, oldest
 *             first, until the seam is full — visibly more than one sitting
 *             could ever take in.
 *   read      she comes in at the OLDEST end and works forward. Never the
 *             newest end: starting at the old end is the only reason nothing
 *             in the middle of a busy stretch can be stranded.
 *   stop      she fills up and halts. A marker plants exactly where she
 *             stopped, and a bracket closes under everything she reached.
 *   account   she writes down, in plain sentences, how far she got, how much
 *             is still waiting, and that next time starts right here.
 *   gap       she leaves. Hours of nothing — the marker sits alone.
 *   resume    she comes back AT the marker, not before it and not after it,
 *             and the second bracket draws from exactly that edge. Two
 *             brackets, identical length, sharing one edge.
 *   settle    a second account, a second marker, and then genuine stillness:
 *             what she has not reached is still there, still lit, waiting.
 *
 * Stage vocabulary is the shared `stage/stages` one, so "the seam exists" is
 * never a boolean — a thing is at a STAGE, and stages are cumulative.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import { ACCOUNTS } from "./copy";
import { APPETITE, UNITS, readAtUnits } from "./layout";

export const TICK_MS = 900;
/** 28 × 900ms = 25.2s per loop, of which the last 3.6s are completely still. */
export const CYCLE = 28;

/** More arrives than one sitting can hold — three waves, ending full. */
const WAVES = [
  { at: 1, n: 8 },
  { at: 2, n: 18 },
  { at: 3, n: 30 },
] as const;
const FULL_AT = WAVES[WAVES.length - 1].at;

/** She arrives at the oldest end. */
const HEAD_AT = 4;
/** She fills up and halts; the marker plants on her arrival, not after it. */
const STOP_AT = 8;
const BRACE_AT = 9;
const NOTE_AT = 10;
/** The one beat where what she did NOT reach is given light rather than
 *  dimmed — the admission is a gesture, not a footnote. */
const ACK_AT = 12;
/** She leaves. Passes are hours apart, and the scene spends real time on it. */
const GAP_AT = 14;
const RESUME_AT = 16;
const STOP2_AT = 20;
const BRACE2_AT = 21;
const NOTE2_AT = 22;
const HOLD_AT = 24;

/**
 * Reduced-motion pinned frame: inside the hold. Both sittings are measured,
 * both markers stand, both accounts are written, and what is still waiting is
 * still there. It deliberately does NOT rewind — the still frame makes the
 * whole argument at once.
 */
export const INITIAL_TICK = 26;

/** Where the clock sits before the section has ever been on screen. The hold
 *  is the only assembled frame that is also a calm one. */
export const PARK_TICK = CYCLE - 1;

export const SEAM_PLAN: StagePlan = {
  shell: WAVES[0].at,
  body: WAVES[0].at,
  detail: FULL_AT,
  chosen: STOP_AT,
};

/** An account writes itself line by line the first time. The second time it
 *  arrives nearly at once — by then you are recognising it, not reading it. */
const NOTE_PLANS: StagePlan[] = [
  { shell: NOTE_AT, body: NOTE_AT + 1, detail: NOTE_AT + 2, chosen: NOTE_AT + 3 },
  { shell: NOTE2_AT, body: NOTE2_AT, detail: NOTE2_AT + 1, chosen: NOTE2_AT + 1 },
];

const LINES = ACCOUNTS[0].lines.length;

/** How much of the seam is behind her at a tick. Linear inside a sitting so
 *  the reading reads as continuous; flat everywhere else, including across the
 *  hours she is away — she does not drift while she is gone. */
function unitsAt(phase: number): number {
  if (phase < HEAD_AT) return 0;
  if (phase < STOP_AT) return (APPETITE * (phase - HEAD_AT)) / (STOP_AT - HEAD_AT);
  if (phase < RESUME_AT) return APPETITE;
  if (phase < STOP2_AT) {
    return APPETITE + (APPETITE * (phase - RESUME_AT)) / (STOP2_AT - RESUME_AT);
  }
  return APPETITE * 2;
}

function arrivedAt(phase: number): number {
  let n = 0;
  for (const w of WAVES) if (phase >= w.at) n = w.n;
  return n;
}

/** How many lines of account `i` are down. */
function linesAt(i: number, phase: number): number {
  const plan = NOTE_PLANS[i];
  if (phase < plan.body) return 0;
  if (i === 0) return Math.min(LINES, phase - plan.shell);
  return phase >= plan.detail ? LINES : 1;
}

export interface SceneState {
  seam: ModuleStage;
  /** How much of what you said exists yet, and how much of that is new this
   *  beat — the seam cascades its arrivals rather than switching on. */
  arrived: number;
  arrivedPrev: number;
  /** How much she has read, and how much of that landed this beat. */
  read: number;
  readPrev: number;
  /** Her position along the seam, 0…1. She is mounted the whole loop. */
  headFrac: number;
  headHere: boolean;
  /** She is mid-sitting — her light is on the seam. */
  reading: boolean;
  /** How many markers stand, and how many brackets are closed. */
  marks: number;
  braces: number;
  /** The dashed run from a marker down to the account that explains it. */
  joins: boolean[];
  /** What she has not reached is named, and once, given light. */
  named: boolean;
  ack: boolean;
  notes: ModuleStage[];
  /** The outline that promises an account. It appears when the sitting it
   *  belongs to STARTS — never before, or the field gives away that there is
   *  going to be a second one while the first is still being read. */
  noteWaiting: boolean[];
  lines: number[];
  /** The closing beat, and the stillness after it. */
  settle: boolean;
  holding: boolean;
}

/** Everything the field needs at a phase tick, derived in one pure read. */
export function sceneAt(phase: number): SceneState {
  const units = unitsAt(phase);
  return {
    seam: stageOf(SEAM_PLAN, phase),
    arrived: arrivedAt(phase),
    arrivedPrev: arrivedAt(phase - 1),
    read: readAtUnits(units),
    readPrev: readAtUnits(unitsAt(phase - 1)),
    headFrac: units / UNITS,
    headHere: phase >= HEAD_AT && (phase < GAP_AT || phase >= RESUME_AT),
    reading:
      (phase >= HEAD_AT && phase <= STOP_AT) || (phase >= RESUME_AT && phase <= STOP2_AT),
    marks: phase >= STOP2_AT ? 2 : phase >= STOP_AT ? 1 : 0,
    braces: phase >= BRACE2_AT ? 2 : phase >= BRACE_AT ? 1 : 0,
    joins: [phase >= NOTE_AT, phase >= NOTE2_AT],
    named: phase >= BRACE_AT,
    ack: phase === ACK_AT,
    notes: NOTE_PLANS.map((p) => stageOf(p, phase)),
    noteWaiting: [phase >= HEAD_AT, phase >= RESUME_AT],
    lines: NOTE_PLANS.map((_, i) => linesAt(i, phase)),
    settle: phase === HOLD_AT,
    holding: phase >= HOLD_AT,
  };
}

/** Beats the status line also narrates. Named here rather than read back off a
 *  `StagePlan` (whose `chosen` is nullable by design). */
export const BEATS = {
  WAVE_AT: WAVES[1].at,
  HEAD_AT,
  STOP_AT,
  NOTE_AT,
  GAP_AT,
  RESUME_AT,
  STOP2_AT,
  HOLD_AT,
} as const;
