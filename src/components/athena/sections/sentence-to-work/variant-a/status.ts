/**
 * The mono console readout in the window's footer — the only words in the
 * scene that are neither a UI label nor her caption. A wording concern rather
 * than a choreography one, so it lives beside `./data` instead of inside it.
 * One-directional: this imports the clock, the clock never imports this.
 */

import { ASK, EDIT, PLAN, START, WORK } from "./data";

/** Full status line — never more than five words. */
export function statusAt(phase: number): string {
  if (phase < ASK.revealAt) return "ready when you are";
  if (phase < ASK.chooseAt) return "taking your request";
  if (phase < PLAN.revealAt) return "request received";
  if (phase < PLAN.chooseAt) return "drafting your plan";
  if (phase < EDIT.depart) return "yours to change";
  if (phase < START.chooseAt) return "waiting for your go";
  if (phase < WORK.arrive) return "starting the work";
  if (phase < WORK.chooseAt) return "five working at once";
  return "summary ready for you";
}

/** Compact readout for narrow viewports — the same beats, fewer words. */
export function statusShortAt(phase: number): string {
  if (phase < ASK.revealAt) return "ready";
  if (phase < ASK.chooseAt) return "listening";
  if (phase < PLAN.revealAt) return "received";
  if (phase < PLAN.chooseAt) return "planning";
  if (phase < START.chooseAt) return "your call";
  if (phase < WORK.arrive) return "starting";
  if (phase < WORK.chooseAt) return "all at once";
  return "summary ready";
}
