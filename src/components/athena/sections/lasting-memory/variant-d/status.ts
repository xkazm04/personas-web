/**
 * The words the clock speaks — the one mono console line under the field, and
 * the single caption that rides beside her inside the art.
 *
 * A WORDING concern rather than a choreography one, so it lives beside `./data`
 * instead of inside it. One-directional: this imports the clock, the clock
 * never imports this.
 *
 * Three things this file is careful never to say, because they would be false:
 * nothing is ever forgotten, dropped or cleared (a thing that goes out of date
 * keeps its place and stops being recalled); nothing happens continuously (the
 * passes are discrete and hours apart, and the gap is the product); and nobody
 * reviews or approves any of it — she does it on her own.
 */

import { COPY } from "./copy";
import { BEATS } from "./data";

/** Full line — one plain claim per act of the story. */
export function statusAt(phase: number): string {
  if (phase < BEATS.HER_AT) return "she works from what you just said";
  if (phase < BEATS.REST[0]) return "this part is rewritten as you talk";
  if (phase < BEATS.DRAW[0]) return "enough has piled up — so she rests";
  if (phase < BEATS.DIST[0]) return "everything from that stretch goes in";
  if (phase < BEATS.KEEP[0]) return "the whole pass costs less than a reply";
  if (phase < BEATS.WAKE[0]) return "a handful of it is worth keeping";
  if (phase < BEATS.QUIET_FROM) return "she wakes knowing more than before";
  if (phase <= BEATS.QUIET_TO) return "a quiet stretch changes nothing";
  if (phase < BEATS.REST[1]) return "you talk more, and it builds again";
  if (phase < BEATS.DRAW[1]) return "hours later, never twice in a row";
  if (phase < BEATS.DIST[1]) return "in it goes, the same way";
  if (phase < BEATS.KEEP[1]) return "she goes back over what she knew";
  if (phase < BEATS.WAKE[1]) return "nothing is kept without a source";
  if (phase < BEATS.HOLD_AT) return "she wakes with more than last time";
  return "the more you talk, the more she carries";
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(phase: number): string {
  if (phase < BEATS.HER_AT) return "she works from what you said";
  if (phase < BEATS.REST[0]) return "rewritten as you talk";
  if (phase < BEATS.DRAW[0]) return "enough piled up — she rests";
  if (phase < BEATS.DIST[0]) return "all of it goes in";
  if (phase < BEATS.KEEP[0]) return "cheaper than one reply";
  if (phase < BEATS.WAKE[0]) return "a handful is worth keeping";
  if (phase < BEATS.QUIET_FROM) return "she wakes knowing more";
  if (phase <= BEATS.QUIET_TO) return "quiet changes nothing";
  if (phase < BEATS.REST[1]) return "you talk more; it builds";
  if (phase < BEATS.DRAW[1]) return "hours later, not sooner";
  if (phase < BEATS.DIST[1]) return "in it goes again";
  if (phase < BEATS.KEEP[1]) return "she revisits what she knew";
  if (phase < BEATS.WAKE[1]) return "nothing kept without a source";
  if (phase < BEATS.HOLD_AT) return "more than last time";
  return "the more she carries";
}

/**
 * The caption beside her — five words at most, and one at a time. It is the
 * only text in the frame that changes with the beat, which is what makes the
 * middle zone read as a state she is IN rather than a box she sits in.
 */
export function captionAt(phase: number): string | null {
  const b = COPY.beats;
  if (phase === BEATS.REST[0]) return b.rest;
  if (phase === BEATS.REST[1]) return b.again;
  if (phase === BEATS.DRAW[0] || phase === BEATS.DRAW[1]) return b.much;
  if (phase === BEATS.DIST[0]) return b.little;
  if (phase === BEATS.DIST[1]) return b.stale;
  if (phase === BEATS.KEEP[0]) return b.links;
  if (phase === BEATS.KEEP[1]) return b.sourced;
  if (phase === BEATS.WAKE[0]) return b.noted;
  if (phase === BEATS.WAKE[1]) return b.more;
  if (phase >= BEATS.QUIET_FROM && phase <= BEATS.QUIET_TO) return b.quiet;
  return null;
}
