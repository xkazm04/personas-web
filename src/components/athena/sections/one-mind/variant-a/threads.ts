/**
 * The threads themselves — pure geometry, no DOM, no React.
 *
 * One cubic bezier per conversation, from where its thread leaves it to where
 * it meets the one shared body of memory. The bow is measured against the
 * thread's own run so a short drop and a long sweep keep the same family of
 * curvature, and `MIN_RUN` puts a floor under it: without one the compact
 * threads, which travel mostly sideways, would flatten into straight wire and
 * stop reading as threads at all. The sway leans each departure out in its own
 * direction, so four threads leaving four places never read as a bundle.
 *
 * Coordinates are percent of the field, matching `./layout` exactly — the SVG
 * that renders these declares `viewBox="0 0 100 100"` with no aspect lock, so
 * "50" here and "50%" in a box's inline style are the same place.
 */

import type { FieldLayout, Flow, Point, Rect } from "./layout";

const MIN_RUN = 14;

const r = (n: number) => Math.round(n * 100) / 100;

/** One thread, anchor to anchor. */
export function curve(from: Point, to: Point, { bow, sway }: Flow): string {
  const run = Math.max(to.y - from.y, MIN_RUN);
  const c1x = from.x + sway;
  const c1y = from.y + run * bow;
  const c2x = to.x - sway * 0.45;
  const c2y = to.y - run * bow;
  return `M ${r(from.x)} ${r(from.y)} C ${r(c1x)} ${r(c1y)}, ${r(c2x)} ${r(c2y)}, ${r(to.x)} ${r(to.y)}`;
}

/** Every conversation to the one thing they all draw on. */
export function threadPaths(L: FieldLayout): string[] {
  return L.panels.map((_, i) => curve(L.out[i], L.inlet[i], L.flow[i]));
}

/** Bar thickness, per axis. The field is wider than it is tall, so a single
 *  percentage would draw the uprights fat and the runs hairline. */
const UP = 0.25;
const ACROSS = 0.4;

/**
 * The wiring INSIDE the memory: the one line everything is strung on, the
 * short stems bringing each thread down onto it from the edge it landed on,
 * and the taps that hang each remembered thing off it.
 *
 * It is drawn as bars rather than as one long line THROUGH the beads for a
 * plain reason: a line crossing a translucent pill reads as a strike-through
 * of the words inside it. Threading between them says the same thing and can
 * be read.
 */
export function spineWires(L: FieldLayout): Rect[] {
  const vertical = L.spine.h > L.spine.w;
  const stems = vertical
    ? []
    : L.inlet.map((p) => ({ x: p.x - UP / 2, y: L.band.y, w: UP, h: L.spine.y - L.band.y }));
  const taps = L.facts.map((r) =>
    vertical
      ? { x: r.x + r.w, y: r.y + r.h / 2 - ACROSS / 2, w: L.spine.x - r.x - r.w, h: ACROSS }
      : { x: r.x + r.w / 2 - UP / 2, y: L.spine.y, w: UP, h: r.y - L.spine.y },
  );
  return [L.spine, ...stems, ...taps];
}
