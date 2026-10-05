import type { ReactNode } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { ATTENTION_COLOR, countAttention } from "../attention";
import { formatClock, type FleetAgent, type FleetProcess } from "../fleet-data";
import type { Meter } from "./Moon";
import type { NightEvent } from "./nightStore";
import { KIND_COLOR, textTone } from "./palette";
import { fill, fmtAgo, fmtDur, type CityCopy } from "./vocab";
import s from "./night.module.css";

/** The top strip's verdict: how many need you (in the needs colour), then the
 *  rest of the fleet as working / resting / off. One line. */
export function AttentionSummary({ agents }: { agents: FleetAgent[] }) {
  const { t } = useTranslation();
  const A = t.fleetPlayground.attention;
  const c = countAttention(agents);
  const dot = (k: "working" | "resting" | "off") => (
    <span className="flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-dark">
      <i className="h-2 w-2 rounded-full" style={{ background: ATTENTION_COLOR[k] }} />
      <b className="font-semibold tabular-nums text-foreground">{c[k]}</b> {A[k]}
    </span>
  );
  return (
    <div className="flex min-w-0 items-center gap-4">
      <span className="flex items-baseline gap-1.5 whitespace-nowrap">
        <b className="text-xl font-bold tabular-nums" style={{ color: textTone(c.critical ? ATTENTION_COLOR.critical : ATTENTION_COLOR.needs) }}>{c.needs}</b>
        <span className="text-sm font-semibold text-foreground">{A.needs}</span>
      </span>
      {dot("working")}
      {dot("resting")}
      {dot("off")}
    </div>
  );
}

/** A small rounded chip for the strips. */
export function Chip({ children, color, title }: { children: ReactNode; color?: string; title?: string }) {
  return (
    <span title={title} className="flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full border border-glass px-2 py-0.5 text-xs text-muted-dark">
      {color && <i className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </span>
  );
}

/** The subscription's two meters as chips; pace matters more than the total. */
export function MeterChips({ copy, meters }: { copy: CityCopy; meters: Meter[] }) {
  const [five, seven] = meters;
  const chip = (m: Meter, tpl: string) => (
    <Chip color={m.hot ? "var(--status-warning)" : "var(--brand-cyan)"} title={fill(copy.moon.resetsIn, { t: fmtDur(m.leftMs) })}>
      <b className="font-semibold text-foreground">{fill(tpl, { pct: m.used })}</b>
      <span style={m.hot ? { color: textTone("var(--status-warning)") } : undefined}>{m.hot ? copy.moon.hot : copy.moon.onPace}</span>
    </Chip>
  );
  return (
    <div className="flex flex-none items-center gap-1.5">
      {chip(five, copy.moon.five)}
      {chip(seven, copy.moon.seven)}
    </div>
  );
}

interface BottomProps {
  copy: CityCopy;
  events: NightEvent[];
  byId: Map<string, FleetAgent>;
  procs: FleetProcess[];
  simMs: number;
}

/** The bottom strip: the newest event on one line, then the app's own work
 *  (compaction, sync, backup) as chips. */
export function BottomStrip({ copy, events, byId, procs, simMs }: BottomProps) {
  const e = events[0];
  const P = copy.processes;
  return (
    <>
      <span className="flex flex-none items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: textTone("var(--brand-amber)") }}>
        <i className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--brand-amber)" }} />
        {copy.live}
      </span>
      <div aria-label={copy.tickerLabel} className="min-w-0 flex-1 truncate text-sm text-foreground">
        {e && (
          <span key={e.id} className={s.tickerIn}>
            <span className="mr-2 font-mono text-xs text-muted-dark">{formatClock(e.tsMs).slice(0, 5)}</span>
            <b className="mr-2 font-mono" style={{ color: textTone(KIND_COLOR[e.kind]) }}>
              {byId.get(e.agentId)?.callsign}
              {e.toAgentId ? ` → ${byId.get(e.toAgentId)?.callsign}` : ""}
            </b>
            {e.text}
          </span>
        )}
      </div>
      <div role="group" aria-label={P.label} className="flex flex-none items-center gap-1.5">
        {procs.map((p) => {
          const text =
            p.status === "running"
              ? fill(P.running, { label: p.label, t: fmtDur(p.startedAgoMs + simMs) })
              : p.status === "queued"
                ? fill(P.queued, { label: p.label })
                : fill(P.done, { label: p.label, age: fmtAgo(copy, (p.startedAgoMs + simMs) / 60000) });
          const color = p.status === "running" ? "var(--brand-cyan)" : p.status === "queued" ? "var(--brand-amber)" : "var(--status-success)";
          return <Chip key={p.label} color={color}>{text}</Chip>;
        })}
      </div>
    </>
  );
}
