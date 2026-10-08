"use client";

import type { CSSProperties } from "react";
import { ATTENTION_COLOR, attentionOf, type AttentionTone } from "../attention";
import { formatAge } from "../fleet-data";
import Emblem from "./Emblem";
import { ReasonChip, StatePill } from "./parts";
import { stateText, taskText, type BoardCopy } from "./copy";
import { TEAM_BY_ID, fill, plural, reasonOf, topReview, type SimAgent } from "./model";
import type { Rect } from "./Tile";
import b from "./board.module.css";
import { pendingText } from "./Controls";
import type { Command } from "./useCommands";

interface HoverCardProps {
  agent: SimAgent;
  /** The tile the card belongs to, in field coordinates. */
  anchor: Rect;
  width: number;
  height: number;
  copy: BoardCopy;
  live: boolean;
  tone: AttentionTone;
  pending?: Command;
  hostName: string;
}

const W = 300;
const H = 200;

/** The spotlight, shrunk to a card that floats beside the tile under attention.
 *  It overlays the field and never takes space from it. */
export default function HoverCard({ agent: a, anchor, width, height, copy, live, tone, pending, hostName }: HoverCardProps) {
  const right = anchor.x + anchor.w + 12;
  const x = right + W <= width - 8 ? right : Math.max(8, anchor.x - W - 12);
  const y = Math.min(Math.max(8, anchor.y + anchor.h / 2 - H / 2), height - H - 8);
  const pile = attentionOf(a);
  const team = TEAM_BY_ID[a.team];
  const top = a.reviews.length ? topReview(a) : null;
  const ring = pile === "needs" ? ATTENTION_COLOR[tone] : pile === "working" ? ATTENTION_COLOR.working : "var(--border-glass-strong)";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-20 overflow-hidden rounded-2xl bg-surface p-4"
      style={{ left: x, top: y, width: W, minHeight: H, boxShadow: `inset 0 0 0 1px ${ring}, 0 18px 50px rgb(0 0 0 / 0.35)` }}
    >
      <div className="pointer-events-none absolute -right-10 -top-8 h-36 w-36 opacity-60">
        <Emblem agent={a} rich live={live} />
      </div>
      <div className="relative flex items-center gap-2 text-xs text-muted-dark">
        <span className={b.teamInk} style={{ "--h": team.hue } as CSSProperties}>{team.name}</span>
      </div>
      <div className={`${b.teamInk} relative mt-1 font-mono text-3xl font-bold leading-none tracking-tight`} style={{ "--h": a.hue } as CSSProperties}>
        {a.callsign}
      </div>
      <div className="relative mt-1 pr-16 text-lg font-semibold leading-tight text-foreground">{a.name}</div>
      <div className="relative mt-2 flex flex-wrap items-center gap-2">
        <StatePill agent={a} text={stateText(a, copy)} />
        {pile === "needs" && <ReasonChip cls={reasonOf(a).cls} label={copy.reasons[reasonOf(a).cls]} />}
      </div>
      <p className="relative mt-2 line-clamp-2 text-base leading-snug text-foreground">{taskText(a, copy, copy.tasks.resting)}</p>
      {a.state === "running" && (
        <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)]">
          <div className="h-full rounded-full bg-[var(--at-working)] transition-[width] duration-1000" style={{ width: `${(a.progress ?? 0) * 100}%` }} />
        </div>
      )}
      {top && (
        <p className="relative mt-2 truncate text-xs text-muted-dark">
          {fill(plural(a.reviews.length, copy.card.reviewsOne, copy.card.reviews), { n: a.reviews.length, age: formatAge(top.ageMin * 60_000) })}
          {" · "}
          <span className="text-foreground">{top.title}</span>
        </p>
      )}
      {pending && <p className="relative mt-2 text-xs font-semibold text-brand-cyan">{pendingText(pending, copy, hostName)}</p>}
      {a.unreadMessages.length > 0 && (
        <p className="relative mt-1 text-xs text-muted-dark">{fill(plural(a.unreadMessages.length, copy.card.unreadOne, copy.card.unread), { n: a.unreadMessages.length })}</p>
      )}
    </div>
  );
}
