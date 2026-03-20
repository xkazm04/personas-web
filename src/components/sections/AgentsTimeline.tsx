"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  Check,
  AlertTriangle,
  Play,
  Pause,
  Timer,
  Zap,
  GitBranch,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp } from "@/lib/animations";

/* ── Types ── */

interface TrackStep {
  label: string;
  durationMs: number;
  status: "ok" | "warn" | "error";
}

interface Scenario {
  id: string;
  name: string;
  trigger: string;
  workflow: {
    steps: TrackStep[];
    totalMs: number;
    result: string;
  };
  agent: {
    steps: TrackStep[];
    totalMs: number;
    result: string;
  };
}

/* ── Scenario Data ── */

const scenarios: Scenario[] = [
  {
    id: "ambiguous-email",
    name: "Ambiguous Email",
    trigger:
      '"Cancel my order... actually, change the address instead."',
    workflow: {
      steps: [
        { label: "Parse intent", durationMs: 800, status: "ok" },
        { label: "Route to cancellation", durationMs: 900, status: "ok" },
        { label: "Detect conflict", durationMs: 700, status: "warn" },
        { label: "No branch exists", durationMs: 600, status: "error" },
        { label: "STUCK", durationMs: 0, status: "error" },
      ],
      totalMs: 3000,
      result: "Stuck in queue. Customer waits hours.",
    },
    agent: {
      steps: [
        { label: "Read full context", durationMs: 500, status: "ok" },
        { label: "Identify corrected intent", durationMs: 600, status: "ok" },
        { label: "Call address API", durationMs: 400, status: "ok" },
        { label: "Send confirmation", durationMs: 300, status: "ok" },
      ],
      totalMs: 1800,
      result: "Resolved in 4 seconds. Customer delighted.",
    },
  },
  {
    id: "split-payment",
    name: "Split Payment Refund",
    trigger:
      "Customer requests refund for item bought with gift card + credit card.",
    workflow: {
      steps: [
        { label: "Look up payment", durationMs: 700, status: "ok" },
        { label: "Route to refund handler", durationMs: 800, status: "ok" },
        { label: "Detect split payment", durationMs: 600, status: "warn" },
        { label: "No split-refund connector", durationMs: 500, status: "error" },
        { label: "Exception thrown", durationMs: 0, status: "error" },
      ],
      totalMs: 2600,
      result: "Escalated to finance. 3-day resolution.",
    },
    agent: {
      steps: [
        { label: "Calculate $40/$60 split", durationMs: 400, status: "ok" },
        { label: "Refund to gift card", durationMs: 500, status: "ok" },
        { label: "Refund to credit card", durationMs: 500, status: "ok" },
        { label: "Notify customer", durationMs: 300, status: "ok" },
      ],
      totalMs: 1700,
      result: "Both refunds processed instantly.",
    },
  },
  {
    id: "staging-env",
    name: "Staging Setup",
    trigger:
      '"Set up staging identical to production but with debug logging."',
    workflow: {
      steps: [
        { label: 'Match template: "create env"', durationMs: 600, status: "ok" },
        { label: "Clone production config", durationMs: 900, status: "ok" },
        { label: "Apply debug flag", durationMs: 700, status: "warn" },
        { label: "12 services need reconfig", durationMs: 800, status: "error" },
        { label: "Branch explosion", durationMs: 0, status: "error" },
      ],
      totalMs: 3000,
      result: "Partial deploy. 6 services misconfigured.",
    },
    agent: {
      steps: [
        { label: "Inventory 12 services", durationMs: 500, status: "ok" },
        { label: "Clone with debug overrides", durationMs: 600, status: "ok" },
        { label: "Deploy with health checks", durationMs: 500, status: "ok" },
        { label: "Verify all healthy", durationMs: 300, status: "ok" },
      ],
      totalMs: 1900,
      result: "Full staging environment in 90 seconds.",
    },
  },
  {
    id: "batch-error",
    name: "Error Recovery",
    trigger:
      "API call returns 503 during a batch of 200 transactions.",
    workflow: {
      steps: [
        { label: "Begin batch", durationMs: 600, status: "ok" },
        { label: "Process 1-147", durationMs: 1000, status: "ok" },
        { label: "Txn 148: 503 error", durationMs: 500, status: "error" },
        { label: "Retry 3x failed", durationMs: 700, status: "error" },
        { label: "Entire batch failed", durationMs: 0, status: "error" },
      ],
      totalMs: 2800,
      result: "147 successful transactions rolled back.",
    },
    agent: {
      steps: [
        { label: "Checkpoint at 147", durationMs: 400, status: "ok" },
        { label: "Backoff + retry 148", durationMs: 700, status: "ok" },
        { label: "Provider back online", durationMs: 400, status: "ok" },
        { label: "Complete remaining 53", durationMs: 500, status: "ok" },
      ],
      totalMs: 2000,
      result: "All 200 transactions processed. Zero data loss.",
    },
  },
  {
    id: "vip-discount",
    name: "VIP Legacy Discount",
    trigger:
      "VIP customer asks for a discount, but already has a special rate from 2023.",
    workflow: {
      steps: [
        { label: "Customer type: VIP", durationMs: 500, status: "ok" },
        { label: "Check discount eligibility", durationMs: 700, status: "ok" },
        { label: "Existing discount detected", durationMs: 600, status: "warn" },
        { label: "Can't stack discounts", durationMs: 500, status: "error" },
        { label: "No rule for VIP + legacy", durationMs: 0, status: "error" },
      ],
      totalMs: 2300,
      result: "Request denied. Customer escalates to manager.",
    },
    agent: {
      steps: [
        { label: "Compare legacy vs new VIP", durationMs: 500, status: "ok" },
        { label: "Legacy = 22% vs 15%", durationMs: 400, status: "ok" },
        { label: "Compose personal response", durationMs: 400, status: "ok" },
        { label: "Offer loyalty bonus", durationMs: 300, status: "ok" },
      ],
      totalMs: 1600,
      result: "Customer keeps better rate + gets loyalty perk.",
    },
  },
];

const CYCLE_MS = 6000;
const ANIMATION_DURATION_MS = 4000;

/* ── Track Step Block ── */

function StepBlock({
  step,
  index,
  isActive,
  isWorkflow,
  totalSteps,
}: {
  step: TrackStep;
  index: number;
  isActive: boolean;
  isWorkflow: boolean;
  totalSteps: number;
}) {
  const prefersReduced = useReducedMotion();
  const isError = step.status === "error";
  const isWarn = step.status === "warn";

  const bgColor = isError
    ? isWorkflow
      ? "bg-brand-rose/20 border-brand-rose/30"
      : "bg-brand-rose/20 border-brand-rose/30"
    : isWarn
      ? "bg-yellow-400/15 border-yellow-400/25"
      : isWorkflow
        ? "bg-white/5 border-white/10"
        : "bg-brand-emerald/10 border-brand-emerald/20";

  const iconColor = isError
    ? "text-brand-rose"
    : isWarn
      ? "text-yellow-400"
      : isWorkflow
        ? "text-white/50"
        : "text-brand-emerald";

  const Icon = isError ? X : isWarn ? AlertTriangle : Check;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: -20 }}
      animate={
        isActive
          ? {
              opacity: 1,
              scale: 1,
              x: 0,
              ...(isError && !prefersReduced
                ? { rotate: [0, -1, 1, -0.5, 0] }
                : {}),
            }
          : { opacity: 0.3, scale: 0.9, x: 0 }
      }
      transition={{
        delay: isActive ? index * 0.35 : 0,
        duration: prefersReduced ? 0.1 : 0.4,
        ease: "easeOut",
      }}
      className={`relative flex items-center gap-2 rounded-lg border px-3 py-2 ${bgColor} shrink-0`}
    >
      <Icon className={`h-3.5 w-3.5 shrink-0 ${iconColor}`} />
      <span
        className={`text-xs font-mono whitespace-nowrap ${
          isError
            ? "text-brand-rose line-through decoration-brand-rose/40"
            : "text-white/70"
        }`}
      >
        {step.label}
      </span>

      {/* Crack effect on error for workflow */}
      {isError && isWorkflow && !prefersReduced && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: index * 0.35 + 0.3, duration: 0.3 }}
          className="absolute inset-0 pointer-events-none"
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M 0 20 L 15 12 L 30 25 L 50 8 L 70 28 L 85 15 L 100 20"
              fill="none"
              stroke="rgba(244,63,94,0.4)"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                delay: index * 0.35 + 0.3,
                duration: 0.5,
              }}
            />
          </svg>
        </motion.div>
      )}

      {/* Connector arrow to next step */}
      {index < totalSteps - 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 0.5 } : { opacity: 0 }}
          transition={{ delay: isActive ? index * 0.35 + 0.2 : 0 }}
          className="absolute -right-4 top-1/2 -translate-y-1/2 text-white/20"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M 2 6 L 10 6 M 7 3 L 10 6 L 7 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── Race Timer ── */

function RaceTimer({
  isRunning,
  durationMs,
  label,
  color,
}: {
  isRunning: boolean;
  durationMs: number;
  label: string;
  color: string;
}) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isRunning) {
      setElapsed(0);
      startRef.current = null;
      return;
    }

    startRef.current = performance.now();
    const tick = () => {
      if (!startRef.current) return;
      const now = performance.now();
      const diff = Math.min(now - startRef.current, durationMs);
      setElapsed(diff);
      if (diff < durationMs) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, durationMs]);

  const seconds = (elapsed / 1000).toFixed(1);

  return (
    <div className="flex items-center gap-1.5">
      <Timer className={`h-3 w-3 ${color}`} />
      <span className={`text-[10px] font-mono tabular-nums ${color}`}>
        {label}: {seconds}s
      </span>
    </div>
  );
}

/* ── Result Card ── */

function ResultCard({
  isWorkflow,
  result,
  visible,
}: {
  isWorkflow: boolean;
  result: string;
  visible: boolean;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`mt-3 rounded-xl border px-4 py-3 ${
            isWorkflow
              ? "border-brand-rose/20 bg-brand-rose/5"
              : "border-brand-emerald/20 bg-brand-emerald/5"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {isWorkflow ? (
              <X className="h-3.5 w-3.5 text-brand-rose" />
            ) : (
              <Check className="h-3.5 w-3.5 text-brand-emerald" />
            )}
            <span
              className={`text-[10px] font-mono uppercase tracking-wider ${
                isWorkflow ? "text-brand-rose/60" : "text-brand-emerald/60"
              }`}
            >
              {isWorkflow ? "FAILED" : "RESOLVED"}
            </span>
          </div>
          <p
            className={`text-sm leading-relaxed ${
              isWorkflow ? "text-brand-rose/80" : "text-brand-emerald/80"
            }`}
          >
            {result}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Time Cursor ── */

function TimeCursor({
  isRunning,
  durationMs,
}: {
  isRunning: boolean;
  durationMs: number;
}) {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return null;

  return (
    <AnimatePresence>
      {isRunning && (
        <motion.div
          className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-cyan/60 via-brand-purple/40 to-brand-cyan/60 z-10 pointer-events-none"
          initial={{ left: "0%" }}
          animate={{ left: "100%" }}
          exit={{ opacity: 0 }}
          transition={{ duration: durationMs / 1000, ease: "linear" }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Track Component ── */

function Track({
  steps,
  isWorkflow,
  isActive,
  result,
  totalMs,
  showResult,
  label,
  icon: Icon,
}: {
  steps: TrackStep[];
  isWorkflow: boolean;
  isActive: boolean;
  result: string;
  totalMs: number;
  showResult: boolean;
  label: string;
  icon: React.ElementType;
}) {
  const themeColor = isWorkflow
    ? "border-brand-rose/10 bg-brand-rose/[0.02]"
    : "border-brand-emerald/10 bg-brand-emerald/[0.02]";

  const headerColor = isWorkflow ? "text-brand-rose/70" : "text-brand-emerald/70";
  const timerColor = isWorkflow ? "text-brand-rose/50" : "text-brand-emerald/50";

  return (
    <div className={`rounded-xl border p-4 ${themeColor} relative overflow-hidden`}>
      {/* Track header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${headerColor}`} />
          <span className={`text-xs font-mono uppercase tracking-wider ${headerColor}`}>
            {label}
          </span>
        </div>
        <RaceTimer
          isRunning={isActive}
          durationMs={totalMs}
          label="Time"
          color={timerColor}
        />
      </div>

      {/* Steps track */}
      <div className="relative">
        <TimeCursor isRunning={isActive} durationMs={totalMs} />

        {/* Progress rail */}
        <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-white/5" />
        {isActive && (
          <motion.div
            className={`absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full ${
              isWorkflow
                ? "bg-gradient-to-r from-brand-rose/40 to-brand-rose/20"
                : "bg-gradient-to-r from-brand-emerald/40 to-brand-cyan/30"
            }`}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: totalMs / 1000, ease: "easeOut" }}
          />
        )}

        {/* Step blocks */}
        <div className="relative flex items-center gap-5 overflow-x-auto pb-2 pt-1 scrollbar-hide">
          {steps.map((step, i) => (
            <StepBlock
              key={`${step.label}-${i}`}
              step={step}
              index={i}
              isActive={isActive}
              isWorkflow={isWorkflow}
              totalSteps={steps.length}
            />
          ))}

          {/* Finish indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={
              isActive
                ? { opacity: 1, scale: 1 }
                : { opacity: 0.2, scale: 0.8 }
            }
            transition={{
              delay: isActive ? steps.length * 0.35 + 0.2 : 0,
              duration: 0.3,
              type: "spring",
            }}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              isWorkflow
                ? "bg-brand-rose/20 ring-1 ring-brand-rose/30"
                : "bg-brand-emerald/20 ring-1 ring-brand-emerald/30"
            }`}
          >
            {isWorkflow ? (
              <X className="h-4 w-4 text-brand-rose" />
            ) : (
              <Check className="h-4 w-4 text-brand-emerald" />
            )}
          </motion.div>
        </div>
      </div>

      {/* Result card */}
      <ResultCard
        isWorkflow={isWorkflow}
        result={result}
        visible={showResult}
      />
    </div>
  );
}

/* ── Main Component ── */

export default function AgentsTimeline() {
  const prefersReduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [paused, setPaused] = useState(false);
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = scenarios[activeIndex];

  const startAnimation = useCallback(() => {
    setIsPlaying(true);
    setShowResults(false);

    // Show results after the animation completes
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    resultTimerRef.current = setTimeout(() => {
      setShowResults(true);
      setIsPlaying(false);
    }, ANIMATION_DURATION_MS);
  }, []);

  const advanceScenario = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % scenarios.length);
  }, []);

  // Start animation when scenario changes
  useEffect(() => {
    startAnimation();
  }, [activeIndex, startAnimation]);

  // Auto-cycle
  useEffect(() => {
    if (paused) return;
    if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    cycleTimerRef.current = setTimeout(() => {
      advanceScenario();
    }, CYCLE_MS);
    return () => {
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    };
  }, [activeIndex, paused, advanceScenario]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    };
  }, []);

  return (
    <SectionWrapper
      id="agents-timeline"
      aria-label="Agents vs Workflows racing timeline comparison"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="text-center mb-14">
        <SectionHeading>
          The <GradientText>Race</GradientText> Is Already Over
        </SectionHeading>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-dark leading-relaxed font-light">
          Watch workflows break down step by step while agents adapt and resolve
          in real time.
        </p>
      </motion.div>

      {/* Scenario tabs */}
      <motion.div
        variants={fadeUp}
        className="flex flex-wrap items-center justify-center gap-2 mb-8"
      >
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              setActiveIndex(i);
              setPaused(true);
            }}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[11px] font-mono tracking-wider transition-all duration-300 ${
              i === activeIndex
                ? "border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : "border-white/[0.06] bg-white/[0.02] text-muted-dark hover:border-white/[0.12] hover:text-muted"
            }`}
          >
            {s.name}
          </button>
        ))}
      </motion.div>

      {/* Trigger description */}
      <motion.div variants={fadeUp} className="mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-3xl rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center backdrop-blur-sm"
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-dark/60">
              Scenario trigger
            </span>
            <p className="mt-1 text-sm text-muted leading-relaxed">
              {scenario.trigger}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Terminal container */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-lg overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <TerminalChrome
          title="agents-vs-workflows.race"
          status={isPlaying ? "racing" : showResults ? "complete" : "ready"}
          info={
            <span className="text-[10px] font-mono text-white/20">
              scenario {activeIndex + 1}/{scenarios.length}
            </span>
          }
          className="px-4 py-2.5"
        />

        <div className="p-4 md:p-6 space-y-4">
          {/* Workflow Track */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`wf-${scenario.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Track
                steps={scenario.workflow.steps}
                isWorkflow={true}
                isActive={isPlaying}
                result={scenario.workflow.result}
                totalMs={scenario.workflow.totalMs}
                showResult={showResults}
                label="Workflow"
                icon={GitBranch}
              />
            </motion.div>
          </AnimatePresence>

          {/* VS Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-brand-rose/20 via-white/5 to-brand-emerald/20" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-background/80">
              <Zap className="h-3.5 w-3.5 text-brand-cyan" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-brand-rose/20 via-white/5 to-brand-emerald/20" />
          </div>

          {/* Agent Track */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`ag-${scenario.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Track
                steps={scenario.agent.steps}
                isWorkflow={false}
                isActive={isPlaying}
                result={scenario.agent.result}
                totalMs={scenario.agent.totalMs}
                showResult={showResults}
                label="Agent"
                icon={Sparkles}
              />
            </motion.div>
          </AnimatePresence>

          {/* Comparison summary card */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Workflow result */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="h-3 w-3 rounded-full bg-brand-rose/30 flex items-center justify-center">
                        <X className="h-2 w-2 text-brand-rose" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-brand-rose/60">
                        Workflow
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-brand-rose/80 tabular-nums">
                      {(scenario.workflow.totalMs / 1000).toFixed(1)}s
                    </div>
                    <div className="text-[10px] text-brand-rose/40 font-mono mt-1">
                      FAILED
                    </div>
                  </div>

                  {/* Agent result */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="h-3 w-3 rounded-full bg-brand-emerald/30 flex items-center justify-center">
                        <Check className="h-2 w-2 text-brand-emerald" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-brand-emerald/60">
                        Agent
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-brand-emerald/80 tabular-nums">
                      {(scenario.agent.totalMs / 1000).toFixed(1)}s
                    </div>
                    <div className="text-[10px] text-brand-emerald/40 font-mono mt-1">
                      RESOLVED
                    </div>
                  </div>
                </div>

                {/* Speed comparison bar */}
                <div className="mt-4 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-brand-cyan" />
                    <span className="text-xs font-mono text-brand-cyan/70">
                      Agent resolved{" "}
                      <span className="text-brand-cyan font-bold">
                        {(
                          ((scenario.workflow.totalMs - scenario.agent.totalMs) /
                            scenario.workflow.totalMs) *
                          100
                        ).toFixed(0)}
                        %
                      </span>{" "}
                      faster
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Progress bar & controls */}
      <motion.div variants={fadeUp} className="mt-6 mx-auto max-w-3xl">
        <div className="flex gap-1.5">
          {scenarios.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveIndex(i);
                setPaused(true);
              }}
              className="relative h-1 flex-1 cursor-pointer rounded-full bg-white/[0.06] overflow-hidden"
            >
              {i === activeIndex && !paused && (
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                  key={`progress-${s.id}`}
                />
              )}
              {i === activeIndex && paused && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple" />
              )}
              {i < activeIndex && (
                <div className="absolute inset-0 rounded-full bg-white/[0.12]" />
              )}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-muted-dark/50">
          <span>
            Race {activeIndex + 1} of {scenarios.length}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => startAnimation()}
              className="cursor-pointer flex items-center gap-1.5 transition-colors hover:text-muted-dark"
            >
              <RotateCcw className="h-3 w-3" />
              Replay
            </button>
            <button
              onClick={() => setPaused((v) => !v)}
              className="cursor-pointer flex items-center gap-1.5 transition-colors hover:text-muted-dark"
            >
              {paused ? (
                <>
                  <Play className="h-3 w-3" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-3 w-3" />
                  Pause
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
