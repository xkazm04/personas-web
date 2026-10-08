"use client";

import { Loader2, Pause, Play, Square } from "lucide-react";
import type { BoardCopy } from "./copy";
import { fill, type SimAgent } from "./model";
import type { Command } from "./useCommands";
import type { Operator } from "./operator";

/** "Pausing · Sending to Studio PC": an open command in words. */
export function pendingText(cmd: Command, c: BoardCopy, host: string): string {
  const status = cmd.status === "held" || cmd.status === "sending" || cmd.status === "acked" ? cmd.status : "done";
  return fill(c.cmd.pending, { doing: c.cmd.doing[cmd.verb], status: fill(c.cmd.status[status], { host }) });
}

export const ctlBtn =
  "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-[background-color,transform] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";
const ghost = `${ctlBtn} text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)] hover:bg-[color-mix(in_oklab,var(--foreground)_7%,transparent)]`;

interface ControlsProps {
  agent: SimAgent;
  copy: BoardCopy;
  op: Operator;
  pending?: Command;
  hostName: string;
}

/**
 * Remote control of one agent: pause or resume it, start a run now, cancel the
 * run in progress. Every button sends a command to the machine; while one is
 * open the buttons wait and say what is in flight, and offline they say why
 * they are off.
 */
export default function Controls({ agent: a, copy: c, op, pending, hostName }: ControlsProps) {
  const running = a.state === "running";
  const canRun = a.enabled && !running && a.state !== "input_required" && a.state !== "draft_ready";
  const off = op.offline || !!pending;
  const reasonId = `ctl-why-${a.id}`;
  const why = op.offline ? fill(c.cmd.offline, { host: hostName }) : pending ? pendingText(pending, c, hostName) : !a.enabled && running ? c.cmd.pausedRunning : null;

  return (
    <div role="group" aria-label={fill(c.cmd.controls, { callsign: a.callsign })} aria-describedby={why ? reasonId : undefined}>
      <div className="flex flex-wrap gap-2">
        {a.enabled ? (
          <button type="button" className={ghost} disabled={off} title={c.cmd.hints.pause} onClick={() => op.pause(a)} data-ctl="pause">
            <Pause aria-hidden className="h-4 w-4" />
            {c.cmd.pause}
          </button>
        ) : (
          <button type="button" className={`${ctlBtn} bg-brand-cyan text-background`} disabled={off} title={c.cmd.hints.resume} onClick={() => op.resume(a)} data-ctl="resume">
            <Play aria-hidden className="h-4 w-4" />
            {c.cmd.resume}
          </button>
        )}
        {canRun && (
          <button type="button" className={ghost} disabled={off} title={c.cmd.hints.run} onClick={() => op.run(a)} data-ctl="run">
            <Play aria-hidden className="h-4 w-4" />
            {c.cmd.run}
          </button>
        )}
        {running && (
          <button type="button" className={ghost} disabled={off} title={c.cmd.hints.cancel} onClick={() => op.cancel(a)} data-ctl="cancel">
            <Square aria-hidden className="h-3.5 w-3.5" />
            {c.cmd.cancel}
          </button>
        )}
      </div>
      {why && (
        <p id={reasonId} role="status" className="mt-2 flex items-center gap-1.5 text-sm text-muted-dark">
          {pending && !op.offline && <Loader2 aria-hidden className="h-3.5 w-3.5 shrink-0 animate-spin text-brand-cyan" />}
          {why}
        </p>
      )}
    </div>
  );
}
