"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { fadeUp } from "@/lib/animations";
import { STAGE_LEGEND } from "./data";
import TeamCanvasFlow from "./TeamCanvasFlow";

/**
 * Team Canvas — the multi-agent pipeline story. Deliberately distinct from the
 * OrchestrationHub (triggers): here a goal fans out to personas working in
 * parallel and converges into a reviewed result. The animated DAG is the art;
 * the stage legend carries the same narrative as text on small screens.
 */
export default function TeamCanvas() {
  return (
    <SectionWrapper id="team-canvas" aria-labelledby="team-canvas-heading">
      <SectionIntro
        id="team-canvas-heading"
        eyebrow="Team canvas"
        heading="From goal to"
        gradient="shipped"
        description="Triggers wake a single agent — the team canvas wires many. One goal fans out to personas working in parallel, then converges into a reviewed, shippable result."
      />

      <motion.div variants={fadeUp} className="mt-12">
        <div
          className="mx-auto max-w-5xl rounded-3xl border p-4 sm:p-8"
          style={{
            borderColor: "var(--border-glass-hover)",
            backgroundColor: "rgba(var(--surface-overlay), 0.02)",
          }}
        >
          <div className="mx-auto aspect-[13/6] w-full">
            <TeamCanvasFlow />
          </div>
        </div>

        {/* Stage legend — the pipeline narrative as text (readable on every screen) */}
        <ol className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          {STAGE_LEGEND.map((label, i) => (
            <li
              key={i}
              className="flex items-center gap-2.5 rounded-xl border border-glass px-3 py-2.5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 font-mono text-xs text-brand-cyan">
                {i + 1}
              </span>
              <span className="text-sm font-light text-muted">{label}</span>
            </li>
          ))}
        </ol>
      </motion.div>
    </SectionWrapper>
  );
}
