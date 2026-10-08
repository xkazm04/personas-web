"use client";

import { useEffect, useRef, useState } from "react";
import type { SimAction } from "./sim";

/* ── Commands to the machine ───────────────────────────────────────
 *
 * Nothing the operator does here changes the fleet directly: it sends a
 * command to the PC, and the board changes when the PC has done it, the way
 * the real plane works (the phone's command chip: Sending, Working, Done).
 * A command is `sending` while it travels, `acked` once the PC has picked it
 * up, then `done`, which is the moment the simulation applies it. Reversible
 * verdicts (approve, send back) are first `held` for an Undo window and only
 * then sent; an undone command never leaves the browser.
 */

export type Verb = "pause" | "resume" | "run" | "cancel" | "retry" | "answer" | "read" | "approve" | "sendback" | "publish" | "revise" | "pauseAll" | "resumeAll";
export type CmdStatus = "held" | "sending" | "acked" | "done" | "undone";

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
}

export type CommandSpec = Omit<Command, "id" | "status">;

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

/** A command that has left the browser and not yet been done. */
export function inFlightFor(cmds: readonly Command[], agentId: string): Command | undefined {
  return cmds.find((c) => c.agentId === agentId && (c.status === "sending" || c.status === "acked"));
}

export function useCommands(dispatch: (a: SimAction) => void) {
  const [cmds, setCmds] = useState<Command[]>([]);
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
    const at = (ms: number, fn: () => void) => window.setTimeout(fn, ms);
    timers.current.set(id, [
      ...(hold ? [at(t0, () => { held.current.delete(id); setStatus(id, "sending"); })] : []),
      at(t0 + SEND_MS, () => setStatus(id, "acked")),
      at(t0 + SEND_MS + ACK_MS, () => {
        timers.current.delete(id);
        const action = toAction(spec);
        if (action) dispatch(action);
        setStatus(id, "done");
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

  return { cmds, send, undo };
}

export type Commands = ReturnType<typeof useCommands>;
