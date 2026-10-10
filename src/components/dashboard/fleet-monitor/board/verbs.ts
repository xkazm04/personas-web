import type { SimAgent } from "./model";

/* ── One verb rulebook ─────────────────────────────────────────────
 *
 * "May this verb act on this agent now?" has one answer, here. The machine
 * (simReducer, and settle() when a command lands) refuses with it; every
 * surface that offers a verb (the agent's controls, the run card, the command
 * palette, bulk actions, triage, the operator) offers it only where it is
 * admitted. A new verb adds one row to VERB_RULES, not a predicate per surface.
 *
 *   admit(verb, agent, { offline, pending }) -> null (admitted) | Refusal
 *   offeredVerbs(agent, ctx)                 -> the run verbs admitted, in order
 *
 * `offline` and `pending` are the plane's own reasons and come first: nothing
 * reaches an offline machine, and an agent with an open run command waits for
 * it. The machine itself only ever sees the agent (no ctx).
 */

/** The verbs that change how one agent runs. */
export type RuleVerb = "pause" | "resume" | "run" | "cancel" | "retry";
export const RULE_VERBS: readonly RuleVerb[] = ["pause", "resume", "run", "cancel", "retry"];

/** Why a verb does not apply. Copy: `personasMonitorCopy.board.cmd.refusals`. */
export type Refusal =
  | "offline" // the machine cannot be reached
  | "pending" // another run command on this agent is still on its way
  | "paused" // the agent is paused: nothing new starts
  | "alreadyPaused" // pause, on an agent that is already off
  | "alreadyOn" // resume, on an agent that is already on
  | "busy" // run, while a run is in progress
  | "waitsForYou" // run, while the agent waits for an answer or holds a draft
  | "notRunning" // cancel, when no run is in progress (it may just have finished)
  | "notFailed" // retry, when the run is no longer failed
  | "gone"; // a decision about something no longer there (review resolved, draft handled, question answered)

export interface AdmitContext {
  /** The machine is offline. */
  offline?: boolean;
  /** An open run command on this agent is still in flight (see openControl). */
  pending?: boolean;
}

type Rule = (a: Pick<SimAgent, "state" | "enabled">) => Refusal | null;

const VERB_RULES: Record<RuleVerb, Rule> = {
  pause: (a) => (a.enabled ? null : "alreadyPaused"),
  resume: (a) => (a.enabled ? "alreadyOn" : null),
  run: (a) =>
    !a.enabled ? "paused" : a.state === "running" ? "busy" : a.state === "input_required" || a.state === "draft_ready" ? "waitsForYou" : null,
  // Cancel stops a run whether or not the agent is paused (a paused agent finishes its run unless cancelled).
  cancel: (a) => (a.state === "running" ? null : "notRunning"),
  // Pause stops new runs, so a paused failed agent is not retried until resumed.
  retry: (a) => (!a.enabled ? "paused" : a.state === "failed" ? null : "notFailed"),
};

/** Null when the verb may act on the agent now; otherwise why not. */
export function admit(verb: RuleVerb, a: Pick<SimAgent, "state" | "enabled">, ctx: AdmitContext = {}): Refusal | null {
  if (ctx.offline) return "offline";
  if (ctx.pending) return "pending";
  return VERB_RULES[verb](a);
}

/** The run verbs this agent's controls offer (ignoring offline and pending,
 *  which the controls show as disabled-with-a-reason rather than hide). */
export function offeredVerbs(a: Pick<SimAgent, "state" | "enabled">): RuleVerb[] {
  return RULE_VERBS.filter((v) => VERB_RULES[v](a) === null);
}

/** The decision verbs' rule: is the thing decided on still there? */
export function admitDecision(
  kind: "review" | "draft" | "answer",
  a: Pick<SimAgent, "state" | "reviews">,
  rid?: string,
): Refusal | null {
  if (kind === "review") return rid && a.reviews.some((r) => r.id === rid) ? null : "gone";
  if (kind === "draft") return a.state === "draft_ready" ? null : "gone";
  return a.state === "input_required" ? null : "gone";
}
