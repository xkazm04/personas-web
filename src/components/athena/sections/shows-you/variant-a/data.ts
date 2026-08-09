/**
 * Data + clock for "The Glide" — section 3 ("She shows you how"), variant A.
 * Modeled on dev-tools-grid/athenaFleetData.ts: one deterministic CYCLE,
 * choreography as data (stops with arrive/depart ticks + target rects), and
 * pure phase functions the scene derives everything from.
 *
 * The scene: a stylized desktop app plays a complete guided walkthrough.
 * Athena's orb glides stop to stop; at each stop four corner brackets lock
 * onto the exact control, the control glows (the rest of the UI is never
 * dimmed or blocked), a ≤5-word caption narrates, and a segmented progress
 * rail advances. The final stop is a real action button. Loop.
 *
 * Geometry lives in `./layout` (WIDE + COMPACT rect sets); all wording lives
 * in `./copy` under the PROTOTYPE COPY header. Both are re-exported here so
 * the scene has a single import surface.
 */

import type { Point, Rect } from "./layout";

export { COPY } from "./copy";
export { WIDE, COMPACT, WIDE_ONLY, layoutFor } from "./layout";
export type { Point, Rect, SceneLayout } from "./layout";

export const CYCLE = 24;
export const TICK_MS = 1100;
/** Reduced-motion pinned frame: mid-walkthrough — brackets locked on stop 2
 *  (Slack connector, mid-handshake), rail at 2/4, caption visible. Every
 *  enriched module renders in its finished state. The story in one image. */
export const INITIAL_TICK = 9;

export type StopId = "template" | "connect" | "trigger" | "action";

export interface GlideStop {
  id: StopId;
  /** ≤5-word caption narrated beside the orb while locked. */
  caption: string;
  /** The control the brackets lock onto (md+ / <md). */
  rect: Rect;
  rectCompact: Rect;
  /** Where the orb hovers while narrating this stop (md+ / <md). */
  orb: Point;
  orbCompact: Point;
  arrive: number;
  depart: number;
}

/** The walkthrough route — pick a template → connect a tool → set the
 *  trigger → end on a real action button. Rects mirror `./layout`. */
export const STOPS: GlideStop[] = [
  {
    id: "template",
    caption: "pick a starting point",
    rect: { x: 3.5, y: 16.5, w: 27, h: 26 },
    rectCompact: { x: 4, y: 15.5, w: 92, h: 22 },
    orb: { x: 61, y: 29 },
    orbCompact: { x: 64, y: 31 },
    arrive: 2,
    depart: 7,
  },
  {
    id: "connect",
    caption: "connect your Slack",
    rect: { x: 5.5, y: 51.5, w: 51.5, h: 6 },
    rectCompact: { x: 6, y: 47.5, w: 88, h: 6 },
    orb: { x: 61, y: 48 },
    orbCompact: { x: 64, y: 56 },
    arrive: 7,
    depart: 12,
  },
  {
    id: "trigger",
    caption: "set the trigger",
    rect: { x: 3.5, y: 80, w: 55.5, h: 16 },
    rectCompact: { x: 4, y: 70, w: 92, h: 15 },
    orb: { x: 61, y: 76 },
    orbCompact: { x: 64, y: 82.5 },
    arrive: 12,
    depart: 17,
  },
  {
    id: "action",
    caption: "one click — it's live",
    rect: { x: 63.5, y: 80, w: 33, h: 13 },
    rectCompact: { x: 4, y: 88.5, w: 92, h: 8 },
    orb: { x: 61, y: 86.5 },
    orbCompact: { x: 50, y: 78.4 },
    arrive: 17,
    depart: 22,
  },
];

/** Where the orb rests before/after a walkthrough — upper right, off the UI. */
export const DOCK: Point = { x: 88, y: 5.5 };

/** Target rect for a stop at the current breakpoint. */
export function rectFor(stop: GlideStop, compact: boolean): Rect {
  return compact ? stop.rectCompact : stop.rect;
}

/** Same, by stop id — how the scene places its four target controls. */
export function rectOf(id: StopId, compact: boolean): Rect {
  return rectFor(STOPS.find((s) => s.id === id) ?? STOPS[0], compact);
}

/** The stop the orb is working (arrived, not yet departed) at a phase tick. */
export function activeStopAt(phase: number): GlideStop | null {
  return STOPS.find((s) => phase >= s.arrive && phase < s.depart) ?? null;
}

/** The stop whose brackets have snapped on (one tick after arrival — the
 *  glide lands first, then the lock). */
export function lockedStopAt(phase: number): GlideStop | null {
  const stop = activeStopAt(phase);
  return stop && phase >= stop.arrive + 1 ? stop : null;
}

/** Orb position at a phase tick — at the active stop, else docked. */
export function orbAt(phase: number, compact: boolean): Point {
  const stop = activeStopAt(phase);
  if (!stop) return DOCK;
  return compact ? stop.orbCompact : stop.orb;
}

/** True on the arrival tick — she is mid-glide / just landing, not locked.
 *  The orb swells while traveling and settles when the brackets snap. */
export function travelingAt(phase: number): boolean {
  const stop = activeStopAt(phase);
  return stop !== null && phase < stop.arrive + 1;
}

/** Segmented progress rail — a segment fills the moment its stop locks. */
export function railAt(phase: number): boolean[] {
  return STOPS.map((s) => phase >= s.arrive + 1);
}

/** Final-stop action button pulses while she presents it. */
export function actionPulseAt(phase: number): boolean {
  const last = STOPS[STOPS.length - 1];
  return phase >= last.arrive + 1 && phase < last.depart;
}

export type ConnectState = "connect" | "connecting" | "connected";

/** The Slack row lives its own little life: an unconnected tool before she
 *  gets there, a handshake while she narrates it, connected ever after. */
export function slackStateAt(phase: number): ConnectState {
  const stop = STOPS[1];
  if (phase < stop.arrive + 1) return "connect";
  if (phase < stop.depart) return "connecting";
  return "connected";
}

/** Mono status line — corner console readout (≤5 words). */
export function statusAt(phase: number): string {
  if (phase < STOPS[0].arrive) return "guided · walkthrough starting";
  if (phase >= STOPS[STOPS.length - 1].depart) return "ended on a real action";
  const done = Math.max(railAt(phase).filter(Boolean).length, 1);
  return `step ${done}/${STOPS.length} · screen stays yours`;
}

/** Compact status for narrow viewports — the step counter alone. */
export function statusShortAt(phase: number): string {
  if (phase < STOPS[0].arrive) return "starting";
  if (phase >= STOPS[STOPS.length - 1].depart) return "live";
  return `step ${Math.max(railAt(phase).filter(Boolean).length, 1)}/${STOPS.length}`;
}

/** Monitoring sparkline — one deterministic week of run counts (SVG y-axis,
 *  so a falling number is a rising line). */
export const CHART_POINTS = [20, 16, 18, 10, 13, 6, 9, 3] as const;
/** Monitoring bar series — the same week as discrete volume. */
export const BAR_POINTS = [45, 70, 55, 85, 60, 95, 72] as const;
/** Template-card health strip — per-day success, as bar heights. */
export const HEALTH_BARS = [55, 80, 62, 90, 70, 96, 84] as const;
