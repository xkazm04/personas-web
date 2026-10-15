import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ACK_MS, HOLD_MS, SEND_MS } from "../board/useCommands";
import { createFleetWorld, fleetWorld, type FleetWorld, type Settled } from "./fleetWorld";

const LAND_MS = SEND_MS + ACK_MS;
const agent = (w: FleetWorld, id: string) => w.store.getState().sim.agents.find((a) => a.id === id)!;

describe("the stage's one world", () => {
  let w: FleetWorld;
  beforeEach(() => {
    vi.useFakeTimers();
    w = createFleetWorld(99);
  });
  afterEach(() => {
    w.dispose();
    vi.useRealTimers();
  });

  it("is one instance per page: the Board and Night shift (any mount order, any number of times) get the same world", () => {
    const board = fleetWorld(99);
    const night = fleetWorld(30);
    expect(night).toBe(board);
    expect(fleetWorld()).toBe(board);
  });

  it("a pause sent on the Board survives the Board unmounting, Night shift mounting and the Board mounting again", () => {
    const world = fleetWorld(99);
    const a = world.store.getState().sim.agents.find((x) => x.enabled && x.state === "idle")!;
    // Board: send Pause, then switch to Night shift before it lands (the command is not lost).
    world.commands.send({ verb: "pause", agentId: a.id });
    vi.advanceTimersByTime(100);
    // Night shift mounts: same world (the hook's lazy initializer reads fleetWorld()), ticking it.
    const night = fleetWorld(99);
    vi.advanceTimersByTime(LAND_MS);
    for (let i = 0; i < 5; i++) night.dispatch({ type: "advance", dt: 1000, scale: 99, still: false });
    expect(agent(night, a.id).enabled).toBe(false);
    // Board again.
    const board = fleetWorld(99);
    expect(agent(board, a.id).enabled).toBe(false);
    expect(board.store.getState().cmds.find((c) => c.agentId === a.id)?.status).toBe("done");
    world.dispose();
  });

  it("a held verdict can be undone, and then never lands", () => {
    const a = w.store.getState().sim.agents.find((x) => x.reviews.length)!;
    const rid = a.reviews[0].id;
    const id = w.commands.send({ verb: "approve", agentId: a.id, rid }, true);
    expect(w.commands.undo(id)).toBe(true);
    vi.advanceTimersByTime(HOLD_MS + LAND_MS);
    expect(agent(w, a.id).reviews.some((r) => r.id === rid)).toBe(true);
    expect(w.store.getState().cmds[0].status).toBe("undone");
  });

  it("a landed command is applied, closed, and reported to onSettled with the sim before and after", () => {
    const seen: Settled[] = [];
    w.onSettled((s) => seen.push(s));
    const a = w.store.getState().sim.agents.find((x) => x.enabled && x.state === "idle")!;
    w.commands.send({ verb: "pause", agentId: a.id });
    vi.advanceTimersByTime(SEND_MS);
    expect(w.store.getState().cmds[0].status).toBe("acked");
    vi.advanceTimersByTime(ACK_MS);
    expect(seen).toHaveLength(1);
    expect(seen[0].before.agents.find((x) => x.id === a.id)!.enabled).toBe(true);
    expect(seen[0].after.agents.find((x) => x.id === a.id)!.enabled).toBe(false);
    expect(w.store.getState().cmds[0].status).toBe("done");
  });

  it("a refused command applies nothing and reports nothing", () => {
    const seen: Settled[] = [];
    w.onSettled((s) => seen.push(s));
    const a = w.store.getState().sim.agents.find((x) => !x.enabled)!;
    w.commands.send({ verb: "pause", agentId: a.id });
    vi.advanceTimersByTime(LAND_MS);
    expect(seen).toHaveLength(0);
    expect(w.store.getState().cmds[0]).toMatchObject({ status: "refused", reason: "alreadyPaused" });
  });

  it("nothing advances by itself: the world stands still until a mounted view ticks it", () => {
    const before = w.store.getState().sim;
    vi.advanceTimersByTime(60_000);
    expect(w.store.getState().sim).toBe(before);
  });

  it("reviewIn adds a review once and the agent now needs you", () => {
    const a = w.store.getState().sim.agents.find((x) => x.state === "idle" && x.enabled && !x.reviews.length)!;
    const review = { id: "ev-x", severity: "warning" as const, title: "New", ageMin: 0 };
    w.dispatch({ type: "reviewIn", id: a.id, review });
    w.dispatch({ type: "reviewIn", id: a.id, review });
    expect(agent(w, a.id).reviews.filter((r) => r.id === "ev-x")).toHaveLength(1);
    expect(agent(w, a.id).state).toBe("attention");
    expect(w.store.getState().sim.events[0]).toMatchObject({ agentId: a.id, kind: "review_requested", text: "New" });
  });
});
