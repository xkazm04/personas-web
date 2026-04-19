"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Radar } from "lucide-react";
import { EVAL_DIMENSIONS } from "../data";
import TabBackdrop from "./TabBackdrop";

export default function EvalTab() {
  const reduced = useReducedMotion() ?? false;
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
    <div className="force-dark relative flex flex-col rounded-xl border border-foreground/[0.08] bg-background/80 backdrop-blur-xl overflow-hidden">
      <TabBackdrop tab="eval" />
      <div className="relative flex items-center justify-between border-b border-foreground/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <Radar className="h-4 w-4 text-brand-emerald" />
          <span className="text-base font-mono font-semibold text-foreground uppercase tracking-wider">
            Eval radar
          </span>
        </div>
        <div className="flex items-center gap-4 text-base font-mono">
          <span className="text-foreground/70">
            Avg{" "}
            <span className="text-brand-emerald font-semibold tabular-nums">
              {avgScore}
            </span>
          </span>
          <span className="text-foreground/70">
            Δ vs baseline{" "}
            <span className="text-brand-emerald font-semibold">
              +{avgScore - avgBaseline}
            </span>
          </span>
        </div>
      </div>

      <div className="relative grid md:grid-cols-[1fr_220px] gap-4 p-5">
        <div className="flex items-center justify-center">
          <svg viewBox="0 0 400 400" className="w-full max-w-[340px] h-auto">
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <circle
                key={f}
                cx={cx}
                cy={cy}
                r={rMax * f}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
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
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={1}
                />
              );
            })}
            <motion.path
              d={scorePath(baselineValues)}
              fill="rgba(255,255,255,0.04)"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={1.25}
              strokeDasharray="4 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.6, delay: 0.2 }}
            />
            <motion.path
              d={scorePath(scoreValues)}
              fill="rgba(52, 211, 153, 0.18)"
              stroke="#34d399"
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
                <g key={d.label}>
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    r={4}
                    fill="#34d399"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.08 }}
                  />
                  <text
                    x={labelP.x}
                    y={labelP.y}
                    textAnchor="middle"
                    fill="white"
                    fontSize={16}
                    fontFamily="monospace"
                    opacity={0.85}
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-2">
          {EVAL_DIMENSIONS.map((d, i) => {
            const delta = d.score - d.baseline;
            return (
              <motion.div
                key={d.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-center justify-between rounded-lg border border-foreground/[0.06] bg-foreground/[0.02] px-3 py-2"
              >
                <span className="text-base font-mono text-foreground/85">{d.label}</span>
                <span className="flex items-center gap-2 font-mono text-base tabular-nums">
                  <span className="text-foreground font-semibold">{d.score}</span>
                  <span className="text-brand-emerald">+{delta}</span>
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-foreground/[0.06] px-5 py-3 text-base font-mono">
        <span className="flex items-center gap-3 text-foreground/70">
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-brand-emerald" /> current
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full border border-foreground/40" /> baseline
          </span>
        </span>
        <span className="uppercase tracking-wider text-foreground/60">
          6 dimensions · 50 sample runs
        </span>
      </div>
    </div>
  );
}
