"use client";

import { memo, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowRight, GitBranch, Sparkles } from "lucide-react";
import { slideInLeft, slideInRight } from "@/lib/animations";
import { scenarios } from "../data";
import type { Scenario } from "../types";
import ComparisonCard from "./ComparisonCard";
import WorkflowPanel from "./WorkflowPanel";
import AgentPanel from "./AgentPanel";

const WorkflowContent = memo(function WorkflowContent({
  activeIndex,
  minHeight,
}: {
  activeIndex: number;
  minHeight: number;
}) {
  const scenario = scenarios[activeIndex];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scenario.id + "-wf"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative"
        style={{ minHeight: minHeight || undefined }}
      >
        <WorkflowPanel scenario={scenario} />
      </motion.div>
    </AnimatePresence>
  );
});

const AgentContent = memo(function AgentContent({
  activeIndex,
  minHeight,
}: {
  activeIndex: number;
  minHeight: number;
}) {
  const scenario = scenarios[activeIndex];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scenario.id + "-ag"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative"
        style={{ minHeight: minHeight || undefined }}
      >
        <AgentPanel scenario={scenario} />
      </motion.div>
    </AnimatePresence>
  );
});

export default function ScenarioDuel({
  activeIndex,
  scenario,
  wfMinH,
  agMinH,
  onMouseEnter,
  onMouseLeave,
}: {
  activeIndex: number;
  scenario: Scenario;
  wfMinH: number;
  agMinH: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const workflowChildren = useMemo(
    () => <WorkflowContent activeIndex={activeIndex} minHeight={wfMinH} />,
    [activeIndex, wfMinH]
  );
  const agentChildren = useMemo(
    () => <AgentContent activeIndex={activeIndex} minHeight={agMinH} />,
    [activeIndex, agMinH]
  );

  return (
    <div
      className="mt-8 grid gap-6 md:grid-cols-2 md:gap-8 relative"
      role="group"
      aria-label={`Scenario ${activeIndex + 1} of ${scenarios.length}: ${scenario.label}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="hidden md:flex absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/8 bg-background shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          <div className="absolute inset-0 rounded-full border border-brand-cyan/10 animate-glow-border" />
          <ArrowRight className="h-4 w-4 text-brand-cyan" />
        </div>
      </div>

      <div className="hidden md:block absolute left-1/2 top-[15%] bottom-[15%] w-px -translate-x-1/2 bg-linear-to-b from-transparent via-white/4 to-transparent" />

      <ComparisonCard
        variant={slideInLeft}
        texture="stripes"
        className="border border-white/8 bg-linear-to-br from-white/6 to-white/2 backdrop-blur-lg hover:border-white/12"
        color={{
          orb: "-right-20 -top-20 bg-brand-rose/4",
          line: "via-brand-rose/8",
          grid: "rgba(244,63,94,0.08)",
          corner: "from-brand-rose/10",
          iconBg: "bg-brand-rose/10",
          iconRing: "ring-brand-rose/6",
          iconText: "text-brand-rose",
          subtitle: "text-brand-rose/70",
        }}
        cornerPosition="top-left"
        icon={GitBranch}
        title="Traditional Workflow"
        subtitle="Deterministic pipeline"
      >
        {workflowChildren}
      </ComparisonCard>

      <div className="mt-2 mb-2 flex items-center gap-3 md:hidden">
        <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/6 to-transparent" />
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-background/80">
          <ArrowDown className="h-3.5 w-3.5 text-brand-cyan" />
        </div>
        <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/6 to-transparent" />
      </div>

      <ComparisonCard
        variant={slideInRight}
        texture="dots"
        className="border border-brand-cyan/15 bg-linear-to-br from-brand-cyan/8 to-white/2 backdrop-blur-lg shadow-[0_0_80px_rgba(6,182,212,0.04)] hover:border-brand-cyan/20 hover:shadow-[0_0_100px_rgba(6,182,212,0.06)]"
        color={{
          orb: "-left-20 -bottom-20 bg-brand-cyan/4",
          line: "via-brand-cyan/10",
          grid: "rgba(6,182,212,0.08)",
          corner: "from-brand-cyan/10",
          iconBg: "bg-brand-cyan/10",
          iconRing: "ring-brand-cyan/8 shadow-[0_0_15px_rgba(6,182,212,0.08)]",
          iconText: "text-brand-cyan",
          subtitle: "text-brand-cyan/70",
        }}
        cornerPosition="bottom-right"
        extraOrbs={
          <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-brand-purple/3 blur-3xl" />
        }
        icon={Sparkles}
        title="Personas Agent"
        subtitle="Reasoning engine"
      >
        {agentChildren}
      </ComparisonCard>
    </div>
  );
}
