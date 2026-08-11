/**
 * WHICH mono console line runs under the field — the only words in the scene
 * that are neither part of the sentence, a task, nor the answer.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, never the reverse.
 *
 * The words themselves live in `src/i18n`; what is left here is only the
 * beat→line mapping. These stay pure phase functions — the copy arrives as a
 * parameter from the component, which is the thing that holds `t`.
 */

import type { Translations } from "@/i18n/en";
import { ANSWER_AT, ANSWERED_AT, SENT_AT, TASK_PLANS, sceneAt } from "./data";

const FIRST_TASK = TASK_PLANS[0].shell;
const LAST_TASK = TASK_PLANS[TASK_PLANS.length - 1].shell;

/** Full line — one plain claim per act of the story. */
export function statusAt(
  phase: number,
  c: Translations["athenaPage"]["fleet"]["status"],
): string {
  const scene = sceneAt(phase);
  if (phase < SENT_AT) return c.speak;
  if (phase < FIRST_TASK) return c.planning;
  if (phase <= LAST_TASK) return c.pieces;
  if (scene.plan === "proposed" || scene.plan === "editing") {
    return c.yourCall;
  }
  if (phase < ANSWER_AT) return c.parallel;
  if (phase < ANSWERED_AT) return c.returning;
  return c.closing;
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(
  phase: number,
  c: Translations["athenaPage"]["fleet"]["status"],
): string {
  const scene = sceneAt(phase);
  if (phase < SENT_AT) return c.speakShort;
  if (phase <= LAST_TASK) return c.piecesShort;
  if (scene.plan === "proposed" || scene.plan === "editing") return c.yourCallShort;
  if (phase < ANSWER_AT) return c.parallelShort;
  if (phase < ANSWERED_AT) return c.returningShort;
  return c.closingShort;
}
