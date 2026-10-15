import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_CREW } from "@/lib/demoCrew";
import { MOCK_TIMINGS, MOCK_RUN_TIMINGS } from "@/lib/commands/mockCommandPlane";
import { MOCK_EVENTS, MOCK_EXECUTIONS, MOCK_PERSONAS } from "@/lib/mockData";
import { observabilityOf } from "@/lib/demoWorld/fleetReads";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useCommandStore } from "@/stores/commandStore";
import { ACK_MS, SEND_MS } from "../board/useCommands";
import { initSim, simReducer } from "../board/sim";
import { planSync, planeCommandsFor, seenFrom, type CrewFixture } from "./crewBridge";
import { crewBridgeFor, demoCrewPorts } from "./demoCrewPorts";
import { createFleetWorld, type FleetWorld } from "./fleetWorld";
import { syncedPageOf } from "./crewLinks";
import { FLEET } from "../fleet-data";

const LAND_MS = SEND_MS + ACK_MS;
const [PR] = DEMO_CREW; // PR Review Agent <-> p004
const SECURITY = DEMO_CREW[3]; // Security Scanner (paused) <-> p094
const STAGE_ONLY = "p001"; // Invoice Reconciler

describe("planeCommandsFor: what a landed Board command carries to the synced pages", () => {
  const sim = initSim(99);
  const apply = (action: Parameters<typeof simReducer>[1]) => simReducer(sim, action);

  it("a crew pause, resume and run become the persona's commands", () => {
    const paused = apply({ type: "pause", id: PR.agentId });
    expect(planeCommandsFor({ spec: { verb: "pause", agentId: PR.agentId }, before: sim, after: paused })).toEqual([
      { verb: "pause_persona", personaId: PR.personaId, params: {} },
    ]);
    const resumed = simReducer(sim, { type: "resume", id: SECURITY.agentId });
    expect(planeCommandsFor({ spec: { verb: "resume", agentId: SECURITY.agentId }, before: sim, after: resumed })).toEqual([
      { verb: "resume_persona", personaId: SECURITY.personaId, params: {} },
    ]);
    expect(planeCommandsFor({ spec: { verb: "run", agentId: PR.agentId }, before: sim, after: sim })).toEqual([
      { verb: "run_persona", personaId: PR.personaId, params: {} },
    ]);
  });

  it("a verdict on a crew review decides that review event", () => {
    const rid = sim.agents.find((a) => a.id === PR.agentId)!.reviews[0].id;
    const after = apply({ type: "review", id: PR.agentId, rid, approve: false });
    expect(planeCommandsFor({ spec: { verb: "sendback", agentId: PR.agentId, rid }, before: sim, after })).toEqual([
      { verb: "review_decide", personaId: PR.personaId, params: { reviewId: rid, decision: "rejected" } },
    ]);
  });

  it("Pause all carries every crew agent it switched off", () => {
    const after = apply({ type: "pauseAll", stop: false });
    const sent = planeCommandsFor({ spec: { verb: "pauseAll", agentId: null }, before: sim, after });
    const enabledCrew = DEMO_CREW.filter((c) => sim.agents.find((a) => a.id === c.agentId)!.enabled);
    expect(sent.map((c) => c.personaId).sort()).toEqual(enabledCrew.map((c) => c.personaId).sort());
    expect(sent.every((c) => c.verb === "pause_persona")).toBe(true);
  });

  it("a stage-only agent's commands stay on the stage", () => {
    const after = apply({ type: "pause", id: STAGE_ONLY });
    expect(planeCommandsFor({ spec: { verb: "pause", agentId: STAGE_ONLY }, before: sim, after })).toEqual([]);
    expect(planeCommandsFor({ spec: { verb: "run", agentId: STAGE_ONLY }, before: sim, after: sim })).toEqual([]);
  });
});

describe("planSync: only what changed on the pages moves the stage", () => {
  const sim = initSim(99);
  const fixtures = (): CrewFixture[] => demoCrewPorts.read();

  it("the seeded fixtures and the seeded stage agree: nothing to do", () => {
    expect(planSync(sim, fixtures(), seenFrom(sim), new Set(), new Set()).actions).toEqual([]);
  });

  it("a persona paused on the pages pauses its agent; a Board pause still on its way is left alone", () => {
    const f = fixtures().map((x) => (x.personaId === PR.personaId ? { ...x, enabled: false } : x));
    expect(planSync(sim, f, seenFrom(sim), new Set(), new Set()).actions).toEqual([{ type: "pause", id: PR.agentId }]);
    const held = planSync(sim, f, seenFrom(sim), new Set([PR.personaId]), new Set());
    expect(held.actions).toEqual([]);
    expect(held.seen.get(PR.personaId)!.enabled).toBe(true);
  });

  it("a review decided on the pages leaves the agent; one raised there arrives", () => {
    const rid = sim.agents.find((a) => a.id === PR.agentId)!.reviews[0].id;
    const f = fixtures().map((x) =>
      x.personaId === PR.personaId
        ? { ...x, reviews: [{ ...x.reviews.find((r) => r.id === rid)!, status: "approved" as const }, { id: "ev-new", status: "pending" as const, title: "New", severity: "info" as const }] }
        : x,
    );
    expect(planSync(sim, f, seenFrom(sim), new Set(), new Set()).actions).toEqual([
      { type: "review", id: PR.agentId, rid, approve: true },
      { type: "reviewIn", id: PR.agentId, review: { id: "ev-new", severity: "info", title: "New", ageMin: 0 } },
    ]);
  });

  it("a run started on the pages starts the agent, once; the Board's own run does not start it twice", () => {
    const f = fixtures().map((x) => (x.personaId === PR.personaId ? { ...x, liveRuns: ["exec-a", "exec-own"] } : x));
    const first = planSync(sim, f, seenFrom(sim), new Set(), new Set(["exec-own"]));
    expect(first.actions).toEqual([{ type: "run", id: PR.agentId }]);
    expect(planSync(sim, f, first.seen, new Set(), new Set()).actions).toEqual([]);
  });
});

describe("activity links: only a crew agent's carried acts link to a synced page", () => {
  const at = FLEET.nowMs + 1000;
  it("a crew run links to Executions, a crew verdict to Reviews", () => {
    expect(syncedPageOf({ agentId: PR.agentId, kind: "decision", decision: { act: "run" }, tsMs: at })).toBe("executions");
    expect(syncedPageOf({ agentId: PR.agentId, kind: "decision", decision: { act: "approve", title: "t" }, tsMs: at })).toBe("reviews");
  });
  it("a stage-only agent, a crew pause and the seeded history link nowhere", () => {
    expect(syncedPageOf({ agentId: STAGE_ONLY, kind: "decision", decision: { act: "run" }, tsMs: at })).toBeNull();
    expect(syncedPageOf({ agentId: PR.agentId, kind: "decision", decision: { act: "pause" }, tsMs: at })).toBeNull();
    expect(syncedPageOf({ agentId: PR.agentId, kind: "review_requested", tsMs: FLEET.nowMs - 60_000 })).toBeNull();
  });
});

describe("the bridge end to end, on the demo's own command plane", () => {
  const personas = MOCK_PERSONAS.map((p) => ({ ...p }));
  const executions = MOCK_EXECUTIONS.map((e) => ({ ...e }));
  const events = MOCK_EVENTS.map((e) => ({ ...e }));
  /** Observability as mockApi serves it now: the world's log folded with the session's rows. */
  const observability = () => observabilityOf({ rows: MOCK_EXECUTIONS, personas: MOCK_PERSONAS });
  let w: FleetWorld;
  const agent = (id: string) => w.store.getState().sim.agents.find((a) => a.id === id)!;

  beforeEach(() => {
    vi.useFakeTimers();
    useAuthStore.setState({ isDemo: true });
    w = createFleetWorld(99);
    crewBridgeFor(w);
  });
  afterEach(() => {
    crewBridgeFor(w).dispose();
    w.dispose();
    useCommandStore.getState().reset();
    useAuthStore.setState({ isDemo: false });
    vi.useRealTimers();
    MOCK_PERSONAS.splice(0, MOCK_PERSONAS.length, ...personas.map((p) => ({ ...p })));
    MOCK_EXECUTIONS.splice(0, MOCK_EXECUTIONS.length, ...executions.map((e) => ({ ...e })));
    MOCK_EVENTS.splice(0, MOCK_EVENTS.length, ...events.map((e) => ({ ...e })));
  });

  /** Let the plane's lazy import and its timers run. */
  const run = async (ms: number) => {
    await vi.advanceTimersByTimeAsync(ms);
  };

  it("a settled Run on a crew agent puts exec-<commandId> in api.listExecutions() exactly once, and today's cost rises by that run only", async () => {
    const before = observability();
    const ready = w.store.getState().sim.agents.find((a) => a.id === PR.agentId)!;
    // PR Review Agent waits for an answer: answer it first so Run is admitted.
    if (ready.state === "input_required") w.dispatch({ type: "answer", id: PR.agentId });
    w.dispatch({ type: "cancel", id: PR.agentId });
    w.commands.send({ verb: "run", agentId: PR.agentId });
    await run(LAND_MS);
    await run(MOCK_TIMINGS.completedMs);
    const ids = Object.values(useCommandStore.getState().inflight).filter((c) => c.verb === "run_persona" && c.personaId === PR.personaId);
    expect(ids).toHaveLength(1);
    expect(ids[0].status).toBe("completed");
    const execId = `exec-${ids[0].id}`;
    await run(MOCK_RUN_TIMINGS.completedMs);
    // mockApi answers after a simulated network delay (a timer).
    const reading = api.listExecutions();
    await run(2000);
    const listed = await reading;
    expect(listed.filter((e) => e.id === execId)).toHaveLength(1);
    const exec = listed.find((e) => e.id === execId)!;
    expect(exec).toMatchObject({ personaId: PR.personaId, status: "completed" });
    // Today's bucket took that run's cost and count once; the other 13 days are untouched.
    // (L3: observability is a fold of the run log, so the run counts by being a row, not by a side write.)
    const after = observability();
    const today = after.dailyMetrics.at(-1)!;
    expect(today.cost).toBeCloseTo(before.dailyMetrics.at(-1)!.cost + exec.costUsd, 6);
    expect(today.executions).toBe(before.dailyMetrics.at(-1)!.executions + 1);
    expect(after.dailyMetrics.slice(0, -1)).toEqual(before.dailyMetrics.slice(0, -1));
    expect(after.metrics.totalExecutions).toBe(before.metrics.totalExecutions + 1);
    expect(observability().metrics.totalExecutions).toBe(after.metrics.totalExecutions);
    // The Board's own run did not start the agent a second time.
    expect(w.store.getState().sim.events.filter((e) => e.agentId === PR.agentId && e.decision?.act === "run")).toHaveLength(1);
  });

  it("a phone pause on a crew persona pauses its agent on the stage", async () => {
    expect(agent(PR.agentId).enabled).toBe(true);
    await useCommandStore.getState().send("pause_persona", { personaId: PR.personaId, deviceId: null, demo: true });
    await run(MOCK_TIMINGS.completedMs);
    expect(MOCK_PERSONAS.find((p) => p.id === PR.personaId)!.enabled).toBe(false);
    expect(agent(PR.agentId).enabled).toBe(false);
  });

  it("a Board pause on a crew agent reaches the persona, and does not bounce back on an unrelated re-read", async () => {
    w.commands.send({ verb: "pause", agentId: PR.agentId });
    await run(LAND_MS);
    expect(agent(PR.agentId).enabled).toBe(false);
    // Another fixture write lands while the pause is still on its way.
    crewBridgeFor(w).reconcile();
    expect(agent(PR.agentId).enabled).toBe(false);
    await run(MOCK_TIMINGS.completedMs);
    expect(MOCK_PERSONAS.find((p) => p.id === PR.personaId)!.enabled).toBe(false);
    crewBridgeFor(w).reconcile();
    expect(agent(PR.agentId).enabled).toBe(false);
  });

  it("an approve on the Board decides the review event the Reviews page reads", async () => {
    const rid = agent(PR.agentId).reviews[0].id;
    w.commands.send({ verb: "approve", agentId: PR.agentId, rid });
    await run(LAND_MS);
    await run(MOCK_TIMINGS.completedMs + 1000);
    expect(MOCK_EVENTS.find((e) => e.id === rid)!.status).toBe("processed");
    expect(agent(PR.agentId).reviews.some((r) => r.id === rid)).toBe(false);
  });

  it("a stage-only agent's Board commands stay local", async () => {
    w.commands.send({ verb: "pause", agentId: STAGE_ONLY });
    await run(LAND_MS + MOCK_TIMINGS.completedMs);
    expect(agent(STAGE_ONLY).enabled).toBe(false);
    expect(Object.keys(useCommandStore.getState().inflight)).toHaveLength(0);
  });

  it("off the demo, nothing crosses either way", async () => {
    useAuthStore.setState({ isDemo: false });
    w.commands.send({ verb: "pause", agentId: PR.agentId });
    await run(LAND_MS + MOCK_TIMINGS.completedMs);
    expect(Object.keys(useCommandStore.getState().inflight)).toHaveLength(0);
    expect(MOCK_PERSONAS.find((p) => p.id === PR.personaId)!.enabled).toBe(true);
  });
});
