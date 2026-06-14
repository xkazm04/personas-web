"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { fadeUp } from "@/lib/animations";
import AssemblyLine from "./variants/AssemblyLine";

/**
 * Team Canvas — the multi-agent pipeline story, reframed around the desktop
 * Factory/KPI mechanism: a goal fans out to personas that move measurable KPIs
 * toward target along an assembly line and converge into a reviewed release.
 * Deliberately distinct from the OrchestrationHub (which shows triggers).
 */
export default function TeamCanvas() {
  return (
    <SectionWrapper id="team-canvas" aria-labelledby="team-canvas-heading">
      <SectionIntro
        id="team-canvas-heading"
        eyebrow="Team canvas"
        heading="From goal to"
        gradient="shipped"
        description="Triggers wake a single agent — the team canvas wires many. A goal fans out to personas that move real KPIs toward target along the line, then converges into a reviewed, shippable release."
      />

      <motion.div variants={fadeUp} className="mt-10">
        <div
          className="mx-auto max-w-5xl rounded-3xl border p-4 sm:p-8"
          style={{
            borderColor: "var(--border-glass-hover)",
            backgroundColor: "rgba(var(--surface-overlay), 0.02)",
          }}
        >
          <AssemblyLine />
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
