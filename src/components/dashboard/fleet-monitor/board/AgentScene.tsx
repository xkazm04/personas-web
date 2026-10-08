"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import Emblem from "./Emblem";
import RunCard from "./RunCard";
import AgentSide from "./AgentSide";
import Controls from "./Controls";
import { StatePill } from "./parts";
import { stateText, type BoardCopy } from "./copy";
import { TEAM_BY_ID, type BoardEvent, type SimAgent } from "./model";
import { openControl, type Command } from "./useCommands";
import type { Operator } from "./operator";
import b from "./board.module.css";

interface AgentSceneProps {
  agent: SimAgent;
  simMs: number;
  events: BoardEvent[];
  copy: BoardCopy;
  still: boolean;
  live: boolean;
  op: Operator;
  cmds: readonly Command[];
  hostName: string;
}

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** One agent as a composed scene: who it is, its run, and what waits on you. */
export default function AgentScene({ agent: a, simMs, events, copy, still, live, op, cmds, hostName }: AgentSceneProps) {
  const team = TEAM_BY_ID[a.team];
  const pending = openControl(cmds, a.id);
  const col = (dx: number, dy: number, delay: number) => ({
    initial: { opacity: 0, x: still ? 0 : dx, y: still ? 0 : dy },
    animate: { opacity: 1, x: 0, y: 0 },
    transition: { duration: still ? 0.2 : 0.6, delay: still ? 0 : delay, ease: EASE },
  });

  return (
    <motion.section
      aria-label={`${a.callsign} ${a.name}`}
      className="absolute inset-0 z-10 grid grid-cols-[minmax(220px,26%)_minmax(0,1fr)_minmax(260px,30%)] overflow-hidden rounded-3xl shadow-[inset_0_0_0_1px_var(--border-glass-strong),0_40px_120px_rgb(0_0_0/0.35)]"
      style={{
        "--h": a.hue,
        background: `radial-gradient(60% 70% at 14% 30%, hsl(${a.hue} 80% 55% / 0.16), transparent 70%), linear-gradient(180deg, color-mix(in oklab, var(--surface) 97%, transparent), color-mix(in oklab, var(--background) 97%, transparent))`,
      } as CSSProperties}
      initial={{ opacity: 0, scale: still ? 1 : 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: still ? 1 : 0.97 }}
      transition={{ duration: still ? 0.2 : 0.5, ease: EASE }}
    >
      <h2 tabIndex={-1} data-agent-title className="sr-only">{`${a.callsign} ${a.name}`}</h2>
      {/* Sized to its own box (container units): the emblem takes whatever
          height the identity block leaves, from a 720px stage to a 960px one. */}
      <motion.div className="relative flex min-w-0 flex-col p-6 [container-type:size]" {...col(-30, 0, 0.05)}>
        <div className="text-xs text-muted-dark">{copy.agent.emblemCaption}</div>
        <div className={`${b.spotArt} pointer-events-none relative my-2 min-h-0 flex-1`} aria-hidden="true">
          <Emblem agent={a} rich live={live} />
        </div>
        <div className="shrink-0">
          <div className={`${b.teamInk} whitespace-nowrap font-mono text-[clamp(2.5rem,min(11cqh,19cqw),4.5rem)] font-bold leading-none tracking-tighter`}>{a.callsign}</div>
          <div className="mt-1.5 line-clamp-2 text-[clamp(1.25rem,min(5cqh,9cqw),1.875rem)] font-semibold leading-tight tracking-tight text-foreground">{a.name}</div>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <span className={`${b.teamInk} rounded-full border border-current px-2.5 py-1 text-xs`} style={{ "--h": team.hue } as CSSProperties}>
              {team.name}
            </span>
            <StatePill agent={a} text={stateText(a, copy)} />
          </div>
          <div className="mt-4">
            <Controls agent={a} copy={copy} op={op} pending={pending} hostName={hostName} />
          </div>
        </div>
      </motion.div>
      <motion.div className="min-w-0 py-4 [container-type:size]" {...col(0, 24, 0.1)}>
        <RunCard agent={a} simMs={simMs} events={events} copy={copy} live={live} busy={op.offline || !!pending} onAct={(k) => op[k](a)} />
      </motion.div>
      <motion.div className="min-w-0 border-l border-glass py-5 pl-5 pr-6" {...col(30, 0, 0.15)}>
        <AgentSide agent={a} simMs={simMs} copy={copy} cmds={cmds} still={still} offline={op.offline} hostName={hostName} onReview={(rid, approve) => op.verdict(a, rid, approve)} onUndo={op.undo} onRead={() => op.read(a)} />
      </motion.div>
    </motion.section>
  );
}
