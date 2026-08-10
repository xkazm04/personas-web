/**
 * The one mono console line under the field — the only words in the scene
 * that are neither part of the sentence, a task, nor the answer.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, never the reverse.
 */

import { ANSWER_AT, ANSWERED_AT, SENT_AT, TASK_PLANS, sceneAt } from "./data";

const FIRST_TASK = TASK_PLANS[0].shell;
const LAST_TASK = TASK_PLANS[TASK_PLANS.length - 1].shell;

/** Full line — one plain claim per act of the story. */
export function statusAt(phase: number): string {
  const scene = sceneAt(phase);
  if (phase < SENT_AT) return "speak it or type it — same either way";
  if (phase < FIRST_TASK) return "Athena works out what it takes";
  if (phase <= LAST_TASK) return "one sentence, four pieces of work";
  if (scene.plan === "proposed" || scene.plan === "editing") {
    return "nothing runs until you say so";
  }
  if (phase < ANSWER_AT) return "all four at the same time";
  if (phase < ANSWERED_AT) return "coming back as one answer";
  return "one sentence in · one answer back";
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(phase: number): string {
  const scene = sceneAt(phase);
  if (phase < SENT_AT) return "type it or say it";
  if (phase <= LAST_TASK) return "four pieces of work";
  if (scene.plan === "proposed" || scene.plan === "editing") return "your call to start";
  if (phase < ANSWER_AT) return "all four at once";
  if (phase < ANSWERED_AT) return "coming back as one";
  return "one answer back";
}
