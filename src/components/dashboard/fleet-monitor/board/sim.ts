import { FLEET } from "../fleet-data";
import { slotCapacity } from "./host";
import {
  MESSAGE_TEXTS,
  TEAM_TASKS,
  rand,
  type BoardEvent,
  type SimAgent,
  type TaskKey,
} from "./model";

/* ── The seeded live simulation, as a pure reducer ──────────────────
 *
 * Same rules as the contest prototype: running agents progress and finish,
 * a finished slot pulls the next queued (or a resting) agent, failures
 * occasionally self-heal, a few new ones happen, and the message graph
 * replays between agents. Randomness is a mulberry32 stream whose seed lives
 * in the state, so every step is deterministic and the reducer stays pure.
 */

export interface SimState {
  agents: SimAgent[];
  /** Newest first. */
  events: BoardEvent[];
  simMs: number;
  seed: number;
  nextTickAt: number;
  /** Sim time of the machine's last report: every tick is a sync pass. */
  beatAt: number;
  /** The fleet size the last advance ran at; caps concurrent runs (host slots). */
  scale: number;
  /** Agents the last "Pause all" switched off, so "Resume all" brings back exactly
   *  those (and not the ones that were off before it); null when not fleet-paused. */
  fleetPaused: string[] | null;
}

/** The agent id of a fleet-wide event (pause all, resume all). */
export const FLEET_EVENT_ID = "*";

export type AgentVerb = "retry" | "read" | "pause" | "resume" | "run" | "cancel";

export type SimAction =
  | { type: "advance"; dt: number; scale: number; still: boolean }
  | { type: "review"; id: string; rid: string; approve: boolean }
  | { type: "draft"; id: string; approve: boolean }
  | { type: "answer"; id: string; text?: string }
  | { type: AgentVerb; id: string }
  | { type: "pauseAll"; stop: boolean }
  | { type: "resumeAll" };

const MAX_EVENTS = 400;

export function initSim(scale = 99): SimState {
  return {
    agents: FLEET.agents.map((a, idx) => ({
      ...a,
      idx,
      reviews: [...a.reviews],
      unreadMessages: [...a.unreadMessages],
      recentStatuses: [...a.recentStatuses],
      spark24h: [...a.spark24h],
      startSim: a.state === "running" ? -(a.runningSinceMs ?? 0) : null,
      taskKey: null,
      callTicks: [],
    })),
    events: FLEET.timeline.map((e) => ({ ...e })),
    simMs: 0,
    seed: 20261001,
    nextTickAt: 3000,
    beatAt: 0,
    scale,
    fleetPaused: null,
  };
}

/** A mutable draft over one reducer step: copy-on-write agents, a random stream. */
class Draft {
  agents: SimAgent[];
  events: BoardEvent[];
  seed: number;
  private touched = new Set<number>();

  constructor(readonly state: SimState) {
    this.agents = state.agents.slice();
    this.events = state.events;
    this.seed = state.seed;
  }
  r(): number {
    const [v, next] = rand(this.seed);
    this.seed = next;
    return v;
  }
  pick<T>(list: T[]): T {
    return list[Math.floor(this.r() * list.length)];
  }
  edit(idx: number): SimAgent {
    if (!this.touched.has(idx)) {
      const a = this.agents[idx];
      this.agents[idx] = {
        ...a,
        reviews: [...a.reviews],
        unreadMessages: [...a.unreadMessages],
        recentStatuses: [...a.recentStatuses],
        spark24h: [...a.spark24h],
      };
      this.touched.add(idx);
    }
    return this.agents[idx];
  }
  push(e: Omit<BoardEvent, "tsMs">, simMs: number) {
    this.events = [{ ...e, tsMs: FLEET.nowMs + simMs }, ...this.events].slice(0, MAX_EVENTS);
  }
}

function startRun(a: SimAgent, simMs: number, task: string | null, taskKey: TaskKey | null) {
  a.state = "running";
  a.progress = 0;
  a.startSim = simMs;
  a.task = task;
  a.taskKey = taskKey;
  a.liveToolCalls = 0;
  a.callTicks = [];
}

/** Start a run when the machine has a free slot; otherwise queue it. */
function startOrQueue(d: Draft, a: SimAgent, scale: number, simMs: number, task: string | null, taskKey: TaskKey | null) {
  const running = d.agents.slice(0, scale).filter((x) => x.state === "running").length;
  if (running < slotCapacity(scale)) startRun(a, simMs, task, taskKey);
  else {
    a.state = "queued";
    a.task = task;
    a.taskKey = taskKey;
    a.progress = null;
    a.startSim = null;
  }
}

function teamTask(d: Draft, a: SimAgent): [string | null, TaskKey | null] {
  const pool = TEAM_TASKS[a.team];
  return pool?.length ? [d.pick(pool), null] : [null, "nextBatch"];
}

function complete(d: Draft, a: SimAgent, scale: number, simMs: number) {
  d.push({ agentId: a.id, toAgentId: null, kind: "run_completed", text: null }, simMs);
  a.state = a.reviews.length ? "attention" : "idle";
  a.task = null;
  a.taskKey = null;
  a.progress = null;
  a.startSim = null;
  a.runsToday++;
  a.recentStatuses = ["completed" as const, ...a.recentStatuses].slice(0, 12);
  a.spark24h[23]++;
  a.costTodayUsd = Math.round((a.costTodayUsd + 0.03 + d.r() * 0.12) * 100) / 100;
  a.liveToolCalls = 0;
  fillSlot(d, scale, simMs, a, true);
}

/** A slot just freed: the next queued agent (same team first) takes it, or,
 *  when `busy` keeps the machine busy, a resting one starts its next batch. */
function fillSlot(d: Draft, scale: number, simMs: number, a: SimAgent, busy: boolean) {
  const scope = d.agents.slice(0, scale);
  let next =
    scope.find((x) => x.state === "queued" && x.enabled && x.team === a.team) ??
    scope.find((x) => x.state === "queued" && x.enabled);
  if (!next && busy) {
    const idle = scope.filter((x) => x.state === "idle" && x.enabled && !x.reviews.length && x.id !== a.id);
    if (idle.length) next = d.pick(idle);
  }
  if (next) {
    const q = d.edit(next.idx);
    startRun(q, simMs, ...teamTask(d, q));
  }
}

/** Stop a run where it stands (cancel, or "Pause all" with stop). */
function stopRun(a: SimAgent) {
  a.state = a.reviews.length ? "attention" : "idle";
  a.task = null;
  a.taskKey = null;
  a.progress = null;
  a.startSim = null;
  a.liveToolCalls = 0;
}

function replayEdge(d: Draft, scale: number, simMs: number) {
  const ids = new Set(d.agents.slice(0, scale).map((a) => a.id));
  const edges = FLEET.channelEdges.filter((e) => ids.has(e.a) && ids.has(e.b));
  if (!edges.length) return;
  const e = d.pick(edges);
  const fwd = d.r() < 0.5;
  const [from, to] = fwd ? [e.a, e.b] : [e.b, e.a];
  const kind = d.r() < 0.55 ? "message" : "handoff";
  const text = d.pick(MESSAGE_TEXTS);
  d.push({ agentId: from, toAgentId: to, kind, text }, simMs);
  if (d.r() < 0.22) {
    const target = d.edit(d.agents.findIndex((a) => a.id === to));
    target.unreadMessages.push({ id: `${to}-m${Math.floor(d.r() * 1e6)}`, text, ageMin: -simMs / 60_000 });
  }
}

function simTick(d: Draft, scale: number, simMs: number) {
  const running = d.agents.slice(0, scale).filter((a) => a.state === "running").map((a) => d.edit(a.idx));
  for (const a of running) {
    a.progress = Math.min(1, (a.progress ?? 0) + 0.015 + d.r() * 0.05);
    const from = a.liveToolCalls;
    a.liveToolCalls += 1 + Math.floor(d.r() * 4);
    a.callTicks = [...a.callTicks.slice(-23), { at: simMs, from, to: a.liveToolCalls }];
  }
  running.filter((a) => (a.progress ?? 0) >= 1).slice(0, 2).forEach((a) => complete(d, a, scale, simMs));
  for (const a of running) if (a.state === "running" && (a.progress ?? 0) >= 1) a.progress = 0.99;

  const r = d.r();
  const failed = d.agents.slice(0, scale).filter((a) => a.state === "failed" && a.enabled);
  if (r < 0.1 && failed.length) {
    const a = d.edit(d.pick(failed).idx);
    startOrQueue(d, a, scale, simMs, ...teamTask(d, a));
    a.health = "degraded";
    d.push({ agentId: a.id, toAgentId: null, kind: "self_heal", text: null }, simMs);
  } else if (r < 0.17) {
    const cands = d.agents.slice(0, scale).filter((a) => a.state === "running" && (a.progress ?? 0) < 0.5);
    if (cands.length && failed.length < 6) {
      const a = d.edit(d.pick(cands).idx);
      a.state = "failed";
      a.task = null;
      a.taskKey = "toolTimeout";
      a.progress = null;
      a.startSim = null;
      a.health = "degraded";
      a.recentStatuses = ["failed" as const, ...a.recentStatuses].slice(0, 12);
      d.push({ agentId: a.id, toAgentId: null, kind: "run_failed", text: null }, simMs);
    } else replayEdge(d, scale, simMs);
  } else replayEdge(d, scale, simMs);
}

export function simReducer(state: SimState, action: SimAction): SimState {
  const d = new Draft(state);
  let { simMs, nextTickAt, beatAt } = state;
  if (action.type === "advance") {
    simMs += action.dt;
    if (simMs >= nextTickAt) {
      simTick(d, action.scale, simMs);
      nextTickAt = simMs + (action.still ? 6000 : 2500 + d.r() * 1500);
      beatAt = simMs;
    }
    return { ...state, agents: d.agents, events: d.events, seed: d.seed, simMs, nextTickAt, beatAt, scale: action.scale };
  }
  const scale = state.scale;
  if (action.type === "pauseAll" || action.type === "resumeAll") return fleetDecision(d, state, action);
  const idx = state.agents.findIndex((a) => a.id === action.id);
  if (idx < 0) return state;
  const a = d.edit(idx);
  const base = { agentId: a.id, toAgentId: null, kind: "decision" as const, text: null };
  if (action.type === "review") {
    const rv = a.reviews.find((x) => x.id === action.rid);
    if (!rv) return state;
    a.reviews = a.reviews.filter((x) => x.id !== rv.id);
    if (!a.reviews.length && (a.state === "attention" || (a.state === "draft_ready" && action.approve))) {
      a.state = "idle";
      a.task = null;
      a.taskKey = null;
    }
    if (a.state === "draft_ready" && !action.approve && !a.reviews.length) startOrQueue(d, a, scale, simMs, null, "revising");
    d.push({ ...base, decision: { act: action.approve ? "approve" : "sendback", title: rv.title } }, simMs);
  } else if (action.type === "retry") {
    const pool = TEAM_TASKS[a.team];
    startOrQueue(d, a, scale, simMs, pool?.[0] ?? null, pool?.length ? null : "retrying");
    a.health = "degraded";
    d.push({ ...base, decision: { act: "retry" } }, simMs);
  } else if (action.type === "answer") {
    if (a.state !== "input_required") return state;
    startOrQueue(d, a, scale, simMs, null, "resuming");
    d.push({ ...base, decision: { act: "answer", text: action.text?.trim() || undefined } }, simMs);
  } else if (action.type === "draft") {
    // A draft with no review of its own: approving publishes it, sending it back revises.
    if (a.state !== "draft_ready") return state;
    if (action.approve) stopRun(a);
    else startOrQueue(d, a, scale, simMs, null, "revising");
    d.push({ ...base, decision: { act: action.approve ? "publish" : "revise" } }, simMs);
  } else if (action.type === "pause") {
    if (!a.enabled) return state;
    a.enabled = false;
    // A queued run never starts; a run in progress finishes (pause stops new runs).
    if (a.state === "queued") stopRun(a);
    d.push({ ...base, decision: { act: "pause" } }, simMs);
  } else if (action.type === "resume") {
    if (a.enabled) return state;
    a.enabled = true;
    d.push({ ...base, decision: { act: "resume" } }, simMs);
  } else if (action.type === "run") {
    if (!a.enabled || a.state === "running" || a.state === "input_required" || a.state === "draft_ready") return state;
    startOrQueue(d, a, scale, simMs, ...teamTask(d, a));
    d.push({ ...base, decision: { act: "run" } }, simMs);
  } else if (action.type === "cancel") {
    if (a.state !== "running") return state;
    stopRun(a);
    fillSlot(d, scale, simMs, a, false);
    d.push({ ...base, decision: { act: "cancel" } }, simMs);
  } else {
    const n = a.unreadMessages.length;
    a.unreadMessages = [];
    d.push({ ...base, decision: { act: "read", n } }, simMs);
  }
  return { ...state, agents: d.agents, events: d.events, seed: d.seed };
}

/** "Pause all" switches every agent in scope off (stopping runs too when asked)
 *  and remembers whom; "Resume all" brings back exactly those. */
function fleetDecision(d: Draft, state: SimState, action: { type: "pauseAll"; stop: boolean } | { type: "resumeAll" }): SimState {
  const base = { agentId: FLEET_EVENT_ID, toAgentId: null, kind: "decision" as const, text: null };
  const scope = state.agents.slice(0, state.scale);
  if (action.type === "pauseAll") {
    const paused: string[] = [];
    let stopped = 0;
    for (const x of scope) {
      if (!x.enabled && !(action.stop && x.state === "running")) continue;
      const a = d.edit(x.idx);
      if (a.enabled) paused.push(a.id);
      a.enabled = false;
      if (a.state === "queued" || (action.stop && a.state === "running")) {
        if (a.state === "running") stopped++;
        stopRun(a);
      }
    }
    d.push({ ...base, decision: { act: "pauseAll", n: paused.length, stopped } }, state.simMs);
    return { ...state, agents: d.agents, events: d.events, seed: d.seed, fleetPaused: [...(state.fleetPaused ?? []), ...paused] };
  }
  const ids = new Set(state.fleetPaused ?? []);
  let n = 0;
  for (const x of scope) {
    if (x.enabled || !ids.has(x.id)) continue;
    d.edit(x.idx).enabled = true;
    n++;
  }
  d.push({ ...base, decision: { act: "resumeAll", n } }, state.simMs);
  return { ...state, agents: d.agents, events: d.events, seed: d.seed, fleetPaused: null };
}
