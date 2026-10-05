"use client";

import { FLEET, formatAge } from "../fleet-data";
import { ago, eventText, hm, type BoardCopy } from "./copy";
import { fill, type BoardEvent, type SimAgent } from "./model";
import type { BoardNav } from "./useBoardNav";

interface BandProps {
  scope: SimAgent[];
  simMs: number;
  events: BoardEvent[];
  copy: BoardCopy;
  nav: BoardNav;
  live: boolean;
}

const KIND_VAR: Record<BoardEvent["kind"], string> = {
  run_completed: "var(--st-ok)", run_failed: "var(--st-failed)", review_requested: "var(--st-attention)",
  message: "var(--sev-info)", handoff: "var(--st-draft_ready)", self_heal: "var(--st-ok)", decision: "var(--foreground)",
};

function Head({ title, note }: { title: string; note: string }) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2 whitespace-nowrap text-xs uppercase tracking-[0.12em] text-muted-dark">
      <span>{title}</span>
      <b className="truncate font-semibold normal-case tracking-normal text-muted">{note}</b>
    </div>
  );
}

/** Beneath the board: usage pace, app-level work, and the newest events. */
export default function Band({ scope, simMs, events, copy, nav, live }: BandProps) {
  const ids = new Set(scope.map((a) => a.id));
  const latest = events.filter((e) => ids.has(e.agentId)).slice(0, 3);
  const byId = Object.fromEntries(scope.map((a) => [a.id, a]));

  return (
    <footer className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.6fr)] gap-0 border-t border-glass pt-3">
      <div className="min-w-0 pr-5">
        <Head title={copy.band.pace} note={fill(copy.band.planNote, { plan: FLEET.usage.plan })} />
        <div className="grid grid-cols-2 gap-5">
          {FLEET.usage.windows.map((w) => {
            const rem = Math.max(0, w.resetsInMs - simMs);
            const el = ((w.windowMs - rem) / w.windowMs) * 100;
            const d = w.utilizationPct - el;
            const [verdict, col] = d > 5 ? [copy.band.hot, "var(--st-input_required)"] : d < -15 ? [copy.band.headroom, "var(--sev-info)"] : [copy.band.onPace, "var(--st-ok)"];
            return (
              <div key={w.label} className="min-w-0">
                <div className="flex items-baseline gap-2 whitespace-nowrap">
                  <span className="text-2xl font-bold tabular-nums" style={{ color: `color-mix(in oklab, ${col} 78%, var(--foreground))` }}>{w.utilizationPct}%</span>
                  <span className="truncate text-sm text-muted-dark">{fill(copy.band.used, { label: w.label })}</span>
                  <span className="ml-auto rounded-md border px-1.5 py-0.5 text-xs font-semibold" style={{ borderColor: col, color: `color-mix(in oklab, ${col} 78%, var(--foreground))` }}>{verdict}</span>
                </div>
                <div className="relative mt-2 h-2 rounded bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)]" aria-hidden="true">
                  <div className="absolute inset-y-0 left-0 rounded" style={{ width: `${w.utilizationPct}%`, background: `linear-gradient(90deg, color-mix(in oklab, ${col} 35%, transparent), ${col})` }} />
                  <div className="absolute -top-1 h-4 w-0.5 rounded-sm bg-foreground" style={{ left: `calc(${el.toFixed(1)}% - 1px)` }} />
                </div>
                <div className="mt-1 truncate text-xs text-muted-dark">{fill(copy.band.elapsed, { pct: Math.round(el), time: formatAge(rem) })}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="min-w-0 border-l border-glass px-5">
        <Head title={copy.band.system} note={copy.band.systemNote} />
        {FLEET.systemProcesses.map((p) => {
          const col = p.status === "running" ? "var(--st-running)" : p.status === "queued" ? "var(--st-queued)" : "var(--st-ok)";
          const status = p.status === "running" ? fill(copy.band.procRunning, { time: formatAge(p.startedAgoMs + simMs) })
            : p.status === "completed" ? fill(copy.band.procDone, { ago: ago(p.startedAgoMs + simMs, copy) }) : copy.band.procQueued;
          return (
            <div key={p.label} className="flex h-6 items-center gap-2.5 whitespace-nowrap text-sm text-muted">
              <span className={`h-2 w-2 shrink-0 rounded-full ${p.status === "running" && live ? "animate-pulse" : ""}`} style={{ background: col, boxShadow: `0 0 8px ${col}` }} />
              <span className="truncate">{p.label}</span>
              <span className="ml-auto text-xs" style={{ color: `color-mix(in oklab, ${col} 78%, var(--foreground))` }}>{status}</span>
            </div>
          );
        })}
      </div>
      <div className="min-w-0 border-l border-glass pl-5">
        <Head title={copy.band.live} note={copy.band.liveNote} />
        {latest.map((e) => {
          const a = byId[e.agentId];
          return (
            <button
              key={`${e.tsMs}-${e.agentId}-${e.kind}`}
              type="button"
              className="grid h-6 w-full grid-cols-[44px_1fr_auto] items-center gap-2.5 rounded-md text-left hover:bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] focus-visible:outline-2 focus-visible:outline-foreground"
              aria-label={`${copy.kinds[e.kind]}, ${a.callsign}: ${eventText(e, copy)}`}
              onClick={(ev) => nav.openAgent(a.id, ev.currentTarget)}
            >
              <span className="font-mono text-xs text-muted-dark">{hm(e.tsMs)}</span>
              <span className="truncate text-sm text-muted">
                <i className="mr-2 inline-block h-2 w-2 rounded-full align-middle" style={{ background: KIND_VAR[e.kind] }} />
                <b className="mr-2 font-mono text-foreground">{a.callsign}</b>
                {eventText(e, copy)}
              </span>
              <span className="whitespace-nowrap text-xs text-muted-dark">{ago(FLEET.nowMs + simMs - e.tsMs, copy)}</span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}
