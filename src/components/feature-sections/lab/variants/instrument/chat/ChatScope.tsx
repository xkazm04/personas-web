"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import Screen, { type Plot } from "../parts/Screen";
import Trace, { r2, smooth } from "../parts/Trace";
import { instrumentCopy } from "../copy";
import { AFTER_PCT, BEFORE_PCT, SAMPLES, TARGET, Y_MAX, levelMean, levelSamples } from "./signal";

const PAD = { l: 44, r: 70, t: 14, b: 30 };
const TICKS = [0, 10, 20, 30, 40];
const FG = "currentColor";

/**
 * CH1 of the Chat tab: the urgent-flag rate as a phosphor trace. Each applied
 * diff re-sweeps the trace at its new level (same signal, tighter spread);
 * the pre-refinement reading stays behind as a dashed ghost, the benchmark
 * band is the calibration window, and once the replay is measured a bracket
 * prints the delta between the two readings.
 */
export default function ChatScope({ level, done, still }: { level: number; done: boolean; still: boolean }) {
  const c = instrumentCopy.chat;
  return (
    <Screen label={c.screenLabel} pad={PAD} className="h-[15rem] stage:h-auto stage:min-h-0">
      {(plot, _box, glow) => {
        const y = (v: number) => r2(plot.y + plot.h * (1 - v / Y_MAX));
        const pts = (lv: number) =>
          levelSamples(lv).map((v, i) => ({ x: plot.x + (i / (SAMPLES - 1)) * plot.w, y: y(v) }));
        const right = plot.x + plot.w;
        return (
          <>
            <Axis plot={plot} y={y} />
            <rect
              x={plot.x}
              y={y(TARGET.hi)}
              width={plot.w}
              height={y(TARGET.lo) - y(TARGET.hi)}
              fill={tint("emerald", 14)}
              stroke={BRAND_VAR.emerald}
              strokeOpacity={0.5}
              strokeDasharray="3 4"
            />
            <text x={plot.x + 6} y={y(TARGET.hi) - 6} className="font-mono" fontSize={13} fill={BRAND_VAR.emerald}>
              {`${c.target} ${fillTemplate(c.targetBand, TARGET)}`}
            </text>

            {level > 0 && <Trace d={smooth(pts(0))} color={FG} glow={glow} dashed dim width={1.5} drawn={!still} />}
            <Trace key={level} d={smooth(pts(level))} color={BRAND_VAR.cyan} glow={glow} drawn={!still} duration={1.3} />

            {[1, 2].map((k) => (
              <motion.g
                key={k}
                initial={false}
                animate={{ opacity: level >= k ? 1 : 0, x: level >= k ? 0 : 8 }}
                transition={{ duration: still ? 0 : 0.4 }}
              >
                <path d={`M ${right + 4} ${y(levelMean(k))} l 7 -5 v 10 z`} fill={BRAND_VAR.cyan} />
                <text x={right + 15} y={y(levelMean(k)) + 4.5} className="font-mono" fontSize={13} fill={BRAND_VAR.cyan}>
                  {fillTemplate(c.adjust, { n: k })}
                </text>
              </motion.g>
            ))}

            <Bracket x={right - 16} y1={y(BEFORE_PCT)} y2={y(AFTER_PCT)} on={done} still={still} />
          </>
        );
      }}
    </Screen>
  );
}

function Axis({ plot, y }: { plot: Plot; y: (v: number) => number }) {
  return (
    <g aria-hidden className="font-mono" fontSize={13} fill="currentColor" fillOpacity={0.65}>
      {TICKS.map((t) => (
        <text key={t} x={plot.x - 8} y={y(t) + 4} textAnchor="end">
          {`${t}%`}
        </text>
      ))}
      <text x={plot.x} y={plot.y + plot.h + 20}>
        {instrumentCopy.chat.axis}
      </text>
    </g>
  );
}

/** The measured delta: a calibration bracket from the old reading to the new one. */
function Bracket({ x, y1, y2, on, still }: { x: number; y1: number; y2: number; on: boolean; still: boolean }) {
  const delta = Math.round((AFTER_PCT - BEFORE_PCT) * 10) / 10;
  const label = fillTemplate(instrumentCopy.chat.deltaPts, { value: delta.toFixed(1) });
  const mid = (y1 + y2) / 2;
  return (
    <motion.g initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: still ? 0 : 0.4 }}>
      <motion.path
        d={`M ${x - 6} ${y1} H ${x} V ${y2} H ${x - 6}`}
        fill="none"
        stroke={BRAND_VAR.amber}
        strokeWidth={1.75}
        initial={false}
        animate={{ pathLength: on ? 1 : 0 }}
        transition={{ duration: still ? 0 : 0.7, ease: "easeOut" }}
      />
      <rect x={x - 112} y={mid - 13} width={102} height={26} rx={5} fill="var(--background)" stroke={BRAND_VAR.amber} strokeOpacity={0.6} />
      <text x={x - 61} y={mid + 5} textAnchor="middle" className="font-mono" fontSize={14} fontWeight={700} fill={BRAND_VAR.amber}>
        {label}
      </text>
    </motion.g>
  );
}
