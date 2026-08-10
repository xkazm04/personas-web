/**
 * The one mono console line under the field.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, the clock never
 * imports this.
 *
 * Two rules it keeps. It never says a number, because the section is not
 * about a budget. And it never uses a verb she does not do — nothing here
 * removes, clears, forgets or tidies anything away; the strongest thing that
 * happens to a memory in this line is that it "stops coming up". The last
 * line is the section's whole claim, stated once the picture has earned it.
 */

import { BEATS } from "./data";

/** Full line — one plain claim per act of the story. */
export function statusAt(phase: number): string {
  if (phase < BEATS.REST_AT) return "everything you have ever told her";
  if (phase < BEATS.USE_AT) return "kept, whether or not it comes up";
  if (phase < BEATS.CITE_AT) return "and this is what she works from today";
  if (phase < BEATS.NEW_CONVO_AT) return "each one joined to where she heard it";
  if (phase < BEATS.LEARNED_AT) return "a new conversation, added to the rest";
  if (phase < BEATS.DESCEND_AT) return "the newer answer is the one she uses";
  if (phase < BEATS.LINKED_AT) return "the older one stops coming up";
  if (phase < BEATS.ANNOUNCE_AT) return "still readable, still joined to its source";
  if (phase < BEATS.WASH_AT) return "she says which would go quiet first, and leaves it";
  return "out of use is not the same as gone";
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(phase: number): string {
  if (phase < BEATS.REST_AT) return "everything you told her";
  if (phase < BEATS.USE_AT) return "kept either way";
  if (phase < BEATS.CITE_AT) return "what she works from";
  if (phase < BEATS.NEW_CONVO_AT) return "and where she heard it";
  if (phase < BEATS.LEARNED_AT) return "a new conversation";
  if (phase < BEATS.DESCEND_AT) return "she uses the newer one";
  if (phase < BEATS.LINKED_AT) return "the older stops coming up";
  if (phase < BEATS.ANNOUNCE_AT) return "readable, still joined";
  if (phase < BEATS.WASH_AT) return "named, and left alone";
  return "out of use is not gone";
}
