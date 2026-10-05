"use client";

import type { CSSProperties } from "react";
import type { FleetTeam } from "../fleet-data";
import Emblem from "./Emblem";
import Queue from "./Queue";
import { Bars, Beads, CompBar, Overline, ReasonChip, Ring, StatePill } from "./parts";
import { stateText, taskText, type BoardCopy } from "./copy";
import { counts, fill, formatRunFor, needs, pct, plural, queueOf, reasonOf, type BoardEvent, type SimAgent } from "./model";
import type { BoardNav } from "./useBoardNav";
import b from "./board.module.css";

interface LayerProps {
  scope: SimAgent[];
  simMs: number;
  events: BoardEvent[];
  copy: BoardCopy;
  nav: BoardNav;
  live: boolean;
  still: boolean;
}

/** Nothing under attention: the fleet's verdict and the ranked queue. */
export function FleetLayer({ scope, simMs, events, copy, nav, live, still }: LayerProps) {
  const c = counts(scope);
  const nd = scope.filter(needs).length;
  const top = queueOf(scope)[0];
  return (
    <>
      {top && (
        <div className={`${b.spotArt} pointer-events-none absolute -right-16 top-10 h-60 w-60 opacity-40`} aria-hidden="true">
          <Emblem agent={top} rich live={live} />
        </div>
      )}
      <Overline>
        <b className="font-semibold tracking-wider text-muted">{copy.spot.verdict}</b>
        <span aria-hidden="true">·</span>
        <span>{fill(copy.spot.agents, { n: scope.length })}</span>
      </Overline>
      <div className="relative mt-3 flex items-end gap-4">
        <span key={still ? "n" : nd} className={`${b.verdictNum} ${nd ? "" : b.verdictOk} ${still ? "" : b.bump} text-8xl font-bold leading-[0.86] tracking-tighter`}>
          {nd}
        </span>
        <span className="pb-1.5">
          <span className="block text-3xl font-semibold leading-none tracking-tight text-foreground">
            {nd ? (nd === 1 ? copy.spot.needsYouOne : copy.spot.needsYouMany) : copy.spot.allClear}
          </span>
          <span className="mt-1.5 block text-base text-muted-dark">{fill(copy.spot.ofAgents, { n: scope.length })}</span>
        </span>
      </div>
      <p className="relative mt-4 text-base text-muted-dark">
        <b className="text-foreground">{c.running}</b> {copy.spot.working} · <b className="text-foreground">{c.queued}</b> {copy.spot.queued} ·{" "}
        <b className="text-foreground">{c.idle}</b> {copy.spot.resting}
      </p>
      <CompBar list={scope} copy={copy} />
      <QueueHead title={copy.spot.needsYou} extra={copy.spot.ranked} count={queueOf(scope).length} copy={copy} />
      <Queue list={scope} simMs={simMs} events={events} copy={copy} nav={nav} empty={copy.spot.emptyFleet} />
    </>
  );
}

function QueueHead({ title, extra, count, copy }: { title: string; extra?: string; count: number; copy: BoardCopy }) {
  return (
    <div className="relative mt-5 flex items-center justify-between border-b border-glass pb-2">
      <Overline>
        <b className="font-semibold tracking-wider text-muted">{title}</b>
        {extra}
      </Overline>
      <span className="text-xs text-muted-dark">
        {count > 4 && `${fill(copy.spot.queueMore, { n: count })} `}
        <kbd className="rounded border border-glass-hover px-1.5 font-mono">N</kbd> {copy.spot.next}
      </span>
    </div>
  );
}

/** A team under attention (or open): its health, cost and its own queue. */
export function TeamLayer({ team, ...p }: LayerProps & { team: FleetTeam }) {
  const list = p.scope.filter((a) => a.team === team.id);
  const c = counts(list);
  const nd = list.filter(needs).length;
  const runs = list.reduce((sum, a) => sum + a.runsToday, 0);
  const cost = list.reduce((sum, a) => sum + a.costTodayUsd, 0);
  const succ = list.reduce((sum, a) => sum + a.successRate, 0) / Math.max(1, list.length);
  const hue = { "--h": team.hue } as CSSProperties;
  return (
    <>
      <Overline>
        <b className={`${b.teamInk} font-semibold tracking-wider`} style={hue}>{p.copy.spot.team}</b>
        <span aria-hidden="true">·</span>
        <span>{fill(plural(list.length, p.copy.spot.inViewOne, p.copy.spot.inView), { n: list.length })}</span>
      </Overline>
      <div className="relative mt-4 text-5xl font-bold leading-none tracking-tight text-foreground">{team.name}</div>
      <div className={`${b.teamSwatch} mt-4 h-1.5 w-14 rounded`} style={hue} />
      <p className="relative mt-4 text-base text-muted-dark">
        <b className={nd ? b["ink-attention"] : "text-foreground"}>{nd ? fill(plural(nd, p.copy.spot.needCountOne, p.copy.spot.needCount), { n: nd }) : p.copy.spot.allClearTeam}</b>
        {" · "}<b className="text-foreground">{c.running}</b> {p.copy.spot.working} · <b className="text-foreground">{c.queued}</b> {p.copy.spot.queued}
      </p>
      <CompBar list={list} copy={p.copy} />
      <dl className="relative mt-4 grid grid-cols-3 gap-3">
        {[[p.copy.spot.runsToday, runs], [p.copy.spot.success, pct(succ)], [p.copy.spot.costToday, `$${cost.toFixed(2)}`]].map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-muted-dark">{k}</dt>
            <dd className="text-2xl font-semibold tabular-nums text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
      <QueueHead title={p.copy.spot.needsYouHere} count={queueOf(list).length} copy={p.copy} />
      <Queue {...p} list={list} empty={fill(p.copy.spot.emptyTeam, { team: team.name, n: c.running })} />
    </>
  );
}

/** One agent under attention: emblem at display scale, state, run and history. */
export function AgentLayer({ agent: a, team, simMs, copy, live }: LayerProps & { agent: SimAgent; team: FleetTeam }) {
  const run = a.state === "running";
  const frac = run ? a.progress ?? 0 : a.successRate;
  const tot = a.spark24h.reduce((sum, v) => sum + v, 0);
  const sev = a.reviews.length ? reasonOf(a) : null;
  const stats: [string, string | number, string?][] = [
    [run ? copy.spot.runningFor : copy.spot.runsToday, run ? formatRunFor(simMs - (a.startSim ?? 0)) : a.runsToday],
    [run ? copy.spot.toolCalls : copy.spot.costToday, run ? a.liveToolCalls : `$${a.costTodayUsd.toFixed(2)}`],
    [copy.spot.reviews, a.reviews.length, sev ? b[`r-${sev.cls}`] : undefined],
    [copy.spot.unread, a.unreadMessages.length],
  ];
  return (
    <>
      <div className={`${b.spotArt} pointer-events-none absolute -right-14 top-2 h-64 w-64 opacity-45`} aria-hidden="true">
        <Emblem agent={a} rich live={live} />
      </div>
      <Overline>
        <b className={`${b.teamInk} font-semibold tracking-wider`} style={{ "--h": team.hue } as CSSProperties}>{team.name}</b>
        <span className="ml-auto normal-case tracking-normal">{copy.spot.stylised}</span>
      </Overline>
      <div className={`${b.teamInk} relative mt-4 whitespace-nowrap font-mono text-[clamp(3rem,10cqh,4.5rem)] font-bold leading-none tracking-tighter`} style={{ "--h": a.hue } as CSSProperties}>
        {a.callsign}
      </div>
      <div className="relative mt-2 line-clamp-2 text-[clamp(1.375rem,4.4cqh,1.875rem)] font-semibold leading-tight tracking-tight text-foreground">{a.name}</div>
      <div className="relative mt-4 flex flex-wrap items-center gap-3">
        <StatePill agent={a} text={stateText(a, copy)} />
        {needs(a) && <ReasonChip cls={reasonOf(a).cls} label={copy.reasons[reasonOf(a).cls]} />}
        <span className="text-sm text-muted-dark">{fill(copy.spot.health, { health: copy.health[a.health] })}</span>
      </div>
      <p className="relative mt-3 min-h-6 text-base leading-snug text-foreground">{taskText(a, copy, copy.tasks.resting)}</p>
      <div className="relative mt-3 grid grid-cols-[auto_1fr] items-center gap-4">
        <Ring frac={frac} size={104} stroke={8} running={run} label={run ? copy.spot.progress : copy.spot.successShort} valueClass="text-2xl" className="size-[clamp(80px,17cqh,104px)]" />
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
          {stats.map(([k, v, cls]) => (
            <div key={k}>
              <dt className="text-xs text-muted-dark">{k}</dt>
              <dd className={`text-xl font-semibold tabular-nums ${cls ?? "text-foreground"}`}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="relative mt-3 flex justify-between text-xs text-muted-dark"><span>{copy.spot.last12}</span><span>{copy.spot.newestFirst}</span></div>
      <Beads agent={a} copy={copy} />
      <div className="relative mt-3 flex justify-between text-xs text-muted-dark"><span>{copy.spot.runs24h}</span><span>{fill(plural(tot, copy.spot.runsCountOne, copy.spot.runsCount), { n: tot })}</span></div>
      <Bars agent={a} height={36} />
    </>
  );
}
