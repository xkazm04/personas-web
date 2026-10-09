"use client";

import { memo, useState, type CSSProperties } from "react";
import { Flag } from "lucide-react";
import { attentionOf, needsTone } from "../attention";
import Emblem from "./Emblem";
import { agentAria, type BoardCopy } from "./copy";
import type { SimAgent } from "./model";
import { useIsAttended, type AttStore } from "./attStore";
import s from "./tiles.module.css";

/** `icon`: too small for a readable name, the persona's emblem says who it is;
 *  `name`: the name at text-base with the emblem as a corner mark; `lg`: a roomier name tile. */
export type Tier = "icon" | "name" | "lg";
export interface Rect { x: number; y: number; w: number; h: number }

interface TileProps {
  agent: SimAgent;
  rect: Rect;
  copy: BoardCopy;
  attStore: AttStore;
  live: boolean;
  /** A command to this agent is on its way to the machine. */
  pending: boolean;
  /** Out of focus (a search or pile filter is on and it does not match). */
  dim: boolean;
  /** Arrival delay (s) for the first-paint rise; null after arrival. */
  riseDelay: number | null;
  /** Stable handlers (the same function for every tile), so a tile re-renders
   *  only when its own agent, place or flags change. */
  onAttend: (id: string) => void;
  onUnattend: () => void;
  onOpen: (id: string, el: HTMLElement) => void;
}

/** A name at text-base needs ~120 px for two short words and two lines of height. */
export function tierOf(r: Rect): Tier {
  if (r.w < 120 || r.h < 64) return "icon";
  return r.w >= 210 && r.h >= 150 ? "lg" : "name";
}

/** Why an agent needs you, as one glyph: failed, waiting, draft, or reviews. */
export function needGlyph(a: SimAgent): string {
  if (a.state === "failed") return "!";
  if (a.state === "input_required") return "?";
  if (a.state === "draft_ready") return "✎";
  return String(a.reviews.length);
}

/** The glyph drawn: a mark for a state, or a flag with the count for reviews,
 *  so a bare number never reads as another kind of mark. (Team scene cards;
 *  the field's tiles say "needs you" by colour alone.) */
export function NeedGlyph({ agent: a, size }: { agent: SimAgent; size: number }) {
  const g = needGlyph(a);
  const reviews = !"!?✎".includes(g);
  return (
    <span className={`${s.glyph} inline-flex shrink-0 items-center`} style={{ fontSize: size }}>
      {reviews && <Flag aria-hidden strokeWidth={3} style={{ width: size * 0.62, height: size * 0.62, marginRight: size * 0.06 }} />}
      {g}
    </span>
  );
}

/**
 * One agent at the fleet level, drawn to answer one question: who is working
 * and who is not. The state is the colour (lit while it works, a solid amber
 * or red block when it needs you, a ghost while it rests, hatched when off);
 * who it is is the persona's emblem, and its name once the tile has room.
 * Why it needs you, its task and its counts live in the hover card and the
 * console, not here.
 */
function Tile({ agent: a, rect, copy, attStore, live, pending, dim, riseDelay, onAttend, onUnattend, onOpen }: TileProps) {
  const tier = tierOf(rect);
  const pile = attentionOf(a);
  const needs = pile === "needs";
  const running = a.state === "running";
  const att = useIsAttended(attStore, "agent", a.id);
  const cls = [
    s.tile, s[pile], needs && needsTone(a) === "critical" && s.critical, needs && live && s.pulse,
    pile === "resting" && a.state === "queued" && s.queued, att && s.att, riseDelay != null && s.rise, dim && s.dim,
  ].filter(Boolean).join(" ");
  const style = {
    left: rect.x, top: rect.y, width: rect.w, height: rect.h,
    "--p": running ? a.progress ?? 0 : 0,
    "--sd": `${(-(a.idx * 0.37) % 2.4).toFixed(2)}s`,
    "--ad": riseDelay != null ? `${riseDelay.toFixed(3)}s` : undefined,
  } as CSSProperties;
  // A change of pile flashes once, so the eye catches it (still under reduced motion).
  const [prevPile, setPrevPile] = useState(pile);
  const [flash, setFlash] = useState(0);
  if (pile !== prevPile) {
    setPrevPile(pile);
    setFlash(flash + 1);
  }
  // Alone, the emblem fills the tile; beside a name it is a corner mark that leaves the name its room.
  const icon = Math.round(tier === "icon" ? Math.min(rect.w, rect.h) * 0.72 : Math.max(20, Math.min(rect.h * 0.4, rect.w * 0.28, 52)));

  return (
    <div
      role="button"
      tabIndex={0}
      data-tile={a.id}
      data-agent-id={a.id}
      aria-label={agentAria(a, copy)}
      className={cls}
      style={style}
      onPointerEnter={() => onAttend(a.id)}
      onPointerLeave={onUnattend}
      onFocus={() => onAttend(a.id)}
      onBlur={onUnattend}
      onClick={(e) => onOpen(a.id, e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(a.id, e.currentTarget);
        }
      }}
    >
      {/* Working: progress runs along the top edge, left to right, with a glint travelling it. */}
      {running && (
        <span className={s.topline} aria-hidden="true">
          {live && !needs && <i className={s.glint} />}
        </span>
      )}
      {flash > 0 && <span key={flash} className={s.flash} aria-hidden="true" />}

      {tier === "icon" ? (
        <span className={`${s.mark} absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`} style={{ width: icon, height: icon }} aria-hidden="true">
          <Emblem agent={a} />
        </span>
      ) : (
        <>
          <span className={`${s.mark} ${s.corner} absolute left-2.5 top-2.5`} style={{ width: icon, height: icon }} aria-hidden="true">
            <Emblem agent={a} />
          </span>
          <span className="relative flex h-full flex-col justify-end p-2.5" aria-hidden="true">
            <span className={`${tier === "lg" ? "line-clamp-3 text-lg" : rect.h >= 72 ? "line-clamp-2 text-base" : "truncate text-base"} font-semibold leading-tight`}>
              {a.name}
            </span>
          </span>
        </>
      )}

      {/* Quiet marks that are not messages: paused while its last run finishes, a command in flight. */}
      {((!a.enabled && pile !== "off") || pending) && (
        <span className="absolute right-1.5 top-1.5 flex items-center gap-1" aria-hidden="true">
          {!a.enabled && pile !== "off" && <i className={s.pauseMark} />}
          {pending && <i className={s.pendingRing} />}
        </span>
      )}
    </div>
  );
}

const sameRect = (x: Rect, y: Rect) => x.x === y.x && x.y === y.y && x.w === y.w && x.h === y.h;

/** The layout is rebuilt on every tick, so compare places by value. */
export default memo(Tile, (p, n) =>
  p.agent === n.agent && sameRect(p.rect, n.rect) && p.copy === n.copy && p.attStore === n.attStore && p.live === n.live &&
  p.pending === n.pending && p.dim === n.dim && p.riseDelay === n.riseDelay &&
  p.onAttend === n.onAttend && p.onUnattend === n.onUnattend && p.onOpen === n.onOpen,
);
