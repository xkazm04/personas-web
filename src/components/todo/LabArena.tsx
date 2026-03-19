"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Swords, GitCompare, LayoutGrid, TrendingUp, DollarSign, Trophy } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import TerminalChrome from "@/components/TerminalChrome";
import CinematicBg from "@/components/todo/CinematicBg";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface Model {
  name: string;
  score: number;
  cost: string;
  latency: string;
  color: string;
}

const initialModels: Model[] = [
  { name: "claude-sonnet-4", score: 94, cost: "$0.12", latency: "2.1s", color: "#a855f7" },
  { name: "gpt-4o", score: 89, cost: "$0.18", latency: "3.4s", color: "#34d399" },
  { name: "gemini-pro", score: 82, cost: "$0.08", latency: "1.8s", color: "#06b6d4" },
  { name: "ollama/llama3", score: 71, cost: "$0.00", latency: "4.2s", color: "#fbbf24" },
];

const labModes = [
  {
    icon: Swords,
    title: "Arena Mode",
    desc: "Pit multiple models against each other on the same persona. Side-by-side output comparison with quality scoring.",
    detail: "Compare up to 6 models simultaneously. Each runs the same prompt — outputs are scored on accuracy, coherence, and tool usage.",
    color: "#f43f5e",
  },
  {
    icon: GitCompare,
    title: "A/B Testing",
    desc: "Run prompt A vs prompt B with statistical significance testing. Auto-detect the winner by cost, latency, or output quality.",
    detail: "Define sample size, confidence interval, and success metrics. The system runs both variants and declares a winner automatically.",
    color: "#a855f7",
  },
  {
    icon: LayoutGrid,
    title: "Matrix Evaluation",
    desc: "Build evaluation matrices: personas x models x use cases. Radar charts and score comparisons across every dimension.",
    detail: "Create test suites with assertions. Run the matrix overnight and get a comprehensive report with heatmaps and breakdowns.",
    color: "#06b6d4",
  },
  {
    icon: TrendingUp,
    title: "Version Tracking",
    desc: "Track different eval configurations over time. Cost sparklines, performance trends, and automatic regression detection.",
    detail: "Every evaluation run is versioned. Compare across time periods to catch performance degradation before it impacts users.",
    color: "#34d399",
  },
];

export default function LabArena() {
  const prefersReducedMotion = useReducedMotion();
  const [models, setModels] = useState(initialModels);
  const [evaluating, setEvaluating] = useState(true);
  const [round, setRound] = useState(1);
  const [activeMode, setActiveMode] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Simulate live evaluation
  const tick = useCallback(() => {
    setModels(prev => {
      const next = prev.map(m => ({
        ...m,
        score: Math.max(60, Math.min(99, m.score + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3))),
      }));
      // Sort by score descending
      return next.sort((a, b) => b.score - a.score);
    });
    setRound(r => r + 1);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !evaluating) return;
    const schedule = () => {
      timerRef.current = setTimeout(() => { tick(); schedule(); }, 2500 + Math.random() * 2000);
    };
    schedule();
    return () => clearTimeout(timerRef.current);
  }, [tick, prefersReducedMotion, evaluating]);

  const leader = models[0];

  return (
    <SectionWrapper id="lab" className="relative overflow-hidden">
      <CinematicBg src="/imgs/features/lab.png" alt="Futuristic AI testing laboratory arena" opacity={75} />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center relative z-10">
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Multi-model{" "}
            <GradientText className="drop-shadow-lg">lab & arena</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-muted-dark font-light">
          Test every prompt against every model. A/B test, compare in arena mode,
          build evaluation matrices — <span className="text-white/80 font-medium">find the optimal config before deploying.</span>
        </motion.p>
      </motion.div>

      <div className="mt-16 grid gap-8 lg:grid-cols-2 relative z-10">
        {/* Left: live arena */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]"
        >
          <TerminalChrome
            title="lab-arena"
            status={evaluating ? "evaluating" : "paused"}
            info={`round ${round}`}
            className="px-5 py-3"
          />
          <div className="p-5 space-y-3">
            <AnimatePresence mode="popLayout">
              {models.map((m, i) => (
                <motion.div
                  key={m.name}
                  layout
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  className="relative rounded-lg border border-white/4 bg-white/2 p-3 overflow-hidden"
                >
                  {/* Leader crown */}
                  {i === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-1.5 right-1.5"
                    >
                      <Trophy className="h-3.5 w-3.5 text-brand-amber/60" />
                    </motion.div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono rounded-full border border-white/10 bg-white/5 h-5 w-5 flex items-center justify-center text-white/40">
                        {i + 1}
                      </span>
                      <span className="text-xs font-mono text-white/70">{m.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-white/30 flex items-center gap-1">
                        <DollarSign className="h-2.5 w-2.5" />{m.cost}
                      </span>
                      <span className="text-[10px] font-mono text-white/30">{m.latency}</span>
                      <motion.span
                        key={m.score}
                        initial={{ scale: 1.3, color: "#06b6d4" }}
                        animate={{ scale: 1, color: m.color }}
                        className="text-sm font-bold font-mono"
                      >
                        {m.score}
                      </motion.span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/4 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: m.color }}
                      animate={{ width: `${m.score}%` }}
                      transition={{ type: "spring", bounce: 0, duration: 0.8 }}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="flex items-center justify-between border-t border-white/4 pt-3 text-[10px] font-mono text-white/20">
              <button
                onClick={() => setEvaluating(e => !e)}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-mono text-white/40 transition-colors hover:bg-white/10 hover:text-white/60"
              >
                {evaluating ? "Pause" : "Resume"}
              </button>
              <span style={{ color: `${leader.color}80` }}>
                {leader.name} leads with {leader.score}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right: expandable mode cards */}
        <div className="space-y-3">
          {labModes.map((mode, i) => (
            <motion.div
              key={mode.title}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              onMouseEnter={() => setActiveMode(i)}
              onMouseLeave={() => setActiveMode(null)}
              whileHover={{ scale: 1.02, x: -4 }}
              className={`group relative flex items-start gap-4 overflow-hidden rounded-xl border p-4 backdrop-blur-sm transition-all duration-400 cursor-default ${
                activeMode === i
                  ? "border-white/20 bg-white/6 shadow-[0_0_30px_rgba(0,0,0,0.2)]"
                  : "border-white/6 bg-white/2"
              }`}
            >
              {activeMode === i && (
                <motion.div
                  layoutId="lab-mode-glow"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: `radial-gradient(circle at 20% 50%, ${mode.color}08, transparent 70%)` }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <div
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300"
                style={{ backgroundColor: `${mode.color}${activeMode === i ? "20" : "12"}` }}
              >
                <mode.icon
                  className="h-5 w-5 transition-transform duration-300"
                  style={{ color: mode.color, transform: activeMode === i ? "scale(1.15)" : undefined }}
                />
              </div>
              <div className="relative flex-1">
                <div className="text-sm font-medium text-white/90">{mode.title}</div>
                <div className="mt-1 text-xs text-muted-dark leading-relaxed">{mode.desc}</div>
                <AnimatePresence>
                  {activeMode === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 rounded-md border border-white/6 bg-white/3 px-3 py-2 text-[11px] text-white/50 leading-relaxed">
                        {mode.detail}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
