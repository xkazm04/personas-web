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
import { PipelinePanelFooter } from "./components/PipelinePanelFooter";
import { PipelineProgressBar } from "./components/PipelineProgressBar";

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
    elapsedMs,
    totalDurationMs,
    handleExampleClick,
    handleReset,
    handleReplay,
    toggleSpeed,
  } = usePipelineSimulation();

  const totalStages =
    activeExample !== null ? examples[activeExample].stages.length : 0;
  const doneCount = stageStatuses.filter((s) => s === "done").length;
  const progressPercent =
    totalDurationMs > 0
      ? Math.min(100, (elapsedMs / totalDurationMs) * 100)
      : 0;
  const remainingMs = Math.max(0, totalDurationMs - elapsedMs);

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
            <PipelinePanelFooter isRunning={isRunning} phase={phase} activeStageIdx={activeStageIdx} totalStages={totalStages} elapsedMs={elapsedMs} remainingMs={remainingMs} doneCount={doneCount} />
          }
        >

        <PipelineProgressBar phase={phase} progressPercent={progressPercent} isRunning={isRunning} reduced={reduced} />

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
