import { ATTENTION_COLOR, attentionOf, needsTone } from "../attention";
import type { FleetAgent } from "../fleet-data";
import { hue as hueTone } from "./palette";
import { rankOf } from "./useNightSim";
import { Glyph } from "./WindowArt";
import s from "./night.module.css";

/**
 * One workstation on the open-plan floor, seen from behind the chair, in the
 * shared state language: working is a persona typing at a lit cyan screen
 * with its progress along the desk edge; needs is a raised lantern in the needs
 * colour with a halo and a badge saying why; resting is a dim screen and a
 * slumped persona (a lamp when queued); off is a covered desk and an empty
 * chair. Drawn in a 100 x 88 box. Stylised illustration.
 */
export default function DeskArt({ a, still }: { a: FleetAgent; still: boolean }) {
  const att = attentionOf(a);
  const h = a.hue;
  const tone = att === "needs" ? ATTENTION_COLOR[needsTone(a)] : ATTENTION_COLOR.working;
  const head = `hsl(${h} 42% 68%)`;
  const body = `hsl(${h} 42% 42%)`;
  const hair = `hsl(${h} 30% 20%)`;
  const screen =
    att === "working" ? "var(--brand-cyan)" : att === "needs" ? tone : att === "off" ? "var(--ns-monitor)" : "color-mix(in oklab, var(--ns-monitor) 70%, var(--foreground))";
  const slump = att === "resting" ? 5 : 0;

  return (
    <g>
      <ellipse cx={50} cy={80} rx={42} ry={6} style={{ fill: "var(--ns-shadow)" }} />
      {att === "needs" && <circle className={still ? undefined : s.beacon} cx={50} cy={44} r={44} style={{ fill: tone }} opacity={0.2} />}
      {att === "working" && <path d="M 30 24 L 70 24 L 82 50 L 18 50 Z" style={{ fill: "var(--brand-cyan)" }} opacity={0.12} />}
      <rect x={8} y={8} width={84} height={30} rx={4} style={{ fill: hueTone(h, 30, 42, 26) }} />
      <rect x={28} y={4} width={44} height={20} rx={2.5} style={{ fill: "var(--ns-monitor)" }} />
      <rect x={30.5} y={6.5} width={39} height={15} rx={1.5} style={{ fill: screen }} opacity={att === "working" || att === "needs" ? 0.9 : 1} />
      {att === "working" && <rect className={still ? undefined : s.typing} x={34} y={11} width={24} height={2.5} style={{ fill: "var(--background)" }} opacity={0.75} />}
      <rect x={47} y={24} width={6} height={4} style={{ fill: "var(--ns-monitor)" }} />
      <rect x={36} y={30} width={28} height={5} rx={1.5} style={{ fill: "var(--ns-monitor)" }} opacity={0.8} />
      {a.state === "queued" && a.enabled && <circle cx={16} cy={16} r={3.5} style={{ fill: "var(--brand-amber)" }} />}

      {att === "off" ? (
        <g>
          <rect x={6} y={6} width={88} height={34} rx={5} style={{ fill: "var(--ns-room)" }} opacity={0.92} />
          {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={6} y={9 + k * 5.5} width={88} height={2.2} style={{ fill: "var(--ns-rail)" }} />)}
          <circle cx={62} cy={70} r={12} fill="none" style={{ stroke: hair }} strokeWidth={3} />
        </g>
      ) : (
        <g>
          <circle cx={50} cy={70} r={13} style={{ fill: hair }} />
          <ellipse cx={50} cy={60 + slump * 0.4} rx={17} ry={9} style={{ fill: body }} />
          {att === "working" && (
            <path d="M 37 58 Q 36 44 42 35 M 63 58 Q 64 44 58 35" fill="none" style={{ stroke: body }} strokeWidth={6} strokeLinecap="round" />
          )}
          {att === "needs" && (
            <g>
              <path d="M 62 56 Q 72 46 76 30" fill="none" style={{ stroke: body }} strokeWidth={6} strokeLinecap="round" />
              <circle cx={77} cy={25} r={6.5} style={{ fill: tone, stroke: "var(--background)" }} strokeWidth={1.2} />
            </g>
          )}
          <circle cx={50 + slump} cy={50 + slump} r={8.5} style={{ fill: head }} />
          <path d={`M ${41.5 + slump} ${48 + slump} A 8.5 8.5 0 0 1 ${58.5 + slump} ${48 + slump} Z`} style={{ fill: hair }} />
        </g>
      )}

      {att === "working" && (
        <g>
          <rect x={10} y={41} width={80} height={3} rx={1.5} style={{ fill: "var(--ns-rail)" }} />
          <rect x={10} y={41} width={80 * (a.progress ?? 0)} height={3} rx={1.5} style={{ fill: "var(--brand-cyan)", transition: "width .8s" }} />
        </g>
      )}
      {att === "needs" && (
        <g>
          <circle cx={87} cy={13} r={11} style={{ fill: tone, stroke: "var(--background)" }} strokeWidth={1.5} />
          <Glyph rank={rankOf(a)} cx={87} cy={13} size={14} />
        </g>
      )}
      {a.unreadMessages.length > 0 && (
        <g>
          <rect x={10} y={42} width={13} height={9} rx={1.2} style={{ fill: "var(--foreground)" }} opacity={0.85} />
          <path d="M 10 42 l 6.5 5 l 6.5 -5" fill="none" style={{ stroke: "var(--background)" }} strokeWidth={1} />
        </g>
      )}
    </g>
  );
}
