"use client";

import type { CSSProperties } from "react";
import { topSeverity } from "../fleet-data";
import Emblem from "./Emblem";
import { agentAria, stateText, taskText, type BoardCopy } from "./copy";
import { needs, type SimAgent } from "./model";
import b from "./board.module.css";
import s from "./tiles.module.css";

export type Tier = "xs" | "md" | "lg";
export interface Rect { x: number; y: number; w: number; h: number }

interface TileProps {
  agent: SimAgent;
  rect: Rect;
  copy: BoardCopy;
  att: boolean;
  flash: boolean;
  live: boolean;
  /** Arrival delay (s) for the first-paint rise; null after arrival. */
  riseDelay: number | null;
  onAttend: () => void;
  onUnattend: () => void;
  onOpen: (el: HTMLElement) => void;
}

export function tierOf(r: Rect): Tier {
  if (r.h < 64 || r.w < 88) return "xs";
  return r.w >= 200 && r.h >= 130 ? "lg" : "md";
}

/** A fracture across a failed tile. */
function Fracture({ tier }: { tier: Tier }) {
  return (
    <span className={`${s.frac} ${tier === "xs" ? s.fracXs : s.fracWide}`} aria-hidden="true">
      <svg className="block h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
        <polyline points="64,0 50,28 72,41 40,66 54,79 36,100" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        <polyline points="50,28 24,34" strokeWidth="1.2" vectorEffect="non-scaling-stroke" opacity=".6" />
      </svg>
    </span>
  );
}

export function Badges({ agent }: { agent: SimAgent }) {
  const sev = topSeverity(agent);
  return (
    <span className="flex gap-0.5" aria-hidden="true">
      {agent.unreadMessages.length > 0 && <span className={`${s.badge} ${s.mail}`}>{agent.unreadMessages.length}</span>}
      {sev && <span className={`${s.badge} ${s[`rv-${sev}`]}`}>{agent.reviews.length}</span>}
    </span>
  );
}

/** One agent on the board. Its form follows the room it has: a callsign
 *  pillar at 99 agents, a named tile at 30, a task card at 10. */
export default function Tile({ agent: a, rect, copy, att, flash, live, riseDelay, onAttend, onUnattend, onOpen }: TileProps) {
  const tier = tierOf(rect);
  const need = needs(a);
  const running = a.state === "running";
  const cls = [
    s.tile, s[`s-${a.state}`], !a.enabled && s.off, need && s.need, att && s.att, flash && s.flash,
    riseDelay != null && s.rise, tier === "xs" && s.xs,
  ].filter(Boolean).join(" ");
  const style = {
    left: rect.x, top: rect.y, width: rect.w, height: rect.h,
    "--p": running ? a.progress ?? 0 : 0,
    "--sd": `${(-(a.idx * 0.37) % 3.6).toFixed(2)}s`,
    "--ad": riseDelay != null ? `${riseDelay.toFixed(3)}s` : undefined,
  } as CSSProperties;
  const emblemSize = tier === "lg" ? "h-11 w-11" : tier === "md" ? "h-6 w-6" : "h-4 w-4";

  return (
    <div
      role="button"
      tabIndex={0}
      data-tile={a.id}
      aria-label={agentAria(a, copy)}
      className={cls}
      style={style}
      onMouseEnter={onAttend}
      onMouseLeave={onUnattend}
      onFocus={onAttend}
      onBlur={onUnattend}
      onClick={(e) => onOpen(e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(e.currentTarget);
        }
      }}
    >
      {running && <span className={s.fill} aria-hidden="true" />}
      {running && live && <span className={s.sweep} aria-hidden="true" />}
      {running && tier !== "lg" && <span className={s.bar} aria-hidden="true" />}
      {a.state === "failed" && <Fracture tier={tier} />}
      {a.state === "input_required" && <span className={`${s.ring} ${live ? s.ringLive : ""}`} aria-hidden="true" />}
      <span className="absolute right-1 top-1 z-[1]"><Badges agent={a} /></span>

      {tier === "xs" && (
        <span className={`relative flex h-full flex-col items-start p-1.5 ${rect.h >= 40 ? "justify-between" : "justify-end"}`}>
          {rect.h >= 40 && <span className={`${emblemSize} opacity-80`}><Emblem agent={a} /></span>}
          <span className="whitespace-nowrap font-mono text-xs font-semibold leading-none tracking-tight">{a.callsign}</span>
        </span>
      )}
      {tier === "md" && (
        <span className="relative flex h-full flex-col justify-between p-2">
          <span className="flex items-center gap-2">
            <span className={emblemSize}><Emblem agent={a} /></span>
            <span className="font-mono text-xs font-semibold">{a.callsign}</span>
          </span>
          <span className="line-clamp-2 pr-3 text-xs leading-tight text-foreground">{a.name}</span>
        </span>
      )}
      {tier === "lg" && (
        <span className="relative flex h-full flex-col p-3">
          <span className="flex items-center gap-3">
            <span className={`${emblemSize} shrink-0`}><Emblem agent={a} /></span>
            <span className="min-w-0">
              <span className="block font-mono text-sm font-semibold">{a.callsign}</span>
              <span className={`block truncate text-xs ${b[`ink-${a.enabled ? a.state : "off"}`]}`}>{stateText(a, copy)}</span>
            </span>
          </span>
          <span className="mt-auto line-clamp-2 text-lg font-semibold leading-tight text-foreground">{a.name}</span>
          <span className="mt-1 truncate pr-3 text-sm text-muted-dark">{taskText(a, copy)}</span>
          {running && (
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)]">
              <span className="block h-full rounded-full bg-[var(--st-running)] transition-[width] duration-1000" style={{ width: `${(a.progress ?? 0) * 100}%` }} />
            </span>
          )}
        </span>
      )}
    </div>
  );
}
