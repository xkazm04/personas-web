import { createStore, type StoreApi } from "zustand/vanilla";
import { initSim, simReducer, type SimAction, type SimState } from "../board/sim";
import {
  ACK_MS,
  HOLD_MS,
  SEND_MS,
  closeCommand,
  planBatchUndo,
  settle,
  type CmdStatus,
  type Command,
  type CommandSpec,
  type Commands,
} from "../board/useCommands";

/* ── The stage's one world ──────────────────────────────────────────
 *
 * The seeded fleet simulation and the command plane to its machine, owned
 * above the views: Board and Night shift read and drive this one store, so a
 * pause sent on the Board is still there after a trip through Night shift (or
 * to another dashboard view and back). It lives as long as the page does; a
 * reload returns to the seeded fleet.
 *
 * Nothing here ticks by itself: the mounted view advances it once per second
 * while it is shown and the tab is visible (`useBoardSim`), so a hidden tab,
 * an offline machine or a view parked in the dashboard's `<Activity>` keeps
 * the world still. A command already sent still lands after its view goes,
 * as it would on a real machine.
 *
 * `onSettled` is the seam for whatever must follow a landed command (the demo
 * crew bridge, `crewBridge.ts`): it sees the command and the sim before and
 * after it was applied.
 */

export interface WorldState {
  sim: SimState;
  /** Newest first, capped: the session's command audit. */
  cmds: Command[];
}

export interface Settled {
  spec: CommandSpec;
  before: SimState;
  after: SimState;
}

export interface FleetWorld {
  store: StoreApi<WorldState>;
  dispatch: (action: SimAction) => void;
  /** The plane's verbs (the `Commands` shape without its list, which is store state). */
  commands: Omit<Commands, "cmds">;
  onSettled: (listener: (s: Settled) => void) => () => void;
  /** Stop every timer (tests; a fresh world). */
  dispose: () => void;
}

const MAX_CMDS = 40;

export function createFleetWorld(scale = 99): FleetWorld {
  const store = createStore<WorldState>(() => ({ sim: initSim(scale), cmds: [] }));
  const listeners = new Set<(s: Settled) => void>();
  const timers = new Map<number, ReturnType<typeof setTimeout>[]>();
  const held = new Set<number>();
  /** Each open batch's command ids (kept here, not read from `cmds`, which is capped). */
  const batches = new Map<number, number[]>();
  let seq = 0;
  let batchSeq = 0;

  const dispatch = (action: SimAction) => store.setState((s) => ({ sim: simReducer(s.sim, action) }));
  const setCmds = (fn: (cs: Command[]) => Command[]) => store.setState((s) => ({ cmds: fn(s.cmds) }));
  const setStatus = (id: number, status: CmdStatus) => setCmds((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));

  /** The command lands: settled against the machine as it is now, applied, then closed. */
  const land = (id: number, spec: CommandSpec) => {
    timers.delete(id);
    const before = store.getState().sim;
    const { action, refusal } = settle(spec, before);
    if (action) dispatch(action);
    setCmds((cs) => cs.map((c) => (c.id === id ? closeCommand(c, refusal) : c)));
    if (action) {
      const after = store.getState().sim;
      listeners.forEach((l) => l({ spec, before, after }));
    }
  };

  const send = (spec: CommandSpec, hold = false): number => {
    const id = ++seq;
    setCmds((cs) => [{ ...spec, id, status: hold ? ("held" as const) : ("sending" as const) }, ...cs].slice(0, MAX_CMDS));
    const t0 = hold ? HOLD_MS : 0;
    if (hold) held.add(id);
    if (spec.batch != null) batches.set(spec.batch, [...(batches.get(spec.batch) ?? []), id]);
    timers.set(id, [
      ...(hold ? [setTimeout(() => { held.delete(id); setStatus(id, "sending"); }, t0)] : []),
      setTimeout(() => setStatus(id, "acked"), t0 + SEND_MS),
      setTimeout(() => land(id, spec), t0 + SEND_MS + ACK_MS),
    ]);
    return id;
  };

  /** Take back a held command; false once it has left (nothing to undo then). */
  const undo = (id: number): boolean => {
    if (!held.has(id)) return false;
    held.delete(id);
    timers.get(id)?.forEach((t) => clearTimeout(t));
    timers.delete(id);
    setStatus(id, "undone");
    return true;
  };

  /** A new batch id for a grouped verdict's commands. */
  const newBatch = (): number => {
    const id = ++batchSeq;
    // Only a recent batch can still be undone (its toast is gone after HOLD_MS).
    batches.delete(id - 20);
    return id;
  };

  /** Take back what is still held of a batch, and say how many had already left. */
  const undoBatch = (batchId: number): { undone: number; alreadySent: number } => {
    const ids = batches.get(batchId) ?? [];
    batches.delete(batchId);
    const plan = planBatchUndo(ids.map((id) => ({ id, batch: batchId, status: held.has(id) ? "held" : "sending" })), batchId);
    const undone = plan.undo.filter((id) => undo(id)).length;
    return { undone, alreadySent: plan.alreadySent + plan.undo.length - undone };
  };

  return {
    store,
    dispatch,
    commands: { send, undo, newBatch, undoBatch },
    onSettled: (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    dispose: () => {
      timers.forEach((ts) => ts.forEach((t) => clearTimeout(t)));
      timers.clear();
      held.clear();
    },
  };
}

let world: FleetWorld | null = null;

/** The page's one world, created on first use at the stage's scale. */
export function fleetWorld(scale = 99): FleetWorld {
  world ??= createFleetWorld(scale);
  return world;
}
