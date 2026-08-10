/**
 * The one mono console line under the field — the only words in the scene that
 * are neither a project, a reading, nor the finding she opens.
 *
 * It reads the same phase clock everything else does, but it is a WORDING
 * concern rather than a choreography one, so it lives beside `./data` instead
 * of inside it. One-directional: this imports the clock, never the reverse.
 *
 * The counts are passed in rather than assumed, because a nine-row field and a
 * six-row field are honestly different fields and the line must not overclaim.
 */

import { FINDINGS } from "./copy";
import { BEATS, sceneAt } from "./data";

const BAD = FINDINGS.length;

/** Full line — one plain claim per act of the story. */
export function statusAt(phase: number, rows: number, total: number): string {
  const scene = sceneAt(phase, rows);
  if (phase < BEATS.SURVEY_AT) return "every project you own, every check on it";
  if (scene.surveying) {
    return `${Math.min(scene.checkedRows * (total / rows), total)} of ${total} checked`;
  }
  if (phase < BEATS.LAND_AT) return `${total - BAD} of them are fine — she says so once`;
  if (phase < BEATS.SORT_AT) return "found in this order · worth nothing in this order";
  if (phase < BEATS.OPEN_AT) return "worst first, not newest first";
  if (phase < BEATS.ACTION_AT) return "what she found, not what the status says";
  if (phase < BEATS.COMMIT_AT) return "and she knows where the fix lives";
  return "nothing rots quietly while you are somewhere else";
}

/** Compact line for narrow viewports — the same beat, fewer words. */
export function statusShortAt(phase: number, rows: number, total: number): string {
  const scene = sceneAt(phase, rows);
  if (phase < BEATS.SURVEY_AT) return "all of it, every day";
  if (scene.surveying) {
    return `${Math.min(scene.checkedRows * (total / rows), total)} of ${total} checked`;
  }
  if (phase < BEATS.LAND_AT) return `${BAD} of ${total} are not fine`;
  if (phase < BEATS.SORT_AT) return "the order she found them";
  if (phase < BEATS.OPEN_AT) return "worst first";
  if (phase < BEATS.COMMIT_AT) return "what she actually found";
  return "nothing rots quietly";
}
