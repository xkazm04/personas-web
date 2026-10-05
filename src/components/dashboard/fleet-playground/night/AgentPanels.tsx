import type { ReactNode } from "react";
import { formatClock, type FleetAgent } from "../fleet-data";
import type { AgentAction, NightEvent } from "./nightStore";
import { KIND_COLOR, SEVERITY_COLOR, textTone } from "./palette";
import { fill, fmtAgo, fmtDur, type CityCopy, type OfficeCopy } from "./vocab";
import o from "./office.module.css";

export function Panel({ title, aside, children, grow }: { title?: string; aside?: ReactNode; children: ReactNode; grow?: boolean }) {
  return (
    <section className={`${o.panel} ${grow ? "min-h-0 flex-1 overflow-hidden" : ""}`}>
      {title && (
        <h4 className="mb-2.5 flex items-center justify-between text-[13px] font-semibold uppercase tracking-widest text-muted-dark">
          <span>{title}</span>
          {aside}
        </h4>
      )}
      {children}
    </section>
  );
}

const BTN = "rounded-lg border px-3 py-1 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-brand-cyan";
const tone = (c: string) => ({ borderColor: `color-mix(in oklab, ${c} 70%, transparent)`, background: `color-mix(in oklab, ${c} 14%, transparent)`, color: "var(--foreground)" });

export function ActionButton({ color, onClick, children }: { color?: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`${BTN} ${color ? "" : "border-glass-strong text-foreground hover:border-glass-hover"}`} style={color ? tone(color) : undefined}>
      {children}
    </button>
  );
}

interface RunProps { a: FleetAgent; copy: OfficeCopy; onAct: (k: AgentAction) => void }

/** What the agent is doing now, and the one decision that unblocks it. */
export function CurrentRun({ a, copy, onAct }: RunProps) {
  const R = copy.run;
  const pct = Math.round((a.progress ?? 0) * 100);
  const big = (text: string, color = "var(--foreground)") => <p className="text-lg" style={{ color: textTone(color) }}>{text}</p>;
  const sub = (text: string) => <p className="mt-1.5 text-[15px] text-muted-dark">{text}</p>;
  if (!a.enabled) return <>{big(R.off)}{sub(R.offSub)}</>;
  switch (a.state) {
    case "running":
      return (
        <>
          {big(a.task ?? "")}
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-foreground/10">
            <i className="block h-full bg-brand-cyan" style={{ width: `${pct}%`, transition: "width .8s" }} />
          </div>
          {sub(fill(R.progress, { pct, t: fmtDur(a.runningSinceMs ?? 0), n: a.liveToolCalls }))}
        </>
      );
    case "failed":
      return <>{big(a.task ?? R.lastFailed, "var(--status-error)")}{sub(R.failedSub)}<div className="mt-3"><ActionButton color="var(--brand-cyan)" onClick={() => onAct("retry")}>{R.retry}</ActionButton></div></>;
    case "input_required":
      return <>{big(a.task ?? R.waiting)}{sub(R.inputSub)}<div className="mt-3"><ActionButton color="var(--brand-amber)" onClick={() => onAct("answer")}>{R.answer}</ActionButton></div></>;
    case "draft_ready":
      return <>{big(a.task ?? R.draftReady)}{sub(R.draftSub)}<div className="mt-3"><ActionButton color="var(--brand-purple)" onClick={() => onAct("accept")}>{R.accept}</ActionButton></div></>;
    case "queued":
      return <>{big(a.task ?? R.queued)}{sub(R.queuedSub)}</>;
    default:
      return <>{big(copy.noRun, "var(--muted-dark)")}{sub(fill(R.idleSub, { status: copy.status[a.recentStatuses[0]], n: a.runsToday }))}</>;
  }
}

/** Pending human reviews, each with Approve and Send back. */
export function Reviews({ a, copy, city, simMs, onAct }: { a: FleetAgent; copy: OfficeCopy; city: CityCopy; simMs: number; onAct: (k: AgentAction, rid: string) => void }) {
  if (!a.reviews.length) return <p className="text-base text-muted-dark">{copy.noDecisions}</p>;
  return (
    <>
      {a.reviews.slice(0, 3).map((r, i) => (
        <div key={r.id} className={`flex flex-col gap-1.5 py-2 ${i ? "border-t border-glass" : "pt-0"}`}>
          <p className="text-base text-foreground">{r.title}</p>
          <div className="flex items-center gap-2.5 text-[13px] text-muted-dark">
            <span className="rounded-full border px-2" style={{ color: textTone(SEVERITY_COLOR[r.severity]), borderColor: SEVERITY_COLOR[r.severity] }}>{copy.severity[r.severity]}</span>
            <span>{fmtAgo(city, r.ageMin + simMs / 60000)}</span>
            <span className="ml-auto flex gap-2">
              <ActionButton color="var(--brand-cyan)" onClick={() => onAct("approve", r.id)}>{copy.approve}</ActionButton>
              <ActionButton onClick={() => onAct("sendback", r.id)}>{copy.sendBack}</ActionButton>
            </span>
          </div>
        </div>
      ))}
      {a.reviews.length > 3 && <p className="mt-1 text-[13px] text-muted-dark">{fill(copy.moreAfter, { n: a.reviews.length - 3 })}</p>}
    </>
  );
}

export function EventList({ events, byId, empty }: { events: NightEvent[]; byId: Map<string, FleetAgent>; empty: string }) {
  if (!events.length) return <p className="text-base text-muted-dark">{empty}</p>;
  return (
    <>
      {events.map((e) => (
        <div key={e.id} className="flex justify-between gap-3 border-t border-glass py-1.5 text-base text-foreground first:border-t-0">
          <span className="min-w-0 truncate">
            <b className="mr-1.5 font-mono" style={{ color: textTone(KIND_COLOR[e.kind]) }}>
              {byId.get(e.agentId)?.callsign}
              {e.toAgentId ? ` → ${byId.get(e.toAgentId)?.callsign}` : ""}
            </b>
            {e.text}
          </span>
          <span className="flex-none text-[13px] text-muted-dark">{formatClock(e.tsMs).slice(0, 5)}</span>
        </div>
      ))}
    </>
  );
}

/** Runs per hour over the last day, oldest first, in the team's hue. */
export function Spark({ a, hue, hourNow, copy }: { a: FleetAgent; hue: number; hourNow: number; copy: OfficeCopy }) {
  const max = Math.max(1, ...a.spark24h);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <>
      <div className="flex h-12 items-end gap-1">
        {a.spark24h.map((v, i) => (
          <i key={i} className="min-h-0.5 flex-1 rounded-t-sm" style={{ height: `${Math.round((v / max) * 100)}%`, background: `color-mix(in oklab, hsl(${hue} 60% 58%) 80%, var(--background))` }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[13px] text-muted-dark">
        <span>{pad((hourNow + 1) % 24)}:00</span>
        <span>{pad((hourNow + 13) % 24)}:00</span>
        <span>{copy.now}</span>
      </div>
    </>
  );
}
