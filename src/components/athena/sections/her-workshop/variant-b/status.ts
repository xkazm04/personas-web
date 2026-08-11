/**
 * The one mono console line under the field — the only words in the scene that
 * are not the name of a bench or the name of a piece of work.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, the clock never
 * imports this.
 *
 * Three things it is careful about. It never says the queue started itself —
 * the queue is where the spend is, and it moves because you moved it. It never
 * says anything runs while you are away. And the line about the bench next door
 * says paired and ready and stops there: it is present, it is not busy, and no
 * wording in this file may ever suggest work is running on it.
 *
 * Both sets are also written to a WIDTH. This line is one mono row that never
 * wraps and never shrinks, so a claim that does not fit is a clipped claim: the
 * full lines are held under ~44 characters and the compact ones under ~26,
 * which is what fits at 640px and at 390px with type at the page's floor.
 */

import { BEATS, PLANS } from "./data";

/** Full line — one plain claim per act. */
export function statusAt(phase: number): string {
  if (phase < PLANS.hands.body) return "one desk, and everything reports to it";
  if (phase < PLANS.queue.shell) return "several pieces of work under her hands";
  if (phase < BEATS.LANDS_AT) return "and more of it waiting its turn beside them";
  if (phase < BEATS.START_AT) return "one lands; the queue is still waiting";
  if (phase < PLANS.standing.shell) return "nothing in the queue moves until you move it";
  if (phase < PLANS.watch.shell) return "standing orders, keeping their own time";
  if (phase < PLANS.next.shell) return "work that begins because something happened";
  if (phase < BEATS.FIRE_AT) return "the bench next door — paired, and ready";
  if (phase < BEATS.TRIP_AT) return "nobody started that one; it was simply time";
  if (phase < BEATS.ABSORB_AT) return "and that one, because a file changed";
  if (phase < BEATS.HOLD_AT) return "she takes them both without being asked";
  return "every kind of work, one place to watch it";
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(phase: number): string {
  if (phase < PLANS.hands.body) return "one desk for all of it";
  if (phase < PLANS.queue.shell) return "several at once";
  if (phase < BEATS.LANDS_AT) return "and more waiting its turn";
  if (phase < BEATS.START_AT) return "one lands";
  if (phase < PLANS.standing.shell) return "the queue waits for you";
  if (phase < PLANS.watch.shell) return "standing orders, own time";
  if (phase < PLANS.next.shell) return "and things that happen";
  if (phase < BEATS.FIRE_AT) return "next door: paired, ready";
  if (phase < BEATS.TRIP_AT) return "nobody started that one";
  if (phase < BEATS.ABSORB_AT) return "that one: a file changed";
  if (phase < BEATS.HOLD_AT) return "she takes both";
  return "all of it, one place";
}
