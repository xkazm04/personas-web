"use client";

import { useState } from "react";
import { CircleSlash, Clock, PauseCircle, PowerOff } from "lucide-react";
import { Modal } from "@/components/dashboard/Modal";
import type { BoardCopy } from "./copy";
import { fill, type SimAgent } from "./model";
import { ctlBtn } from "./Controls";

interface FleetPauseDialogProps {
  open: boolean;
  onClose: () => void;
  scope: readonly SimAgent[];
  hostName: string;
  copy: BoardCopy;
  onConfirm: (paused: number, stopped: number) => void;
}

/** What "Pause all" will do, counted from the fleet as it stands. */
export function pauseImpact(scope: readonly SimAgent[]) {
  return {
    toPause: scope.filter((a) => a.enabled).length,
    running: scope.filter((a) => a.state === "running").length,
    queued: scope.filter((a) => a.enabled && a.state === "queued").length,
    alreadyOff: scope.filter((a) => !a.enabled).length,
  };
}

/**
 * The fleet's emergency brake, with its consequences spelled out before it is
 * pulled: how many runs are in flight (they finish, unless you also stop
 * them), how many queued runs will not start, and who is already off.
 */
export default function FleetPauseDialog({ open, onClose, scope, hostName, copy, onConfirm }: FleetPauseDialogProps) {
  const c = copy.cmd.confirm;
  const [stop, setStop] = useState(false);
  const im = pauseImpact(scope);
  const rows: [typeof Clock, string][] = [
    [stop ? CircleSlash : Clock, fill(stop ? c.stopping : c.running, { n: im.running })],
    [PauseCircle, fill(c.queued, { n: im.queued })],
    [PowerOff, c.triggers],
  ];
  if (im.alreadyOff) rows.push([PowerOff, fill(c.alreadyOff, { n: im.alreadyOff })]);
  const close = () => {
    setStop(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      maxWidth="max-w-lg"
      ariaLabel={fill(c.title, { host: hostName })}
      title={fill(c.title, { host: hostName })}
      subtitle={c.lede}
      actions={
        <>
          <button type="button" className={`${ctlBtn} text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)]`} onClick={close}>
            {c.keep}
          </button>
          <button
            type="button"
            data-confirm-pause
            className={`${ctlBtn} bg-[var(--status-warning)] text-[color-mix(in_oklab,var(--status-warning)_14%,black)]`}
            onClick={() => {
              onConfirm(im.toPause, stop ? im.running : 0);
              close();
            }}
          >
            {stop && im.running ? fill(c.confirmStop, { n: im.toPause, m: im.running }) : fill(c.confirm, { n: im.toPause })}
          </button>
        </>
      }
    >
      <ul className="space-y-2.5">
        {rows.map(([Icon, text]) => (
          <li key={text} className="flex items-center gap-3 text-base text-foreground">
            <Icon aria-hidden className="h-4 w-4 shrink-0 text-muted-dark" />
            {text}
          </li>
        ))}
      </ul>
      {im.running > 0 && (
        <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-base text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)]">
          <input type="checkbox" checked={stop} onChange={(e) => setStop(e.target.checked)} className="h-4 w-4 accent-[var(--status-warning)]" />
          {fill(c.stopNow, { n: im.running })}
        </label>
      )}
    </Modal>
  );
}
