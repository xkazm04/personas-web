import { FLEET } from "../fleet-data";
import { f1 } from "./palette";

export interface Meter {
  label: string;
  used: number;
  leftMs: number;
  /** Share of the window already gone, 0..1. */
  elapsed: number;
  /** Using more than the time gone: on course to run out early. */
  hot: boolean;
}

/** The subscription's two meters, aged by the simulated clock. */
export function meters(simMs: number): Meter[] {
  return FLEET.usage.windows.map((w) => {
    const leftMs = Math.max(0, w.resetsInMs - simMs);
    const elapsed = (w.windowMs - leftMs) / w.windowMs;
    return { label: w.label, used: w.utilizationPct, leftMs, elapsed, hot: w.utilizationPct > elapsed * 100 };
  });
}

interface MoonProps {
  cx: number;
  cy: number;
  r: number;
  five: Meter;
  seven: Meter;
  clipId?: string;
}

/**
 * The moon is the 5-hour meter (lit from below as it fills; the dashed line is
 * how much of the window has gone); its halo is the 7-day meter, with a tick
 * for the time gone. Amber when usage runs ahead of time.
 */
export default function Moon({ cx, cy, r, five, seven, clipId = "ns-moon-clip" }: MoonProps) {
  const R = r + 16;
  const C = 2 * Math.PI * R;
  const lit = Math.max(0, Math.min(1, five.used / 100));
  const e5y = cy + r - 2 * r * five.elapsed;
  const t = -Math.PI / 2 + seven.elapsed * 2 * Math.PI;
  const tick = `M ${f1(cx + Math.cos(t) * (R - 8))} ${f1(cy + Math.sin(t) * (R - 8))} L ${f1(cx + Math.cos(t) * (R + 8))} ${f1(cy + Math.sin(t) * (R + 8))}`;
  return (
    <g aria-hidden="true">
      <circle cx={cx} cy={cy} r={r * 3} style={{ fill: "var(--ns-moon)" }} opacity={0.06} />
      <circle cx={cx} cy={cy} r={r * 1.8} style={{ fill: "var(--ns-moon)" }} opacity={0.06} />
      <clipPath id={clipId}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
      <circle cx={cx} cy={cy} r={r} style={{ fill: "var(--ns-moon-dark)" }} />
      <g clipPath={`url(#${clipId})`}>
        <rect x={cx - r} y={f1(cy + r - 2 * r * lit)} width={2 * r} height={f1(2 * r * lit)} style={{ fill: "var(--ns-moon)", transition: "y .8s, height .8s" }} />
        <g style={{ fill: "var(--text-secondary)" }}>
          <circle cx={cx - 14} cy={cy + 12} r={8} opacity={0.35} />
          <circle cx={cx + 16} cy={cy + 22} r={5} opacity={0.3} />
          <circle cx={cx + 10} cy={cy - 18} r={6} opacity={0.22} />
        </g>
        <path d={`M ${cx - r} ${f1(e5y)} L ${cx + r} ${f1(e5y)}`} style={{ stroke: "var(--brand-cyan)" }} strokeWidth={2} strokeDasharray="4 3" />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" style={{ stroke: "var(--ns-moon)" }} strokeOpacity={0.4} strokeWidth={1.2} />
      <circle cx={cx} cy={cy} r={R} fill="none" style={{ stroke: "var(--text-secondary)" }} strokeOpacity={0.25} strokeWidth={4} />
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        style={{ stroke: seven.hot ? "var(--status-warning)" : "var(--brand-cyan)" }}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={`${f1((C * seven.used) / 100)} ${f1(C)}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <path d={tick} style={{ stroke: "var(--foreground)" }} strokeWidth={2.5} />
    </g>
  );
}
