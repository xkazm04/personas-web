import { topSeverity, type FleetAgent } from "../fleet-data";
import { SEVERITY_COLOR, STATE_COLOR, f1, hue as hueTone, windowState } from "./palette";
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
}

const INK = { fill: "var(--ns-ink)" };
const tint = (c: string, pct: number) => ({ fill: `color-mix(in oklab, ${c} ${pct}%, var(--ns-glass))` });

/**
 * One agent's window. What sits in it is the agent's state: rising light while
 * it works, a slumped figure on red glass when it failed, a raised lantern when
 * it waits for you, paper when a draft is ready, a dim lamp in the queue,
 * curtains when idle, shutters when switched off. A flag on the frame carries
 * pending reviews in their top severity; a faint envelope means unread mail.
 */
export default function WindowArt({ a, x, y, w, h, hue, still }: WindowArtProps) {
  const st = windowState(a);
  const frame = hueTone(hue, 52, 52, 40);
  const cx = x + w / 2;
  const sev = topSeverity({ reviews: a.reviews } as FleetAgent);

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2} style={tint(STATE_COLOR[st], st === "idle" || st === "off" ? 4 : 16)} />
      {st === "running" && <Running x={x} y={y} w={w} h={h} cx={cx} progress={a.progress ?? 0} still={still} />}
      {(st === "idle" || st === "attention") && (
        <g style={{ fill: "var(--text-disabled)" }} opacity={0.4}>
          <path d={`M ${x} ${y} L ${f1(x + w * 0.3)} ${y} Q ${f1(x + w * 0.18)} ${f1(y + h * 0.55)} ${f1(x + w * 0.26)} ${y + h} L ${x} ${y + h} Z`} />
          <path d={`M ${x + w} ${y} L ${f1(x + w * 0.7)} ${y} Q ${f1(x + w * 0.82)} ${f1(y + h * 0.55)} ${f1(x + w * 0.74)} ${y + h} L ${x + w} ${y + h} Z`} />
        </g>
      )}
      {st === "queued" && (
        <g>
          <circle cx={cx} cy={f1(y + h * 0.3)} r={f1(w * 0.42)} style={{ fill: STATE_COLOR.queued }} opacity={0.18} />
          <circle cx={cx} cy={f1(y + h * 0.3)} r={f1(w * 0.09)} style={{ fill: STATE_COLOR.queued }} />
          <path d={`M ${f1(cx - w * 0.14)} ${f1(y + h * 0.22)} L ${f1(cx + w * 0.14)} ${f1(y + h * 0.22)} L ${cx} ${f1(y + h * 0.1)} Z`} style={{ fill: STATE_COLOR.queued }} opacity={0.7} />
        </g>
      )}
      {st === "failed" && (
        <g>
          <rect x={x} y={y} width={w} height={h} style={{ fill: STATE_COLOR.failed }} opacity={0.42} />
          <path d={`M ${f1(x + w * 0.2)} ${y + 2} L ${f1(x + w * 0.45)} ${f1(y + h * 0.4)} L ${f1(x + w * 0.32)} ${f1(y + h * 0.55)} L ${f1(x + w * 0.6)} ${y + h - 2}`} style={{ stroke: "var(--foreground)" }} strokeWidth={1.6} fill="none" opacity={0.85} />
          <circle cx={f1(cx + w * 0.1)} cy={f1(y + h * 0.78)} r={f1(w * 0.12)} style={INK} />
          <path d={`M ${f1(x + w * 0.1)} ${y + h} Q ${f1(x + w * 0.2)} ${f1(y + h * 0.7)} ${f1(cx)} ${f1(y + h * 0.82)} L ${f1(cx)} ${y + h} Z`} style={INK} />
        </g>
      )}
      {st === "input_required" && (
        <g>
          <rect x={x} y={y} width={w} height={h} style={{ fill: STATE_COLOR.input_required }} opacity={0.38} />
          <circle cx={f1(cx - w * 0.1)} cy={f1(y + h * 0.52)} r={f1(w * 0.12)} style={INK} />
          <path d={`M ${f1(cx - w * 0.36)} ${y + h} Q ${f1(cx - w * 0.32)} ${f1(y + h * 0.66)} ${f1(cx - w * 0.1)} ${f1(y + h * 0.66)} Q ${f1(cx + w * 0.1)} ${f1(y + h * 0.66)} ${f1(cx + w * 0.14)} ${y + h} Z`} style={INK} />
          <path d={`M ${f1(cx + w * 0.02)} ${f1(y + h * 0.68)} L ${f1(cx + w * 0.22)} ${f1(y + h * 0.3)}`} style={{ stroke: "var(--ns-ink)" }} strokeWidth={f1(w * 0.09)} strokeLinecap="round" />
          <circle cx={f1(cx + w * 0.25)} cy={f1(y + h * 0.24)} r={f1(w * 0.11)} style={{ fill: "var(--ns-lamp)" }} />
        </g>
      )}
      {st === "draft_ready" && (
        <g>
          <rect x={x} y={y} width={w} height={h} style={{ fill: STATE_COLOR.draft_ready }} opacity={0.34} />
          <g transform={`rotate(-8 ${cx} ${f1(y + h * 0.5)})`}>
            <rect x={f1(cx - w * 0.22)} y={f1(y + h * 0.22)} width={f1(w * 0.44)} height={f1(h * 0.52)} style={{ fill: "var(--ns-paper)" }} />
            <path d={`M ${f1(cx - w * 0.14)} ${f1(y + h * 0.34)} h ${f1(w * 0.28)} M ${f1(cx - w * 0.14)} ${f1(y + h * 0.44)} h ${f1(w * 0.28)} M ${f1(cx - w * 0.14)} ${f1(y + h * 0.54)} h ${f1(w * 0.18)}`} style={{ stroke: STATE_COLOR.draft_ready }} strokeWidth={1.5} />
          </g>
        </g>
      )}
      {st === "off" && (
        <g>
          {Array.from({ length: Math.ceil(h / 5) }, (_, k) => (
            <rect key={k} x={x} y={y + k * 5} width={w} height={Math.min(3, h - k * 5)} style={{ fill: "var(--ns-rail)" }} />
          ))}
        </g>
      )}
      <rect x={x} y={y} width={w} height={h} rx={2} fill="none" style={{ stroke: frame }} strokeWidth={2} />
      {st !== "off" && <path d={`M ${x} ${f1(y + h * 0.38)} L ${x + w} ${f1(y + h * 0.38)}`} style={{ stroke: frame }} strokeWidth={1} opacity={0.55} />}
      <rect x={x - 3} y={y + h} width={w + 6} height={4} style={{ fill: hueTone(hue, 40, 44, 34) }} />
      {st === "failed" && <circle className={still ? undefined : s.blink} cx={x + w - 3} cy={y + h - 2} r={4.5} style={{ fill: STATE_COLOR.failed }} />}
      {sev && (
        <g>
          <path d={`M ${x + w + 1} ${y + 4} L ${x + w + 1} ${y - 14}`} style={{ stroke: "var(--muted-dark)" }} strokeWidth={1.5} />
          <path d={`M ${x + w + 1} ${y - 15} h 19 l -4 9 l 4 9 h -19 Z`} style={{ fill: SEVERITY_COLOR[sev] }} />
          <text x={x + w + 9} y={y - 1.5} textAnchor="middle" fontSize={16} fontWeight={800} style={{ fill: "var(--background)" }} className="font-sans">
            {a.reviews.length}
          </text>
        </g>
      )}
      {a.unreadMessages.length > 0 && (
        <g opacity={0.7}>
          <rect x={x + 3} y={y + h - 11} width={12} height={8} rx={1} style={{ fill: "var(--muted-dark)" }} />
          <path d={`M ${x + 3} ${y + h - 11} l 6 4.5 l 6 -4.5`} style={{ stroke: "var(--background)" }} strokeWidth={1} fill="none" />
        </g>
      )}
    </g>
  );
}

function Running({ x, y, w, h, cx, progress, still }: { x: number; y: number; w: number; h: number; cx: number; progress: number; still: boolean }) {
  const fh = h * Math.max(0.06, progress);
  const hy = y + h * 0.56;
  return (
    <g>
      <rect className={still ? undefined : s.breath} x={x} y={f1(y + h - fh)} width={w} height={f1(fh)} fill="url(#ns-run-fill)" opacity={still ? 0.8 : undefined} />
      <circle cx={f1(cx - w * 0.08)} cy={f1(hy)} r={f1(w * 0.12)} style={INK} />
      <path d={`M ${f1(cx - w * 0.32)} ${y + h} Q ${f1(cx - w * 0.3)} ${f1(hy + w * 0.14)} ${f1(cx - w * 0.08)} ${f1(hy + w * 0.13)} Q ${f1(cx + w * 0.14)} ${f1(hy + w * 0.14)} ${f1(cx + w * 0.16)} ${y + h} Z`} style={INK} />
      <rect x={f1(cx + w * 0.16)} y={f1(y + h * 0.66)} width={f1(w * 0.22)} height={f1(h * 0.16)} style={{ fill: "color-mix(in oklab, var(--brand-cyan) 60%, var(--foreground))" }} opacity={0.85} />
    </g>
  );
}
