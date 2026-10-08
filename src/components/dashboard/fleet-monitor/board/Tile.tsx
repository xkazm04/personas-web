"use client";

import { useState, type CSSProperties } from "react";
import { Flag } from "lucide-react";
import { attentionOf, needsTone } from "../attention";
import Emblem from "./Emblem";
import { agentAria, shortState, taskText, type BoardCopy } from "./copy";
import { pct, type SimAgent } from "./model";
import s from "./tiles.module.css";

export type Tier = "xs" | "md" | "lg";
export interface Rect { x: number; y: number; w: number; h: number }

interface TileProps {
  agent: SimAgent;
  rect: Rect;
  copy: BoardCopy;
  att: boolean;
  live: boolean;
  /** A command to this agent is on its way to the machine. */
  pending: boolean;
  /** Out of focus (a search or pile filter is on and it does not match). */
  dim: boolean;
  /** Arrival delay (s) for the first-paint rise; null after arrival. */
  riseDelay: number | null;
  onAttend: () => void;
  onUnattend: () => void;
  onOpen: (el: HTMLElement) => void;
}

export function tierOf(r: Rect): Tier {
  if (r.w < 96 || r.h < 70) return "xs";
  return r.w >= 210 && r.h >= 150 ? "lg" : "md";
}

/** Why an agent needs you, as one glyph: failed, waiting, draft, or reviews. */
export function needGlyph(a: SimAgent): string {
  if (a.state === "failed") return "!";
  if (a.state === "input_required") return "?";
  if (a.state === "draft_ready") return "✎";
  return String(a.reviews.length);
}

/** The glyph drawn: a mark for a state, or a flag with the count for reviews,
 *  so a bare number never reads as another kind of mark. */
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
 * One agent, drawn to be sorted by the eye before it is read: lit and
 * filling while it works, a solid amber or red block with a glyph when it
 * needs you, a ghost while it rests, hatched when off. The callsign is always
 * there; bigger tiles (30 and 10 agents, large screens) add name and task.
 */
export default function Tile({ agent: a, rect, copy, att, live, pending, dim, riseDelay, onAttend, onUnattend, onOpen }: TileProps) {
  const tier = tierOf(rect);
  const pile = attentionOf(a);
  const needs = pile === "needs";
  const running = a.state === "running";
  const cls = [
    s.tile, s[pile], needs && needsTone(a) === "critical" && s.critical, needs && live && s.pulse,
    pile === "resting" && a.state === "queued" && s.queued, att && s.att, riseDelay != null && s.rise, dim && s.dim,
  ].filter(Boolean).join(" ");
  const style = {
    left: rect.x, top: rect.y, width: rect.w, height: rect.h,
    "--p": running ? a.progress ?? 0 : 0,
    "--sd": `${(-(a.idx * 0.37) % 3.2).toFixed(2)}s`,
    "--ad": riseDelay != null ? `${riseDelay.toFixed(3)}s` : undefined,
  } as CSSProperties;
  const glyphSize = Math.round(tier === "xs" ? Math.min(rect.h * 0.42, rect.w * 0.4, 56) : Math.min(rect.h * 0.3, 36));
  // The glyph already counts reviews unless the state itself is the reason.
  const extraReviews = a.reviews.length > 0 && (a.state === "failed" || a.state === "input_required" || a.state === "draft_ready");
  const marks = a.unreadMessages.length > 0 || extraReviews;
  const glyph = needs ? <NeedGlyph agent={a} size={glyphSize} /> : null;
  // A change of pile flashes once, so the eye catches it (still under reduced motion).
  const [prevPile, setPrevPile] = useState(pile);
  const [flash, setFlash] = useState(0);
  if (pile !== prevPile) {
    setPrevPile(pile);
    setFlash(flash + 1);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      data-tile={a.id}
      data-agent-id={a.id}
      aria-label={agentAria(a, copy)}
      className={cls}
      style={style}
      onPointerEnter={onAttend}
      onPointerLeave={onUnattend}
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
      {running && !needs && <span className={s.fill} aria-hidden="true" />}
      {running && !needs && live && <span className={s.sweep} aria-hidden="true" />}
      {running && <span className={s.bar} aria-hidden="true" />}
      {flash > 0 && <span key={flash} className={s.flash} aria-hidden="true" />}

      <span className="relative flex h-full flex-col p-2" aria-hidden="true">
        {/* Top row: the callsign keeps its own lane; at medium+ the glyph sits at its end. */}
        <span className="flex items-start gap-2">
          {tier === "lg" && <span className="h-8 w-8 shrink-0"><Emblem agent={a} /></span>}
          <span className="min-w-0 flex-1">
            <span className={`flex items-center gap-1 whitespace-nowrap font-mono font-semibold leading-tight ${tier === "xs" ? "text-xs" : "text-sm"}`}>
              {a.callsign}
              {!a.enabled && pile !== "off" && <i className={s.pauseMark} />}
              {pending && <i className={s.pendingRing} />}
            </span>
            {tier !== "xs" && rect.h >= 84 && <span className="block truncate text-xs font-medium">{shortState(a, copy)}</span>}
          </span>
          {tier !== "xs" && glyph}
        </span>
        {/* A tall medium tile has room for what it is doing (large tiles show it under the
            name); resting and off tiles stay quiet rather than repeat their state. */}
        {tier === "md" && rect.h >= 124 && (pile === "working" || needs || a.state === "queued") && (
          <span className={`mt-2 line-clamp-3 text-xs leading-snug ${pile === "working" || needs ? "" : "text-muted-dark"}`}>{taskText(a, copy, copy.tasks.resting)}</span>
        )}

        {tier !== "xs" && (
          <span className="mt-auto min-w-0">
            <span className={`block font-semibold leading-tight ${tier === "lg" ? "line-clamp-2 text-base" : "line-clamp-2 text-xs"} ${pile === "working" || needs ? "" : "text-muted-dark"}`}>
              {a.name}
            </span>
            {tier === "lg" && <span className="mt-0.5 block truncate text-xs">{taskText(a, copy, copy.tasks.resting)}</span>}
          </span>
        )}

        {/* Bottom row: progress and the quiet badges on the left; on a pillar, the glyph on the right. */}
        {(tier === "xs" || marks) && (
          <span className={`flex items-end gap-1.5 ${tier === "xs" ? "mt-auto" : "mt-1"}`}>
            {tier === "xs" && running && !needs && <span className="text-xs tabular-nums">{pct(a.progress ?? 0)}</span>}
            {a.unreadMessages.length > 0 && <i className={`${s.mailDot} mb-1`} />}
            {extraReviews && <span className={s.reviewBadge}>{a.reviews.length}</span>}
            {tier === "xs" && <span className="ml-auto">{glyph}</span>}
          </span>
        )}
      </span>
    </div>
  );
}
