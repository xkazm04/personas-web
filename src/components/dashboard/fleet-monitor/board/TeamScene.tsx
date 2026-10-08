"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import type { FleetTeam } from "../fleet-data";
import Emblem from "./Emblem";
import { NeedGlyph, type Rect } from "./Tile";
import { attentionOf, needsTone } from "../attention";
import { agentAria, shortState, taskText, type BoardCopy } from "./copy";
import { fill, gridFit, orderInBay, plural, type SimAgent } from "./model";
import type { BoardNav } from "./useBoardNav";
import b from "./board.module.css";
import s from "./tiles.module.css";

interface TeamSceneProps {
  team: FleetTeam;
  list: SimAgent[];
  /** The bay the scene grows out of (and shrinks back into). */
  from: Rect;
  width: number;
  height: number;
  copy: BoardCopy;
  nav: BoardNav;
  still: boolean;
  live: boolean;
  /** The agent scene is open on top: keep this mounted but out of reach. */
  covered: boolean;
}

const G = 14;

/** A team opened up: every agent a card with its emblem, task and last 24h. */
export default function TeamScene({ team, list: unordered, from, width, height, copy, nav, still, live, covered }: TeamSceneProps) {
  const list = orderInBay(unordered);
  const fit = gridFit(list.length, width, height, G, 460, 300);
  const gw = fit.cols * fit.tw + (fit.cols - 1) * G;
  const gh = fit.rows * fit.th + (fit.rows - 1) * G;
  const ox = (width - gw) / 2;
  const oy = (height - gh) / 2;
  const collapsed = { x: from.x, y: from.y, scaleX: from.w / width, scaleY: from.h / height, opacity: 0 };

  return (
    <motion.section
      aria-label={fill(plural(list.length, copy.team.titleOne, copy.team.title), { team: team.name, n: list.length })}
      inert={covered}
      className="absolute inset-0 origin-top-left"
      initial={still ? { opacity: 0 } : collapsed}
      animate={{ x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 }}
      exit={still ? { opacity: 0 } : collapsed}
      transition={{ duration: still ? 0.2 : 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      style={{ "--h": team.hue } as CSSProperties}
    >
      <h2 data-team-title tabIndex={-1} className="sr-only">
        {fill(plural(list.length, copy.team.titleOne, copy.team.title), { team: team.name, n: list.length })}
      </h2>
      {list.map((a, j) => {
        const run = a.state === "running";
        const m = Math.max(1, ...a.spark24h);
        const att = nav.att?.type === "agent" && nav.att.id === a.id;
        const pile = attentionOf(a);
        const cls = [
          s.card, pile === "working" && s.cardWorking, pile === "needs" && s.cardNeeds, pile === "needs" && needsTone(a) === "critical" && s.critical,
          pile === "off" && s.cardOff, att && s.cardAtt,
        ].filter(Boolean).join(" ");
        return (
          <div
            key={a.id}
            role="button"
            tabIndex={0}
            data-card={a.id}
            aria-label={agentAria(a, copy)}
            className={`${cls} flex flex-col`}
            style={{
              left: ox + (j % fit.cols) * (fit.tw + G), top: oy + Math.floor(j / fit.cols) * (fit.th + G),
              width: fit.tw, height: fit.th, "--glow": pile === "needs" ? "var(--tone)" : pile === "working" ? "var(--at-working)" : "var(--border-glass-strong)",
            } as CSSProperties}
            onMouseEnter={() => nav.attend({ type: "agent", id: a.id })}
            onMouseLeave={nav.unattend}
            onFocus={() => nav.attend({ type: "agent", id: a.id })}
            onBlur={nav.unattend}
            onClick={(e) => nav.openAgent(a.id, e.currentTarget)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                nav.openAgent(a.id, e.currentTarget);
              }
            }}
          >
            <span className={s.cardGlow} aria-hidden="true" />
            <span className="absolute right-3 top-3 h-12 w-12" aria-hidden="true"><Emblem agent={a} rich live={live} /></span>
            <span className="relative flex items-baseline gap-2.5 pr-14">
              <span className="font-mono text-base font-bold text-muted">{a.callsign}</span>
              <span className={`truncate text-xs font-semibold ${b[`ink-${a.enabled ? a.state : "off"}`]}`}>{shortState(a, copy)}</span>
            </span>
            <span className="relative mt-1.5 line-clamp-2 pr-10 text-xl font-semibold leading-tight text-foreground">{a.name}</span>
            <span className="relative mt-1 truncate text-base text-muted-dark">{taskText(a, copy, copy.tasks.resting)}</span>
            {run && (
              <span className="relative mt-2 block h-1.5 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)]">
                <span className="block h-full rounded-full bg-[var(--st-running)] transition-[width] duration-1000" style={{ width: `${(a.progress ?? 0) * 100}%` }} />
              </span>
            )}
            <span className="relative mt-auto flex items-end justify-between gap-3 pt-2">
              <span className={`${s.spark} flex h-7 flex-1 items-end gap-0.5`} aria-hidden="true">
                {a.spark24h.map((v, i) => <i key={i} style={{ height: `${Math.max(6, (v / m) * 100).toFixed(0)}%` }} />)}
              </span>
              {pile === "needs" && (
                <span className="leading-none" style={{ color: "color-mix(in oklab, var(--tone) 80%, var(--foreground))" }} aria-hidden="true">
                  <NeedGlyph agent={a} size={24} />
                </span>
              )}
              <span className="whitespace-nowrap text-right text-xs text-muted-dark">
                <b className="block text-base text-foreground">{a.runsToday}</b>
                {copy.team.runsToday}
              </span>
            </span>
          </div>
        );
      })}
    </motion.section>
  );
}
