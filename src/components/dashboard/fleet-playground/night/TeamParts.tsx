import { formatClock, type FleetAgent, type FleetTeam } from "../fleet-data";
import type { NightEvent } from "./nightStore";
import { hueText, KIND_COLOR, textTone } from "./palette";
import { ranked } from "./useNightSim";
import { fill, type OfficeCopy } from "./vocab";
import o from "./office.module.css";

interface TeamTopProps {
  copy: OfficeCopy;
  team: FleetTeam;
  teams: FleetTeam[];
  scoped: FleetAgent[];
  onFloor: () => void;
  onTeam: (id: string) => void;
}

/** L1's top strip: back to the floor, where you are, and every other
 *  department one click away (one row; it scrolls sideways when crowded). */
export function TeamTop({ copy, team, teams, scoped, onFloor, onTeam }: TeamTopProps) {
  return (
    <>
      <button type="button" onClick={onFloor} className="flex-none rounded-lg border border-brand-cyan/50 px-2.5 py-0.5 text-sm text-foreground transition-colors hover:bg-brand-cyan/10 focus-visible:outline-2 focus-visible:outline-brand-cyan">
        ← {copy.back}
      </button>
      <nav aria-label={copy.breadcrumb} className="flex flex-none items-center gap-2 text-sm">
        <button type="button" onClick={onFloor} className="text-muted-dark hover:text-foreground hover:underline">{copy.floor}</button>
        <span className="text-muted-dark">›</span>
        <span aria-current="page" className="font-semibold" style={{ color: hueText(team.hue) }}>{team.name}</span>
      </nav>
      <div role="group" aria-label={copy.teamsLabel} className={`${o.switcher} flex min-w-0 flex-1 justify-end gap-1.5 overflow-x-auto py-1`}>
        {teams.map((tm) => {
          const ny = ranked(scoped.filter((a) => a.team === tm.id)).length;
          const on = tm.id === team.id;
          return (
            <button
              key={tm.id}
              type="button"
              aria-pressed={on}
              onClick={() => onTeam(tm.id)}
              className={`flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-brand-cyan ${on ? "border-glass-strong text-foreground" : "border-glass text-muted-dark hover:text-foreground"}`}
              style={on ? { background: `color-mix(in oklab, ${hueText(tm.hue)} 16%, transparent)` } : undefined}
            >
              <i className="h-2 w-2 rounded-full" style={{ background: hueText(tm.hue) }} />
              {tm.name}
              {ny > 0 && <span className="font-semibold" style={{ color: textTone("var(--status-warning)") }}>{ny}</span>}
            </button>
          );
        })}
      </div>
    </>
  );
}

interface TeamFooterProps {
  copy: OfficeCopy;
  members: FleetAgent[];
  events: NightEvent[];
  byId: Map<string, FleetAgent>;
}

/** Under L1's rail: the department's day in numbers and its latest events. */
export function TeamFooter({ copy, members, events, byId }: TeamFooterProps) {
  const run = members.filter((a) => a.enabled && a.state === "running").length;
  const runs = members.reduce((n, a) => n + a.runsToday, 0);
  const cost = members.reduce((n, a) => n + a.costTodayUsd, 0);
  const success = members.reduce((n, a) => n + a.successRate, 0) / Math.max(1, members.length);
  const ids = new Set(members.map((a) => a.id));
  const latest = events.filter((e) => ids.has(e.agentId)).slice(0, 3);
  return (
    <div className="px-3 py-2.5">
      <p className="text-[13px] text-muted-dark">{fill(copy.counts, { n: members.length, run })}</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {([[String(runs), copy.runsToday], [`${Math.round(success * 100)}%`, copy.successRate], [`$${cost.toFixed(2)}`, copy.costToday]] as const).map(([v, k]) => (
          <div key={k}>
            <div className="text-lg font-semibold tabular-nums text-foreground">{v}</div>
            <div className="text-xs text-muted-dark">{k}</div>
          </div>
        ))}
      </div>
      <h3 className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wider text-muted-dark">{copy.latestHeading}</h3>
      {latest.length === 0 && <p className="text-[13px] text-muted-dark">{copy.quiet}</p>}
      {latest.map((e) => (
        <p key={e.id} className="truncate border-t border-glass py-1 text-[13px] text-foreground first:border-t-0">
          <span className="mr-1.5 font-mono text-xs text-muted-dark">{formatClock(e.tsMs).slice(0, 5)}</span>
          <b className="mr-1.5 font-mono" style={{ color: textTone(KIND_COLOR[e.kind]) }}>{byId.get(e.agentId)?.callsign}</b>
          {e.text}
        </p>
      ))}
    </div>
  );
}
