"use client";

import { useEffect, useRef } from "react";
import { FLEET, type FleetAgent, type FleetTeam } from "../fleet-data";
import { ActionButton, CurrentRun, EventList, Panel, Reviews, Spark } from "./AgentPanels";
import { meters } from "./Moon";
import MiniSky from "./MiniSky";
import { act, type AgentAction, type NightEvent } from "./nightStore";
import { hueText, stateColor, textTone } from "./palette";
import Persona from "./Persona";
import { cap, fill, fmtAgo, stateWord, windowAria, type CityCopy, type OfficeCopy } from "./vocab";
import o from "./office.module.css";

interface AgentRoomProps {
  a: FleetAgent;
  team: FleetTeam;
  events: NightEvent[];
  byId: Map<string, FleetAgent>;
  simMs: number;
  origin: { x: string; y: string };
  city: CityCopy;
  copy: OfficeCopy;
  still: boolean;
  onBack: () => void;
  onCity: () => void;
}

const HEALTH_COLOR = { healthy: "var(--brand-cyan)", degraded: "var(--status-warning)", critical: "var(--status-error)" } as const;

/**
 * One agent's room filling the frame: the persona at its desk under its own
 * window on the night, and beside it the run, the decisions waiting on you,
 * the day's numbers and the inbox. Grows out of the room you opened.
 */
export default function AgentRoom({ a, team, events, byId, simMs, origin, city, copy, still, onBack, onCity }: AgentRoomProps) {
  const titleRef = useRef<HTMLDivElement>(null);
  useEffect(() => titleRef.current?.focus({ preventScroll: true }), [a.id]);

  const onAct = (k: AgentAction, rid?: string) => act(a.id, k, rid);
  const ok = a.recentStatuses.filter((x) => x === "completed").length;
  const mine = events.filter((e) => e.agentId === a.id || e.toAgentId === a.id).slice(0, 4);
  const hourNow = Math.floor((FLEET.nowMs + simMs) / 3_600_000) % 24;
  const where = !a.enabled ? copy.where.rest : a.state === "running" ? copy.where.work : copy.where.desk;
  const c = stateColor(a);

  return (
    <section
      aria-label={windowAria(city, a, team.name)}
      className={`absolute inset-0 z-20 overflow-hidden ${still ? "" : o.roomIn}`}
      style={{ ["--ox" as string]: origin.x, ["--oy" as string]: origin.y, ["--c" as string]: c, ["--team" as string]: `hsl(${team.hue} 50% 50%)` }}
    >
      <div className={o.agentBg} />
      <nav aria-label={copy.breadcrumb} className="absolute left-6 top-3 z-10 flex items-center gap-3 text-base">
        <button type="button" onClick={onBack} className="rounded-lg border border-brand-cyan/50 px-3 py-1 text-foreground transition-colors hover:bg-brand-cyan/10 focus-visible:outline-2 focus-visible:outline-brand-cyan" style={{ background: "var(--ns-panel)" }}>
          ← {copy.back}
        </button>
        <button type="button" onClick={onCity} className="text-muted-dark hover:text-foreground hover:underline">{copy.city}</button>
        <span className="text-muted-dark">›</span>
        <button type="button" onClick={onBack} className="text-muted-dark hover:text-foreground hover:underline">{team.name}</button>
        <span className="text-muted-dark">›</span>
        <span aria-current="page" className="font-semibold text-foreground">{a.callsign} {a.name}</span>
        <span className="ml-2 text-[13px] text-muted-dark">{copy.escHint}</span>
      </nav>

      <div className="absolute inset-x-6 bottom-4 top-16 grid grid-cols-[minmax(280px,36%)_1fr] gap-6">
        <div className="relative flex min-h-0 flex-col items-center justify-end">
          <div className={`${o.miniSky} absolute left-[30%] top-6`}><MiniSky used5={meters(simMs)[0].used} /></div>
          <Persona a={a} still={still} className="relative w-full max-w-[520px]" />
          <p className="mt-1 self-start text-[13px] text-muted-dark">{fill(copy.artNote, { callsign: a.callsign, where })}</p>
        </div>

        <div className="flex min-h-0 flex-col">
          <div ref={titleRef} tabIndex={-1} className="outline-none">
            <div className="flex flex-wrap items-baseline gap-4">
              <span className="font-mono text-[88px] font-bold leading-none tracking-tighter" style={{ color: hueText(a.hue) }}>{a.callsign}</span>
              <span className="rounded-full border px-3.5 py-1 text-base" style={{ color: textTone(c), borderColor: c }}>{cap(stateWord(city, a))}</span>
              {a.health !== "healthy" && (
                <span className="rounded-full border px-3.5 py-1 text-base" style={{ color: textTone(HEALTH_COLOR[a.health]), borderColor: HEALTH_COLOR[a.health] }}>
                  {fill(copy.healthPill, { h: copy.health[a.health] })}
                </span>
              )}
            </div>
            <h2 className="mt-1 text-4xl font-semibold tracking-tight text-foreground">{a.name}</h2>
            <p className="mt-1.5 truncate text-lg text-muted-dark">{fill(copy.summaryLine, { team: team.name, runs: a.runsToday, ok, bad: 12 - ok })}</p>
          </div>

          <div className="mt-4 grid min-h-0 flex-1 grid-cols-2 gap-4">
            <div className="flex min-h-0 flex-col gap-3">
              <Panel title={copy.currentRun}><CurrentRun a={a} copy={copy} onAct={onAct} /></Panel>
              <Panel title={copy.needsDecision} aside={<span>{a.reviews.length}</span>}>
                <Reviews a={a} copy={copy} city={city} simMs={simMs} onAct={onAct} />
              </Panel>
              <Panel title={fill(copy.latestFrom, { callsign: a.callsign })} grow>
                <EventList events={mine} byId={byId} empty={copy.nothingLogged} />
              </Panel>
            </div>
            <div className="flex min-h-0 flex-col gap-3">
              <Panel>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    [String(a.runsToday), copy.runsToday, "var(--foreground)"],
                    [`${Math.round(a.successRate * 100)}%`, copy.success, "var(--foreground)"],
                    [`$${a.costTodayUsd.toFixed(2)}`, copy.costToday, "var(--foreground)"],
                    [copy.health[a.health], copy.healthLabel, HEALTH_COLOR[a.health]],
                  ] as const).map(([v, k, col]) => (
                    <div key={k}>
                      <div className="text-2xl font-semibold tracking-tight" style={{ color: textTone(col) }}>{v}</div>
                      <div className="text-[13px] text-muted-dark">{k}</div>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title={copy.last12} aside={<span className="normal-case tracking-normal">{copy.newestFirst}</span>}>
                <div className="flex items-center gap-2" role="img" aria-label={a.recentStatuses.map((x) => copy.status[x]).join(", ")}>
                  {a.recentStatuses.map((x, i) => <i key={i} className={`${o.bead} ${x === "failed" ? o.fail : ""}`} />)}
                </div>
              </Panel>
              <Panel title={copy.runsPerHour} aside={<span className="normal-case tracking-normal">{fill(copy.runsTotal, { n: a.spark24h.reduce((x, y) => x + y, 0) })}</span>}>
                <Spark a={a} hue={team.hue} hourNow={hourNow} copy={copy} />
              </Panel>
              <Panel
                title={fill(copy.messages, { n: a.unreadMessages.length })}
                aside={a.unreadMessages.length > 0 && <ActionButton onClick={() => onAct("read")}>{copy.markRead}</ActionButton>}
                grow
              >
                {a.unreadMessages.length === 0 && <p className="text-base text-muted-dark">{copy.inboxClear}</p>}
                {a.unreadMessages.slice(0, 2).map((m) => (
                  <div key={m.id} className="flex justify-between gap-3 border-t border-glass py-1.5 text-base text-foreground first:border-t-0">
                    <span className="min-w-0 truncate">{m.text}</span>
                    <span className="flex-none text-[13px] text-muted-dark">{fmtAgo(city, m.ageMin + simMs / 60000)}</span>
                  </div>
                ))}
                {a.unreadMessages.length > 2 && <p className="text-[13px] text-muted-dark">{fill(copy.more, { n: a.unreadMessages.length - 2 })}</p>}
              </Panel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
