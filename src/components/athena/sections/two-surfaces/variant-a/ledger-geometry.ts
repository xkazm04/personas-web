/**
 * Pure geometry + timeline for "The Migration Ledger" (section 2, variant A).
 * No JSX.
 *
 * One stage space: a 1000×560 SVG viewBox overlaying the md+ scene. Noise
 * surfaces (HTML cards) are absolutely positioned by percent of the stage
 * box; flight paths / changelog labels are derived from the same percent
 * coordinates so lines and cards stay registered at any stage width.
 */

export const STAGE_W = 1000;
export const STAGE_H = 560;

type PctPoint = { x: number; y: number }; // percent of stage box, 0-100

/** Where each noise surface springs in (left column). */
export const SOURCES: Record<"popover" | "fleet" | "failure", PctPoint> = {
  popover: { x: 17, y: 16 },
  fleet: { x: 17, y: 46 },
  failure: { x: 17, y: 76 },
};

/** Where each migration lands (right column destinations). */
export const DESTS: Record<"orb" | "chat" | "tile", PctPoint> = {
  orb: { x: 75, y: 16 },
  chat: { x: 76, y: 46 },
  tile: { x: 76, y: 80 },
};

const ux = (p: PctPoint) => ({ x: (p.x / 100) * STAGE_W, y: (p.y / 100) * STAGE_H });

/** Flight leader line: source edge → gentle bezier → destination edge. */
function flightPath(from: PctPoint, to: PctPoint, sag: number): string {
  const a = ux(from);
  const b = ux(to);
  const x0 = a.x + 82; // start just right of the card
  const x1 = b.x - 88; // end just left of the destination
  const c1 = { x: x0 + (x1 - x0) * 0.35, y: a.y + sag };
  const c2 = { x: x0 + (x1 - x0) * 0.72, y: b.y + sag * 0.4 };
  return (
    `M ${x0.toFixed(1)} ${a.y.toFixed(1)} ` +
    `C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ` +
    `${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ` +
    `${x1.toFixed(1)} ${b.y.toFixed(1)}`
  );
}

export type Flight = {
  id: "popover" | "fleet" | "failure";
  source: PctPoint;
  dest: PctPoint;
  /** Bezier the leader line draws along while the surface flies. */
  path: string;
  /** Percent placement for the changelog-entry label near the path midpoint. */
  label: { left: string; top: string };
};

function flight(
  id: Flight["id"],
  dest: PctPoint,
  sag: number,
  labelDy: number,
): Flight {
  const source = SOURCES[id];
  const midY = (source.y + dest.y) / 2 + (sag / STAGE_H) * 100 * 0.6;
  return {
    id,
    source,
    dest,
    path: flightPath(source, dest, sag),
    label: { left: `${(source.x + dest.x) / 2}%`, top: `${(midY + labelDy).toFixed(1)}%` },
  };
}

/** One entry per MIGRATIONS item in data.ts, keyed by the same ids. */
export const FLIGHTS: readonly Flight[] = [
  flight("popover", DESTS.orb, -26, -6.5),
  flight("fleet", DESTS.chat, -20, -6.5),
  flight("failure", DESTS.tile, 22, 4.5),
];

/* ------------------------------------------------------------------ */
/* Timeline — one shared clock so cards, lines, labels and landings    */
/* stay in step. All values are framer-motion delays in seconds.       */
/* ------------------------------------------------------------------ */

const base = (i: number) => 0.25 + i * 0.85;

export const TL = {
  /** Noise surface springs in, looking obnoxious. */
  pop: base,
  /** Surface lifts off toward its destination. */
  fly: (i: number) => base(i) + 0.55,
  flyDuration: 1.0,
  /** Leader line traces the flight path. */
  draw: (i: number) => base(i) + 0.6,
  /** Changelog-entry label pops near the path midpoint. */
  label: (i: number) => base(i) + 0.95,
  /** Destination reacts (glow / ledger row / in-place error). */
  land: (i: number) => base(i) + 1.35,
  /** Closing beat — the surviving-surfaces statement. */
  close: 3.5,
  closeSub: 3.75,
} as const;
