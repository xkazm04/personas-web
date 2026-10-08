"use client";

import { Loader2, Monitor, Pause, Play } from "lucide-react";
import { ATTENTION_COLOR } from "../attention";
import { ago, type BoardCopy } from "./copy";
import { fill } from "./model";
import type { HostReading } from "./host";
import { ctlBtn, pendingText } from "./Controls";
import type { Command } from "./useCommands";

interface HostCardProps {
  host: HostReading;
  copy: BoardCopy;
  live: boolean;
  /** Agents the last "Pause all" switched off (0 when the fleet is not paused). */
  fleetPaused: number;
  /** An open fleet-wide command. */
  pending?: Command;
  onPauseAll: () => void;
  onResumeAll: () => void;
}

/** "synced 3s ago": the heartbeat at second resolution, which is what it moves at. */
export function beatText(ms: number, c: BoardCopy): string {
  const s = Math.floor(ms / 1000);
  return s < 1 ? c.host.justNow : fill(c.host.secondsAgo, { n: s });
}

function Meter({ label, value, frac, tone }: { label: string; value: string; frac: number | null; tone: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-muted-dark">{label}</span>
        <span className="truncate font-semibold tabular-nums text-foreground">{value}</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)]">
        {frac != null && <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.round(frac * 100)}%`, background: tone }} />}
      </div>
    </div>
  );
}

/**
 * The machine the fleet runs on, at the top of the rail: which computer, is it
 * answering, how fresh is what you see, and how much room it has left. Run
 * slots are drawn one cell per slot, so "full" reads before the numbers do.
 */
export default function HostCard({ host: h, copy: c, live, fleetPaused, pending, onPauseAll, onResumeAll }: HostCardProps) {
  const online = h.status === "online";
  const statusCol = online ? "var(--status-success)" : "var(--muted-foreground)";
  const cpuTone = h.cpuPct != null && h.cpuPct > 85 ? ATTENTION_COLOR.warning : ATTENTION_COLOR.working;
  const slotsAria = fill(c.host.slotsAria, { used: h.slotsUsed, total: h.slotsTotal, queued: h.queued, paused: h.paused });

  return (
    <section aria-label={c.host.label} className="flex-none border-b border-glass px-3 pb-3 pt-2.5" data-host-status={h.status}>
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] shadow-[inset_0_0_0_1px_var(--border-glass)]">
          <Monitor aria-hidden className="h-4 w-4 text-foreground" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold leading-tight text-foreground">{h.name}</div>
          <div className="truncate text-xs leading-tight text-muted-dark" title={h.platform}>
            {online ? (
              <>
                {fill(c.host.synced, { ago: beatText(h.beatAgeMs, c) })}
                {h.latencyMs != null && <span title={c.host.latencyTitle}> · <span className="tabular-nums">{fill(c.host.latency, { ms: h.latencyMs })}</span></span>}
              </>
            ) : (
              fill(c.host.lastSeen, { ago: ago(h.beatAgeMs, c) })
            )}
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ color: `color-mix(in oklab, ${statusCol} 80%, var(--foreground))`, background: `color-mix(in oklab, ${statusCol} 12%, transparent)` }}>
          <i className={`h-1.5 w-1.5 rounded-full ${online && live ? "animate-pulse" : ""}`} style={{ background: online ? statusCol : "transparent", boxShadow: online ? undefined : `inset 0 0 0 1.5px ${statusCol}` }} aria-hidden />
          {online ? c.host.online : c.host.offline}
        </span>
      </div>

      {!online && <p className="mt-2 text-xs leading-snug text-muted-dark">{c.host.offlineNote}</p>}

      <div className={`mt-3 ${online ? "" : "opacity-60"}`}>
        <div className="flex items-baseline justify-between text-xs">
          <span className="uppercase tracking-wider text-muted-dark">{c.host.slots}</span>
          <span className="font-semibold tabular-nums text-foreground">{fill(c.host.slotsValue, { used: h.slotsUsed, total: h.slotsTotal })}</span>
        </div>
        <div role="img" aria-label={slotsAria} className="mt-1.5 flex gap-[3px]">
          {Array.from({ length: h.slotsTotal }, (_, i) => (
            <i
              key={i}
              className="h-3 min-w-0 flex-1 rounded-[3px] transition-colors duration-500"
              style={i < h.slotsUsed
                ? { background: ATTENTION_COLOR.working, boxShadow: `0 0 6px color-mix(in oklab, ${ATTENTION_COLOR.working} 45%, transparent)` }
                : { boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--foreground) 22%, transparent)" }}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-dark">
          <span>{h.queued ? fill(c.host.queued, { n: h.queued }) : c.host.queuedNone}</span>
          {h.paused > 0 && <span>{fill(c.host.paused, { n: h.paused })}</span>}
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-3">
        <Meter label={c.host.cpu} value={h.cpuPct != null ? `${h.cpuPct}%` : c.host.notReported} frac={h.cpuPct != null ? h.cpuPct / 100 : null} tone={cpuTone} />
        <Meter
          label={c.host.memory}
          value={h.memUsedGb != null ? fill(c.host.memValue, { used: h.memUsedGb, total: h.memTotalGb }) : c.host.notReported}
          frac={h.memUsedGb != null ? h.memUsedGb / h.memTotalGb : null}
          tone="var(--status-info)"
        />
      </div>

      <FleetRow c={c} host={h} fleetPaused={fleetPaused} pending={pending} onPauseAll={onPauseAll} onResumeAll={onResumeAll} />
    </section>
  );
}

/** The fleet's brake: Pause all (with its impact dialog), or, once pulled,
 *  the paused state and Resume. Waits while a fleet command is in flight. */
function FleetRow({ c, host: h, fleetPaused, pending, onPauseAll, onResumeAll }: Pick<HostCardProps, "fleetPaused" | "pending" | "onPauseAll" | "onResumeAll"> & { c: BoardCopy; host: HostReading }) {
  const offline = h.status === "offline";
  const off = offline || !!pending;
  const why = offline ? fill(c.cmd.offline, { host: h.name }) : undefined;
  return (
    <div role="group" aria-label={c.cmd.fleetControls} className="mt-3">
      {fleetPaused > 0 ? (
        <div className="flex items-center gap-2 rounded-lg bg-[color-mix(in_oklab,var(--status-warning)_12%,transparent)] py-1.5 pl-2.5 pr-1.5">
          <div className="min-w-0 flex-1 text-xs leading-tight">
            <div className="font-semibold text-foreground">{c.cmd.fleetPaused}</div>
            <div className="truncate text-muted-dark">{fill(c.cmd.fleetPausedNote, { n: fleetPaused })}</div>
          </div>
          <button type="button" className={`${ctlBtn} h-8 bg-brand-cyan text-background`} disabled={off} title={why ?? fill(c.cmd.hints.resumeAll, { n: fleetPaused })} onClick={onResumeAll} data-ctl="resume-all">
            <Play aria-hidden className="h-3.5 w-3.5" />
            {fill(c.cmd.resumeAll, { n: fleetPaused })}
          </button>
        </div>
      ) : (
        <button type="button" className={`${ctlBtn} h-8 w-full justify-center text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)] hover:bg-[color-mix(in_oklab,var(--status-warning)_10%,transparent)]`} disabled={off} title={why ?? fill(c.cmd.hints.pauseAll, { host: h.name })} onClick={onPauseAll} data-ctl="pause-all">
          <Pause aria-hidden className="h-3.5 w-3.5" />
          {c.cmd.pauseAll}
        </button>
      )}
      {pending && (
        <p role="status" className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-dark">
          <Loader2 aria-hidden className="h-3 w-3 animate-spin text-brand-cyan" />
          {pendingText(pending, c, h.name)}
        </p>
      )}
    </div>
  );
}

/** The field's notice while the machine is offline: what you see is its last word. */
export function OfflineBanner({ host, copy: c }: { host: HostReading; copy: BoardCopy }) {
  return (
    <p role="status" className="flex flex-none items-center gap-2 border-b border-glass bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)] px-4 py-1.5 text-sm text-foreground">
      <i className="h-2 w-2 shrink-0 rounded-full shadow-[inset_0_0_0_1.5px_var(--muted-foreground)]" aria-hidden />
      {fill(c.host.offlineBanner, { name: host.name, ago: ago(host.beatAgeMs, c) })}
    </p>
  );
}
