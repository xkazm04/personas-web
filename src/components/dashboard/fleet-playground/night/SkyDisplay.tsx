import type { ReactNode } from "react";
import { needsYou, type FleetAgent } from "../fleet-data";
import type { BuildingBox } from "./city-layout";
import { LABEL, READING } from "./lantern-placement";
import type { Meter } from "./Moon";
import { hueText, SEVERITY_COLOR, stateColor, textTone } from "./palette";
import { cap, fill, fmtDur, reviewsLine, sevOf, stateWord, unreadLine, type CityCopy } from "./vocab";
import s from "./night.module.css";

/* Sizes are DESIGN units on a stage that scales to ~0.78 at its smallest:
   LABEL (16) and READING (21) keep >= 12 px and >= 16 px on screen. */

/** The summary's text, shared with the lantern pass so it can steer around it. */
export function summaryText(copy: CityCopy, scoped: FleetAgent[]) {
  const ny = scoped.filter(needsYou).length;
  const count = (st: FleetAgent["state"]) => scoped.filter((a) => a.enabled && a.state === st).length;
  return {
    ny,
    words: ny === 1 ? copy.needsYouOne : copy.needsYouMany,
    sub: fill(copy.summary, { running: count("running"), queued: count("queued"), idle: count("idle"), off: scoped.filter((a) => !a.enabled).length }),
  };
}

/** The moon block's four lines, shared with the lantern pass. */
export function moonText(copy: CityCopy, five: Meter, seven: Meter) {
  const verdict = (m: Meter, goneTpl: string) =>
    `${m.hot ? copy.moon.hot : copy.moon.onPace} · ${fill(goneTpl, { pct: Math.round(m.elapsed * 100) })} · ${fill(copy.moon.resetsIn, { t: fmtDur(m.leftMs) })}`;
  return {
    fiveTitle: `${copy.moon.fiveHour} ${five.used}%`,
    five: verdict(five, copy.moon.windowGone),
    sevenTitle: `${copy.moon.sevenDay} ${seven.used}%`,
    seven: verdict(seven, copy.moon.weekGone),
  };
}

const WARN = textTone("var(--status-warning)");

/** The sky's headline: how many windows need you, and the calm mass beneath. */
export function Summary({ copy, scoped }: { copy: CityCopy; scoped: FleetAgent[] }) {
  const { ny, words, sub } = summaryText(copy, scoped);
  return (
    <div className={`${s.fade} ${s.dimOnAtt} absolute left-11 top-[70px]`}>
      <div className="flex items-baseline gap-3 whitespace-nowrap leading-none">
        <span key={ny} className={`${s.pop} inline-block font-bold tracking-tight`} style={{ fontSize: 84, color: WARN, textShadow: "0 0 30px color-mix(in oklab, var(--status-warning) 30%, transparent)" }}>
          {ny}
        </span>
        <span className="font-semibold tracking-tight text-foreground" style={{ fontSize: 44 }}>{words}</span>
      </div>
      <div className="mt-3 text-muted-dark" style={{ fontSize: READING }}>{sub}</div>
    </div>
  );
}

/** Moon and halo labels with their pace verdicts. */
export function MoonLabels({ copy, five, seven }: { copy: CityCopy; five: Meter; seven: Meter }) {
  const m = moonText(copy, five, seven);
  const verdict = (hot: boolean, text: string) => (
    <div className="mt-0.5" style={{ fontSize: LABEL, color: hot ? WARN : "var(--muted-dark)" }}>{text}</div>
  );
  return (
    <div className={`${s.fade} ${s.dimOnAtt} absolute right-[180px] top-[78px] text-right`}>
      <div className="text-foreground" style={{ fontSize: READING }}>{m.fiveTitle}</div>
      {verdict(five.hot, m.five)}
      <div className="h-3" />
      <div className="text-foreground" style={{ fontSize: READING }}>{m.sevenTitle}</div>
      {verdict(seven.hot, m.seven)}
    </div>
  );
}

interface DisplayProps {
  copy: CityCopy;
  agent: FleetAgent | null;
  team: BuildingBox | null;
  teamName: string;
  simMs: number;
}

/** When a window or a building is under attention, the sky becomes its stage. */
export function Display({ copy, agent, team, teamName, simMs }: DisplayProps) {
  const on = !!agent || !!team;
  return (
    <div aria-live="polite" className={`${s.display} ${on ? s.on : ""} absolute left-[220px] top-[78px] w-[1000px] text-center`}>
      {agent && <AgentStage copy={copy} a={agent} teamName={teamName} simMs={simMs} />}
      {!agent && team && <TeamStage copy={copy} b={team} />}
    </div>
  );
}

function AgentStage({ copy, a, teamName, simMs }: { copy: CityCopy; a: FleetAgent; teamName: string; simMs: number }) {
  const sev = sevOf(a);
  return (
    <>
      <div className="font-mono font-bold leading-none tracking-tighter" style={{ fontSize: 112, color: hueText(a.hue) }}>{a.callsign}</div>
      <div className="mt-1.5 text-5xl font-semibold tracking-tight text-foreground">{a.name}</div>
      <div className="mt-2.5 truncate text-muted-dark" style={{ fontSize: 23 }}>
        <span className="font-semibold" style={{ color: textTone(stateColor(a)) }}>{cap(stateWord(copy, a))}</span> · {teamName}
        {a.task ? ` · ${a.task}` : ""}
      </div>
      {a.enabled && a.state === "running" && (
        <>
          <div className="mx-auto mt-3.5 h-2 w-[420px] overflow-hidden rounded-full bg-foreground/10">
            <i className="block h-full rounded-full bg-brand-cyan" style={{ width: `${Math.round((a.progress ?? 0) * 100)}%`, transition: "width .8s" }} />
          </div>
          <div className="mt-2.5 text-muted-dark" style={{ fontSize: READING }}>{fill(copy.runningFor, { t: fmtDur(a.runningSinceMs ?? 0), n: a.liveToolCalls })}</div>
        </>
      )}
      {(sev || a.unreadMessages.length > 0) && (
        <div className="mt-3.5 flex justify-center gap-2.5">
          {sev && <Badge color={SEVERITY_COLOR[sev]}>{reviewsLine(copy, a, simMs)}</Badge>}
          {a.unreadMessages.length > 0 && <Badge color="var(--ns-wire)">{unreadLine(copy, a)}</Badge>}
        </div>
      )}
      <div className="mt-3 text-muted-dark" style={{ fontSize: LABEL }}>{copy.openRoom}</div>
    </>
  );
}

function TeamStage({ copy, b }: { copy: CityCopy; b: BuildingBox }) {
  const ny = b.mem.filter(needsYou).length;
  const run = b.mem.filter((a) => a.state === "running").length;
  const runs = b.mem.reduce((n, a) => n + a.runsToday, 0);
  return (
    <>
      <div className="font-bold leading-none tracking-tighter" style={{ fontSize: 88, color: hueText(b.t.hue) }}>{b.t.name}</div>
      <div className="mt-3 text-muted-dark" style={{ fontSize: 23 }}>{fill(copy.teamLine, { n: b.n, run, ny, runs })}</div>
      <div className="mt-3 text-muted-dark" style={{ fontSize: LABEL }}>{copy.stepInside}</div>
    </>
  );
}

/** A pill in a state or severity colour; the text tone keeps AA in light themes. */
export function Badge({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="rounded-full border px-2.5 py-0.5" style={{ fontSize: LABEL, color: textTone(color), borderColor: color, background: "var(--ns-panel)" }}>
      {children}
    </span>
  );
}
