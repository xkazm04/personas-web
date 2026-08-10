/**
 * WHEN everything happens in "The Glide" — section 3 ("Onboarding partner"),
 * variant A. Modeled on dev-tools-grid/athenaFleetData.ts: one deterministic
 * CYCLE and pure phase functions the scene reads every frame. Where the route
 * goes is `./route`, the stage vocabulary is `./stages`; `./copy`, `./layout`
 * and `./series` are re-exported here so the scene has one import surface.
 * Nothing here touches the DOM.
 *
 * The app COMPOSES itself. Nothing pops into existence whole: every module is
 * built in layers, and the layers INTERLEAVE with Athena's journey.
 *
 *   shell    she DEPARTS the previous stop; the dashed ghost solidifies into
 *            the real panel — frame, header, label. She is still crossing.
 *   body     she ARRIVES; the structural content cascades in, row by row.
 *   detail   the brackets LOCK; the fine texture fills — metrics, chips,
 *            pills, avatar stacks, the sparkline drawing itself.
 *   chosen   the choice COMMITS as a small choreographed moment rather than a
 *            state flip, and the module keeps it for the rest of the loop.
 *
 * The tick clock sets only the STAGE; the order parts arrive inside a stage is
 * framer's job (`./modules/parts`), which is why this model cost the grid
 * nothing. The closing stop creates the agent, and only then do the runs table
 * and the monitoring deck exist — only then is there anything to monitor.
 */

import { DOCK, ROUTE, type RouteStop, type StopId } from "./route";
import { atStage, stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import type { Point, Rect } from "./layout";

export { COPY } from "./copy";
export { WIDE, COMPACT, WIDE_ONLY, layoutFor } from "./layout";
export { BAR_POINTS, CHART_POINTS, HEALTH_BARS } from "./series";
export { atStage, stepDelay, STEP } from "@/components/athena/stage/stages";
export type { ModuleStage } from "@/components/athena/stage/stages";
export type { Point, Rect, SceneLayout } from "./layout";
export type { RouteStop, StopId } from "./route";

/** Ticks per stop: depart+shell · arrive+body · lock+detail · choose · settle. */
const STOP_TICKS = 5;
/** Two opening beats before the first module — the chrome composes, then the
 *  toolbar. The workspace wakes up instead of popping in from a dead canvas. */
const FIRST_REVEAL = 2;
/** The closing stop lingers: the button beckons an extra beat before it
 *  commits, and she stays while the results deck builds itself behind her. */
const FINALE_TAIL = 2;

export const CYCLE = 27;
export const TICK_MS = 900; // 27 ticks × 900ms ≈ 24.3s per loop
/** Reduced-motion pinned frame: the last beat that still has her in it, and
 *  the first at which EVERY module has reached its final stage. The finished
 *  story in one still image. */
export const INITIAL_TICK = 23;

export interface GlideStop extends RouteStop {
  /** She sets off for this stop — and its ghost solidifies behind her. */
  revealAt: number;
  /** She has landed; the brackets lock one tick later. */
  arrive: number;
  /** The beat the whole stop exists for: the choice commits. */
  chooseAt: number;
  depart: number;
}

/** Beats derived from one grid, so no two tick numbers can drift apart. Each
 *  stop's revealAt is the previous stop's depart — the next module starts
 *  building as she leaves the last one. */
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

export type ModuleKey =
  | "toolbar" | "templates" | "connectors" | "trigger" | "action" | "runs" | "monitor";

/** A stop-owned module builds around its stop's journey: framed while she
 *  crosses, filled as she lands, detailed on the lock, marked on the commit. */
const stopPlan = (s: GlideStop): StagePlan => ({
  shell: s.revealAt,
  body: s.arrive,
  detail: s.arrive + 1,
  chosen: s.chooseAt,
});

/**
 * The whole composition order in one table — the single source of truth for
 * when any part of the app exists. The results deck waits for the agent: the
 * runs table frames and fills on the commit beat itself, its texture lands a
 * tick later, and the monitor builds one tick behind that, so the payoff
 * cascades across three beats instead of arriving as two finished panels.
 */
const done = CLOSER.chooseAt;
export const STAGE_PLAN: Record<ModuleKey, StagePlan> = {
  toolbar: { shell: 1, body: 1, detail: 1, chosen: null },
  templates: stopPlan(STOPS[0]),
  connectors: stopPlan(STOPS[1]),
  trigger: stopPlan(STOPS[2]),
  action: stopPlan(CLOSER),
  runs: { shell: done, body: done, detail: done + 1, chosen: null },
  monitor: { shell: done + 1, body: done + 1, detail: done + 2, chosen: null },
};

const MODULE_KEYS = Object.keys(STAGE_PLAN) as ModuleKey[];

/** Target rect for a stop at the current breakpoint. */
export function rectFor(stop: GlideStop, compact: boolean): Rect {
  return compact ? stop.rectCompact : stop.rect;
}

/** Same, by stop id — how the scene places its four target controls. */
export function rectOf(id: StopId, compact: boolean): Rect {
  return rectFor(STOPS.find((s) => s.id === id) ?? STOPS[0], compact);
}

/** The stop she is working: its module is building and she has not departed. */
export function activeStopAt(phase: number): GlideStop | null {
  return STOPS.find((s) => phase >= s.revealAt && phase < s.depart) ?? null;
}

/** The stop whose brackets have snapped on (one tick after arrival — the
 *  glide lands first, then the lock, then the module's detail fills). */
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

/** True while she is crossing to a stop — the same beat that stop's panel is
 *  being framed, which is the whole point: she never waits for the UI. */
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
  /** How far each module has composed; the rest still hold their rects. */
  stage: Record<ModuleKey, ModuleStage>;
  templateChosen: boolean;
  /** The runner-up dims a beat AFTER the pick lands, so the drawn check and
   *  the accent sweep own their moment before anything else moves. */
  templateDimmed: boolean;
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
  const stage = {} as Record<ModuleKey, ModuleStage>;
  for (const key of MODULE_KEYS) stage[key] = stageOf(STAGE_PLAN[key], phase);
  return {
    lockedId: lockedStopAt(phase)?.id ?? null,
    stage,
    templateChosen: atStage(stage.templates, "chosen"),
    templateDimmed: phase >= STOPS[0].chooseAt + 1,
    slack: slackStateAt(phase),
    scheduleArmed: atStage(stage.trigger, "chosen"),
    action: actionStateAt(phase),
  };
}

