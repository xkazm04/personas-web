import { FLEET } from "../fleet-data";
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
}

export type SimAction =
  | { type: "advance"; dt: number; scale: number; still: boolean }
  | { type: "review"; id: string; rid: string; approve: boolean }
  | { type: "retry" | "answer" | "read"; id: string };

const MAX_EVENTS = 400;

export function initSim(): SimState {
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
    })),
    events: FLEET.timeline.map((e) => ({ ...e })),
    simMs: 0,
    seed: 20261001,
    nextTickAt: 3000,
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
  const scope = d.agents.slice(0, scale);
  let next =
    scope.find((x) => x.state === "queued" && x.enabled && x.team === a.team) ??
    scope.find((x) => x.state === "queued" && x.enabled);
  if (!next) {
    const idle = scope.filter((x) => x.state === "idle" && x.enabled && !x.reviews.length && x.id !== a.id);
    if (idle.length) next = d.pick(idle);
  }
  if (next) {
    const q = d.edit(next.idx);
    startRun(q, simMs, ...teamTask(d, q));
  }
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
    a.liveToolCalls += 1 + Math.floor(d.r() * 4);
  }
  running.filter((a) => (a.progress ?? 0) >= 1).slice(0, 2).forEach((a) => complete(d, a, scale, simMs));
  for (const a of running) if (a.state === "running" && (a.progress ?? 0) >= 1) a.progress = 0.99;

  const r = d.r();
  const failed = d.agents.slice(0, scale).filter((a) => a.state === "failed" && a.enabled);
  if (r < 0.1 && failed.length) {
    const a = d.edit(d.pick(failed).idx);
    startRun(a, simMs, ...teamTask(d, a));
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
  let { simMs, nextTickAt } = state;
  if (action.type === "advance") {
    simMs += action.dt;
    if (simMs >= nextTickAt) {
      simTick(d, action.scale, simMs);
      nextTickAt = simMs + (action.still ? 6000 : 2500 + d.r() * 1500);
    }
    return { agents: d.agents, events: d.events, seed: d.seed, simMs, nextTickAt };
  }
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
    if (a.state === "draft_ready" && !action.approve && !a.reviews.length) startRun(a, simMs, null, "revising");
    d.push({ ...base, decision: { act: action.approve ? "approve" : "sendback", title: rv.title } }, simMs);
  } else if (action.type === "retry") {
    const pool = TEAM_TASKS[a.team];
    startRun(a, simMs, pool?.[0] ?? null, pool?.length ? null : "retrying");
    a.health = "degraded";
    d.push({ ...base, decision: { act: "retry" } }, simMs);
  } else if (action.type === "answer") {
    startRun(a, simMs, null, "resuming");
    d.push({ ...base, decision: { act: "answer" } }, simMs);
  } else {
    const n = a.unreadMessages.length;
    a.unreadMessages = [];
    d.push({ ...base, decision: { act: "read", n } }, simMs);
  }
  return { ...state, agents: d.agents, events: d.events, seed: d.seed };
}
