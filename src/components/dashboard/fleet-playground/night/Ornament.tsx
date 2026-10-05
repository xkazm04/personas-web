import { teamTones } from "./palette";
import s from "./night.module.css";

interface OrnamentProps {
  teamId: string;
  cx: number;
  top: number;
  w: number;
  hue: number;
  still: boolean;
}

const LEAF = "color-mix(in oklab, var(--brand-emerald) 70%, var(--background))";
const LAMP = "var(--ns-lamp)";
const BEACON = "var(--status-error)";

/**
 * The roof each team's building wears, drawn for its trade: a bank pediment,
 * a support tower with a headset dish, a glasshouse, a saw-tooth workshop,
 * a pennant tower, a domed courthouse, an observatory, a house, a water tower.
 * Stylised illustration.
 */
export default function Ornament({ teamId, cx, top, w, hue, still }: OrnamentProps) {
  const { body: B, roof: R, lamp: L, glow: LL } = teamTones(hue);
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const anim = (cls: string) => (still ? undefined : cls);

  switch (teamId) {
    case "finance":
      return (
        <g>
          <rect x={x0 - 8} y={top - 8} width={w + 16} height={10} style={{ fill: R }} />
          <path d={`M ${x0 - 10} ${top - 8} L ${cx} ${top - 50} L ${x1 + 10} ${top - 8} Z`} style={{ fill: B, stroke: R }} strokeWidth={3} />
          <path d={`M ${x0 + 16} ${top - 14} L ${cx} ${top - 40} L ${x1 - 16} ${top - 14} Z`} style={{ fill: R }} opacity={0.6} />
          <circle cx={cx} cy={top - 24} r={5} style={{ fill: L }} opacity={0.75} />
        </g>
      );
    case "support":
      return (
        <g>
          <rect x={x0 + 14} y={top - 18} width={w - 28} height={18} style={{ fill: B, stroke: R }} strokeWidth={2} />
          <rect x={cx - 2} y={top - 74} width={4} height={56} style={{ fill: R }} />
          <path d={`M ${cx - 24} ${top - 64} A 24 24 0 0 1 ${cx + 24} ${top - 64}`} fill="none" style={{ stroke: L }} strokeWidth={4} />
          <rect x={cx - 30} y={top - 70} width={10} height={16} rx={4} style={{ fill: L }} />
          <rect x={cx + 20} y={top - 70} width={10} height={16} rx={4} style={{ fill: L }} />
          <path d={`M ${cx + 25} ${top - 54} q -4 10 -16 12`} fill="none" style={{ stroke: L }} strokeWidth={2} />
        </g>
      );
    case "growth":
      return (
        <g>
          <path d={`M ${x0} ${top} Q ${cx} ${top - 74} ${x1} ${top} Z`} style={{ fill: `color-mix(in oklab, ${L} 22%, transparent)`, stroke: R }} strokeWidth={3} />
          {[1, 2, 3, 4].map((k) => {
            const xx = x0 + (w * k) / 5;
            return <path key={k} d={`M ${xx} ${top} L ${cx + (xx - cx) * 0.45} ${top - 34}`} style={{ stroke: R }} strokeWidth={1.5} />;
          })}
          <path d={`M ${cx} ${top - 36} q -2 -16 -12 -24`} style={{ stroke: LEAF }} strokeWidth={3} fill="none" />
          <ellipse cx={cx - 14} cy={top - 62} rx={9} ry={5} style={{ fill: LEAF }} transform={`rotate(-30 ${cx - 14} ${top - 62})`} />
          <path d={`M ${cx} ${top - 36} q 4 -14 14 -18`} style={{ stroke: LEAF }} strokeWidth={3} fill="none" />
          <ellipse cx={cx + 16} cy={top - 56} rx={8} ry={4.5} style={{ fill: LEAF }} transform={`rotate(25 ${cx + 16} ${top - 56})`} />
        </g>
      );
    case "eng": {
      const tw = w / 3;
      let d = `M ${x0} ${top}`;
      for (let k = 0; k < 3; k++) d += ` L ${x0 + k * tw} ${top - 30} L ${x0 + (k + 1) * tw} ${top}`;
      return (
        <g>
          <path d={`${d} Z`} style={{ fill: B, stroke: R }} strokeWidth={2.5} />
          {[0, 1, 2].map((k) => (
            <rect key={k} x={x0 + k * tw + 1.5} y={top - 26} width={4} height={24} style={{ fill: LL }} opacity={0.45} />
          ))}
          <rect x={x1 - 30} y={top - 70} width={15} height={58} style={{ fill: R }} />
          <circle className={anim(s.smoke)} cx={x1 - 22} cy={top - 78} r={7} style={{ fill: "var(--text-secondary)" }} opacity={still ? 0.25 : undefined} />
          {!still && <circle className={s.smoke} style={{ animationDelay: "-3s", fill: "var(--text-secondary)" }} cx={x1 - 22} cy={top - 78} r={7} />}
        </g>
      );
    }
    case "sales":
      return (
        <g>
          <rect x={cx - 30} y={top - 14} width={60} height={14} style={{ fill: R }} />
          <path d={`M ${cx - 20} ${top - 14} L ${cx} ${top - 76} L ${cx + 20} ${top - 14} Z`} style={{ fill: B, stroke: R }} strokeWidth={2.5} />
          <rect x={cx - 1} y={top - 106} width={2.5} height={32} style={{ fill: L }} />
          <path className={anim(s.wave)} d={`M ${cx + 1.5} ${top - 106} L ${cx + 30} ${top - 99} L ${cx + 1.5} ${top - 92} Z`} style={{ fill: LL }} />
        </g>
      );
    case "legal":
      return (
        <g>
          <rect x={x0 - 6} y={top - 8} width={w + 12} height={8} style={{ fill: R }} />
          <rect x={cx - 36} y={top - 26} width={72} height={18} style={{ fill: B, stroke: R }} strokeWidth={2} />
          {[-2, -1, 0, 1, 2].map((k) => (
            <rect key={k} x={cx + k * 13 - 2} y={top - 24} width={4} height={14} style={{ fill: R }} />
          ))}
          <path d={`M ${cx - 34} ${top - 26} A 34 32 0 0 1 ${cx + 34} ${top - 26} Z`} style={{ fill: B, stroke: R }} strokeWidth={2.5} />
          <path d={`M ${cx - 14} ${top - 50} A 22 22 0 0 1 ${cx + 6} ${top - 56}`} fill="none" style={{ stroke: LL }} strokeWidth={2} opacity={0.5} />
          <rect x={cx - 1.5} y={top - 72} width={3} height={16} style={{ fill: L }} />
          <circle cx={cx} cy={top - 74} r={3.5} style={{ fill: LL }} />
        </g>
      );
    case "data":
      return (
        <g>
          <rect x={cx - 44} y={top - 10} width={88} height={10} style={{ fill: R }} />
          <path d={`M ${cx - 40} ${top - 10} A 40 40 0 0 1 ${cx + 40} ${top - 10} Z`} style={{ fill: B, stroke: R }} strokeWidth={2.5} />
          <path d={`M ${cx - 4} ${top - 49} L ${cx + 6} ${top - 49} L ${cx + 8} ${top - 12} L ${cx - 6} ${top - 12} Z`} style={{ fill: "var(--ns-ink)" }} opacity={0.75} />
          <rect x={cx} y={top - 46} width={46} height={12} rx={3} style={{ fill: L }} transform={`rotate(-38 ${cx} ${top - 40})`} />
          <circle cx={cx} cy={top - 40} r={5} style={{ fill: LL }} />
        </g>
      );
    case "people":
      return (
        <g>
          <path d={`M ${x0 - 10} ${top + 2} L ${cx} ${top - 52} L ${x1 + 10} ${top + 2} Z`} style={{ fill: B, stroke: R }} strokeWidth={3} />
          <rect x={x1 - 34} y={top - 46} width={14} height={26} style={{ fill: R }} />
          <circle cx={cx} cy={top - 22} r={9} style={{ fill: LAMP }} opacity={0.6} />
          <path d={`M ${cx} ${top - 31} L ${cx} ${top - 13} M ${cx - 9} ${top - 22} L ${cx + 9} ${top - 22}`} style={{ stroke: B }} strokeWidth={2} />
        </g>
      );
    case "infra":
      return (
        <g>
          <path d={`M ${cx - 22} ${top} L ${cx - 14} ${top - 34} M ${cx + 22} ${top} L ${cx + 14} ${top - 34} M ${cx - 18} ${top - 16} L ${cx + 18} ${top - 16}`} style={{ stroke: R }} strokeWidth={3} />
          <rect x={cx - 28} y={top - 66} width={56} height={32} rx={6} style={{ fill: B, stroke: R }} strokeWidth={2.5} />
          <path d={`M ${cx - 28} ${top - 55} L ${cx + 28} ${top - 55} M ${cx - 28} ${top - 45} L ${cx + 28} ${top - 45}`} style={{ stroke: R }} strokeWidth={1.5} />
          <rect x={cx - 1.5} y={top - 98} width={3} height={32} style={{ fill: R }} />
          <circle className={anim(s.slowBlink)} cx={cx} cy={top - 100} r={4} style={{ fill: BEACON }} />
        </g>
      );
    default:
      return <rect x={x0} y={top - 10} width={w} height={10} style={{ fill: R }} />;
  }
}

/** Street-level dressing: a garden and lamp by the house, steps by the bank and court. */
export function GroundDecor({ teamId, cx, w, ground, hue }: { teamId: string; cx: number; w: number; ground: number; hue: number }) {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  if (teamId === "people") {
    return (
      <g>
        <circle cx={x0 - 8} cy={ground - 10} r={12} style={{ fill: "color-mix(in oklab, var(--brand-emerald) 22%, var(--background))" }} />
        <circle cx={x0 - 20} cy={ground - 6} r={9} style={{ fill: "color-mix(in oklab, var(--brand-emerald) 16%, var(--background))" }} />
        <rect x={x1 + 9} y={ground - 64} width={3} height={64} style={{ fill: "var(--ns-rail)" }} />
        <circle cx={x1 + 10.5} cy={ground - 66} r={5} style={{ fill: LAMP }} />
        <circle cx={x1 + 10.5} cy={ground - 66} r={22} style={{ fill: LAMP }} opacity={0.1} />
      </g>
    );
  }
  if (teamId === "finance" || teamId === "legal") {
    return <rect x={x0 - 10} y={ground - 6} width={w + 20} height={6} style={{ fill: teamTones(hue).roof }} />;
  }
  return null;
}
