"use client";

import { ArrowLeft } from "lucide-react";
import type { CSSProperties } from "react";
import { ATTENTION_COLOR, type AttentionCounts } from "../attention";
import { FLEET, formatAge, formatClock } from "../fleet-data";
import { useTranslation } from "@/i18n/useTranslation";
import { simNow, type BoardCopy } from "./copy";
import { TEAM_BY_ID, fill, plural, type SimAgent } from "./model";
import type { BoardNav } from "./useBoardNav";
import b from "./board.module.css";

interface TopStripProps {
  counts: AttentionCounts;
  scope: SimAgent[];
  simMs: number;
  copy: BoardCopy;
  nav: BoardNav;
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
export default function TopStrip({ counts: c, scope, simMs, copy, nav }: TopStripProps) {
  const { t } = useTranslation();
  const piles = t.fleetPlayground.attention;
  const verdict = c.needs ? plural(c.needs, copy.top.needsOne, copy.top.needsMany) : copy.top.allClear;
  // Below the fleet level the way back needs the room: the pile legend yields.
  const deep = !!(nav.teamOpen || nav.agentOpen);

  return (
    <>
      <Crumbs scope={scope} copy={copy} nav={nav} />
      <div className="flex shrink-0 items-baseline gap-2">
        <span className="text-2xl font-bold leading-none tabular-nums" style={{ color: c.needs ? ATTENTION_COLOR[c.critical ? "critical" : "needs"] : ATTENTION_COLOR.working }}>{c.needs}</span>
        <span className="text-sm font-semibold text-foreground">{verdict}</span>
      </div>
      <div className="flex min-w-0 items-center gap-3" role="img" aria-label={PILES.map((p) => `${c[p]} ${piles[p]}`).join(", ")}>
        <div className="flex h-2 w-[clamp(96px,12vw,220px)] shrink-0 gap-0.5 overflow-hidden rounded-full">
          {PILES.filter((p) => c[p]).map((p) => <i key={p} className="h-full transition-[flex-grow] duration-700" style={{ flexGrow: c[p], background: ATTENTION_COLOR[p] }} />)}
        </div>
        <span className={`hidden items-center gap-3 whitespace-nowrap text-xs tabular-nums text-muted-dark ${deep ? "" : "lg:flex"}`}>
          {PILES.map((p) => (
            <span key={p} className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm" style={{ background: ATTENTION_COLOR[p] }} />{c[p]} {piles[p]}</span>
          ))}
        </span>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-4">
        {FLEET.usage.windows.map((w) => {
          const rem = Math.max(0, w.resetsInMs - simMs);
          const el = ((w.windowMs - rem) / w.windowMs) * 100;
          const d = w.utilizationPct - el;
          const [verdictText, col] = d > 5 ? [copy.band.hot, ATTENTION_COLOR.warning] : d < -15 ? [copy.band.headroom, "var(--status-info)"] : [copy.band.onPace, "var(--status-success)"];
          const full = `${fill(copy.band.used, { label: w.label })} ${w.utilizationPct}%, ${verdictText}. ${fill(copy.band.elapsed, { pct: Math.round(el), time: formatAge(rem) })}`;
          return (
            <div key={w.label} className="flex items-center gap-2 text-xs" title={full} role="img" aria-label={full}>
              <span className="text-muted-dark">{w.label}</span>
              <span className="relative h-1.5 w-16 rounded-full bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)]">
                <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${w.utilizationPct}%`, background: col }} />
                <span className="absolute -top-1 h-3.5 w-0.5 rounded-sm bg-foreground" style={{ left: `calc(${el.toFixed(1)}% - 1px)` }} />
              </span>
              <span className="font-semibold tabular-nums" style={{ color: `color-mix(in oklab, ${col} 75%, var(--foreground))` }}>{w.utilizationPct}%</span>
            </div>
          );
        })}
        <span className="font-mono text-sm font-semibold tabular-nums text-foreground" aria-hidden="true">{formatClock(simNow(simMs))} UTC</span>
        <span className="hidden items-center gap-1.5 whitespace-nowrap text-xs text-muted-dark xl:flex">
          <kbd className={kbd} title={copy.nav.nextHint}>N</kbd> <span className="hidden 2xl:inline">{copy.nav.nextHint}</span>
          <kbd className={`${kbd} ml-1`} title={copy.nav.escHint}>Esc</kbd> <span className="hidden 2xl:inline">{copy.nav.escHint}</span>
        </span>
      </div>
    </>
  );
}
