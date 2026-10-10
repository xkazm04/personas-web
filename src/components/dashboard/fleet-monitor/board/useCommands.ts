"use client";

import { useEffect, useRef, useState } from "react";
import { refusalOf, type SimAction, type SimState } from "./sim";
import type { Refusal } from "./verbs";

/* ── Commands to the machine ───────────────────────────────────────
 *
 * Nothing the operator does here changes the fleet directly: it sends a
 * command to the PC, and the board changes when the PC has done it, the way
 * the real plane works (the phone's command chip: Sending, Working, Done).
 * A command is `sending` while it travels, `acked` once the PC has picked it
 * up, then `done`, which is the moment the simulation applies it. Reversible
 * verdicts (approve, send back) are first `held` for an Undo window and only
 * then sent; an undone command never leaves the browser. When it lands, the
 * machine checks it against the rulebook (verbs.ts) as things stand then: a
 * cancel whose run finished in flight, or an approve whose review was settled
 * elsewhere, ends `refused` with its reason instead of `done`.
 */

export type Verb = "pause" | "resume" | "run" | "cancel" | "retry" | "answer" | "read" | "approve" | "sendback" | "publish" | "revise" | "pauseAll" | "resumeAll";
export type CmdStatus = "held" | "sending" | "acked" | "done" | "refused" | "undone";

export interface Command {
  id: number;
  verb: Verb;
  /** Null for a fleet-wide command. */
  agentId: string | null;
  /** The review a verdict is about. */
  rid?: string;
  /** Pause all: also stop the runs in progress. */
  stop?: boolean;
  /** An answer's words. */
  text?: string;
  /** Sim time it was sent at (for the activity log's clock). */
  atSim?: number;
  status: CmdStatus;
  /** Why the machine refused it (status "refused"). */
  reason?: Refusal;
  /** The batch it was sent in (a grouped triage verdict): one Undo takes back all of it. */
  batch?: number;
}

export type CommandSpec = Omit<Command, "id" | "status" | "reason">;

/** The Undo window of a held verdict. */
export const HOLD_MS = 4000;
/** Browser to the sync plane to the PC picking it up. */
export const SEND_MS = 450;
/** The PC acknowledging to the PC having done it. */
export const ACK_MS = 750;

export const isOpen = (c: Command) => c.status === "held" || c.status === "sending" || c.status === "acked";

/** What the PC does when the command arrives. */
export function toAction(c: CommandSpec): SimAction | null {
  if (c.verb === "pauseAll") return { type: "pauseAll", stop: !!c.stop };
  if (c.verb === "resumeAll") return { type: "resumeAll" };
  if (!c.agentId) return null;
  if (c.verb === "approve" || c.verb === "sendback") return c.rid ? { type: "review", id: c.agentId, rid: c.rid, approve: c.verb === "approve" } : null;
  if (c.verb === "publish" || c.verb === "revise") return { type: "draft", id: c.agentId, approve: c.verb === "publish" };
  if (c.verb === "answer") return { type: "answer", id: c.agentId, text: c.text };
  return { type: c.verb, id: c.agentId };
}

/** What happens when a command lands on the machine in `state`: the action it
 *  applies, or why it is refused (then nothing is applied). */
export function settle(spec: CommandSpec, state: Pick<SimState, "agents">): { action: SimAction | null; refusal: Refusal | null } {
  const action = toAction(spec);
  if (!action) return { action: null, refusal: "gone" };
  const refusal = refusalOf(state, action);
  return refusal ? { action: null, refusal } : { action, refusal: null };
}

/** A landed command's final record: done, or refused with its reason. */
export function closeCommand(c: Command, refusal: Refusal | null): Command {
  return refusal ? { ...c, status: "refused", reason: refusal } : { ...c, status: "done" };
}

/** The open command on an agent (newest first), if any. */
export function openFor(cmds: readonly Command[], agentId: string): Command | undefined {
  return cmds.find((c) => c.agentId === agentId && isOpen(c));
}

const CONTROL_VERBS: ReadonlySet<Verb> = new Set(["pause", "resume", "run", "cancel", "retry", "answer"]);

/** The open command that changes how the agent runs: it holds the run controls.
 *  A verdict or mark-read does not (a held verdict must not lock Pause). */
export function openControl(cmds: readonly Command[], agentId: string): Command | undefined {
  return cmds.find((c) => c.agentId === agentId && isOpen(c) && CONTROL_VERBS.has(c.verb));
}

/** What Undo can still take back of a batch: its held commands; the rest have left. */
export function planBatchUndo(cmds: readonly Pick<Command, "id" | "batch" | "status">[], batchId: number): { undo: number[]; alreadySent: number } {
  const members = cmds.filter((c) => c.batch === batchId && c.status !== "undone");
  const undo = members.filter((c) => c.status === "held").map((c) => c.id);
  return { undo, alreadySent: members.length - undo.length };
}

/** A command that has left the browser and not yet been done. */
export function inFlightFor(cmds: readonly Command[], agentId: string): Command | undefined {
  return cmds.find((c) => c.agentId === agentId && (c.status === "sending" || c.status === "acked"));
}

/**
 * The command plane. `sim` is the machine's current state: a landing command
 * is settled against the latest one (kept in a ref, read only in timers).
 */
export function useCommands(dispatch: (a: SimAction) => void, sim: Pick<SimState, "agents">) {
  const [cmds, setCmds] = useState<Command[]>([]);
  const simRef = useRef(sim);
  useEffect(() => {
    simRef.current = sim;
  }, [sim]);
  const batchSeq = useRef(0);
  /** Each open batch's command ids (kept here, not read from `cmds`, which an
   *  Undo from an older render's toast would see stale, and which is capped). */
  const batches = useRef(new Map<number, number[]>());
  const timers = useRef(new Map<number, number[]>());
  const held = useRef(new Set<number>());
  const seq = useRef(0);

  useEffect(() => {
    const all = timers.current;
    return () => all.forEach((ids) => ids.forEach((t) => window.clearTimeout(t)));
  }, []);

  const setStatus = (id: number, status: CmdStatus) => setCmds((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));

  const send = (spec: CommandSpec, hold = false): number => {
    const id = ++seq.current;
    setCmds((cs) => [{ ...spec, id, status: hold ? ("held" as const) : ("sending" as const) }, ...cs].slice(0, 40));
    const t0 = hold ? HOLD_MS : 0;
    if (hold) held.current.add(id);
    if (spec.batch != null) batches.current.set(spec.batch, [...(batches.current.get(spec.batch) ?? []), id]);
    const at = (ms: number, fn: () => void) => window.setTimeout(fn, ms);
    timers.current.set(id, [
      ...(hold ? [at(t0, () => { held.current.delete(id); setStatus(id, "sending"); })] : []),
      at(t0 + SEND_MS, () => setStatus(id, "acked")),
      at(t0 + SEND_MS + ACK_MS, () => {
        timers.current.delete(id);
        const { action, refusal } = settle(spec, simRef.current);
        if (action) dispatch(action);
        setCmds((cs) => cs.map((c) => (c.id === id ? closeCommand(c, refusal) : c)));
      }),
    ]);
    return id;
  };

  /** Take back a held command; false once it has left (nothing to undo then). */
  const undo = (id: number): boolean => {
    if (!held.current.has(id)) return false;
    held.current.delete(id);
    timers.current.get(id)?.forEach((t) => window.clearTimeout(t));
    timers.current.delete(id);
    setStatus(id, "undone");
    return true;
  };

  /** A new batch id for a grouped verdict's commands. */
  const newBatch = (): number => {
    const id = ++batchSeq.current;
    // Only a recent batch can still be undone (its toast is gone after HOLD_MS).
    batches.current.delete(id - 20);
    return id;
  };

  /** Take back what is still held of a batch, and say how many had already left. */
  const undoBatch = (batchId: number): { undone: number; alreadySent: number } => {
    const ids = batches.current.get(batchId) ?? [];
    batches.current.delete(batchId);
    const plan = planBatchUndo(ids.map((id) => ({ id, batch: batchId, status: held.current.has(id) ? "held" : "sending" })), batchId);
    const undone = plan.undo.filter((id) => undo(id)).length;
    return { undone, alreadySent: plan.alreadySent + plan.undo.length - undone };
  };

  return { cmds, send, undo, newBatch, undoBatch };
}

export type Commands = ReturnType<typeof useCommands>;
