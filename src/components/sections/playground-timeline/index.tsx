"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import TerminalChrome from "@/components/TerminalChrome";
import SectionIntro from "@/components/primitives/SectionIntro";
import { TerminalPanel } from "@/components/primitives";
import { fadeUp } from "@/lib/animations";
import { examples } from "./data";
import { usePipelineSimulation } from "./use-pipeline-simulation";
import ExampleSelector from "./components/ExampleSelector";
import TimelineTrack from "./components/TimelineTrack";

export default function PlaygroundTimeline() {
  const reduced = useReducedMotion() ?? false;
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    activeExample,
    activeStageIdx,
    stageStatuses,
    phase,
    isRunning,
    speed,
    handleExampleClick,
    handleReset,
    handleReplay,
    toggleSpeed,
  } = usePipelineSimulation();

  const totalStages =
    activeExample !== null ? examples[activeExample].stages.length : 0;
  const doneCount = stageStatuses.filter((s) => s === "done").length;
  const activeCount = stageStatuses.filter((s) => s === "active").length;
  const progressPercent =
    totalStages > 0 ? ((doneCount + activeCount * 0.5) / totalStages) * 100 : 0;

  useEffect(() => {
    if (activeStageIdx >= 0 && scrollRef.current) {
      const cards = scrollRef.current.querySelectorAll("[data-stage-card]");
      const activeCard = cards[activeStageIdx] as HTMLElement | undefined;
      if (activeCard) {
        activeCard.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeStageIdx, reduced]);

  const activeExampleData =
    activeExample !== null ? examples[activeExample] : null;

  return (
    <SectionWrapper id="playground-timeline">
      <SectionIntro
        heading="Execution"
        gradient="Pipeline"
        description="Follow each stage of the agent pipeline as it processes your request from input to output."
      />

      <ExampleSelector
        activeExample={activeExample}
        isRunning={isRunning}
        speed={speed}
        phase={phase}
        onExampleClick={handleExampleClick}
        onToggleSpeed={toggleSpeed}
        onReplay={handleReplay}
        onReset={handleReset}
      />

      <motion.div variants={fadeUp} className="mx-auto max-w-5xl">
        <TerminalPanel
          shadow="hero"
          header={
            <TerminalChrome
              title="execution-pipeline"
              status={
                phase === "running" ? "executing" : phase === "done" ? "complete" : "ready"
              }
              info={
                activeExampleData ? (
                  <span className="truncate max-w-[200px] inline-block">
                    {activeExampleData.prompt}
                  </span>
                ) : undefined
              }
              className="px-5 py-3"
            />
          }
          footer={
            <>
              <div className="flex items-center gap-3 text-base font-mono tracking-wider uppercase text-muted-dark">
                <span>Pipeline View</span>
                {isRunning && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-brand-cyan/60"
                  >
                    Stage {activeStageIdx + 1} of {totalStages}
                  </motion.span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {totalStages > 0 && (
                  <span className="text-base font-mono text-muted-dark">
                    {doneCount}/{totalStages} stages
                  </span>
                )}
                {phase === "done" && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-base font-mono tracking-wider uppercase text-brand-emerald/60"
                  >
                    pipeline complete
                  </motion.span>
                )}
              </div>
            </>
          }
        >

        {phase !== "idle" && (
          <div className="relative h-1 bg-white/[0.03]">
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{
                background: "linear-gradient(90deg, #06b6d4, #a855f7, #34d399)",
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: reduced ? 0 : 0.6, ease: "easeOut" }}
            />
            {isRunning && !reduced && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-cyan"
                style={{
                  left: `${progressPercent}%`,
                  boxShadow: "0 0 12px 4px rgba(6,182,212,0.5)",
                  marginLeft: "-6px",
                }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
        )}

        <TimelineTrack
          phase={phase}
          activeExample={activeExample}
          activeExampleData={activeExampleData}
          stageStatuses={stageStatuses}
          reduced={reduced}
          scrollRef={scrollRef}
        />

        </TerminalPanel>
      </motion.div>
    </SectionWrapper>
  );
}
