"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp } from "@/lib/animations";
import AssemblyLine from "./variants/AssemblyLine";

/**
 * Team Canvas — the multi-agent pipeline story, reframed around the desktop
 * Factory/KPI mechanism: a goal fans out to personas that move measurable KPIs
 * toward target along an assembly line and converge into a reviewed release.
 * Deliberately distinct from the OrchestrationHub (which shows triggers).
 */
export default function TeamCanvas() {
  const { t } = useTranslation();
  const copy = t.teamCanvasSection;
  return (
    <SectionWrapper fit="min" id="team-canvas" aria-labelledby="team-canvas-heading">
      <SectionIntro
        id="team-canvas-heading"
        heading={copy.heading}
        gradient={copy.headingGradient}
        description={copy.lede}
      />

      <motion.div variants={fadeUp} className="mt-10 stage:mt-0" data-stage-zoom>
        <div
          className="mx-auto max-w-5xl rounded-2xl border p-4 sm:p-8 stage:p-5"
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
