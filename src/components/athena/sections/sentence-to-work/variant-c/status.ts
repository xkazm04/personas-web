/**
 * The one mono console line under the field — the only words in the scene that
 * are neither something someone said nor a label on something on screen.
 *
 * It reads the same phase clock everything else does, but wording is a
 * different concern from choreography, so it lives beside `./data` rather than
 * inside it. One-directional: this imports the clock; the clock never imports
 * this.
 */

import { CONFIRM_AT, SETTLED_AT, STAGE_PLAN, WAIT_AT } from "./data";

const LEAVE = STAGE_PLAN.work.shell;
const RUNNING = STAGE_PLAN.work.body;
const BACK = SETTLED_AT + 1;

/** Full status line, beat by beat. */
export function statusAt(phase: number): string {
  if (phase < STAGE_PLAN.plan.shell) return "the last thing before you go";
  if (phase < CONFIRM_AT) return "her plan · change any of it";
  if (phase < LEAVE) return "nothing starts until you say so";
  if (phase < RUNNING) return "you step away";
  if (phase < WAIT_AT) return "it keeps going without you";
  if (phase < BACK) return "one thing waits · nothing guessed";
  return "you're back · one answer, not a pile";
}

/** Compact status for narrow viewports — the same beats, fewer words. */
export function statusShortAt(phase: number): string {
  if (phase < STAGE_PLAN.plan.shell) return "before you go";
  if (phase < CONFIRM_AT) return "yours to change";
  if (phase < LEAVE) return "you said go";
  if (phase < RUNNING) return "you step away";
  if (phase < WAIT_AT) return "it keeps going";
  if (phase < BACK) return "one thing waits";
  return "one answer";
}
