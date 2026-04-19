"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock, RotateCcw } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { ThemedChip, TerminalPanel } from "@/components/primitives";
import { fadeUp } from "@/lib/animations";
import { examples } from "./data";
import { usePlaygroundSimulation } from "./use-playground-simulation";
import PromptEditorPanel from "./components/PromptEditorPanel";
import AgentMindPanel from "./components/AgentMindPanel";

export default function PlaygroundSplit() {
  const reduced = useReducedMotion() ?? false;

  const {
    activeExample,
    nodes,
    phase,
    isRunning,
    elapsedMs,
    handleExampleClick,
    handleReset,
  } = usePlaygroundSimulation();

  const activeExampleData =
    activeExample !== null ? examples[activeExample] : null;

  return (
    <SectionWrapper id="playground-split">
      <SectionIntro
        heading="The Agent"
        gradient="Mind"
        description="Watch the agent's thought process unfold in real time. Pick a prompt and see how it parses, plans, and executes."
      />

      <motion.div
        variants={fadeUp}
        className="mb-6 flex flex-wrap gap-2 justify-center"
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

      <motion.div variants={fadeUp} className="mx-auto max-w-5xl">
        <TerminalPanel
          shadow="hero"
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
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1.5"
                  >
                    <Clock className="h-3 w-3 text-muted-dark" />
                    <span
                      className={`text-base font-mono tabular-nums ${
                        phase === "done"
                          ? "text-brand-emerald/60"
                          : "text-muted-dark"
                      }`}
                    >
                      {(elapsedMs / 1000).toFixed(1)}s
                    </span>
                  </motion.div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">
            <PromptEditorPanel
              activeExample={activeExample}
              activeExampleData={activeExampleData}
              phase={phase}
              reduced={reduced}
            />
            <AgentMindPanel nodes={nodes} phase={phase} reduced={reduced} />
          </div>
        </TerminalPanel>
      </motion.div>
    </SectionWrapper>
  );
}
