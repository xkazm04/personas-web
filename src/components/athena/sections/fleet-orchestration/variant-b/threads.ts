/**
 * The threads themselves — pure geometry, no DOM, no React.
 *
 * Every thread is one cubic bezier authored from two anchors plus a `Flow`
 * (bow + sway). The bow is measured against the thread's own vertical run so
 * a short hop and a long drop keep the same family of curvature, and `MIN_RUN`
 * puts a floor under it: without one, the near-horizontal threads of the fan
 * would flatten into straight lines and the branch would stop reading as a
 * branch. The sway leans the departure sideways in the direction the thread is
 * already going, which is what stops four arcs out of one point from looking
 * like a compass rose.
 *
 * Coordinates are percent of the field, matching `./layout` exactly — the SVG
 * that renders these declares `viewBox="0 0 100 100"` with no aspect lock, so
 * "50" here and "50%" in a card's inline style are the same place.
 */

import { cardIn, cardOut, type FieldLayout, type Flow, type Point } from "./layout";

/** Curvature floor, in percent of the field. Below this the fan flattens into
 *  a bundle of straight wire and stops reading as a branch at all. */
const MIN_RUN = 12;

const r = (n: number) => Math.round(n * 100) / 100;

/** One thread, from anchor to anchor. */
export function curve(from: Point, to: Point, { bow, sway }: Flow): string {
  const run = Math.max(to.y - from.y, MIN_RUN);
  const c1x = from.x + sway;
  const c1y = from.y + run * bow;
  const c2x = to.x - sway * 0.45;
  const c2y = to.y - run * bow;
  return `M ${r(from.x)} ${r(from.y)} C ${r(c1x)} ${r(c1y)}, ${r(c2x)} ${r(c2y)}, ${r(to.x)} ${r(to.y)}`;
}

/** Her → each task. Drawn as each task is derived from the sentence. Each one
 *  leaves from its own point around her rather than all from one pixel. */
export function branchPaths(L: FieldLayout): string[] {
  return L.cards.map((_, i) => {
    const flow = L.branchFlow[i];
    const from = flow.origin
      ? { x: L.source.x + flow.origin.x, y: L.source.y + flow.origin.y }
      : L.source;
    return curve(from, cardIn(L, i), flow);
  });
}

/** Each task → the one node the answer settles at. Drawn as tasks finish. */
export function mergePaths(L: FieldLayout): string[] {
  return L.cards.map((_, i) => curve(cardOut(L, i), L.merge, L.mergeFlow[i]));
}

/** The short trunk from the merge node into the top of the answer. */
export function trunkPath(L: FieldLayout): string {
  const top = { x: L.result.x + L.result.w / 2, y: L.result.y };
  return `M ${r(L.merge.x)} ${r(L.merge.y)} L ${r(top.x)} ${r(top.y)}`;
}
