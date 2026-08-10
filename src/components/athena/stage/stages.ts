/**
 * The layered-reveal vocabulary every /athena scene composes through.
 *
 * Lives in `stage/` beside the page's other shared vocabulary (AthenaStage,
 * athena-tokens, useStillMotion) because it is section-agnostic: it says only
 * that content arrives in ordered layers, never what any layer contains. Born
 * in the onboarding-partner section; promoted here so later sections inherit
 * the model instead of forking it.
 *
 * A module is never "shown" or "hidden" — it is at a STAGE, and the stages are
 * cumulative, so a module reading `atStage(stage, "body")` still has everything
 * `shell` brought. Kept here as a pure ordered primitive so `data.ts` can own
 * the tick table (the choreography) without also owning the comparison logic.
 *
 *   ghost   the dashed placeholder holding the module's rect
 *   shell   the ghost SOLIDIFIES into the real panel — frame + header/label
 *   body    the structural content — card rows, connector rows, table rows
 *   detail  the fine texture — metrics, chips, pills, avatars, sparkline
 *   chosen  the choice made here has committed and left a visible mark
 *
 * The tick clock decides only WHICH stage a module is in. The order the parts
 * of a stage arrive is framer's job (`./modules/parts`) — which is why adding
 * this whole model cost the tick grid nothing.
 */

export type ModuleStage = "ghost" | "shell" | "body" | "detail" | "chosen";

const RANK: Record<ModuleStage, number> = {
  ghost: 0,
  shell: 1,
  body: 2,
  detail: 3,
  chosen: 4,
};

/** Has a module reached (or passed) a stage? Always compare, never equate. */
export function atStage(stage: ModuleStage, min: ModuleStage): boolean {
  return RANK[stage] >= RANK[min];
}

/** The tick each stage of one module opens on. `chosen: null` means the module
 *  is scenery rather than a decision — it never gets a commit beat. */
export interface StagePlan {
  shell: number;
  body: number;
  detail: number;
  chosen: number | null;
}

/** Which stage a plan is in at a phase tick. */
export function stageOf(plan: StagePlan, phase: number): ModuleStage {
  if (plan.chosen !== null && phase >= plan.chosen) return "chosen";
  if (phase >= plan.detail) return "detail";
  if (phase >= plan.body) return "body";
  if (phase >= plan.shell) return "shell";
  return "ghost";
}

/**
 * Intra-stage cascade spacing, in seconds. One tick is 900ms, so a stage of
 * eight parts still finishes inside its own beat — the cascade reads as one
 * gesture, never as a queue the next tick has to wait for.
 */
export const STEP = 0.09;

/** Delay for the nth part of a stage; `lead` offsets a whole group (e.g. the
 *  texture that trails the structure it shares a tick with). */
export function stepDelay(i: number, lead = 0): number {
  return lead + i * STEP;
}
