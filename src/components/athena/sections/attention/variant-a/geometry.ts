/**
 * Pure geometry + timeline for "Focus, kept" (section 2, variant A). No JSX.
 *
 * One coordinate space: a 960×600 viewBox depicting the visitor's screen —
 * an editor window mid-flow, seven interruption cards erupting over it, and
 * a small calm glow at the right edge everything streams into.
 *
 * The timeline is declarative (delays on whileInView keyframes, REPLAY
 * viewport) rather than a state machine, so it replays on every re-entry
 * for free and needs no effects.
 */

export const VIEW_W = 960;
export const VIEW_H = 600;

/* ------------------------------------------------------------------ */
/* The visitor's editor window                                         */
/* ------------------------------------------------------------------ */

export const EDITOR = { x: 70, y: 50, w: 690, h: 470, r: 18 } as const;
export const CHROME_H = 36;
/** Window-chrome traffic-light dot centers. */
export const CHROME_DOTS = [88, 106, 124].map((cx) => ({
  cx,
  cy: EDITOR.y + CHROME_H / 2,
}));

/** Abstract code lines: indent steps + widths, laid out top to bottom. */
const LINE_SPECS = [
  { indent: 0, w: 180 }, { indent: 1, w: 300 }, { indent: 1, w: 240 },
  { indent: 2, w: 340, hot: true }, { indent: 2, w: 210 }, { indent: 1, w: 120 },
  { indent: 0, w: 60 }, { indent: 0, w: 260 }, { indent: 1, w: 320, hot: true },
  { indent: 1, w: 180 }, { indent: 2, w: 280 }, { indent: 0, w: 90 },
] as const;

export const CODE_LINES = LINE_SPECS.map((s, i) => ({
  x: EDITOR.x + 34 + s.indent * 28,
  y: EDITOR.y + CHROME_H + 30 + i * 27,
  w: s.w,
  hot: "hot" in s && s.hot === true,
}));

/** The line that "types itself" once the screen heals — flow resuming. */
export const HEAL_LINE = {
  x: EDITOR.x + 34 + 28,
  y: EDITOR.y + CHROME_H + 30 + LINE_SPECS.length * 27,
  w: 252,
  h: 10,
} as const;
/** Blinking caret riding the end of the heal line. */
export const CARET = {
  x: HEAL_LINE.x + HEAL_LINE.w + 8,
  y: HEAL_LINE.y - 4,
  w: 3,
  h: 18,
} as const;

/* ------------------------------------------------------------------ */
/* The calm presence + counter chip                                    */
/* ------------------------------------------------------------------ */

export const GLOW = { x: 880, y: 300, r: 26 } as const;
export const COUNTER = { cx: 852, cy: 366, w: 168, h: 32, r: 16 } as const;

/* ------------------------------------------------------------------ */
/* Interruption cards + their flights                                  */
/* ------------------------------------------------------------------ */

export const CARD = { w: 210, h: 58, r: 12 } as const;

/** Card top-left, entrance rotation, and settled (messy) resting tilt. */
export const SPOTS = [
  { x: 140, y: 84, rot: -8, settle: -3 },
  { x: 400, y: 62, rot: 6, settle: 2 },
  { x: 560, y: 150, rot: -5, settle: -2 },
  { x: 96, y: 280, rot: 8, settle: 3 },
  { x: 470, y: 300, rot: -7, settle: -2 },
  { x: 280, y: 176, rot: 5, settle: 2 },
  { x: 560, y: 430, rot: -6, settle: -3 },
] as const;

export function cardCenter(i: number) {
  const s = SPOTS[i];
  return { cx: s.x + CARD.w / 2, cy: s.y + CARD.h / 2 };
}

/** Translation from a card's rest position to the glow (flight end). */
export function flightDelta(i: number) {
  const { cx, cy } = cardCenter(i);
  return { dx: GLOW.x - cx, dy: GLOW.y - cy };
}

/** Thin traced arc each interruption leaves as it streams into the glow. */
export function trailPath(i: number): string {
  const { cx, cy } = cardCenter(i);
  const c1x = cx + (GLOW.x - cx) * 0.3;
  const c1y = cy - 70;
  const c2x = GLOW.x - 90;
  const c2y = GLOW.y - 50;
  return `M ${cx} ${cy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${GLOW.x} ${GLOW.y}`;
}

/** transform-box: view-box so scale/rotate resolve around a point in user units. */
export function originAt(x: number, y: number) {
  return { transformBox: "view-box", transformOrigin: `${x}px ${y}px` } as const;
}

/* ------------------------------------------------------------------ */
/* Timeline (seconds from viewport entry)                              */
/* ------------------------------------------------------------------ */

export const T = {
  /** Chaos: card i springs in, slightly rotated, stealing space. */
  pop: (i: number) => 0.1 + i * 0.16,
  /** Transformation: card i lifts off and streams into the glow. */
  flight: (i: number) => 1.9 + i * 0.12,
  /** The screen heals: flow line types itself, editor re-expands. */
  heal: 3.15,
  /** Counter chip pops beside the glow — nothing was lost, it was held. */
  counter: 3.4,
} as const;
