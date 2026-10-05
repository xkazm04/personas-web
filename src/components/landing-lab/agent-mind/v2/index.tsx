"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { fadeUp } from "@/lib/animations";
import { tint } from "@/lib/brand-theme";
import { useMindRun } from "../shared/useMindRun";
import Script from "./Script";
import CameraStage from "./CameraStage";

/**
 * Landing lab - The Agent Mind, V2 "Camera": the same two panes and six
 * beats, restaged as a film. The prompt editor is the script (the sample
 * prompts are its scenes); the agent mind is a deep, lit space the camera
 * travels through, framing each beat at display size with subtitles, then
 * pulling back to the whole plan as the four outcomes rise into frame.
 */
export default function AgentMindV2() {
  const panelRef = useRef<HTMLDivElement>(null);
  const run = useMindRun(panelRef, 1.7);
  return (
    <SectionWrapper fit="fill" id="playground-split">
      <SectionIntro heading={run.copy.heading} gradient={run.copy.headingGradient} description={run.copy.description} />
      <motion.div
        ref={panelRef}
        data-tour-diagram="agent-mind"
        data-stage-slot
        variants={fadeUp}
        className="mx-auto w-full max-w-7xl"
      >
        <div
          className="grid h-full overflow-hidden rounded-[1.5rem] border border-glass-hover lg:grid-cols-[minmax(17rem,3fr)_minmax(0,7fr)]"
          style={{
            background: "color-mix(in srgb, var(--background) 96%, var(--brand-purple))",
            boxShadow: `inset 0 1px 0 rgba(var(--surface-overlay),0.08), 0 50px 120px -50px ${tint("purple", 40)}`,
          }}
        >
          <div className="border-b border-glass lg:border-b-0 lg:border-r">
            <Script run={run} />
          </div>
          <CameraStage run={run} />
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {run.isRunning ? run.copy.srRunning : run.phase === "done" ? run.copy.srDone : ""}
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
