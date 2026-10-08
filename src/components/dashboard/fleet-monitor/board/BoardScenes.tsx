"use client";

import { AnimatePresence } from "framer-motion";
import TeamScene from "./TeamScene";
import AgentScene from "./AgentScene";
import TriageView from "./TriageView";
import { TEAM_BY_ID, type BoardEvent, type SimAgent } from "./model";
import type { Rect } from "./Tile";
import type { BoardCopy } from "./copy";
import type { BoardNav } from "./useBoardNav";
import type { Command } from "./useCommands";
import type { Operator } from "./operator";

interface BoardScenesProps {
  scope: SimAgent[];
  nav: BoardNav;
  /** The open team's bay on the field, which its scene grows out of. */
  bayRect?: Rect;
  width: number;
  height: number;
  simMs: number;
  events: BoardEvent[];
  copy: BoardCopy;
  still: boolean;
  live: boolean;
  op: Operator;
  cmds: readonly Command[];
  hostName: string;
  triage: boolean;
  onTriageClose: () => void;
}

/** The layers that open over the field: a team (L1), triage, an agent's console (L2). */
export default function BoardScenes({ scope, nav, bayRect, width, height, simMs, events, copy, still, live, op, cmds, hostName, triage, onTriageClose }: BoardScenesProps) {
  const openAgent = nav.agentOpen ? scope.find((a) => a.id === nav.agentOpen) : undefined;
  return (
    <>
      <AnimatePresence>
        {nav.teamOpen && bayRect && (
          <TeamScene key={nav.teamOpen} covered={!!openAgent} team={TEAM_BY_ID[nav.teamOpen]} list={scope.filter((a) => a.team === nav.teamOpen)} from={bayRect} width={width} height={height} copy={copy} nav={nav} still={still} live={live} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {triage && (
          <TriageView key="triage" scope={scope} simMs={simMs} events={events} copy={copy} op={op} hostName={hostName} still={still}
            onClose={onTriageClose} onConsole={(id) => { onTriageClose(); nav.openAgent(id, null); }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {openAgent && (
          <AgentScene key="agent" agent={openAgent} simMs={simMs} events={events} copy={copy} still={still} live={live} op={op} cmds={cmds} hostName={hostName} onStep={nav.stepAgent} />
        )}
      </AnimatePresence>
    </>
  );
}
