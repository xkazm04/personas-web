/**
 * WHEN everything happens in "The Glide" — section 3 ("Onboarding partner"),
 * variant A. Modeled on dev-tools-grid/athenaFleetData.ts: one deterministic
 * CYCLE and pure phase functions the scene reads every frame. Where the route
 * goes is `./route`; `./copy`, `./layout` and `./series` are re-exported here
 * so the scene has one import surface. Nothing here touches the DOM.
 *
 * The app BUILDS itself. The canvas opens as quiet skeletons holding their
 * rects, and each module materializes only at its own moment — onboarding is
 * a thing you make, not a finished screen someone points at. Every stop runs
 * the same five-beat figure:
 *
 *   revealAt   the module springs into its reserved rect; she sets off for it
 *   arrive     the orb lands
 *   arrive+1   the corner brackets lock
 *   chooseAt   the choice COMMITS — a state change you can see
 *   depart     she moves on; the module keeps that state for the rest of the
 *              loop, so the screen only ever accumulates
 *
 * The closing stop creates the agent, and only then do the runs table and the
 * monitoring deck exist — because only then is there anything to monitor.
 */

import { DOCK, ROUTE, type RouteStop, type StopId } from "./route";
import type { Point, Rect } from "./layout";

export { COPY } from "./copy";
export { WIDE, COMPACT, WIDE_ONLY, layoutFor } from "./layout";
export { BAR_POINTS, CHART_POINTS, HEALTH_BARS } from "./series";
export type { Point, Rect, SceneLayout } from "./layout";
export type { RouteStop, StopId } from "./route";

/** Ticks per stop: reveal · arrive · lock · choose · settle. */
const STOP_TICKS = 5;
/** Two opening beats before the first module — bare skeletons, then the
 *  toolbar. The workspace wakes up instead of popping in from a dead canvas. */
const FIRST_REVEAL = 2;
/** The closing stop lingers: the button beckons an extra beat before it
 *  commits, and she stays while the results deck arrives behind her. */
const FINALE_TAIL = 2;

export const CYCLE = 27;
export const TICK_MS = 900; // 27 ticks × 900ms ≈ 24.3s per loop
/** Reduced-motion pinned frame: the last beat that still has her in it. Every
 *  module revealed and in its chosen state — template picked, Slack connected,
 *  schedule armed, agent created, runs + monitoring live — brackets on the
 *  action button, rail 4/4. The finished story in one still image. */
export const INITIAL_TICK = 23;

export interface GlideStop extends RouteStop {
  /** The module materializes here — and she sets off for it. */
  revealAt: number;
  /** She has landed; the brackets lock one tick later. */
  arrive: number;
  /** The beat the whole stop exists for: the choice commits. */
  chooseAt: number;
  depart: number;
}

/** Beats derived from one grid, so no two tick numbers can drift apart. Each
 *  stop's revealAt is the previous stop's depart — she never returns to the
 *  dock mid-route, and the next module lands as she leaves the last. */
export const STOPS: GlideStop[] = ROUTE.map((stop, i) => {
  const last = i === ROUTE.length - 1;
  const revealAt = FIRST_REVEAL + i * STOP_TICKS;
  return {
    ...stop,
    revealAt,
    arrive: revealAt + 1,
    chooseAt: revealAt + (last ? 4 : 3),
    depart: revealAt + STOP_TICKS + (last ? FINALE_TAIL : 0),
  };
});

const CLOSER = STOPS[STOPS.length - 1];

/** The tick each module materializes on — the whole reveal order in one
 *  table. Stop-owned modules inherit their stop's reveal beat; the results
 *  deck waits for the agent to exist. */
export const REVEAL = {
  toolbar: 1,
  templates: STOPS[0].revealAt,
  connectors: STOPS[1].revealAt,
  trigger: STOPS[2].revealAt,
  action: CLOSER.revealAt,
  runs: CLOSER.chooseAt,
  monitor: CLOSER.chooseAt + 1,
};

export type ModuleKey = keyof typeof REVEAL;

/** Target rect for a stop at the current breakpoint. */
export function rectFor(stop: GlideStop, compact: boolean): Rect {
  return compact ? stop.rectCompact : stop.rect;
}

/** Same, by stop id — how the scene places its four target controls. */
export function rectOf(id: StopId, compact: boolean): Rect {
  return rectFor(STOPS.find((s) => s.id === id) ?? STOPS[0], compact);
}

/** The stop she is working: its module is up and she has not departed. */
export function activeStopAt(phase: number): GlideStop | null {
  return STOPS.find((s) => phase >= s.revealAt && phase < s.depart) ?? null;
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

/** True while she is crossing to a stop — the reveal beat. The orb swells in
 *  flight and settles on arrival, one beat before the brackets snap. */
export function travelingAt(phase: number): boolean {
  const stop = activeStopAt(phase);
  return stop !== null && phase < stop.arrive;
}

/** Segmented progress rail — a segment fills when its choice commits, not
 *  when she arrives: the rail counts decisions made, not places visited. */
export function railAt(phase: number): boolean[] {
  return STOPS.map((s) => phase >= s.chooseAt);
}

export type ConnectState = "connect" | "connecting" | "connected";
export type ActionState = "idle" | "pulse" | "done";

export interface SceneState {
  lockedId: StopId | null;
  /** Which modules exist yet; the rest hold their rects as quiet skeletons. */
  shown: Record<ModuleKey, boolean>;
  templateChosen: boolean;
  slack: ConnectState;
  scheduleArmed: boolean;
  action: ActionState;
}

/** The Slack row lives its own little life: an unconnected tool until she
 *  commits the choice, a handshake on that beat, connected ever after. */
function slackStateAt(phase: number): ConnectState {
  const stop = STOPS[1];
  if (phase < stop.chooseAt) return "connect";
  return phase < stop.chooseAt + 1 ? "connecting" : "connected";
}

/** The closing button beckons once the brackets lock, then commits for good. */
function actionStateAt(phase: number): ActionState {
  if (phase >= CLOSER.chooseAt) return "done";
  return phase >= CLOSER.arrive + 1 ? "pulse" : "idle";
}

/** Everything the canvas needs at a phase tick, derived in one pure read. */
export function sceneStateAt(phase: number): SceneState {
  return {
    lockedId: lockedStopAt(phase)?.id ?? null,
    shown: {
      toolbar: phase >= REVEAL.toolbar,
      templates: phase >= REVEAL.templates,
      connectors: phase >= REVEAL.connectors,
      trigger: phase >= REVEAL.trigger,
      action: phase >= REVEAL.action,
      runs: phase >= REVEAL.runs,
      monitor: phase >= REVEAL.monitor,
    },
    templateChosen: phase >= STOPS[0].chooseAt,
    slack: slackStateAt(phase),
    scheduleArmed: phase >= STOPS[2].chooseAt,
    action: actionStateAt(phase),
  };
}

/** Which step of the route is on screen (1-based), for the status readouts. */
function stepAt(phase: number): number {
  const stop = activeStopAt(phase);
  return stop ? STOPS.indexOf(stop) + 1 : STOPS.length;
}

/** Mono status line — corner console readout. */
export function statusAt(phase: number): string {
  if (phase < STOPS[0].revealAt) return "workspace · setting up together";
  if (phase >= CLOSER.chooseAt) return "agent live · monitoring on";
  return `step ${stepAt(phase)}/${STOPS.length} · built with you`;
}

/** Compact status for narrow viewports — the step counter alone. */
export function statusShortAt(phase: number): string {
  if (phase < STOPS[0].revealAt) return "setting up";
  if (phase >= CLOSER.chooseAt) return "live";
  return `step ${stepAt(phase)}/${STOPS.length}`;
}
