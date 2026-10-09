import { memo } from "react";
import { needsTone } from "../attention";
import BoardHoverCard from "../board/HoverCard";
import type { BoardCopy } from "../board/copy";
import type { SimAgent } from "../board/model";
import { inFlightFor, type Command } from "../board/useCommands";
import Backdrop from "./Backdrop";
import Building, { type Att } from "./Building";
import type { CityLayout } from "./city-layout";
import { HoverCard, TeamCardBody, type Anchor } from "./HoverCard";
import MoonArt, { type Meter } from "./Moon";
import Packets, { type Packet } from "./Packets";
import { stageOf, useCityArrival } from "./useCityArrival";
import Vehicles from "./Vehicles";
import { AgentWires, RoofWires as RoofWiresArt } from "./Wires";
import type { CityCopy } from "./vocab";
import type { FleetProcess } from "../fleet-data";
import s from "./night.module.css";

interface CityFieldProps {
  L: CityLayout;
  scale: number;
  copy: CityCopy;
  boardCopy: BoardCopy;
  still: boolean;
  live: boolean;
  att: Att;
  byId: Map<string, SimAgent>;
  meters: Meter[];
  procs: FleetProcess[];
  packet: Packet | null;
  cmds: readonly Command[];
  hostName: string;
  pinned: Att;
  /** Stable handlers (state setters or stable callbacks), so memoised buildings
   *  re-render only for their own windows and attention. */
  setHover: (a: Att) => void;
  setFocus: (a: Att) => void;
  openAgent: (id: string) => void;
  pinTeam: (id: string) => void;
  unpin: () => void;
  /** A layer (the agent console) covers the city: hold the last frame and do
   *  no work until it is uncovered. */
  frozen: boolean;
}

// The art that does not follow attention: a hover re-renders none of it.
const Moon = memo(MoonArt);
const RoofWires = memo(RoofWiresArt);

/**
 * The city filling the field edge to edge: a thin sky band with the moon (the
 * usage meters), the buildings across the full width, a thin street. The
 * thing under attention gets a card floating beside it; nothing reserves
 * space for it. A click on the sky or the street unpins the card.
 */
function CityField({ L, scale, copy, boardCopy, still, live, att, byId, meters, procs, packet, cmds, hostName, pinned, setHover, setFocus, openAgent, pinTeam, unpin }: CityFieldProps) {
  const arrival = useCityArrival(L.teams, scale);
  const arrived = arrival === Infinity;
  const attAgent = att?.kind === "agent" ? byId.get(att.id) ?? null : null;
  const attTeamId = att?.kind === "team" ? att.id : attAgent?.team ?? null;
  const moonR = Math.round(L.sky * 0.24);

  let anchor: Anchor | null = null;
  const wv = attAgent ? L.win.get(attAgent.id) : undefined;
  const bAtt = att?.kind === "team" ? L.teams.find((b) => b.t.id === att.id) : undefined;
  if (wv) anchor = { x: wv.x, y: wv.y, w: wv.w, h: wv.h };
  else if (bAtt) anchor = { x: bAtt.cx - bAtt.w / 2, y: bAtt.anchor, w: bAtt.w, h: Math.min(160, L.ground - bAtt.anchor) };

  return (
    <>
      <div
        className={`${s.cityWrap} ${att ? s.hasAtt : ""} ${arrived ? s.arrived : ""}`}
        onMouseLeave={() => setHover(null)}
        onClick={(e) => {
          if (pinned && !(e.target as Element).closest('[role="button"]')) unpin();
        }}
      >
        <svg width={L.W} height={L.H} viewBox={`0 0 ${L.W} ${L.H}`} className="block">
          <defs>
            <linearGradient id="ns-run-fill" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" style={{ stopColor: "var(--brand-cyan)" }} stopOpacity={0.9} />
              <stop offset="1" style={{ stopColor: "var(--brand-cyan)" }} stopOpacity={0.45} />
            </linearGradient>
            {(["critical", "warning"] as const).map((tone) => (
              <linearGradient key={tone} id={`ns-shaft-${tone}`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" style={{ stopColor: tone === "critical" ? "var(--status-error)" : "var(--status-warning)" }} stopOpacity={0.45} />
                <stop offset="1" style={{ stopColor: tone === "critical" ? "var(--status-error)" : "var(--status-warning)" }} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <Backdrop W={L.W} H={L.H} ground={L.ground} />
          <Moon cx={L.W - moonR * 2.6} cy={L.sky / 2 + 2} r={moonR} five={meters[0]} seven={meters[1]} />
          {arrived && <g className={s.wiresIn}><RoofWires layout={L} byId={byId} /></g>}
          {L.teams.map((b) => (
            <Building
              key={`${b.t.id}-${scale}`}
              b={b}
              L={L}
              copy={copy}
              still={still}
              stage={stageOf(b, arrival)}
              lifted={attTeamId === b.t.id}
              attAgent={attAgent?.team === b.t.id ? attAgent.id : null}
              attTeam={att?.kind === "team" && att.id === b.t.id}
              onHover={setHover}
              onFocusAtt={setFocus}
              onOpenAgent={openAgent}
              onPinTeam={pinTeam}
            />
          ))}
          <AgentWires layout={L} agentId={attAgent?.id ?? null} />
          <Packets packet={packet} layout={L} />
          <Vehicles procs={procs} W={L.W} ground={L.ground} street={L.H - L.ground} />
        </svg>
      </div>
      {attAgent && anchor && (
        <BoardHoverCard agent={attAgent} anchor={anchor} width={L.W} height={L.H} copy={boardCopy} live={live} tone={needsTone(attAgent)} pending={inFlightFor(cmds, attAgent.id)} hostName={hostName} />
      )}
      {!attAgent && bAtt && anchor && (
        <HoverCard anchor={anchor} field={{ w: L.W, h: L.H }}>
          <TeamCardBody copy={copy} team={bAtt.t} members={bAtt.mem} hint={copy.pinHint} />
        </HoverCard>
      )}
    </>
  );
}

/** Frozen while covered: the city keeps its last frame and skips every tick
 *  and attention change; uncovering renders it once with the latest state. */
export default memo(CityField, (p, n) => {
  if (n.frozen) return true;
  for (const k of Object.keys(n) as (keyof CityFieldProps)[]) if (p[k] !== n[k]) return false;
  return true;
});
