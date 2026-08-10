/**
 * The one mono console line under the scene.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, the clock never
 * imports this.
 *
 * It narrates the days passing because the art cannot say a number out loud
 * without becoming a calendar — but it never says WHICH days, and it never
 * names a mechanism. Everything it claims, the picture is already showing.
 */

import { BEATS, MOMENT_PLANS } from "./data";

/** Full line — one plain claim per act. */
export function statusAt(phase: number): string {
  if (phase < MOMENT_PLANS[0].detail) return "an ordinary conversation";
  if (phase < BEATS.LEAVE[0]) return "you mention one thing, in passing";
  if (phase < MOMENT_PLANS[1].shell) return "days pass";
  if (phase < BEATS.DRAFT_AT) return "somewhere else entirely, about something else";
  if (phase < MOMENT_PLANS[1].detail) return "you start to explain again · you stop";
  if (phase < BEATS.LEAVE[1]) return "she already planned around it";
  if (phase < MOMENT_PLANS[2].shell) return "more days pass";
  if (phase < MOMENT_PLANS[2].detail) return "a question with no context in it";
  if (phase < BEATS.CLOSE_AT) return "answered from something you said once";
  return "three conversations · one of her · nothing repeated";
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(phase: number): string {
  if (phase < MOMENT_PLANS[0].detail) return "an ordinary conversation";
  if (phase < BEATS.LEAVE[0]) return "you mention one thing";
  if (phase < MOMENT_PLANS[1].shell) return "days pass";
  if (phase < BEATS.DRAFT_AT) return "somewhere else entirely";
  if (phase < MOMENT_PLANS[1].detail) return "you start to explain · you stop";
  if (phase < BEATS.LEAVE[1]) return "she planned around it";
  if (phase < MOMENT_PLANS[2].shell) return "more days pass";
  if (phase < MOMENT_PLANS[2].detail) return "no context in the question";
  if (phase < BEATS.CLOSE_AT) return "she still had it";
  return "three conversations · nothing repeated";
}
