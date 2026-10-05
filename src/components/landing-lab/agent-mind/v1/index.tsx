"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { fadeUp } from "@/lib/animations";
import { useMindRun } from "../shared/useMindRun";
import PromptPicker from "../shared/PromptPicker";
import Console from "./Console";

/**
 * Landing lab - The Agent Mind, V1 "Lit console": the live section's layout
 * and beats kept one-for-one (prompt editor | agent mind, six-beat run,
 * four-part result), re-crafted - the light follows the beat under attention,
 * edges carry packets, the beat is named at display size, and the editor
 * reacts to the mind beat by beat.
 */
export default function AgentMindV1() {
  const panelRef = useRef<HTMLDivElement>(null);
  const run = useMindRun(panelRef, 1.25);
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
        className="mx-auto w-full max-w-6xl"
      >
        <Console run={run} />
      </motion.div>
    </SectionWrapper>
  );
}
