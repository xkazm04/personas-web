import { FLEET, type FleetAgent, type FleetEvent, type FleetProcess, type EventKind } from "../fleet-data";
import { mulberry32 } from "./palette";

/* ── Night Shift's live demo state ──────────────────────────────────
 *
 * A module-level store, so the city keeps its state across tab switches.
 * It is a seeded simulation of the demo fleet: runs progress, queued agents
 * pick up work, failed ones self-heal, messages travel. Event texts it writes
 * are demo data in the same voice as `fleet.json`, not interface copy.
 */

export interface NightEvent extends FleetEvent {
  id: number;
}

export interface Packet {
  id: number;
  from: string;
  to: string;
  kind: "message" | "handoff";
}

export interface NightState {
  agents: FleetAgent[];
  events: NightEvent[];
  procs: FleetProcess[];
  /** Simulated time elapsed since `FLEET.nowMs`. */
  simMs: number;
  packet: Packet | null;
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

let seq = 0;
let state: NightState = {
  agents: clone(FLEET.agents),
  events: FLEET.timeline.map((e) => ({ ...e, id: ++seq })),
  procs: clone(FLEET.systemProcesses),
  simMs: 0,
  packet: null,
};

const rnd = mulberry32(20261001);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];

const listeners = new Set<() => void>();
export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export const getSnapshot = () => state;

function commit(next: NightState) {
  state = next;
  for (const fn of listeners) fn();
}

/* Task and message texts the simulation reuses come from the data itself. */
const TASKS: Record<string, string[]> = {};
for (const a of FLEET.agents) if (a.state === "running" && a.task) (TASKS[a.team] ??= []).push(a.task);
const TEXTS = {
  message: [...new Set(FLEET.timeline.filter((e) => e.kind === "message").map((e) => e.text))],
  handoff: [...new Set(FLEET.timeline.filter((e) => e.kind === "handoff").map((e) => e.text))],
};
const taskFor = (team: string) => pick(TASKS[team] ?? ["Working through the next batch"]);

/** A mutable draft of one simulation step; `finish` freezes it into a new state. */
function draft() {
  const agents = state.agents.slice();
  const events = state.events.slice();
  const edit = (id: string) => {
    const i = agents.findIndex((a) => a.id === id);
    agents[i] = { ...agents[i], recentStatuses: agents[i].recentStatuses.slice(), spark24h: agents[i].spark24h.slice() };
    return agents[i];
  };
  const log = (agentId: string, kind: EventKind, text: string, toAgentId: string | null = null) => {
    events.unshift({ id: ++seq, tsMs: FLEET.nowMs + state.simMs, agentId, toAgentId, kind, text });
    if (events.length > 400) events.pop();
  };
  return { agents, events, edit, log };
}

function startRun(a: FleetAgent, task: string) {
  a.state = "running";
  a.progress = 0;
  a.runningSinceMs = 0;
  a.task = task;
  a.liveToolCalls = 0;
}

/** One tick of the city: `elapsedMs` of real time passed. */
export function simStep(scale: number, elapsedMs: number) {
  const d = draft();
  const inScope = (a: FleetAgent) => d.agents.indexOf(a) < scale;
  let packet: Packet | null = state.packet;

  for (const a0 of d.agents.slice(0, scale)) {
    if (!(a0.enabled && a0.state === "running")) continue;
    const a = d.edit(a0.id);
    a.progress = Math.min(1, (a.progress ?? 0) + 0.012 + rnd() * 0.05);
    a.runningSinceMs = (a.runningSinceMs ?? 0) + elapsedMs;
    a.liveToolCalls += 1 + Math.floor(rnd() * 4);
    if (a.progress >= 1) {
      a.state = a.reviews.length ? "attention" : "idle";
      a.task = null;
      a.progress = null;
      a.runningSinceMs = null;
      a.liveToolCalls = 0;
      a.runsToday++;
      a.recentStatuses.unshift("completed");
      a.recentStatuses.length = 12;
      a.spark24h[23]++;
      d.log(a.id, "run_completed", "Run completed");
      const q = d.agents.find((x) => inScope(x) && x.enabled && x.state === "queued");
      if (q) startRun(d.edit(q.id), taskFor(q.team));
    }
  }

  const roll = rnd();
  if (roll < 0.16) {
    const failed = d.agents.filter((a) => inScope(a) && a.enabled && a.state === "failed");
    if (failed.length) {
      const a = d.edit(pick(failed).id);
      startRun(a, `Retrying: ${taskFor(a.team)}`);
      a.health = "degraded";
      d.log(a.id, "self_heal", "Self-healed: retrying with a fresh session");
    }
  } else if (roll < 0.21) {
    const busy = d.agents.filter((a) => inScope(a) && a.enabled && a.state === "running" && (a.progress ?? 0) > 0.2);
    if (busy.length) {
      const a = d.edit(pick(busy).id);
      a.state = "failed";
      a.task = "Last run failed: tool timeout";
      a.progress = null;
      a.runningSinceMs = null;
      a.recentStatuses.unshift("failed");
      a.recentStatuses.length = 12;
      d.log(a.id, "run_failed", "Run failed: tool timeout");
    }
  }

  if (rnd() < 0.8) {
    const ids = new Set(d.agents.slice(0, scale).map((a) => a.id));
    const edges = FLEET.channelEdges.filter((e) => ids.has(e.a) && ids.has(e.b));
    if (edges.length) {
      const e = pick(edges);
      const fwd = rnd() < 0.5;
      const kind = rnd() < 0.55 ? "message" : "handoff";
      const from = fwd ? e.a : e.b;
      const to = fwd ? e.b : e.a;
      d.log(from, kind, pick(TEXTS[kind]), to);
      packet = { id: seq, from, to, kind };
    }
  }

  commit({ ...state, agents: d.agents, events: d.events, simMs: state.simMs + elapsedMs, packet });
}
