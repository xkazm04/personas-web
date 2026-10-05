import { memo, type KeyboardEvent } from "react";
import { needsYou } from "../fleet-data";
import { emptySlots, GROUND, type BuildingBox, type Tier, type WinBox } from "./city-layout";
import { LABEL } from "./lantern-placement";
import Ornament, { GroundDecor } from "./Ornament";
import { hueText, stateColor, teamTones } from "./palette";
import WindowArt from "./WindowArt";
import { fill, windowAria, type CityCopy } from "./vocab";
import s from "./night.module.css";

export type Att = { kind: "agent" | "team"; id: string } | null;

export interface BuildingHandlers {
  onHover: (att: Att) => void;
  onFocusAtt: (att: Att) => void;
  onOpenAgent: (id: string) => void;
  onOpenTeam: (teamId: string) => void;
}

interface BuildingProps extends BuildingHandlers {
  b: BuildingBox;
  tier: Tier;
  copy: CityCopy;
  still: boolean;
  /** Plays the rise-and-lights-on entrance (first paint, scale change). */
  entrance: boolean;
  lifted: boolean;
  attAgent: string | null;
  attTeam: boolean;
}

const activate = (fn: () => void) => (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
};

function Building({ b, tier, copy, still, entrance, lifted, attAgent, attTeam, onHover, onFocusAtt, onOpenAgent, onOpenTeam }: BuildingProps) {
  const { t } = b;
  const tones = teamTones(t.hue);
  const x0 = b.cx - b.w / 2;
  const bodyH = GROUND - b.top;
  const ny = b.mem.filter(needsYou).length;
  const team = { kind: "team" as const, id: t.id };
  const cls = [s.bldg, lifted ? s.lift : "", entrance && !still ? s.rise : ""].join(" ");

  return (
    <g className={cls} style={{ animationDelay: `${b.i * 55}ms` }}>
      <g
        className={`${s.bshape} ${attTeam ? s.att : ""}`}
        role="button"
        tabIndex={0}
        aria-label={fill(copy.buildingAria, { team: t.name, n: b.n, ny })}
        onMouseEnter={() => onHover(team)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onFocusAtt(team)}
        onBlur={() => onFocusAtt(null)}
        onClick={() => onOpenTeam(t.id)}
        onKeyDown={activate(() => onOpenTeam(t.id))}
      >
        <GroundDecor teamId={t.id} cx={b.cx} w={b.w} ground={GROUND} hue={t.hue} />
        <rect x={x0 + 7} y={b.top + 7} width={b.w} height={bodyH - 7} style={{ fill: "var(--ns-shadow)" }} />
        <rect x={x0} y={b.top} width={b.w} height={bodyH} style={{ fill: tones.body }} />
        <rect x={x0} y={b.top} width={3} height={bodyH} style={{ fill: tones.rim }} />
        <rect x={x0} y={b.top} width={b.w} height={3} style={{ fill: tones.roof }} />
        <Ornament teamId={t.id} cx={b.cx} top={b.top} w={b.w} hue={t.hue} still={still} />
        <rect x={x0 + 6} y={GROUND - 31} width={b.w - 12} height={25} rx={3} style={{ fill: tones.sign, stroke: tones.rim }} strokeWidth={1} />
        <text
          x={b.cx}
          y={GROUND - 12}
          textAnchor="middle"
          fontSize={LABEL}
          fontWeight={600}
          className="font-sans"
          style={{ fill: hueText(t.hue) }}
          // A long team name is fitted to its sign rather than shrunk below the label floor.
          {...(t.name.length * LABEL * 0.54 > b.w - 20 ? { textLength: b.w - 20, lengthAdjust: "spacingAndGlyphs" } : {})}
        >
          {t.name}
        </text>
        {tier.lobby > 0 && <Lobby cx={b.cx} w={b.w} lobby={tier.lobby} tones={tones} />}
        {emptySlots(b, tier).map((p, k) => (
          <rect key={k} x={p.x} y={p.y} width={tier.ww} height={tier.wh} style={{ fill: tones.sign, stroke: tones.roof }} strokeWidth={1.5} strokeDasharray="3 3" />
        ))}
        <rect className={s.bring} x={x0 - 8} y={b.anchor - 8} width={b.w + 16} height={GROUND - b.anchor + 12} rx={10} fill="none" style={{ stroke: hueText(t.hue) }} strokeWidth={2.5} strokeDasharray="6 5" />
      </g>
      {b.wins.map((wv) => (
        <Window
          key={wv.a.id}
          wv={wv}
          copy={copy}
          still={still}
          entrance={entrance}
          att={attAgent === wv.a.id}
          onHover={onHover}
          onFocusAtt={onFocusAtt}
          onOpenAgent={onOpenAgent}
        />
      ))}
    </g>
  );
}

export default memo(Building);

function Lobby({ cx, w, lobby, tones }: { cx: number; w: number; lobby: number; tones: ReturnType<typeof teamTones> }) {
  const dh = lobby - 12;
  const dw = Math.min(46, w * 0.3);
  return (
    <g>
      <path
        d={`M ${cx - dw / 2} ${GROUND - 34} V ${GROUND - 34 - dh + dw / 2} A ${dw / 2} ${dw / 2} 0 0 1 ${cx + dw / 2} ${GROUND - 34 - dh + dw / 2} V ${GROUND - 34} Z`}
        style={{ fill: tones.sign, stroke: tones.rim }}
        strokeWidth={2}
      />
      <rect x={cx - dw / 2 + 5} y={GROUND - 34 - dh * 0.55} width={dw - 10} height={dh * 0.55 - 2} style={{ fill: "var(--ns-lamp)" }} opacity={0.14} />
      <rect x={cx - w / 2 + 8} y={GROUND - 40 - lobby + 8} width={w - 16} height={4} style={{ fill: tones.roof }} />
    </g>
  );
}

interface WindowProps {
  wv: WinBox;
  copy: CityCopy;
  still: boolean;
  entrance: boolean;
  att: boolean;
  onHover: (att: Att) => void;
  onFocusAtt: (att: Att) => void;
  onOpenAgent: (id: string) => void;
}

function Window({ wv, copy, still, entrance, att, onHover, onFocusAtt, onOpenAgent }: WindowProps) {
  const { a, x, y, w, h, b } = wv;
  const glow = stateColor(a);
  const me = { kind: "agent" as const, id: a.id };
  // A stable, per-window stagger for the lights coming on.
  const delay = 0.15 + b.i * 0.11 + wv.row * 0.07 + ((Number(a.id.slice(1)) * 37) % 35) / 100;
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
      <circle className={s.glow} cx={x + w / 2} cy={y + h / 2} r={w * 1.3} style={{ fill: glow }} opacity={0.22} />
      <rect x={x - 10} y={y - 16} width={w + 22} height={h + 26} fill="transparent" />
      <WindowArt a={a} x={x} y={y} w={w} h={h} hue={b.t.hue} still={still} />
      <rect className={s.ring} x={x - 5} y={y - 5} width={w + 10} height={h + 12} rx={5} fill="none" style={{ stroke: glow }} strokeWidth={2.5} />
      {entrance && !still && (
        <rect className={s.lightsOn} x={x - 1} y={y - 1} width={w + 2} height={h + 2} style={{ fill: "var(--ns-glass)", ["--d" as string]: `${delay.toFixed(2)}s` }} />
      )}
    </g>
  );
}
