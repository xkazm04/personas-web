import { ATTENTION_COLOR, attentionOf, needsTone } from "../attention";
import { needsYou, type FleetAgent } from "../fleet-data";
import { activate, type Att } from "./Building";
import DeskArt from "./DeskArt";
import { CallsignLabel } from "./WindowArt";
import { DESK_VB, type FloorLayout } from "./floor-layout";
import { AgentCardBody, HoverCard, TeamCardBody, type Anchor } from "./HoverCard";
import { hue, hueText, textTone } from "./palette";
import { fill, stateWord, type CityCopy, type OfficeCopy } from "./vocab";
import s from "./night.module.css";

/** Desks narrower than this carry no callsign (it would crowd the persona). */
const DESK_LABEL_MIN = 80;

interface FloorFieldProps {
  F: FloorLayout;
  city: CityCopy;
  copy: OfficeCopy;
  still: boolean;
  att: Att;
  simMs: number;
  setHover: (a: Att) => void;
  setFocus: (a: Att) => void;
  openAgent: (id: string, el: Element) => void;
  openTeam: (id: string) => void;
}

/**
 * The whole fleet as one open-plan office floor: each team a department zone
 * tinted in its hue, each agent a desk. A zone's label or bare floor opens
 * the department; a desk opens straight into the agent's room.
 */
export default function FloorField({ F, city, copy, still, att, simMs, setHover, setFocus, openAgent, openTeam }: FloorFieldProps) {
  const attDesk = att?.kind === "agent" ? F.desk.get(att.id) : undefined;
  const attZone = att?.kind === "team" ? F.zones.find((z) => z.t.id === att.id) : undefined;
  let anchor: Anchor | null = null;
  if (attDesk) anchor = { x: attDesk.x, y: attDesk.y, w: attDesk.w, h: attDesk.h };
  else if (attZone) anchor = { x: attZone.x, y: attZone.y, w: Math.min(attZone.w, 220), h: 40 };

  return (
    <>
      <svg width={F.W} height={F.H} viewBox={`0 0 ${F.W} ${F.H}`} className="block" onMouseLeave={() => setHover(null)}>
        {F.zones.map((z) => {
          const team = { kind: "team" as const, id: z.t.id };
          const ny = z.mem.filter(needsYou).length;
          const crit = z.mem.some((a) => attentionOf(a) === "needs" && needsTone(a) === "critical");
          return (
            <g key={z.t.id}>
              <g
                className={`${s.bshape} ${attZone === z ? s.att : ""}`}
                role="button"
                tabIndex={0}
                aria-label={fill(copy.zoneAria, { team: z.t.name, n: z.mem.length, ny })}
                onMouseEnter={() => setHover(team)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setFocus(team)}
                onBlur={() => setFocus(null)}
                onClick={() => openTeam(z.t.id)}
                onKeyDown={activate(() => openTeam(z.t.id))}
              >
                <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={10} style={{ fill: hue(z.t.hue, 9, 45, 40), stroke: hue(z.t.hue, 34, 50, 40) }} strokeWidth={1.2} />
                <rect x={z.x} y={z.y} width={z.w} height={22} rx={10} style={{ fill: hue(z.t.hue, 16, 45, 40) }} />
                <text x={z.x + 12} y={z.y + 16} fontSize={13} fontWeight={600} className="font-sans" style={{ fill: hueText(z.t.hue) }}>
                  {z.t.name}
                  <tspan dx={8} fontWeight={400} style={{ fill: "var(--muted-dark)" }}>{z.mem.length}</tspan>
                  {ny > 0 && <tspan dx={8} fontWeight={700} style={{ fill: textTone(ATTENTION_COLOR[crit ? "critical" : "warning"]) }}>● {ny}</tspan>}
                </text>
                <rect className={s.bring} x={z.x - 3} y={z.y - 3} width={z.w + 6} height={z.h + 6} rx={12} fill="none" style={{ stroke: hueText(z.t.hue) }} strokeWidth={2} strokeDasharray="6 5" />
              </g>
              {z.desks.map((d) => {
                const me = { kind: "agent" as const, id: d.a.id };
                return (
                  <g
                    key={d.a.id}
                    id={`ns-desk-${d.a.id}`}
                    className={`${s.win} ${attDesk === d ? s.att : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-label={fill(copy.deskAria, { callsign: d.a.callsign, name: d.a.name, team: z.t.name, state: stateWord(city, d.a) })}
                    onMouseEnter={() => setHover(me)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setFocus(me)}
                    onBlur={() => setFocus(null)}
                    onClick={(e) => openAgent(d.a.id, e.currentTarget)}
                    onKeyDown={activate(() => openAgent(d.a.id, document.getElementById(`ns-desk-${d.a.id}`) as Element))}
                  >
                    <rect x={d.x} y={d.y} width={d.w} height={d.h} fill="transparent" />
                    <g transform={`translate(${d.x} ${d.y}) scale(${d.w / DESK_VB.w})`}>
                      <DeskArt a={d.a} still={still} />
                    </g>
                    {d.w >= DESK_LABEL_MIN && (attentionOf(d.a) === "needs" || attentionOf(d.a) === "working") && (
                      <CallsignLabel text={d.a.callsign} cx={d.x + d.w / 2} y={d.y + d.h - 16} onTone={false} />
                    )}
                    <rect className={s.ring} x={d.x - 3} y={d.y - 3} width={d.w + 6} height={d.h + 6} rx={6} fill="none" style={{ stroke: "var(--foreground)" }} strokeWidth={2} />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      {anchor && (
        <HoverCard anchor={anchor} field={{ w: F.W, h: F.H }}>
          {attDesk ? (
            <AgentCardBody copy={city} a={attDesk.a as FleetAgent} team={attDesk.z.t.name} simMs={simMs} hint={city.openRoom} />
          ) : (
            attZone && <TeamCardBody copy={city} team={attZone.t} members={attZone.mem} hint={city.stepInside} />
          )}
        </HoverCard>
      )}
    </>
  );
}
