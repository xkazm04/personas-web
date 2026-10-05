"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { fadeUp } from "@/lib/animations";
import { useMindRun } from "../shared/useMindRun";
import PromptPicker from "../shared/PromptPicker";
import NotePage from "./NotePage";
import InkPage from "./InkPage";

/**
 * Landing lab - The Agent Mind, V3 "Inked": the same two panes and six
 * beats as a sketchbook spread. The prompt is the facing page; the mind is a
 * drawing pencilled in from the start, which the pen inks and paints beat by
 * beat as the agent works - the plan becomes a finished illustration exactly
 * when the run completes.
 */
export default function AgentMindV3() {
  const panelRef = useRef<HTMLDivElement>(null);
  const run = useMindRun(panelRef, 1.8);
  return (
    <SectionWrapper fit="fill" id="playground-split">
      <SectionIntro heading={run.copy.heading} gradient={run.copy.headingGradient} description={run.copy.description} />
      <motion.div variants={fadeUp}>
        <PromptPicker run={run} className="mb-5 stage:mb-[2svh]" />
      </motion.div>
      <motion.div
        ref={panelRef}
        data-tour-diagram="agent-mind"
        data-stage-slot
        variants={fadeUp}
        className="mx-auto w-full max-w-7xl"
      >
        <div
          className="relative grid h-full overflow-hidden rounded-[1.25rem] border border-glass-hover lg:grid-cols-[minmax(18rem,3fr)_minmax(0,7fr)]"
          style={{
            ["--am3-paper" as string]: "color-mix(in srgb, var(--background) 93%, var(--foreground))",
            background: "var(--am3-paper)",
            boxShadow:
              "inset 0 0 80px color-mix(in srgb, var(--background) 60%, transparent), 0 40px 100px -50px color-mix(in srgb, var(--foreground) 25%, transparent)",
          }}
        >
          {/* Spine: the fold between the two pages. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 hidden w-10 -translate-x-1/2 lg:block"
            style={{ left: "30%", background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--background) 55%, transparent), transparent)" }}
          />
          <NotePage run={run} />
          <InkPage run={run} />
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {run.isRunning ? run.copy.srRunning : run.phase === "done" ? run.copy.srDone : ""}
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
