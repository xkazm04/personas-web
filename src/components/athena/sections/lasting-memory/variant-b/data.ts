/**
 * WHEN everything happens in "The Archive" — lasting memory, variant B.
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM.
 * The scene reads this every frame and renders whatever it says; no component
 * decides timing for itself.
 *
 * The argument the clock is making, beat by beat:
 *
 *   ground    the record arrives first — every conversation you have ever
 *             had, along the floor. It is what the rest of the section
 *             stands on, so it is the ground literally.
 *   rest      the things that stopped coming up long ago fill in below the
 *             seam. They are dim, wholly readable, and on screen BEFORE
 *             anything is in use — so the resting layer is never introduced
 *             as the place things go.
 *   use       the lit band fills in, and then every card, lit or resting,
 *             draws a hairline down to the conversation it came out of.
 *   learn     a new conversation joins the end of the record (which only
 *             ever gets longer), and out of it a new thing to work from
 *             rises into the light, cited to what made it.
 *   supersede the older answer to the same question goes quiet where it
 *             stands, then SETTLES — down its own thread, across the seam,
 *             into the resting layer. It never leaves the frame, its words
 *             never stop being readable, and the end of its thread fixed to
 *             its conversation never moves at all.
 *   announce  she names the thing that would go quiet first, and the next
 *             beat is her not touching it. Announcing instead of acting is
 *             the whole design, so it gets two beats and no movement.
 *   wash      one light passes down through all three strata in turn.
 *   hold      three beats of stillness on the finished frame.
 *
 * Stage vocabulary is the shared `stage/stages` one, so "the card exists" is
 * never a boolean — a card is at a STAGE, and stages are cumulative.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";

export const TICK_MS = 900;
/** 26 x 900ms = 23.4s per loop, of which the last 2.7s are still. */
export const CYCLE = 26;

const RECORD_AT = 1;
/** She takes her place on the line between in use and at rest. */
const SEAM_AT = 2;
const REST_AT = 3;
const USE_AT = 5;
/** Citations draw: the resting layer first, then the lit band. */
const CITE_AT = 7;
const NEW_CONVO_AT = 11;
const LEARN_AT = 13;
const LEARNED_AT = 15;
/** The older answer stops being worked from — in place, before it moves. */
const QUIET_AT = 16;
const DESCEND_AT = 17;
const SETTLED_AT = 18;
const LINKED_AT = 19;
const ANNOUNCE_AT = 20;
const LEFT_AT = 21;
const WASH_AT = 22;
const HOLD_AT = 23;

/**
 * Reduced-motion pinned frame: inside the hold. Every layer is on screen at
 * once — the record complete, the new thing lit and cited, the superseded
 * answer resting below the seam still legible and still joined, and the named
 * card sitting exactly where it always was. It deliberately does NOT rewind.
 */
export const INITIAL_TICK = 24;

/** Where the clock sits before the section has ever been on screen. */
export const PARK_TICK = CYCLE - 1;

/** The one that goes out of use during the loop (index into KNOWN). */
export const SUPERSEDED = 1;
/** The one she names and does not touch. */
export const NAMED = 4;
/** Already out of use before the loop starts. */
const AT_REST: readonly number[] = [4, 5, 6];

/** The framed strip along the floor. */
const RECORD_PLAN: StagePlan = { shell: RECORD_AT, body: 2, detail: 3, chosen: null };
/** The conversation that joins its end. Its waiting outline opens a beat early
 *  — the archive always has room, and showing the room is the point. */
const NEW_BLOCK_PLAN: StagePlan = { shell: NEW_CONVO_AT, body: 12, detail: 12, chosen: null };
const NEW_BLOCK_GHOST = NEW_CONVO_AT - 1;

/**
 * One card's whole life. The resting ones arrive first and in a small
 * cascade; the lit ones follow; the new one arrives on its own beat and is
 * the only card in the section that gets a commit.
 */
const PLANS: readonly StagePlan[] = [
  { shell: USE_AT, body: USE_AT + 1, detail: CITE_AT + 1, chosen: null },
  { shell: USE_AT, body: USE_AT + 1, detail: CITE_AT + 1, chosen: null },
  { shell: USE_AT, body: USE_AT + 2, detail: CITE_AT + 1, chosen: null },
  { shell: LEARN_AT, body: LEARN_AT + 1, detail: LEARNED_AT, chosen: LEARNED_AT },
  { shell: REST_AT, body: REST_AT + 1, detail: CITE_AT, chosen: null },
  { shell: REST_AT, body: REST_AT + 1, detail: CITE_AT, chosen: null },
  { shell: REST_AT, body: REST_AT + 2, detail: CITE_AT, chosen: null },
];

/** The waiting outline for the new thing opens a beat before it solidifies. */
const LEARN_GHOST = LEARN_AT - 1;

/** Which act she is narrating. */
export type Act =
  | "open" | "cited" | "newConvo" | "learned" | "quiet" | "descend"
  | "settled" | "linked" | "announce" | "left" | "hold";

function actAt(phase: number): Act {
  if (phase < CITE_AT) return "open";
  if (phase < NEW_CONVO_AT) return "cited";
  if (phase < LEARN_AT) return "newConvo";
  if (phase < QUIET_AT) return "learned";
  if (phase < DESCEND_AT) return "quiet";
  if (phase < SETTLED_AT) return "descend";
  if (phase < LINKED_AT) return "settled";
  if (phase < ANNOUNCE_AT) return "linked";
  if (phase < LEFT_AT) return "announce";
  if (phase < HOLD_AT) return "left";
  return "hold";
}

export interface SceneState {
  record: ModuleStage;
  newBlock: ModuleStage;
  newBlockGhost: boolean;
  /** Stage per KNOWN index. */
  known: ModuleStage[];
  /** Its waiting outline is open (the new one only). */
  ghosts: boolean[];
  /** It has settled into the resting layer. */
  atRest: boolean[];
  /** It is no longer being worked from — true a beat BEFORE it moves, so
   *  going quiet and going down read as two different things. */
  quiet: boolean[];
  /** The beat the new thing commits into use. */
  arriving: boolean;
  /** The one that moved wears its mark. */
  stillHere: boolean;
  /** Its citation proves itself — a light runs the join, end to end. */
  linking: boolean;
  announced: boolean;
  leftAlone: boolean;
  /** The light that passes down through all three strata, once, then the
   *  shared breath it leaves behind. */
  wash: boolean;
  together: boolean;
  holding: boolean;
  /** She is doing something (glow lifts); she is on the seam at all. */
  working: boolean;
  present: boolean;
  act: Act;
}

/** Everything the field needs at a phase tick, derived in one pure read. */
export function sceneAt(phase: number): SceneState {
  return {
    record: stageOf(RECORD_PLAN, phase),
    newBlock: stageOf(NEW_BLOCK_PLAN, phase),
    newBlockGhost: phase >= NEW_BLOCK_GHOST,
    known: PLANS.map((p) => stageOf(p, phase)),
    ghosts: PLANS.map((_, i) => (i === 3 ? phase >= LEARN_GHOST : true)),
    atRest: PLANS.map((_, i) => AT_REST.includes(i) || (i === SUPERSEDED && phase >= DESCEND_AT)),
    quiet: PLANS.map((_, i) => AT_REST.includes(i) || (i === SUPERSEDED && phase >= QUIET_AT)),
    arriving: phase === LEARNED_AT,
    stillHere: phase >= SETTLED_AT,
    linking: phase >= LINKED_AT && phase < ANNOUNCE_AT,
    announced: phase >= ANNOUNCE_AT,
    leftAlone: phase >= LEFT_AT,
    wash: phase === WASH_AT,
    together: phase >= WASH_AT,
    holding: phase >= HOLD_AT,
    working: phase >= NEW_CONVO_AT && phase < WASH_AT,
    present: phase >= SEAM_AT,
    act: actAt(phase),
  };
}

/** Beats the status line also narrates. Named here rather than read back off
 *  a `StagePlan` (whose `chosen` is nullable by design). */
export const BEATS = {
  REST_AT,
  USE_AT,
  CITE_AT,
  NEW_CONVO_AT,
  LEARNED_AT,
  DESCEND_AT,
  LINKED_AT,
  ANNOUNCE_AT,
  WASH_AT,
} as const;
