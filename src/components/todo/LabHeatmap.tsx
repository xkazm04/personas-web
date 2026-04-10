"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Grid3X3, Crown, Info, Zap } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp, staggerContainer } from "@/lib/animations";

/* ─── data ─── */

const models = ["claude-sonnet-4", "gpt-4o", "gemini-pro", "ollama/llama3"] as const;
const dimensions = ["Accuracy", "Coherence", "Tool Use", "Speed", "Cost"] as const;

const modelColors: Record<string, string> = {
  "claude-sonnet-4": "#a855f7",
  "gpt-4o": "#34d399",
  "gemini-pro": "#06b6d4",
  "ollama/llama3": "#fbbf24",
};

type ScoreGrid = number[][];

function initScores(): ScoreGrid {
  return [
    [94, 92, 96, 78, 85],
    [89, 90, 82, 65, 70],
    [82, 80, 74, 91, 93],
    [71, 68, 60, 55, 98],
  ];
}

function scoreToColor(score: number): string {
  // Map 50-100 to intensity: dark blue (low) -> cyan -> emerald (high)
  const t = Math.max(0, Math.min(1, (score - 50) / 50));
  if (t < 0.33) {
    // Dark indigo to cyan
    const p = t / 0.33;
    const r = Math.round(15 + p * (6 - 15));
    const g = Math.round(23 + p * (182 - 23));
    const b = Math.round(42 + p * (212 - 42));
    return `rgb(${r},${g},${b})`;
  }
  if (t < 0.66) {
    // Cyan to emerald
    const p = (t - 0.33) / 0.33;
    const r = Math.round(6 + p * (52 - 6));
    const g = Math.round(182 + p * (211 - 182));
    const b = Math.round(212 + p * (153 - 212));
    return `rgb(${r},${g},${b})`;
  }
  // Emerald to bright green-white
  const p = (t - 0.66) / 0.34;
  const r = Math.round(52 + p * (134 - 52));
  const g = Math.round(211 + p * (239 - 211));
  const b = Math.round(153 + p * (172 - 153));
  return `rgb(${r},${g},${b})`;
}

function scoreToPulseIntensity(score: number): number {
  return 0.3 + ((score - 50) / 50) * 0.7;
}

/* ─── tooltip ─── */

interface Tooltip {
  row: number;
  col: number;
  x: number;
  y: number;
}

/* ─── component ─── */

export default function LabHeatmap() {
  const prefersReducedMotion = useReducedMotion();
  const [scores, setScores] = useState<ScoreGrid>(initScores);
  const [tick, setTick] = useState(0);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Live score drift
  const driftScores = useCallback(() => {
    setScores((prev) =>
      prev.map((row) =>
        row.map((s) => {
          const delta = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 4);
          return Math.max(50, Math.min(99, s + delta));
        }),
      ),
    );
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const schedule = () => {
      timerRef.current = setTimeout(
        () => {
          driftScores();
          schedule();
        },
        1800 + Math.random() * 1200,
      );
    };
    schedule();
    return () => clearTimeout(timerRef.current);
  }, [driftScores, prefersReducedMotion]);

  // Best model calculation
  const bestModel = useMemo(() => {
    let bestIdx = 0;
    let bestAvg = 0;
    scores.forEach((row, i) => {
      const avg = row.reduce((a, b) => a + b, 0) / row.length;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestIdx = i;
      }
    });
    return { index: bestIdx, name: models[bestIdx], avg: Math.round(bestAvg) };
  }, [scores]);

  const handleCellHover = (row: number, col: number, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const parentRect = gridRef.current?.getBoundingClientRect();
    if (!parentRect) return;
    setTooltip({
      row,
      col,
      x: rect.left - parentRect.left + rect.width / 2,
      y: rect.top - parentRect.top - 8,
    });
  };

  return (
    <SectionWrapper id="lab-heatmap" className="relative overflow-hidden">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="text-center relative z-10"
      >
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Evaluation{" "}
            <GradientText className="drop-shadow-lg">heatmap</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-xl text-muted-dark font-light"
        >
          Live performance matrix across every model and dimension.{" "}
          <span className="text-foreground/80 font-medium">
            Watch scores shift in real time.
          </span>
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        onViewportEnter={() => {
          if (!hasAnimatedIn) setHasAnimatedIn(true);
        }}
        className="mt-16 mx-auto max-w-3xl"
      >
        <div className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]">
          <TerminalChrome
            title="lab-heatmap"
            status="live"
            info={
              <span className="flex items-center gap-1">
                <Zap className="h-2.5 w-2.5 text-brand-amber/60" />
                tick #{tick}
              </span>
            }
            className="px-5 py-3"
          />

          <div ref={gridRef} className="relative p-5">
            {/* Column headers */}
            <div
              className="grid gap-1.5 mb-2"
              style={{
                gridTemplateColumns: `140px repeat(${dimensions.length}, 1fr)`,
              }}
            >
              <div />
              {dimensions.map((dim, ci) => (
                <motion.div
                  key={dim}
                  initial={{ opacity: 0, y: -10 }}
                  animate={
                    hasAnimatedIn
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: -10 }
                  }
                  transition={{ delay: ci * 0.06, duration: 0.3 }}
                  className="text-sm font-mono text-muted-dark text-center tracking-wider uppercase"
                >
                  {dim}
                </motion.div>
              ))}
            </div>

            {/* Grid rows */}
            {models.map((model, ri) => (
              <div
                key={model}
                className="grid gap-1.5 mb-1.5"
                style={{
                  gridTemplateColumns: `140px repeat(${dimensions.length}, 1fr)`,
                }}
              >
                {/* Row label */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={
                    hasAnimatedIn
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0, x: -20 }
                  }
                  transition={{ delay: ri * 0.1, duration: 0.4 }}
                  className="flex items-center gap-2 pr-2"
                >
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: modelColors[model] }}
                  />
                  <span className="text-sm font-mono text-muted truncate">
                    {model}
                  </span>
                  {bestModel.index === ri && (
                    <motion.div
                      key={`crown-${tick}`}
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        bounce: 0.5,
                        duration: 0.4,
                      }}
                    >
                      <Crown className="h-3 w-3 text-brand-amber/70 shrink-0" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Score cells */}
                {scores[ri].map((score, ci) => {
                  const cellDelay = hasAnimatedIn
                    ? 0
                    : ri * 0.1 + ci * 0.06 + 0.2;
                  const color = scoreToColor(score);
                  const intensity = scoreToPulseIntensity(score);

                  return (
                    <motion.div
                      key={`${ri}-${ci}`}
                      initial={{ opacity: 0, scale: 0.3 }}
                      animate={
                        hasAnimatedIn
                          ? { opacity: 1, scale: 1 }
                          : { opacity: 0, scale: 0.3 }
                      }
                      transition={{
                        delay: cellDelay,
                        duration: 0.35,
                        type: "spring",
                        bounce: 0.3,
                      }}
                      onMouseEnter={(e) => handleCellHover(ri, ci, e)}
                      onMouseLeave={() => setTooltip(null)}
                      className="relative aspect-square rounded-md cursor-crosshair overflow-hidden group"
                      style={{ backgroundColor: color }}
                    >
                      {/* Pulse overlay */}
                      {!prefersReducedMotion && (
                        <motion.div
                          className="absolute inset-0 rounded-md"
                          animate={{
                            opacity: [
                              intensity * 0.15,
                              intensity * 0.45,
                              intensity * 0.15,
                            ],
                          }}
                          transition={{
                            duration: 2 + Math.random(),
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          style={{
                            backgroundColor: "white",
                          }}
                        />
                      )}
                      {/* Score text on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-sm font-mono font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                          {score}
                        </span>
                      </div>
                      {/* Glow edge */}
                      <div
                        className="absolute inset-0 rounded-md ring-1 ring-inset opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{
                          boxShadow: `inset 0 0 12px ${color}, 0 0 16px ${color}60`,
                        }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            ))}

            {/* Tooltip */}
            <AnimatePresence>
              {tooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 pointer-events-none"
                  style={{
                    left: tooltip.x,
                    top: tooltip.y,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <div className="rounded-lg border border-white/15 bg-black/90 backdrop-blur-sm px-3 py-2 shadow-xl">
                    <div className="text-sm font-mono text-muted mb-1">
                      {models[tooltip.row]}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-muted-dark uppercase tracking-wider">
                        {dimensions[tooltip.col]}
                      </span>
                      <span
                        className="text-sm font-mono font-bold"
                        style={{
                          color: scoreToColor(scores[tooltip.row][tooltip.col]),
                        }}
                      >
                        {scores[tooltip.row][tooltip.col]}
                      </span>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-white/15" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Legend + best model */}
          <div className="flex flex-wrap items-center justify-between border-t border-white/4 px-5 py-3 gap-3">
            {/* Color legend */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Info className="h-3 w-3 text-muted-dark" />
                <span className="text-sm font-mono text-muted-dark">
                  Score
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                {[50, 60, 70, 80, 90, 99].map((s) => (
                  <div
                    key={s}
                    className="h-3 w-5 rounded-sm"
                    style={{ backgroundColor: scoreToColor(s) }}
                    title={`${s}`}
                  />
                ))}
              </div>
              <span className="text-sm font-mono text-muted-dark">
                50 — 99
              </span>
            </div>

            {/* Best model indicator */}
            <motion.div
              key={`best-${bestModel.name}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Crown className="h-3 w-3 text-brand-amber/60" />
              <span className="text-sm font-mono text-muted">
                Best:{" "}
                <span
                  className="font-medium"
                  style={{ color: modelColors[bestModel.name] }}
                >
                  {bestModel.name}
                </span>
              </span>
              <span className="text-sm font-mono text-muted-dark">
                avg {bestModel.avg}
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Model legend cards */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 mx-auto max-w-3xl">
        {models.map((model, i) => {
          const avg = Math.round(
            scores[i].reduce((a, b) => a + b, 0) / scores[i].length,
          );
          const best = Math.max(...scores[i]);
          const bestDim = dimensions[scores[i].indexOf(best)];

          return (
            <motion.div
              key={model}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{
                scale: 1.04,
                boxShadow: `0 0 25px ${modelColors[model]}15`,
              }}
              className="rounded-xl border border-white/6 bg-white/2 p-4 transition-all duration-300 hover:border-white/15 hover:bg-white/5"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: modelColors[model] }}
                />
                <span className="text-sm font-mono text-muted truncate">
                  {model}
                </span>
              </div>
              <div
                className="text-xl font-bold font-mono"
                style={{ color: modelColors[model] }}
              >
                {avg}
              </div>
              <div className="text-sm font-mono text-muted-dark mt-1">
                Best: {bestDim} ({best})
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
