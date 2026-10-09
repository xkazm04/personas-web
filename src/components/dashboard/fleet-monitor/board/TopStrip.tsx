"use client";

import { ArrowLeft, LayoutGrid, List } from "lucide-react";
import type { CSSProperties } from "react";
import { ATTENTION_COLOR, type AttentionCounts } from "../attention";
import { formatClock } from "../fleet-data";
import { simNow, type BoardCopy } from "./copy";
import { TEAM_BY_ID, fill, plural, type SimAgent } from "./model";
import type { BoardNav } from "./useBoardNav";
import type { HostReading } from "./host";
import FindBox from "./FindBox";
import UsageMeters from "./UsageMeters";
import { NO_FOCUS, isFocusing, togglePile, type FocusFilter } from "./focus";
import b from "./board.module.css";
import { personasMonitorCopy } from "@/i18n/pending/personasMonitor";

interface TopStripProps {
  counts: AttentionCounts;
  scope: SimAgent[];
  simMs: number;
  copy: BoardCopy;
  nav: BoardNav;
  host: HostReading;
  focus: FocusFilter;
  onFocus: (f: FocusFilter) => void;
  /** Agents in focus, in reading order. */
  matches: readonly SimAgent[];
  onPalette: () => void;
  layout: "field" | "list";
  onLayout: (l: "field" | "list") => void;
  onShortcuts: () => void;
}

const PILES = ["needs", "working", "resting", "off"] as const;
const crumbBtn = "rounded px-1 text-muted-dark underline decoration-dashed underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground";
const kbd = "rounded border border-glass-hover px-1.5 font-mono";

/** The way back, shown only below the fleet level. */
function Crumbs({ scope, copy, nav }: Pick<TopStripProps, "scope" | "copy" | "nav">) {
  const agent = nav.agentOpen ? scope.find((a) => a.id === nav.agentOpen) : undefined;
  const teamId = agent?.team ?? nav.teamOpen;
  if (!teamId) return null;
  const team = TEAM_BY_ID[teamId];
  const backLabel = agent && nav.teamOpen ? fill(copy.nav.backToTeam, { team: TEAM_BY_ID[nav.teamOpen].name }) : copy.nav.backToFleet;
  return (
    <div className="flex min-w-0 items-center gap-3 border-r border-glass pr-4">
      <button type="button" onClick={nav.back} aria-label={backLabel} className="inline-flex items-center gap-1.5 rounded-lg border border-glass-hover px-2.5 py-0.5 text-sm text-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] focus-visible:outline-2 focus-visible:outline-foreground">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        {copy.nav.back}
      </button>
      <nav aria-label={copy.nav.breadcrumb} className="min-w-0">
        <ol className="flex items-center gap-1.5 whitespace-nowrap text-sm">
          <li><button type="button" className={crumbBtn} onClick={() => { nav.closeAgent(false); nav.closeTeam(true); }}>{copy.nav.fleet}</button></li>
          <li aria-hidden="true" className="text-muted-dark">›</li>
          <li className="min-w-0 truncate">
            {agent ? (
              <button type="button" className={crumbBtn} onClick={() => (nav.teamOpen === team.id ? nav.closeAgent(true) : nav.openTeam(team.id))}>{team.name}</button>
            ) : (
              <span aria-current="page" className={`${b.teamInk} font-semibold`} style={{ "--h": team.hue } as CSSProperties}>{team.name}</span>
            )}
          </li>
          {agent && (
            <>
              <li aria-hidden="true" className="text-muted-dark">›</li>
              <li aria-current="page" className="font-semibold text-foreground"><span className="mr-1.5 font-mono text-brand-cyan">{agent.callsign}</span>{agent.name}</li>
            </>
          )}
        </ol>
      </nav>
    </div>
  );
}

/** L0's top edge, one line: the way back, the verdict, the fleet's mix, usage pace, the clock. */
export default function TopStrip({ counts: c, scope, simMs, copy, nav, host, focus, onFocus, matches, onPalette, layout, onLayout, onShortcuts }: TopStripProps) {
  const piles = personasMonitorCopy.attention;
  const verdict = c.needs ? plural(c.needs, copy.top.needsOne, copy.top.needsMany) : copy.top.allClear;
  // Below the fleet level the way back needs the room: the pile legend yields.
  const deep = !!(nav.teamOpen || nav.agentOpen);

  return (
    <>
      <Crumbs scope={scope} copy={copy} nav={nav} />
      {!deep && (
        <div role="group" aria-label={copy.list.layoutLabel} className="flex shrink-0 gap-0.5 rounded-lg p-0.5 shadow-[inset_0_0_0_1px_var(--border-glass)]">
          {(["field", "list"] as const).map((l) => {
            const Icon = l === "field" ? LayoutGrid : List;
            return (
              <button key={l} type="button" aria-pressed={layout === l} title={l === "field" ? copy.list.fieldHint : copy.list.listHint} onClick={() => onLayout(l)} data-layout={l}
                className={`inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-foreground ${layout === l ? "bg-foreground/10 text-foreground" : "text-muted-dark hover:text-foreground"}`}>
                <Icon aria-hidden className="h-3.5 w-3.5" />
                <span className="hidden min-[1800px]:inline">{copy.list[l]}</span>
              </button>
            );
          })}
        </div>
      )}
      <div className="flex shrink-0 items-baseline gap-2">
        <span className="text-2xl font-bold leading-none tabular-nums" style={{ color: c.needs ? ATTENTION_COLOR[c.critical ? "critical" : "needs"] : ATTENTION_COLOR.working }}>{c.needs}</span>
        <span className="text-sm font-semibold text-foreground">{verdict}</span>
      </div>
      <div className="flex min-w-0 items-center gap-3">
        {/* At the fleet level the pile toggles carry the mix; the bar stands in below that and on small screens. */}
        <div role="img" aria-label={PILES.map((p) => `${c[p]} ${piles[p]}`).join(", ")} className={`h-2 w-[clamp(72px,9vw,180px)] shrink-0 gap-0.5 overflow-hidden rounded-full ${deep ? "flex" : "flex lg:hidden"}`}>
          {PILES.filter((p) => c[p]).map((p) => <i key={p} className="h-full transition-[flex-grow] duration-700" style={{ flexGrow: c[p], background: ATTENTION_COLOR[p], opacity: focus.piles.length && !focus.piles.includes(p) ? 0.3 : 1 }} />)}
        </div>
        {!deep && (
          <div role="group" aria-label={copy.find.pilesLabel} className="hidden items-center gap-0.5 whitespace-nowrap text-xs tabular-nums lg:flex">
            {PILES.map((p) => {
              const on = focus.piles.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={on}
                  title={fill(copy.find.pileHint, { pile: piles[p] })}
                  onClick={() => onFocus(togglePile(focus, p))}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-foreground ${on ? "bg-foreground/10 text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)]" : "text-muted-dark hover:text-foreground"}`}
                >
                  <i className="h-2 w-2 rounded-sm" style={{ background: ATTENTION_COLOR[p] }} />
                  {c[p]} {piles[p]}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {!deep && <FindBox query={focus.query} onQuery={(q) => onFocus({ ...focus, query: q })} matches={matches} focusing={isFocusing(focus)} onOpen={nav.openAgent} onClear={() => onFocus(NO_FOCUS)} copy={copy} />}
      <button type="button" onClick={onPalette} title={copy.palette.label} aria-label={copy.palette.label} className="hidden shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-dark shadow-[inset_0_0_0_1px_var(--border-glass)] hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground md:inline-flex" data-palette-open>
        <span className="hidden min-[1800px]:inline">{copy.palette.open}</span>
        <kbd className={kbd}>{"⌘K"}</kbd>
      </button>
      <div className="ml-auto flex shrink-0 items-center gap-4">
        <span className="hidden items-center gap-4 min-[1500px]:flex"><UsageMeters simMs={simMs} copy={copy} /></span>
        {host.status === "online" ? (
          <span className="font-mono text-sm font-semibold tabular-nums text-foreground" aria-hidden="true">{formatClock(simNow(simMs))} UTC</span>
        ) : (
          <span className="text-sm text-muted-dark">{fill(copy.host.asOf, { time: formatClock(simNow(simMs) - host.beatAgeMs).slice(0, 5) })}</span>
        )}
        <button type="button" onClick={onShortcuts} title={copy.keys.open} aria-label={copy.keys.open} data-shortcuts
          className="hidden h-6 w-6 place-items-center rounded-md font-mono text-xs text-muted-dark shadow-[inset_0_0_0_1px_var(--border-glass-hover)] hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground md:grid">
          ?
        </button>
      </div>
    </>
  );
}
