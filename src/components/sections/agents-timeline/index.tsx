"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GitBranch, Sparkles, Zap } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import TerminalChrome from "@/components/TerminalChrome";
import SectionIntro from "@/components/primitives/SectionIntro";
import { ThemedChip } from "@/components/primitives";
import { fadeUp } from "@/lib/animations";
import { ANIMATION_DURATION_MS, CYCLE_MS, scenarios } from "./data";
import Track from "./components/Track";
import ComparisonSummary from "./components/ComparisonSummary";
import TimelineControls from "./components/TimelineControls";

export default function AgentsTimeline() {
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

    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    resultTimerRef.current = setTimeout(() => {
      setShowResults(true);
      setIsPlaying(false);
    }, ANIMATION_DURATION_MS);
  }, []);

  const advanceScenario = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % scenarios.length);
  }, []);

  useEffect(() => {
    queueMicrotask(() => startAnimation());
  }, [activeIndex, startAnimation]);

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
      <SectionIntro
        heading="The"
        gradient="Race"
        trailing=" Is Already Over"
        description="See what happens when a rigid system meets a real-world problem — and how an intelligent agent handles it instead."
        className="mb-14"
      />

      <motion.div
        variants={fadeUp}
        className="flex flex-wrap items-center justify-center gap-2 mb-8"
      >
        {scenarios.map((s, i) => (
          <ThemedChip
            key={s.id}
            active={i === activeIndex}
            onClick={() => {
              setActiveIndex(i);
              setPaused(true);
            }}
            size="sm"
            mono
          >
            {s.name}
          </ThemedChip>
        ))}
      </motion.div>

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
            <span className="text-base font-mono uppercase tracking-wider text-muted-dark/60">
              Scenario trigger
            </span>
            <p className="mt-1 text-base text-muted leading-relaxed">
              {scenario.trigger}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

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
            <span className="text-base font-mono text-muted-dark">
              scenario {activeIndex + 1}/{scenarios.length}
            </span>
          }
          className="px-4 py-2.5"
        />

        <div className="p-4 md:p-6 space-y-4">
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

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-brand-rose/20 via-white/5 to-brand-emerald/20" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-background/80">
              <Zap className="h-3.5 w-3.5 text-brand-cyan" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-brand-rose/20 via-white/5 to-brand-emerald/20" />
          </div>

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

          <ComparisonSummary scenario={scenario} showResults={showResults} />
        </div>
      </motion.div>

      <TimelineControls
        activeIndex={activeIndex}
        paused={paused}
        onSelect={(i) => {
          setActiveIndex(i);
          setPaused(true);
        }}
        onReplay={() => startAnimation()}
        onTogglePause={() => setPaused((v) => !v)}
      />
    </SectionWrapper>
  );
}
