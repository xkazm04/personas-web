import { formatClock, type FleetAgent, type FleetTeam } from "../fleet-data";
import type { NightEvent } from "./nightStore";
import { hueText, KIND_COLOR, SEVERITY_COLOR, stateColor, textTone } from "./palette";
import { ranked } from "./useNightSim";
import { sevOf } from "./vocab";
import { cap, fill, fmtDur, reasonShort, reviewsLine, stateWord, unreadLine, type CityCopy, type OfficeCopy } from "./vocab";
import o from "./office.module.css";

interface OfficeInfoProps {
  team: FleetTeam;
  members: FleetAgent[];
  events: NightEvent[];
  byId: Map<string, FleetAgent>;
  focus: FleetAgent | null;
  simMs: number;
  city: CityCopy;
  copy: OfficeCopy;
  onOpen: (id: string) => void;
}

/** The team at a glance: counts, today's numbers, who needs you on these
 *  floors, the latest events. A room under attention takes over the top. */
export default function OfficeInfo({ team, members, events, byId, focus, simMs, city, copy, onOpen }: OfficeInfoProps) {
  const queue = ranked(members);
  const run = members.filter((a) => a.state === "running").length;
  const runs = members.reduce((n, a) => n + a.runsToday, 0);
  const cost = members.reduce((n, a) => n + a.costTodayUsd, 0);
  const success = members.reduce((n, a) => n + a.successRate, 0) / Math.max(1, members.length);
  const ids = new Set(members.map((a) => a.id));
  const latest = events.filter((e) => ids.has(e.agentId)).slice(0, 3);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <h2 className="text-5xl font-bold leading-none tracking-tight" style={{ color: hueText(team.hue) }}>{team.name}</h2>
      <p className="mt-3 text-xl text-muted-dark">
        {fill(copy.counts, { n: members.length, run })} ·{" "}
        <span style={{ color: queue.length ? textTone("var(--status-warning)") : undefined }}>{queue.length === 1 ? copy.needOne : fill(copy.needMany, { n: queue.length })}</span>
      </p>
      <div className="mt-5 flex gap-6">
        {[[runs, copy.runsToday], [`${Math.round(success * 100)}%`, copy.successRate], [`$${cost.toFixed(2)}`, copy.costToday]].map(([v, k]) => (
          <div key={k}>
            <div className="text-[30px] font-semibold tracking-tight text-foreground">{v}</div>
            <div className="text-[13px] text-muted-dark">{k}</div>
          </div>
        ))}
      </div>

      <h3 className="mb-2.5 mt-6 text-[13px] font-semibold uppercase tracking-widest text-muted-dark">{copy.needsYouHeading}</h3>
      <div className="flex flex-col gap-2">
        {queue.length === 0 && <p className="text-base text-muted-dark">{copy.calm}</p>}
        {queue.slice(0, 4).map((a) => {
          const r = reasonShort(city, a);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onOpen(a.id)}
              className="flex w-full items-center gap-3 rounded-[10px] border border-glass-hover px-3 py-2 text-left transition-colors hover:border-glass-strong focus-visible:outline-2 focus-visible:outline-brand-cyan"
              style={{ borderLeft: `4px solid ${r.color}`, background: "var(--ns-panel)" }}
            >
              <span className="min-w-[56px] font-mono text-base font-bold" style={{ color: textTone(r.color) }}>{a.callsign}</span>
              <span className="truncate text-base text-foreground">{a.name} · {r.text}</span>
            </button>
          );
        })}
      </div>

      <h3 className="mb-2 mt-6 text-[13px] font-semibold uppercase tracking-widest text-muted-dark">{copy.latestHeading}</h3>
      <div className="min-h-0 flex-1 overflow-hidden">
        {latest.length === 0 && <p className="text-base text-muted-dark">{copy.quiet}</p>}
        {latest.map((e) => (
          <div key={e.id} className="flex justify-between gap-3 border-t border-glass py-1.5 text-base text-foreground">
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
      </div>

      <div className={`${o.focusCard} ${focus ? o.on : ""}`} aria-hidden="true">
        {focus && <FocusCard a={focus} simMs={simMs} city={city} copy={copy} />}
      </div>
    </div>
  );
}

function FocusCard({ a, simMs, city, copy }: { a: FleetAgent; simMs: number; city: CityCopy; copy: OfficeCopy }) {
  const sev = sevOf(a);
  return (
    <>
      <div className="font-mono text-[80px] font-bold leading-none tracking-tighter" style={{ color: hueText(a.hue) }}>{a.callsign}</div>
      <div className="mt-1.5 text-[32px] font-semibold text-foreground">{a.name}</div>
      <div className="mt-2 text-xl font-semibold" style={{ color: textTone(stateColor(a)) }}>{cap(stateWord(city, a))}</div>
      {a.task && <div className="mt-1.5 text-lg text-muted-dark">{a.task}</div>}
      {a.enabled && a.state === "running" && <div className="mt-1.5 text-base text-muted-dark">{fill(city.runningFor, { t: fmtDur(a.runningSinceMs ?? 0), n: a.liveToolCalls })}</div>}
      {sev && <div className="mt-1.5 text-base" style={{ color: textTone(SEVERITY_COLOR[sev]) }}>{reviewsLine(city, a, simMs)}</div>}
      {a.unreadMessages.length > 0 && <div className="mt-1.5 text-base" style={{ color: textTone("var(--ns-wire)") }}>{unreadLine(city, a)}</div>}
      <div className="mt-2 text-[13px] text-muted-dark">{copy.roomHint}</div>
    </>
  );
}
