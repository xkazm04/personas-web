"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { RotateCcw } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { ThemedChip, TerminalPanel } from "@/components/primitives";
import { fadeUp } from "@/lib/animations";
import { useStillMotion } from "@/hooks/useStillMotion";
import { examples } from "./data";
import { usePlaygroundSimulation } from "./use-playground-simulation";
import PromptEditorPanel from "./components/PromptEditorPanel";
import AgentMindPanel from "./components/AgentMindPanel";
import { RunProgressBar, RunTimer } from "./components/RunClock";

export default function PlaygroundSplit() {
  const reduced = useStillMotion();

  const {
    activeExample,
    nodes,
    phase,
    isRunning,
    startedAt,
    totalDurationMs,
    handleExampleClick,
    handleReset,
  } = usePlaygroundSimulation();

  const activeExampleData =
    activeExample !== null ? examples[activeExample] : null;

  // The first screen of this section used to be two empty panes ("Select a
  // prompt to begin"). Play the first prompt once when the section is on
  // screen; the visitor can pick another at any time. Not under reduced motion
  // (a run is motion the visitor did not start), and never more than once.
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(panelRef, { once: true, amount: 0.5 });
  const autoplayed = useRef(false);
  useEffect(() => {
    if (!inView || reduced || autoplayed.current) return;
    autoplayed.current = true;
    const t = setTimeout(() => handleExampleClick(0), 700);
    return () => clearTimeout(t);
  }, [inView, reduced, handleExampleClick]);

  return (
    <SectionWrapper fit="fill" id="playground-split">
      <SectionIntro
        heading="The Agent"
        gradient="Mind"
        description="Watch the agent's thought process unfold in real time. Pick a prompt and see how it parses, plans, and executes."
      />

      <motion.div
        variants={fadeUp}
        className="mb-6 flex flex-wrap gap-2 justify-center stage:mb-[2svh]"
      >
        {examples.map((ex, i) => (
          <ThemedChip
            key={ex.label}
            active={activeExample === i}
            onClick={() => handleExampleClick(i)}
            disabled={isRunning}
            size="sm"
            icon={
              <ex.icon className="h-3.5 w-3.5" style={{ color: ex.iconColor }} />
            }
          >
            {ex.label}
          </ThemedChip>
        ))}
        {phase === "done" && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-full border border-glass-hover px-4 py-2 text-base font-medium text-muted-dark hover:border-white/20 hover:text-foreground hover:bg-white/5 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </motion.div>

      <motion.div
        ref={panelRef}
        data-tour-diagram="agent-mind"
        data-stage-slot
        variants={fadeUp}
        className="mx-auto w-full max-w-5xl"
      >
        <TerminalPanel
          shadow="hero"
          className="stage:flex stage:h-full stage:flex-col"
          bodyClassName="stage:flex stage:min-h-0 stage:flex-1 stage:flex-col"
          footer={
            <>
              <div className="flex items-center gap-3 text-base font-mono tracking-wider uppercase text-muted-dark">
                <span>Split View</span>
                {isRunning && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-brand-cyan/60"
                  >
                    Executing...
                  </motion.span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {(phase === "running" || phase === "done") && (
                  <RunTimer startedAt={startedAt} running={isRunning} totalMs={totalDurationMs} done={phase === "done"} />
                )}
                {phase === "done" && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-base font-mono tracking-wider uppercase text-brand-emerald/60"
                  >
                    execution complete
                  </motion.span>
                )}
              </div>
            </>
          }
        >
          {phase !== "idle" && (
            <RunProgressBar startedAt={startedAt} running={isRunning} totalMs={totalDurationMs} reduced={reduced} />
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px] stage:min-h-0 stage:flex-1">
            <PromptEditorPanel
              activeExample={activeExample}
              activeExampleData={activeExampleData}
              phase={phase}
              reduced={reduced}
            />
            <AgentMindPanel nodes={nodes} phase={phase} reduced={reduced} />
          </div>
          {/* Phase changes are otherwise visual-only; announce them to AT. */}
          <p className="sr-only" role="status" aria-live="polite">
            {phase === "running"
              ? "Running simulation"
              : phase === "done"
                ? "Execution complete — results available"
                : ""}
          </p>
        </TerminalPanel>
      </motion.div>
    </SectionWrapper>
  );
}
