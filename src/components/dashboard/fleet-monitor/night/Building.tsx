import { memo, type KeyboardEvent } from "react";
import { ATTENTION_COLOR, attentionOf, needsTone } from "../attention";
import { needsYou } from "../fleet-data";
import { emptySlots, type BuildingBox, type CityLayout, type WinBox } from "./city-layout";
import Ornament from "./Ornament";
import { hueText, teamTones } from "./palette";
import type { Stage } from "./useCityArrival";
import WindowArt from "./WindowArt";
import { fill, windowAria, type CityCopy } from "./vocab";
import s from "./night.module.css";

export type Att = { kind: "agent" | "team"; id: string } | null;

interface BuildingProps {
  b: BuildingBox;
  L: CityLayout;
  copy: CityCopy;
  still: boolean;
  /** How much of it has arrived (frame, floors of offices, floors of personas). */
  stage: Stage;
  lifted: boolean;
  attAgent: string | null;
  attTeam: boolean;
  onHover: (att: Att) => void;
  onFocusAtt: (att: Att) => void;
  /** Opens the agent's console (the Board's nested detail). */
  onOpenAgent: (id: string) => void;
  onPinTeam: (teamId: string) => void;
}

export const activate = (fn: () => void) => (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
};

function Building({ b, L, copy, still, stage, lifted, attAgent, attTeam, onHover, onFocusAtt, onOpenAgent, onPinTeam }: BuildingProps) {
  const { t } = b;
  const tones = teamTones(t.hue);
  const x0 = b.cx - b.w / 2;
  const bodyH = L.ground - b.top;
  const team = { kind: "team" as const, id: t.id };
  const needs = b.wins.filter((wv) => wv.row < stage.people && attentionOf(wv.a) === "needs");
  const signFits = t.name.length * 13 * 0.55 <= b.w - 14;
  if (!stage.frame) return null;

  return (
    <g className={`${s.bldg} ${lifted ? s.lift : ""} ${s.frameIn}`}>
      <g
        className={`${s.bshape} ${attTeam ? s.att : ""}`}
        role="button"
        tabIndex={0}
        aria-label={fill(copy.buildingAria, { team: t.name, n: b.n, ny: b.mem.filter(needsYou).length })}
        onMouseEnter={() => onHover(team)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onFocusAtt(team)}
        onBlur={() => onFocusAtt(null)}
        onClick={() => onPinTeam(t.id)}
        onKeyDown={activate(() => onPinTeam(t.id))}
      >
        <rect x={x0 + 6} y={b.top + 6} width={b.w} height={bodyH - 6} style={{ fill: "var(--ns-shadow)" }} />
        <rect x={x0} y={b.top} width={b.w} height={bodyH} style={{ fill: tones.body }} />
        <rect x={x0} y={b.top} width={3} height={bodyH} style={{ fill: tones.rim }} />
        <rect x={x0} y={b.top} width={b.w} height={3} style={{ fill: tones.roof }} />
        <Ornament teamId={t.id} cx={b.cx} top={b.top} w={b.w} hue={t.hue} still={still} />
        <rect x={x0 + 5} y={L.ground - 25} width={b.w - 10} height={21} rx={3} style={{ fill: tones.sign, stroke: tones.rim }} strokeWidth={1} />
        <text x={b.cx} y={L.ground - 10} textAnchor="middle" fontSize={13} fontWeight={600} className="font-sans" style={{ fill: hueText(t.hue) }} {...(signFits ? {} : { textLength: b.w - 16, lengthAdjust: "spacingAndGlyphs" })}>
          {t.name}
        </text>
        {stage.offices >= b.rows && emptySlots(L, b).map((p, k) => (
          <rect key={k} x={p.x} y={p.y} width={L.ww} height={L.wh} style={{ fill: tones.sign, stroke: tones.roof }} strokeWidth={1.5} strokeDasharray="3 3" />
        ))}
        <rect className={s.bring} x={x0 - 6} y={b.anchor - 6} width={b.w + 12} height={L.ground - b.anchor + 8} rx={8} fill="none" style={{ stroke: hueText(t.hue) }} strokeWidth={2} strokeDasharray="6 5" />
      </g>
      {needs.map((wv) => <Beacon key={wv.a.id} wv={wv} top={b.top} still={still} />)}
      {b.wins.map((wv) => wv.row < stage.offices && (
        <Window key={wv.a.id} wv={wv} copy={copy} still={still} occupied={wv.row < stage.people} att={attAgent === wv.a.id} onHover={onHover} onFocusAtt={onFocusAtt} onOpenAgent={onOpenAgent} />
      ))}
    </g>
  );
}

/** The layout is rebuilt on every tick, so compare a building by its place and
 *  its members: a tick re-renders only the buildings whose agents changed, and
 *  a hover only the one or two buildings it enters and leaves. */
function sameBuilding(p: BuildingProps, n: BuildingProps): boolean {
  if (p.stage.frame !== n.stage.frame || p.stage.offices !== n.stage.offices || p.stage.people !== n.stage.people) return false;
  if (p.lifted !== n.lifted || p.attAgent !== n.attAgent || p.attTeam !== n.attTeam || p.still !== n.still || p.copy !== n.copy) return false;
  if (p.onHover !== n.onHover || p.onFocusAtt !== n.onFocusAtt || p.onOpenAgent !== n.onOpenAgent || p.onPinTeam !== n.onPinTeam) return false;
  const [x, y] = [p.b, n.b];
  if (x.t !== y.t || x.i !== y.i || x.cx !== y.cx || x.w !== y.w || x.top !== y.top || x.anchor !== y.anchor || x.cols !== y.cols || x.rows !== y.rows || x.mem.length !== y.mem.length) return false;
  const [l, m] = [p.L, n.L];
  if (l.ground !== m.ground || l.ww !== m.ww || l.wh !== m.wh || l.gap !== m.gap || l.vgap !== m.vgap || l.pad !== m.pad) return false;
  return x.mem.every((a, i) => a === y.mem[i]);
}

export default memo(Building, sameBuilding);

/** A needs-you window lights a beacon on its roof edge, tied to it by a beam
 *  and throwing a short shaft of light into the sky. */
function Beacon({ wv, top, still }: { wv: WinBox; top: number; still: boolean }) {
  const tone = needsTone(wv.a);
  const c = ATTENTION_COLOR[tone];
  const x = wv.x + wv.w / 2;
  return (
    <g pointerEvents="none">
      <rect x={x - 1} y={top} width={2} height={Math.max(0, wv.y - top)} style={{ fill: c }} opacity={0.55} />
      <rect x={x - 7} y={top - 70} width={14} height={66} fill={`url(#ns-shaft-${tone})`} />
      <circle className={still ? undefined : s.beacon} cx={x} cy={top - 4} r={13} style={{ fill: c }} opacity={0.22} />
      <circle cx={x} cy={top - 4} r={4.5} style={{ fill: c, stroke: "var(--background)" }} strokeWidth={1} />
    </g>
  );
}

interface WindowProps {
  wv: WinBox;
  copy: CityCopy;
  still: boolean;
  /** The persona has taken its desk (the arrival's last step); before it, an empty lit office. */
  occupied: boolean;
  att: boolean;
  onHover: (att: Att) => void;
  onFocusAtt: (att: Att) => void;
  /** Opens the agent's console (the Board's nested detail). */
  onOpenAgent: (id: string) => void;
}

const Window = memo(function Window({ wv, copy, still, occupied, att, onHover, onFocusAtt, onOpenAgent }: WindowProps) {
  const { a, x, y, w, h, b } = wv;
  const me = { kind: "agent" as const, id: a.id };
  return (
    <g
      id={`ns-w-${a.id}`}
      className={`${s.win} ${s.officeIn} ${att ? s.att : ""}`}
      role="button"
      tabIndex={0}
      aria-label={windowAria(copy, a, b.t.name)}
      onMouseEnter={() => onHover(me)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onFocusAtt(me)}
      onBlur={() => onFocusAtt(null)}
      onClick={() => onOpenAgent(a.id)}
      onKeyDown={activate(() => onOpenAgent(a.id))}
    >
      <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} fill="transparent" />
      <WindowArt a={a} x={x} y={y} w={w} h={h} hue={b.t.hue} still={still} callsign={a.callsign} vacant={!occupied} />
      <rect className={s.ring} x={x - 4} y={y - 4} width={w + 8} height={h + 9} rx={4} fill="none" style={{ stroke: "var(--foreground)" }} strokeWidth={2.5} />
    </g>
  );
}, (p, n) =>
  p.wv.a === n.wv.a && p.wv.x === n.wv.x && p.wv.y === n.wv.y && p.wv.w === n.wv.w && p.wv.h === n.wv.h && p.wv.row === n.wv.row &&
  p.wv.b.i === n.wv.b.i && p.wv.b.t === n.wv.b.t && p.occupied === n.occupied && p.att === n.att && p.still === n.still && p.copy === n.copy &&
  p.onHover === n.onHover && p.onFocusAtt === n.onFocusAtt && p.onOpenAgent === n.onOpenAgent,
);
