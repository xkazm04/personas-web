import type { ReactNode } from "react";
import { topSeverity, type FleetAgent } from "../fleet-data";
import { SEVERITY_COLOR, STATE_COLOR, windowState } from "./palette";
import s from "./night.module.css";

interface PersonaProps {
  a: FleetAgent;
  still: boolean;
  className?: string;
}

const LIT = new Set(["running", "failed", "input_required", "draft_ready"]);
const ZZ = { fill: "var(--text-secondary)" };

/**
 * A persona at its desk, drawn for its state: typing at a lit screen, slumped
 * over a cracked one, standing with a lantern raised, holding up a draft,
 * waiting by a dim lamp, dozing, or behind shutters. Cut-paper style, tinted
 * with the agent's own hue. Stylised illustration.
 */
export default function Persona({ a, still, className }: PersonaProps) {
  const st = windowState(a);
  const h = a.hue;
  const head = `hsl(${h} 42% 70%)`;
  const body = `hsl(${h} 42% 40%)`;
  const arm = `hsl(${h} 44% 50%)`;
  const dark = `hsl(${h} 30% 18%)`;
  const sc = STATE_COLOR[st];
  const screen = { fill: `color-mix(in oklab, ${sc} ${st === "idle" || st === "attention" || st === "off" ? 6 : 30}%, var(--ns-monitor))` };
  const anim = (cls: string) => (still ? undefined : cls);
  const armPath = (d: string) => <path d={d} style={{ stroke: arm }} strokeWidth={11} strokeLinecap="round" fill="none" />;
  const seated = (hx: number) => (
    <>
      <path d="M 54 168 Q 52 116 74 112 L 86 112 Q 104 116 102 168 Z" style={{ fill: body }} />
      <circle cx={hx} cy={90} r={19} style={{ fill: head }} />
      <path d={`M ${hx - 18} 84 Q ${hx - 12} 66 ${hx + 10} 70 Q ${hx + 18} 74 ${hx + 18} 84 Q ${hx + 4} 76 ${hx - 18} 84 Z`} style={{ fill: dark }} />
    </>
  );

  let screenArt: ReactNode = null;
  let fig: ReactNode = null;
  let front: ReactNode = null;
  const sev = topSeverity(a);

  if (st === "running") {
    const glow = { fill: "color-mix(in oklab, var(--brand-cyan) 55%, var(--foreground))" };
    screenArt = (
      <>
        <rect x={145} y={99} width={46} height={4} style={glow} opacity={0.9} />
        <rect x={145} y={108} width={58} height={4} style={glow} opacity={0.55} />
        <rect className={anim(s.typing)} x={145} y={117} width={38} height={4} style={glow} />
        <path d="M 139 96 L 104 92 L 104 122 L 139 130 Z" style={{ fill: sc }} opacity={0.08} />
      </>
    );
    fig = (<>{seated(82)}{armPath("M 92 124 Q 112 138 138 146")}</>);
  } else if (st === "failed") {
    screenArt = (
      <>
        <path d="M 150 92 L 168 112 L 158 118 L 182 134 M 168 112 L 196 100" style={{ stroke: sc }} strokeWidth={2.4} fill="none" />
        <circle className={anim(s.blink)} cx={176} cy={80} r={6} style={{ fill: sc }} />
        <circle cx={176} cy={80} r={16} style={{ fill: sc }} opacity={0.2} />
      </>
    );
    fig = (
      <>
        <path d="M 50 168 Q 56 128 92 126 L 118 136 Q 104 160 98 168 Z" style={{ fill: body }} />
        {armPath("M 100 130 Q 124 142 150 146")}
        <circle cx={122} cy={134} r={17} style={{ fill: head }} />
        <path d="M 108 126 Q 120 116 136 126 Q 124 122 108 130 Z" style={{ fill: dark }} />
      </>
    );
  } else if (st === "input_required") {
    screenArt = <text x={176} y={126} textAnchor="middle" fontSize={34} fontWeight={800} className="font-sans" style={{ fill: sc }}>?</text>;
    fig = (
      <>
        <rect x={56} y={168} width={11} height={46} rx={4} style={{ fill: dark }} />
        <rect x={76} y={168} width={11} height={46} rx={4} style={{ fill: dark }} />
        <path d="M 50 172 Q 48 112 70 108 L 80 108 Q 98 112 94 172 Z" style={{ fill: body }} />
        <circle cx={74} cy={86} r={19} style={{ fill: head }} />
        <path d="M 56 80 Q 62 62 84 66 Q 92 70 92 80 Q 78 72 56 80 Z" style={{ fill: dark }} />
        {armPath("M 88 118 Q 104 92 106 56")}
        <circle cx={112} cy={70} r={36} style={{ fill: sc }} opacity={0.18} />
        <path d="M 106 48 L 106 56" style={{ stroke: dark }} strokeWidth={2} />
        <rect x={99} y={56} width={20} height={26} rx={6} style={{ fill: "var(--ns-lamp)", stroke: dark }} strokeWidth={2} />
      </>
    );
  } else if (st === "draft_ready") {
    screenArt = (
      <>
        <rect x={150} y={98} width={40} height={5} style={{ fill: sc }} opacity={0.7} />
        <rect x={150} y={108} width={52} height={5} style={{ fill: sc }} opacity={0.5} />
      </>
    );
    fig = (
      <>
        {seated(80)}
        <g transform="rotate(-10 120 104)">
          <rect x={104} y={74} width={40} height={54} rx={2} style={{ fill: "var(--ns-paper)" }} />
          <path d="M 111 86 h 26 M 111 95 h 26 M 111 104 h 18 M 111 113 h 22" style={{ stroke: sc }} strokeWidth={2.4} />
        </g>
        <circle cx={120} cy={104} r={40} style={{ fill: sc }} opacity={0.12} />
        {armPath("M 92 124 Q 104 118 110 110")}
      </>
    );
  } else if (st === "queued") {
    screenArt = (
      <>
        {[160, 176, 192].map((x, i) => <circle key={x} cx={x} cy={113} r={3.5} style={{ fill: sc }} opacity={1 - i * 0.3} />)}
        <path d="M 116 148 L 116 112 L 128 104" style={{ stroke: sc }} strokeWidth={3} fill="none" opacity={0.7} />
        <path d="M 120 100 L 138 100 L 132 110 L 124 110 Z" style={{ fill: sc }} />
        <path d="M 124 110 L 112 148 L 150 148 L 132 110 Z" style={{ fill: sc }} opacity={0.14} />
      </>
    );
    fig = (<>{seated(80)}{armPath("M 90 128 Q 98 160 86 164")}</>);
  } else if (st === "idle" || st === "attention") {
    fig = (
      <>
        <path d="M 44 170 Q 40 120 58 112 L 70 110 Q 92 114 98 170 Z" style={{ fill: body }} />
        <circle cx={58} cy={90} r={19} style={{ fill: head }} />
        <path d="M 40 86 Q 44 68 66 70 Q 76 74 76 82 Q 60 76 40 86 Z" style={{ fill: dark }} />
        {armPath("M 84 128 Q 92 156 80 164")}
        <text x={84} y={62} fontSize={20} fontWeight={700} className="font-sans" style={ZZ} opacity={0.8}>z</text>
        <text x={98} y={46} fontSize={16} fontWeight={700} className="font-sans" style={ZZ} opacity={0.55}>z</text>
      </>
    );
    if (sev) {
      front = (
        <>
          <path d="M 206 148 L 206 112" style={{ stroke: "var(--muted-dark)" }} strokeWidth={2.5} />
          <path d="M 206 112 h 22 l -6 8 l 6 8 h -22 Z" style={{ fill: SEVERITY_COLOR[sev] }} />
        </>
      );
    }
  } else {
    front = (
      <>
        <rect x={18} y={40} width={214} height={156} style={{ fill: "var(--ns-room)" }} opacity={0.85} />
        {Array.from({ length: 15 }, (_, k) => <rect key={k} x={18} y={44 + k * 10} width={214} height={6} style={{ fill: "var(--ns-rail)" }} />)}
        <rect x={18} y={40} width={214} height={156} fill="none" style={{ stroke: "var(--ns-rail)" }} strokeWidth={3} />
      </>
    );
  }

  return (
    <svg viewBox="0 0 250 230" className={className} aria-hidden="true">
      <ellipse cx={128} cy={216} rx={104} ry={8} style={{ fill: "var(--ns-shadow)" }} />
      {LIT.has(st) && (
        <>
          <circle cx={170} cy={118} r={110} style={{ fill: sc }} opacity={0.06} />
          <circle cx={170} cy={118} r={62} style={{ fill: sc }} opacity={0.07} />
        </>
      )}
      <g style={{ fill: dark }}>
        <rect x={28} y={112} width={13} height={86} rx={5} />
        <rect x={28} y={164} width={68} height={10} rx={4} />
        <rect x={58} y={174} width={6} height={40} />
      </g>
      <rect x={98} y={148} width={132} height={10} rx={3} style={{ fill: `hsl(${h} 18% 34%)` }} />
      <rect x={106} y={158} width={7} height={56} style={{ fill: `hsl(${h} 18% 24%)` }} />
      <rect x={214} y={158} width={7} height={56} style={{ fill: `hsl(${h} 18% 24%)` }} />
      <rect x={170} y={138} width={10} height={10} style={{ fill: "var(--ns-monitor)" }} />
      <rect x={134} y={86} width={84} height={54} rx={5} style={{ fill: "var(--ns-monitor)" }} />
      <rect x={139} y={91} width={74} height={44} rx={2} style={screen} />
      {screenArt}
      {fig && st !== "off" && <g transform="translate(4 4)" className={s.shadow}>{fig}</g>}
      {fig}
      {front}
    </svg>
  );
}
