import type { CSSProperties } from "react";
import { FLEET, type FleetAgent } from "../fleet-data";
import Backdrop from "./Backdrop";
import Building, { type Att } from "./Building";
import type { CityLayout } from "./city-layout";
import { AgentCardBody, HoverCard, TeamCardBody, type Anchor } from "./HoverCard";
import Moon, { type Meter } from "./Moon";
import type { Packet } from "./nightStore";
import Packets from "./Packets";
import Vehicles from "./Vehicles";
import { AgentWires, RoofWires } from "./Wires";
import type { CityCopy } from "./vocab";
import type { FleetProcess } from "../fleet-data";
import s from "./night.module.css";

interface CityFieldProps {
  L: CityLayout;
  scale: number;
  copy: CityCopy;
  still: boolean;
  att: Att;
  byId: Map<string, FleetAgent>;
  meters: Meter[];
  procs: FleetProcess[];
  packet: Packet | null;
  simMs: number;
  dolly: string | null;
  setHover: (a: Att) => void;
  setFocus: (a: Att) => void;
  openAgent: (id: string) => void;
  openTeam: (id: string) => void;
}

/**
 * The city filling the field edge to edge: a thin sky band with the moon (the
 * usage meters), the buildings across the full width, a thin street. The
 * thing under attention gets a card floating beside it; nothing reserves
 * space for it.
 */
export default function CityField({ L, scale, copy, still, att, byId, meters, procs, packet, simMs, dolly, setHover, setFocus, openAgent, openTeam }: CityFieldProps) {
  const attAgent = att?.kind === "agent" ? byId.get(att.id) ?? null : null;
  const attTeamId = att?.kind === "team" ? att.id : attAgent?.team ?? null;
  const moonR = Math.round(L.sky * 0.24);

  let anchor: Anchor | null = null;
  const wv = attAgent ? L.win.get(attAgent.id) : undefined;
  const bAtt = att?.kind === "team" ? L.teams.find((b) => b.t.id === att.id) : undefined;
  if (wv) anchor = { x: wv.x, y: wv.y, w: wv.w, h: wv.h };
  else if (bAtt) anchor = { x: bAtt.cx - bAtt.w / 2, y: bAtt.anchor, w: bAtt.w, h: Math.min(160, L.ground - bAtt.anchor) };

  let wrap: CSSProperties | undefined;
  const target = dolly ? L.teams.find((b) => b.t.id === dolly) : undefined;
  if (target) {
    const top = target.anchor - 10;
    const k = Math.min(3, (L.H * 0.8) / (L.ground - top), (L.W * 0.5) / target.w);
    wrap = { transform: `translate(${L.W / 2 - target.cx * k}px, ${L.H / 2 - ((top + L.ground) / 2) * k}px) scale(${k})`, opacity: 0 };
  }

  return (
    <>
      <div className={`${s.cityWrap} ${att ? s.hasAtt : ""}`} style={wrap} onMouseLeave={() => setHover(null)}>
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
          <RoofWires layout={L} byId={byId} />
          {L.teams.map((b) => (
            <Building
              key={`${b.t.id}-${scale}`}
              b={b}
              L={L}
              copy={copy}
              still={still}
              lifted={attTeamId === b.t.id}
              attAgent={attAgent?.team === b.t.id ? attAgent.id : null}
              attTeam={att?.kind === "team" && att.id === b.t.id}
              onHover={setHover}
              onFocusAtt={setFocus}
              onOpenAgent={openAgent}
              onOpenTeam={openTeam}
            />
          ))}
          <AgentWires layout={L} agentId={attAgent?.id ?? null} />
          <Packets packet={packet} layout={L} paused={!!dolly} />
          <Vehicles procs={procs} W={L.W} ground={L.ground} street={L.H - L.ground} />
        </svg>
      </div>
      {anchor && !dolly && (
        <HoverCard anchor={anchor} field={{ w: L.W, h: L.H }}>
          {attAgent ? (
            <AgentCardBody copy={copy} a={attAgent} team={FLEET.teams.find((x) => x.id === attAgent.team)?.name ?? ""} simMs={simMs} hint={copy.openRoom} />
          ) : (
            bAtt && <TeamCardBody copy={copy} team={bAtt.t} members={bAtt.mem} hint={copy.stepInside} />
          )}
        </HoverCard>
      )}
    </>
  );
}
