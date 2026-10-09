import { ATTENTION_COLOR, attentionOf, needsTone } from "../attention";
import type { FleetAgent } from "../fleet-data";
import { f1, hue as hueTone } from "./palette";
import { rankOf } from "./rank";
import s from "./night.module.css";

export type WindowAgent = Pick<FleetAgent, "enabled" | "state" | "progress" | "reviews" | "unreadMessages">;

interface WindowArtProps {
  a: WindowAgent;
  x: number;
  y: number;
  w: number;
  h: number;
  hue: number;
  still: boolean;
  /** Shown on needs and working windows when it fits (12px mono). */
  callsign?: string;
}

const INK = { fill: "var(--ns-ink)" };

/**
 * One agent's window, in the playground's shared state language:
 * working is lit cyan with the light rising as the run progresses and a figure
 * at the screen; needs is the loudest thing in the city, solid amber (red when
 * failed or critical) with a glyph for why; resting is dark glass with a faint
 * figure (a dim lamp when queued); off is shutters.
 */
export default function WindowArt({ a, x, y, w, h, hue, still, callsign }: WindowArtProps) {
  const att = attentionOf(a);
  const label = callsign && (att === "needs" || att === "working") && labelFits(callsign, w, h) ? callsign : null;
  const top = label ? LABEL_H : 0;
  const frame = hueTone(hue, 52, 52, 40);
  const cx = x + w / 2;
  const tone = att === "needs" ? ATTENTION_COLOR[needsTone(a)] : "";

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2} style={{ fill: "var(--ns-glass)" }} />
      {att === "working" && <Working x={x} y={y} w={w} h={h} cx={cx} progress={a.progress ?? 0} still={still} />}
      {att === "needs" && (
        <g>
          <rect x={x} y={y} width={w} height={h} style={{ fill: tone }} opacity={0.88} />
          <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} fill="none" style={{ stroke: "var(--foreground)" }} strokeWidth={1} opacity={0.35} />
          <Glyph rank={rankOf(a as FleetAgent)} cx={cx} cy={y + top + (h - top) / 2} size={Math.min(w, h - top) * 0.58} />
          {a.enabled && a.state === "running" && (
            <rect x={x} y={y + h - 3} width={w * (a.progress ?? 0)} height={3} style={{ fill: ATTENTION_COLOR.working }} />
          )}
        </g>
      )}
      {att === "resting" && <Resting x={x} y={y} w={w} h={h} cx={cx} queued={a.state === "queued"} />}
      {att === "off" &&
        Array.from({ length: Math.ceil(h / 5) }, (_, k) => (
          <rect key={k} x={x} y={y + k * 5} width={w} height={Math.min(3, h - k * 5)} style={{ fill: "var(--ns-rail)" }} />
        ))}
      {label && <CallsignLabel text={label} cx={cx} y={y} onTone={att === "needs"} />}
      <rect x={x} y={y} width={w} height={h} rx={2} fill="none" style={{ stroke: frame }} strokeWidth={2} />
      <rect x={x - 2} y={y + h} width={w + 4} height={3} style={{ fill: hueTone(hue, 40, 44, 34) }} />
      {a.unreadMessages.length > 0 && (
        <g opacity={0.85}>
          <rect x={x + 3} y={y + h - 11} width={12} height={8} rx={1} style={{ fill: "var(--foreground)" }} />
          <path d={`M ${x + 3} ${y + h - 11} l 6 4.5 l 6 -4.5`} style={{ stroke: "var(--background)" }} strokeWidth={1} fill="none" />
        </g>
      )}
    </g>
  );
}

const LABEL_H = 15;

/** Does a 12px mono callsign fit on this window (or desk) with room to spare? */
export function labelFits(callsign: string, w: number, h: number): boolean {
  return callsign.length * 7.2 + 4 <= w && h >= 34;
}

/**
 * The agent's callsign across the top of its window: ink straight on the lit
 * needs colour, or on a dark plate over a working window. 12px, never smaller.
 */
export function CallsignLabel({ text, cx, y, onTone }: { text: string; cx: number; y: number; onTone: boolean }) {
  const w = text.length * 7.2 + 4;
  return (
    <g pointerEvents="none">
      {!onTone && <rect x={cx - w / 2} y={y + 1.5} width={w} height={LABEL_H - 2} rx={2} style={{ fill: "var(--ns-panel)" }} />}
      <text x={cx} y={y + 12} textAnchor="middle" fontSize={12} fontWeight={700} className="font-mono" style={onTone ? INK : { fill: "var(--foreground)" }}>
        {text}
      </text>
    </g>
  );
}

/** Why it needs you: ! failed, ? waiting for an answer, a page for a draft,
 *  a flag for a review. Ink on the lit glass. */
export function Glyph({ rank, cx, cy, size }: { rank: number; cx: number; cy: number; size: number }) {
  const u = size / 10;
  if (rank === 0 || rank === 1) {
    return (
      <text x={cx} y={cy + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={900} className="font-sans" style={INK}>
        {rank === 0 ? "!" : "?"}
      </text>
    );
  }
  if (rank === 3) {
    return (
      <g style={INK}>
        <path d={`M ${cx - 3.5 * u} ${cy - 5 * u} h ${5 * u} l ${2 * u} ${2 * u} v ${8 * u} h ${-7 * u} Z`} />
        <path d={`M ${cx - 2 * u} ${cy - 1 * u} h ${4 * u} M ${cx - 2 * u} ${cy + 1.2 * u} h ${4 * u} M ${cx - 2 * u} ${cy + 3.4 * u} h ${3 * u}`} style={{ stroke: "var(--ns-glass)" }} strokeWidth={Math.max(1, u * 0.7)} />
      </g>
    );
  }
  return (
    <g style={INK}>
      <rect x={cx - 3.5 * u} y={cy - 5 * u} width={Math.max(1.5, u * 0.9)} height={10 * u} />
      <path d={`M ${cx - 2.6 * u} ${cy - 5 * u} h ${6.5 * u} l ${-1.6 * u} ${2.2 * u} l ${1.6 * u} ${2.2 * u} h ${-6.5 * u} Z`} />
    </g>
  );
}

function Working({ x, y, w, h, cx, progress, still }: { x: number; y: number; w: number; h: number; cx: number; progress: number; still: boolean }) {
  const fh = h * Math.max(0.08, progress);
  const hy = y + h * 0.62;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} style={{ fill: ATTENTION_COLOR.working }} opacity={0.28} />
      <rect className={still ? undefined : s.breath} x={x} y={f1(y + h - fh)} width={w} height={f1(fh)} fill="url(#ns-run-fill)" opacity={still ? 0.85 : undefined} />
      <circle cx={f1(cx - w * 0.1)} cy={f1(hy)} r={f1(w * 0.13)} style={INK} />
      <path d={`M ${f1(cx - w * 0.36)} ${y + h} Q ${f1(cx - w * 0.33)} ${f1(hy + w * 0.16)} ${f1(cx - w * 0.1)} ${f1(hy + w * 0.15)} Q ${f1(cx + w * 0.14)} ${f1(hy + w * 0.16)} ${f1(cx + w * 0.16)} ${y + h} Z`} style={INK} />
      <rect className={still ? undefined : s.typing} x={f1(cx + w * 0.14)} y={f1(y + h * 0.72)} width={f1(w * 0.26)} height={f1(Math.max(2, h * 0.06))} style={{ fill: "var(--foreground)" }} opacity={0.9} />
    </g>
  );
}

function Resting({ x, y, w, h, cx, queued }: { x: number; y: number; w: number; h: number; cx: number; queued: boolean }) {
  const hy = y + h * 0.66;
  return (
    <g>
      <g style={{ fill: "var(--foreground)" }} opacity={0.12}>
        <circle cx={f1(cx - w * 0.06)} cy={f1(hy)} r={f1(w * 0.12)} />
        <path d={`M ${f1(cx - w * 0.3)} ${y + h} Q ${f1(cx - w * 0.06)} ${f1(hy + w * 0.12)} ${f1(cx + w * 0.18)} ${y + h} Z`} />
      </g>
      {queued ? (
        <circle cx={f1(x + w * 0.76)} cy={f1(y + h * 0.3)} r={f1(Math.max(2, w * 0.08))} style={{ fill: "var(--brand-amber)" }} opacity={0.7} />
      ) : (
        <g style={{ fill: "var(--text-disabled)" }} opacity={0.3}>
          <path d={`M ${x} ${y} h ${f1(w * 0.26)} Q ${f1(x + w * 0.16)} ${f1(y + h * 0.55)} ${f1(x + w * 0.22)} ${y + h} H ${x} Z`} />
          <path d={`M ${x + w} ${y} h ${f1(-w * 0.26)} Q ${f1(x + w * 0.84)} ${f1(y + h * 0.55)} ${f1(x + w * 0.78)} ${y + h} H ${x + w} Z`} />
        </g>
      )}
    </g>
  );
}
