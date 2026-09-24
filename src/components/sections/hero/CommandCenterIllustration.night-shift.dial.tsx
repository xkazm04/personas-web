"use client";

import { motion, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { AWAY_FROM, C, NOW, R, RUNS, VB, arcPath, innerAnchor, polar } from "./CommandCenterIllustration.night-shift.data";

const HOUR_LABELS = [0, 6, 12, 18];
const MONO = "var(--font-mono)";
const hub = { transformBox: "view-box", transformOrigin: `${C}px ${C}px` } as const;
const ping = { transformBox: "fill-box", transformOrigin: "center" } as const;

/**
 * The 24h dial: midnight at the top, clockwise. Informative marks only - four
 * run slots (filled = finished, dashed = scheduled), the hand at "now", and the
 * band you were away. Hour ticks are the scale; the ring is otherwise empty,
 * because nothing runs between slots.
 */
export default function NightShiftDial({
  rotate,
  passed,
  clock,
  armed,
}: {
  rotate: MotionValue<number>;
  passed: number;
  clock: string;
  armed: boolean;
}) {
  const cyan = BRAND_VAR.cyan;
  return (
    <svg viewBox={`0 0 ${VB} ${VB}`} width={VB} height={VB} className="block h-auto w-full max-w-[232px]" aria-hidden="true">
      {/* scale: 24 hour ticks, 00/06/12/18 labelled */}
      {Array.from({ length: 24 }, (_, h) => {
        const major = h % 6 === 0;
        const a = polar(R + (major ? 6 : 8), h);
        const b = polar(R + (major ? 14 : 12), h);
        return (
          <line
            key={h}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="var(--muted-dark)"
            strokeOpacity={major ? 0.7 : 0.3}
            strokeWidth={major ? 1.2 : 1}
          />
        );
      })}
      {HOUR_LABELS.map((h) => {
        const p = polar(R + 24, h);
        return (
          <text key={h} x={p.x} y={p.y + 4} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="var(--muted-dark)">
            {String(h).padStart(2, "0")}
          </text>
        );
      })}

      {/* the ring, and the stretch of it you were away for */}
      <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(var(--surface-overlay), 0.12)" strokeWidth={1} />
      <path d={arcPath(R, AWAY_FROM, NOW)} fill="none" stroke={tint("cyan", 14)} strokeWidth={12} strokeLinecap="round" />

      {/* inner face behind the clock readout */}
      <circle cx={C} cy={C} r={38} fill="rgba(var(--surface-overlay), 0.03)" stroke="rgba(var(--surface-overlay), 0.08)" />

      {/* the hand: a rim pointer (points at 00 at rotate 0) so it never crosses a
          slot label; the parent drives it once from 21:30 to now */}
      <motion.g style={{ ...hub, rotate }}>
        <line x1={C} y1={C - R + 10} x2={C} y2={C - R - 15} stroke={cyan} strokeWidth={2} strokeLinecap="round" />
        <circle cx={C} cy={C - R} r={3.5} fill={cyan} stroke="var(--background)" strokeWidth={1.5} />
      </motion.g>

      {/* run slots */}
      {RUNS.map((run, i) => {
        const done = i < passed;
        const p = polar(R, run.hour);
        const t = polar(R - 19, run.hour);
        const color = BRAND_VAR[run.brand];
        return (
          <g key={run.time}>
            {armed && done && (
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={6}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                style={ping}
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 2.6, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={6}
              fill={done ? color : "var(--background)"}
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray={done ? undefined : "2.4 2"}
            />
            <text
              x={t.x}
              y={t.y + 4}
              textAnchor={innerAnchor(run.hour)}
              fontSize={12}
              fontFamily={MONO}
              fill={done ? "var(--foreground)" : "var(--muted-dark)"}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {run.time}
            </text>
          </g>
        );
      })}

      {/* now */}
      <text x={C} y={C + 3} textAnchor="middle" fontSize={20} fontWeight={700} fontFamily={MONO} fill="var(--foreground)" style={{ fontVariantNumeric: "tabular-nums" }}>
        {clock}
      </text>
      <text x={C} y={C + 20} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={cyan}>
        now
      </text>
    </svg>
  );
}
