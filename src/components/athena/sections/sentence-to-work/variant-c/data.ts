/**
 * WHEN everything happens in "You Left. It Kept Going." — section 4, variant C.
 *
 * One deterministic tick clock, read every frame by pure phase functions.
 * Nothing here touches the DOM, nothing here is impure, and the whole
 * choreography is legible as a single table.
 *
 * The arc, in four acts:
 *
 *   ACT I    ticks 0–6    You say one plain sentence. Athena offers a plan
 *                         with your name on it — three lines you can change.
 *                         Nothing at all starts until you say go, and the go
 *                         is a choreographed beat, not a flipped flag.
 *   ACT II   ticks 7–8    You leave. Your marker travels off the field and
 *                         the work web takes its first shape behind you.
 *   ACT III  ticks 9–19   Eight lights run without you. One of them reaches
 *                         a question it will not answer for you, and from
 *                         tick 13 it simply waits — patient, never failed.
 *                         The rest settle one by one while the field deepens.
 *   ACT IV   ticks 20–25  You come back. Not to a pile: one composed answer,
 *                         and the single thing that still wants you.
 *
 * Reduced motion pins tick 24 — the frame where you are back, every light has
 * resolved, the answer is fully composed, and the one question is on it.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import { NODES, WAITING_NODE, type WorkNode } from "./layout";

export { COPY } from "./copy";
export { lightAt, duskAt, type FieldLight } from "./light";
export {
  WIDE,
  COMPACT,
  NODES,
  WAITING_NODE,
  layoutFor,
  nodePoint,
  nodesFor,
  filamentsFor,
} from "./layout";
export type { FieldLayout, Point, Rect, WorkNode } from "./layout";
export { atStage, stepDelay, STEP } from "@/components/athena/stage/stages";
export type { ModuleStage } from "@/components/athena/stage/stages";

export const CYCLE = 26;
export const TICK_MS = 900; // 26 ticks × 900ms ≈ 23.4s per loop
/** The still that tells the whole story: you are back and it is all there. */
export const INITIAL_TICK = 24;

/** The tick the one that needs you starts waiting — and keeps waiting. */
export const WAIT_AT = 13;

/** The four blocks the field composes, each morphing out of its own ghost. */
export type BlockKey = "ask" | "plan" | "work" | "summary";

/**
 * The whole composition order in one table.
 *
 * `ask` is not a decision, so it has no commit beat — it is the sentence you
 * said, and it stays said. `plan` owns the confirmation: its commit IS the
 * moment work is allowed to begin, which is why `work` cannot open its shell
 * until the tick after. `summary` commits last, on the question that wants you.
 */
export const STAGE_PLAN: Record<BlockKey, StagePlan> = {
  ask: { shell: 1, body: 2, detail: 3, chosen: null },
  plan: { shell: 3, body: 4, detail: 5, chosen: 6 },
  work: { shell: 7, body: 9, detail: 12, chosen: 19 },
  summary: { shell: 21, body: 22, detail: 23, chosen: 24 },
};

const BLOCK_KEYS = Object.keys(STAGE_PLAN) as BlockKey[];

/** The beat you say go — and therefore the first beat anything is allowed to
 *  happen. Narrowed once here so no caller has to re-prove it is a number. */
export const CONFIRM_AT = STAGE_PLAN.plan.chosen as number;
/** The beat the last light that can finish on its own does. */
export const SETTLED_AT = STAGE_PLAN.work.chosen as number;

/** Where you are. The whole section is about the middle three. */
export type Presence = "with-you" | "leaving" | "away" | "returning" | "back";

export function presenceAt(phase: number): Presence {
  if (phase < STAGE_PLAN.work.shell) return "with-you";
  if (phase === STAGE_PLAN.work.shell) return "leaving";
  if (phase <= SETTLED_AT) return "away";
  if (phase === SETTLED_AT + 1) return "returning";
  return "back";
}

/** True while your marker is off the field (or on its way off it). */
export const goneAt = (phase: number): boolean => {
  const p = presenceAt(phase);
  return p === "leaving" || p === "away";
};

/**
 * Athena's three registers. She is the one thing that does not leave: brighter
 * while you are together, quiet and steady all night, brighter again when she
 * has something to hand you.
 */
export type AthenaMode = "attending" | "keeping" | "offering";

export function athenaAt(phase: number): AthenaMode {
  if (phase < STAGE_PLAN.work.shell) return "attending";
  return phase <= SETTLED_AT ? "keeping" : "offering";
}

/** What one light in the sky is doing. */
export type NodeState = "dark" | "live" | "waiting" | "done";

export function nodeStateAt(node: WorkNode, phase: number): NodeState {
  if (phase < STAGE_PLAN.work.body) return "dark";
  if (node.doneAt === null) return phase >= WAIT_AT ? "waiting" : "live";
  return phase >= node.doneAt ? "done" : "live";
}

/** How many lights have settled — the count the return is built on. */
export function settledAt(phase: number): number {
  return NODES.filter((n) => nodeStateAt(n, phase) === "done").length;
}

/** True from the beat the one that needs you starts waiting. */
export const waitingAt = (phase: number): boolean =>
  nodeStateAt(WAITING_NODE, phase) === "waiting";

export interface SceneState {
  stage: Record<BlockKey, ModuleStage>;
  presence: Presence;
  athena: AthenaMode;
  waiting: boolean;
}

/** Everything the field needs at a phase tick, derived in one pure read. */
export function sceneStateAt(phase: number): SceneState {
  const stage = {} as Record<BlockKey, ModuleStage>;
  for (const key of BLOCK_KEYS) stage[key] = stageOf(STAGE_PLAN[key], phase);
  return {
    stage,
    presence: presenceAt(phase),
    athena: athenaAt(phase),
    waiting: waitingAt(phase),
  };
}
