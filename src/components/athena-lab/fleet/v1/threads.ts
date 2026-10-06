/**
 * The threads themselves - pure geometry, no DOM, no React.
 *
 * Wide: every thread is one cubic bezier along x, authored from two anchors
 * plus a `Flow`. `MIN_RUN` floors the bow so the short hops still read as a
 * branch, not a bundle of straight wire; the sway leans each thread off its
 * neighbours so four arcs out of one point never look like a compass rose.
 *
 * Compact: threads run as rounded elbows down the two gutters - out of her
 * down the left, answers home down the right - so none of them crosses a card.
 *
 * Coordinates are the scene's design px (`./layout`), the same space the
 * cards are placed in and the thread SVG's viewBox declares.
 */

import { cardIn, cardOut, type FieldLayout, type Flow, type Point } from "./layout";

const MIN_RUN = 40;
/** How far from her centre a thread leaves - clear of the avatar ring. */
const ORIGIN_R = 30;

const r = (n: number) => Math.round(n * 10) / 10;
const fmt = (p: Point) => `${r(p.x)} ${r(p.y)}`;

/** One wide thread, along x. */
function along(from: Point, to: Point, { bow, sway }: Flow): string {
  const run = Math.max(Math.abs(to.x - from.x), MIN_RUN);
  const c1 = { x: from.x + run * bow, y: from.y + sway };
  const c2 = { x: to.x - run * bow, y: to.y - sway * 0.4 };
  return `M ${fmt(from)} C ${fmt(c1)}, ${fmt(c2)}, ${fmt(to)}`;
}

/** Down the gutter, then in: the compact branch. */
function downThenAcross(from: Point, to: Point): string {
  const c1 = { x: from.x, y: from.y + (to.y - from.y) * 0.85 };
  const c2 = { x: from.x + (to.x - from.x) * 0.15, y: to.y };
  return `M ${fmt(from)} C ${fmt(c1)}, ${fmt(c2)}, ${fmt(to)}`;
}

/** Out, then down the gutter: the compact way home. */
function acrossThenDown(from: Point, to: Point): string {
  const c1 = { x: from.x + (to.x - from.x) * 0.85, y: from.y };
  const c2 = { x: to.x, y: from.y + (to.y - from.y) * 0.15 };
  return `M ${fmt(from)} C ${fmt(c1)}, ${fmt(c2)}, ${fmt(to)}`;
}

/** The sentence -> her: what you said, handed over. */
export function intakePath(L: FieldLayout): string {
  if (L.axis === "y") {
    const from = { x: L.branch.x, y: L.plan.y + L.plan.h };
    return `M ${fmt(from)} L ${fmt({ x: L.branch.x, y: L.branch.y - ORIGIN_R })}`;
  }
  const from = { x: L.request.x + L.request.w, y: L.request.y + L.request.h / 2 };
  return along(from, { x: L.branch.x - ORIGIN_R, y: L.branch.y }, { bow: 0.5, sway: 0 });
}

/** Her -> each task. Drawn as each task is derived from the sentence. */
export function branchPaths(L: FieldLayout): string[] {
  return L.cards.map((_, i) => {
    const to = cardIn(L, i);
    if (L.axis === "y") {
      return downThenAcross({ x: L.branch.x, y: L.branch.y + ORIGIN_R }, to);
    }
    const a = Math.atan2(to.y - L.branch.y, to.x - L.branch.x);
    const from = { x: L.branch.x + Math.cos(a) * ORIGIN_R, y: L.branch.y + Math.sin(a) * ORIGIN_R };
    return along(from, to, L.branchFlow[i]);
  });
}

/** Each task -> the one node the answer settles at. Drawn as tasks finish. */
export function mergePaths(L: FieldLayout): string[] {
  return L.cards.map((_, i) =>
    L.axis === "y"
      ? acrossThenDown(cardOut(L, i), L.merge)
      : along(cardOut(L, i), L.merge, L.mergeFlow[i]),
  );
}

/** The short trunk from the merge node into the answer. */
export function trunkPath(L: FieldLayout): string {
  const to =
    L.axis === "y"
      ? { x: L.merge.x, y: L.result.y }
      : { x: L.result.x, y: L.result.y + L.result.h / 2 };
  return `M ${fmt(L.merge)} L ${fmt(to)}`;
}
