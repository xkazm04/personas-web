"use client";

import { AnimatePresence, motion } from "framer-motion";
import { TEAM_BY_ID, type BoardEvent, type SimAgent } from "./model";
import { AgentLayer, FleetLayer, TeamLayer } from "./SpotLayers";
import type { BoardCopy } from "./copy";
import type { BoardNav } from "./useBoardNav";
import b from "./board.module.css";

interface SpotlightProps {
  scope: SimAgent[];
  scale: number;
  simMs: number;
  events: BoardEvent[];
  copy: BoardCopy;
  nav: BoardNav;
  live: boolean;
  still: boolean;
  away: boolean;
}

/**
 * The stage on the left. It always holds whatever is under attention at
 * display scale: a hovered or focused agent, a team, the open team, or, with
 * nothing under attention, the fleet's verdict. Layers crossfade on change.
 */
export default function Spotlight({ scope, scale, nav, away, still, ...rest }: SpotlightProps) {
  const { att, teamOpen } = nav;
  let key: string;
  if (att?.type === "agent" && scope.some((a) => a.id === att.id)) key = `a:${att.id}`;
  else if (att?.type === "team" && scope.some((a) => a.team === att.id)) key = `t:${att.id}`;
  else if (teamOpen) key = `t:${teamOpen}`;
  else key = `f:${scale}`;
  const [kind, id] = key.split(":");
  const p = { scope, nav, still, ...rest };

  return (
    <aside
      aria-label={rest.copy.spot.label}
      inert={away}
      className={`${b.spot} relative h-full min-h-0 overflow-hidden rounded-3xl transition-[opacity,transform] duration-500 ${
        away ? "pointer-events-none -translate-x-6 scale-[0.98] opacity-0" : ""
      }`}
    >
      <div className={b.beam} aria-hidden="true" />
      <AnimatePresence initial={false}>
        <motion.div
          key={key}
          className="absolute inset-0 flex flex-col px-6 py-5 [container-type:size]"
          initial={{ opacity: 0, y: still ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: still ? 0 : -6 }}
          transition={{ duration: still ? 0.2 : 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {kind === "a" && (
            <AgentLayer {...p} agent={scope.find((a) => a.id === id)!} team={TEAM_BY_ID[scope.find((a) => a.id === id)!.team]} />
          )}
          {kind === "t" && <TeamLayer {...p} team={TEAM_BY_ID[id]} />}
          {kind === "f" && <FleetLayer {...p} />}
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}
