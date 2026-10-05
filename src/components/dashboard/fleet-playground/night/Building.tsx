import { memo, type KeyboardEvent } from "react";
import { ATTENTION_COLOR, attentionOf, needsTone } from "../attention";
import { needsYou } from "../fleet-data";
import { emptySlots, type BuildingBox, type CityLayout, type WinBox } from "./city-layout";
import Ornament from "./Ornament";
import { hueText, teamTones } from "./palette";
import WindowArt from "./WindowArt";
import { fill, windowAria, type CityCopy } from "./vocab";
import s from "./night.module.css";

export type Att = { kind: "agent" | "team"; id: string } | null;

interface BuildingProps {
  b: BuildingBox;
  L: CityLayout;
  copy: CityCopy;
  still: boolean;
  lifted: boolean;
  attAgent: string | null;
  attTeam: boolean;
  onHover: (att: Att) => void;
  onFocusAtt: (att: Att) => void;
  onOpenAgent: (id: string) => void;
  onOpenTeam: (teamId: string) => void;
}

export const activate = (fn: () => void) => (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
};

function Building({ b, L, copy, still, lifted, attAgent, attTeam, onHover, onFocusAtt, onOpenAgent, onOpenTeam }: BuildingProps) {
  const { t } = b;
  const tones = teamTones(t.hue);
  const x0 = b.cx - b.w / 2;
  const bodyH = L.ground - b.top;
  const team = { kind: "team" as const, id: t.id };
  const needs = b.wins.filter((wv) => attentionOf(wv.a) === "needs");
  const signFits = t.name.length * 13 * 0.55 <= b.w - 14;

  return (
    <g className={`${s.bldg} ${lifted ? s.lift : ""} ${still ? "" : s.rise}`} style={{ animationDelay: `${b.i * 55}ms` }}>
      <g
        className={`${s.bshape} ${attTeam ? s.att : ""}`}
        role="button"
        tabIndex={0}
        aria-label={fill(copy.buildingAria, { team: t.name, n: b.n, ny: b.mem.filter(needsYou).length })}
        onMouseEnter={() => onHover(team)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onFocusAtt(team)}
        onBlur={() => onFocusAtt(null)}
        onClick={() => onOpenTeam(t.id)}
        onKeyDown={activate(() => onOpenTeam(t.id))}
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
        {emptySlots(L, b).map((p, k) => (
          <rect key={k} x={p.x} y={p.y} width={L.ww} height={L.wh} style={{ fill: tones.sign, stroke: tones.roof }} strokeWidth={1.5} strokeDasharray="3 3" />
        ))}
        <rect className={s.bring} x={x0 - 6} y={b.anchor - 6} width={b.w + 12} height={L.ground - b.anchor + 8} rx={8} fill="none" style={{ stroke: hueText(t.hue) }} strokeWidth={2} strokeDasharray="6 5" />
      </g>
      {needs.map((wv) => <Beacon key={wv.a.id} wv={wv} top={b.top} still={still} />)}
      {b.wins.map((wv) => (
        <Window key={wv.a.id} wv={wv} copy={copy} still={still} att={attAgent === wv.a.id} onHover={onHover} onFocusAtt={onFocusAtt} onOpenAgent={onOpenAgent} />
      ))}
    </g>
  );
}

export default memo(Building);

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
  att: boolean;
  onHover: (att: Att) => void;
  onFocusAtt: (att: Att) => void;
  onOpenAgent: (id: string) => void;
}

function Window({ wv, copy, still, att, onHover, onFocusAtt, onOpenAgent }: WindowProps) {
  const { a, x, y, w, h, b } = wv;
  const me = { kind: "agent" as const, id: a.id };
  const delay = 0.15 + b.i * 0.09 + wv.row * 0.06 + ((Number(a.id.slice(1)) * 37) % 35) / 100;
  return (
    <g
      id={`ns-w-${a.id}`}
      className={`${s.win} ${att ? s.att : ""}`}
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
      <WindowArt a={a} x={x} y={y} w={w} h={h} hue={b.t.hue} still={still} callsign={a.callsign} />
      <rect className={s.ring} x={x - 4} y={y - 4} width={w + 8} height={h + 9} rx={4} fill="none" style={{ stroke: "var(--foreground)" }} strokeWidth={2.5} />
      {!still && <rect className={s.lightsOn} x={x - 1} y={y - 1} width={w + 2} height={h + 2} style={{ fill: "var(--ns-glass)", ["--d" as string]: `${delay.toFixed(2)}s` }} />}
    </g>
  );
}
