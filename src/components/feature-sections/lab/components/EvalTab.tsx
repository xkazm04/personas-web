"use client";

import { motion } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { Radar } from "lucide-react";
import { EVAL_DIMENSIONS, EVAL_SAMPLE_RUNS } from "../data";
import { fillTemplate } from "@/lib/fillTemplate";
import TabBackdrop from "./TabBackdrop";
import { useStageBox } from "../useStageBox";
import { labSectionCopy } from "@/i18n/pending/labSection";

export default function EvalTab() {
  const copy = labSectionCopy.eval;
  const reduced = useStillMotion();
  // On the desktop stage the radar is height-bound: crop the viewBox to the
  // chart and its labels, and size the labels to read ~15px at any height.
  const [boxRef, box] = useStageBox<HTMLDivElement>();
  const labelSize = box ? Math.min(24, Math.max(16, (15 * 340) / box.h)) : 16;
  const cx = 200;
  const cy = 200;
  const rMax = 130;
  const n = EVAL_DIMENSIONS.length;

  const axisPoint = (i: number, r: number) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    };
  };

  const scorePath = (values: number[]) =>
    values
      .map((v, i) => {
        const p = axisPoint(i, (v / 100) * rMax);
        return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
      })
      .join(" ") + " Z";

  const baselineValues = EVAL_DIMENSIONS.map((d) => d.baseline);
  const scoreValues = EVAL_DIMENSIONS.map((d) => d.score);

  const avgScore = Math.round(scoreValues.reduce((s, v) => s + v, 0) / n);
  const avgBaseline = Math.round(baselineValues.reduce((s, v) => s + v, 0) / n);

  return (
    <div className="relative flex flex-col rounded-xl border border-foreground/[0.10] bg-background/80 backdrop-blur-xl overflow-hidden stage:h-full">
      <TabBackdrop tab="eval" />
      <div className="relative flex items-center justify-between border-b border-foreground/[0.06] px-5 py-3 stage:py-2">
        <div className="flex items-center gap-2">
          <Radar className="h-4 w-4 text-brand-emerald" />
          <span className="text-base font-mono font-semibold text-foreground uppercase tracking-wider">
            {copy.title}
          </span>
        </div>
        <div className="flex items-center gap-4 text-base font-mono">
          <span className="text-foreground/70">
            {copy.avg}{" "}
            <span className="text-brand-emerald font-semibold tabular-nums">
              {avgScore}
            </span>
          </span>
          <span className="text-foreground/70">
            {copy.deltaVsBaseline}{" "}
            <span className="text-brand-emerald font-semibold">
              +{avgScore - avgBaseline}
            </span>
          </span>
        </div>
      </div>

      <div className="relative grid md:grid-cols-[1fr_220px] gap-4 p-5 stage:min-h-0 stage:flex-1 stage:grid-cols-[1fr_15rem] stage:p-3">
        <div ref={boxRef} className="flex items-center justify-center stage:relative stage:min-h-0">
          <svg viewBox={box ? "20 24 368 340" : "0 0 400 400"} className="w-full max-w-[340px] h-auto text-foreground stage:absolute stage:inset-0 stage:h-full stage:max-w-none">
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <circle
                key={f}
                cx={cx}
                cy={cy}
                r={rMax * f}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.12}
                strokeWidth={1}
              />
            ))}
            {EVAL_DIMENSIONS.map((_, i) => {
              const p = axisPoint(i, rMax);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={p.x}
                  y2={p.y}
                  stroke="currentColor"
                  strokeOpacity={0.15}
                  strokeWidth={1}
                />
              );
            })}
            <motion.path
              d={scorePath(baselineValues)}
              fill="currentColor"
              fillOpacity={0.08}
              stroke="currentColor"
              strokeOpacity={0.4}
              strokeWidth={1.25}
              strokeDasharray="4 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.6, delay: 0.2 }}
            />
            <motion.path
              d={scorePath(scoreValues)}
              fill="rgba(16, 185, 129, 0.28)"
              stroke="#10b981"
              strokeWidth={2}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduced ? 0 : 0.8, delay: 0.4 }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
            {EVAL_DIMENSIONS.map((d, i) => {
              const p = axisPoint(i, (d.score / 100) * rMax);
              const labelP = axisPoint(i, rMax + 22);
              return (
                <g key={d.key}>
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    r={4}
                    fill="#10b981"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.08 }}
                  />
                  <text
                    x={labelP.x}
                    y={labelP.y}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize={labelSize}
                    fontFamily="monospace"
                    opacity={0.85}
                  >
                    {copy.dimensions[d.key]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-2 stage:flex stage:min-h-0 stage:flex-col stage:justify-center stage:gap-1.5 stage:space-y-0">
          {EVAL_DIMENSIONS.map((d, i) => {
            const delta = d.score - d.baseline;
            return (
              <motion.div
                key={d.key}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-center justify-between rounded-lg border border-foreground/[0.06] bg-foreground/[0.02] px-3 py-2 stage:max-h-11 stage:min-h-0 stage:flex-1 stage:py-0"
              >
                <span className="text-base font-mono text-foreground/85">{copy.dimensions[d.key]}</span>
                <span className="flex items-center gap-2 font-mono text-base tabular-nums">
                  <span className="text-foreground font-semibold">{d.score}</span>
                  <span className="text-brand-emerald">+{delta}</span>
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-foreground/[0.06] px-5 py-3 stage:py-2 text-base font-mono">
        <span className="flex items-center gap-3 text-foreground/70">
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-brand-emerald" /> {copy.current}
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full border border-foreground/40" /> {copy.baseline}
          </span>
        </span>
        <span className="uppercase tracking-wider text-foreground/60">
          {fillTemplate(copy.footer, { dimensions: n, runs: EVAL_SAMPLE_RUNS })}
        </span>
      </div>
    </div>
  );
}
