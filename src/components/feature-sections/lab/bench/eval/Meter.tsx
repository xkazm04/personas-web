"use client";

import { motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { r2 } from "../parts/Trace";
import Ticker from "../parts/Ticker";

/** Dial range: every eval reading sits in 60-100. */
const LO = 60;
const HI = 100;
const CX = 100;
const CY = 104;
const R = 80;

/** Score -> needle rotation, degrees from straight up (-90 = LO, +90 = HI). */
const angle = (v: number) => -90 + ((Math.min(HI, Math.max(LO, v)) - LO) / (HI - LO)) * 180;
const polar = (v: number, r: number) => {
  const a = ((angle(v) - 90) * Math.PI) / 180;
  return { x: r2(CX + Math.cos(a) * r), y: r2(CY + Math.sin(a) * r) };
};
const TICKS = Array.from({ length: (HI - LO) / 2 + 1 }, (_, i) => LO + i * 2);

function arc(from: number, to: number, r: number) {
  const a = polar(Math.min(from, to), r);
  const b = polar(Math.max(from, to), r);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 0 1 ${b.x} ${b.y}`;
}

/**
 * One analogue meter of the bank. The needle springs up from the stop to the
 * live version's score and, while the bench is running, quivers like a live
 * reading; the engraved tick is the reference version's score, and the lit
 * arc between them is the delta (emerald gain, rose loss).
 */
export default function Meter({
  label,
  score,
  baseline,
  still,
  run,
  index,
}: {
  label: string;
  score: number;
  baseline: number;
  still: boolean;
  run: boolean;
  index: number;
}) {
  const delta = score - baseline;
  const k = delta < 0 ? "rose" : "emerald";
  const ref = polar(baseline, R + 6);
  const refIn = polar(baseline, R - 12);
  return (
    <div className="flex min-h-0 flex-col rounded-lg border border-glass bg-foreground/[0.025] px-2 pb-2 pt-1">
      <svg aria-hidden viewBox="0 0 200 122" className="h-auto w-full text-foreground stage:min-h-0 stage:flex-1">
        <path d={arc(LO, HI, R)} fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={1.5} />
        <g stroke="currentColor">
          {TICKS.map((t) => {
            const major = t % 10 === 0;
            const a = polar(t, R);
            const b = polar(t, R - (major ? 10 : 5));
            return <line key={t} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeOpacity={major ? 0.55 : 0.25} strokeWidth={major ? 1.5 : 1} />;
          })}
        </g>
        <g className="font-mono" fontSize={16} fill="currentColor" fillOpacity={0.65} textAnchor="middle">
          <text x={CX - R} y={CY + 14}>
            {LO}
          </text>
          <text x={CX + R} y={CY + 14}>
            {HI}
          </text>
        </g>
        <motion.path
          d={arc(baseline, score, R + 1)}
          fill="none"
          stroke={BRAND_VAR[k]}
          strokeWidth={5}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ duration: still ? 0 : 0.5, delay: still ? 0 : 0.6 + index * 0.08 }}
        />
        <line x1={ref.x} y1={ref.y} x2={refIn.x} y2={refIn.y} stroke="currentColor" strokeWidth={2.5} strokeOpacity={0.8} />
        <g transform={`translate(${CX} ${CY})`}>
          <motion.g
            initial={{ rotate: still ? angle(score) : -90 }}
            animate={{ rotate: angle(score) }}
            transition={still ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 9, delay: 0.15 + index * 0.08 }}
          >
            <motion.g
              animate={run ? { rotate: [0, 0.9, -0.6, 0.3, 0] } : { rotate: 0 }}
              transition={run ? { duration: 2.2 + index * 0.35, repeat: Infinity, ease: "easeInOut", delay: 1.6 } : { duration: 0.3 }}
            >
              <circle r={R + 8} fill="none" />
              <line x1={0} y1={8} x2={0} y2={-(R - 4)} stroke={BRAND_VAR[k]} strokeWidth={2.25} strokeLinecap="round" />
            </motion.g>
          </motion.g>
          <circle r={5} fill="var(--background)" stroke={BRAND_VAR[k]} strokeWidth={2} />
        </g>
      </svg>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 px-1 font-mono">
        <span className="text-sm uppercase tracking-[0.12em] text-foreground/80">{label}</span>
        <span className="flex items-baseline gap-2 tabular-nums">
          <span className="text-base font-semibold text-foreground">
            <Ticker value={score} from={LO} />
          </span>
          <span className="text-sm font-semibold" style={{ color: BRAND_VAR[k] }}>
            <Ticker value={delta} signed />
          </span>
        </span>
      </div>
    </div>
  );
}
