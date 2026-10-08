"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import RunCard from "./RunCard";
import AgentSide from "./AgentSide";
import AgentHeader from "./AgentHeader";
import AgentActivity from "./AgentActivity";
import type { BoardCopy } from "./copy";
import type { BoardEvent, SimAgent } from "./model";
import { openControl, type Command } from "./useCommands";
import type { Operator } from "./operator";

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
  onStep: (delta: number) => void;
}

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** One agent as a remote console: who it is and its controls across the top,
 *  then its run, what it is doing, and what waits on you. */
export default function AgentScene({ agent: a, simMs, events, copy, still, live, op, cmds, hostName, onStep }: AgentSceneProps) {
  const pending = openControl(cmds, a.id);
  const col = (dy: number, delay: number) => ({
    initial: { opacity: 0, y: still ? 0 : dy },
    animate: { opacity: 1, y: 0 },
    transition: { duration: still ? 0.2 : 0.5, delay: still ? 0 : delay, ease: EASE },
  });

  return (
    <motion.section
      aria-label={`${a.callsign} ${a.name}`}
      className="absolute inset-0 z-10 flex flex-col overflow-hidden rounded-3xl shadow-[inset_0_0_0_1px_var(--border-glass-strong),0_40px_120px_rgb(0_0_0/0.35)]"
      style={{
        "--h": a.hue,
        background: `radial-gradient(50% 60% at 8% 0%, hsl(${a.hue} 80% 55% / 0.14), transparent 70%), linear-gradient(180deg, color-mix(in oklab, var(--surface) 97%, transparent), color-mix(in oklab, var(--background) 97%, transparent))`,
      } as CSSProperties}
      initial={{ opacity: 0, scale: still ? 1 : 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: still ? 1 : 0.98 }}
      transition={{ duration: still ? 0.2 : 0.45, ease: EASE }}
    >
      <AgentHeader agent={a} copy={copy} live={live} op={op} pending={pending} hostName={hostName} onStep={onStep} />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(260px,0.82fr)] gap-4 p-4">
        <motion.div className="min-h-0 min-w-0 [container-type:size]" {...col(16, 0.05)}>
          <RunCard agent={a} simMs={simMs} copy={copy} live={live} busy={op.offline || !!pending} onRetry={() => op.retry(a)} onDraft={(approve) => op.draft(a, approve)} />
        </motion.div>
        <motion.div className="min-h-0 min-w-0" {...col(16, 0.1)}>
          <AgentActivity agent={a} simMs={simMs} events={events} copy={copy} />
        </motion.div>
        <motion.div className="min-h-0 min-w-0 border-l border-glass pl-4" {...col(16, 0.15)}>
          <AgentSide agent={a} simMs={simMs} copy={copy} cmds={cmds} still={still} offline={op.offline} hostName={hostName} onReview={(rid, approve) => op.verdict(a, rid, approve)} onUndo={op.undo} onRead={() => op.read(a)} onAnswer={(text) => op.answer(a, text)} busy={!!pending} />
        </motion.div>
      </div>
    </motion.section>
  );
}
