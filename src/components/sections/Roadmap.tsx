"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Circle, CheckCircle2, Rocket } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import { PhaseCardStrip } from "@/components/PhaseCard";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  phases,
  statusConfig,
  priorityClass,
  phaseCardData,
  completedCount,
  totalPhases,
  remainingCount,
  progressPercent,
  progressWidth,
  firstRemainingPhase,
} from "@/data/roadmap-phases";
import type { Phase } from "@/data/roadmap-phases";

const RoadmapCard = memo(function RoadmapCard({ phase, index }: { phase: Phase; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[phase.status];

  return (
    <motion.div
      variants={fadeUp}
      className="relative flex gap-6 md:gap-8"
    >
      {/* Timeline spine */}
      <div className="relative flex flex-col items-center pt-1">
        {/* Status dot */}
        <div className={`relative z-10 h-3.5 w-3.5 rounded-full ${status.dotClass} ring-4 ring-background`}>
          {phase.status === "in-progress" && (
            <div className="absolute inset-0 rounded-full bg-brand-cyan/30 animate-ping" />
          )}
        </div>
        {/* Vertical connector */}
        {index < phases.length - 1 && (
          <div className={`mt-1 w-px flex-1 ${status.lineClass}`} />
        )}
      </div>

      {/* Card content */}
      <div className="flex-1 pb-10">
        <div className="relative">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full text-left cursor-pointer group"
        >
          <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent p-6 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.025]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Phase number */}
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] font-mono text-sm font-bold text-muted shrink-0">
                  {phase.id}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-semibold text-lg">{phase.name}</h3>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase ${status.badgeClass}`}>
                      {status.label}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase ${priorityClass[phase.priority]}`}>
                      {phase.priority} priority
                    </span>
                  </div>
                  <p className="text-xs text-muted-dark mt-1 max-w-lg">{phase.goal}</p>
                </div>
              </div>

              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 mt-1"
              >
                <ChevronDown className="h-4 w-4 text-muted-dark transition-colors duration-300 group-hover:text-muted" />
              </motion.div>
            </div>

            {/* Task count summary */}
            <div className="mt-4 flex gap-4 text-[11px] font-mono text-muted-dark/50">
              <span>{phase.tasks.length} work streams</span>
              <span className="text-white/[0.06]">|</span>
              <span>{phase.tasks.reduce((s, t) => s + t.items.length, 0)} deliverables</span>
            </div>
          </div>
        </button>
        {phase.status === "in-progress" && (
          <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl overflow-hidden">
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              <rect
                x="1" y="1"
                width="100%" height="100%"
                rx="16" ry="16"
                fill="none"
                stroke="rgba(6,182,212,0.2)"
                strokeWidth="1.5"
                strokeDasharray="8 8"
                style={{ animation: "dash-flow 2s linear infinite" }}
              />
            </svg>
          </div>
        )}
        </div>

        {/* Expandable task list */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-3 pl-2">
                {phase.tasks.map((task, i) => (
                  <motion.div
                    key={task.title}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className="rounded-xl border border-white/[0.03] bg-white/[0.01] p-4 transition-all duration-300 hover:border-white/[0.06] hover:bg-white/[0.02] texture-lines"
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <task.icon className="h-4 w-4 text-muted-dark" />
                      <h4 className="text-sm font-medium">{task.title}</h4>
                    </div>
                    <ul className="space-y-2 pl-6">
                      {task.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-muted-dark leading-relaxed">
                          <div className="mt-1.5 h-1 w-1 rounded-full bg-white/[0.15] shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

export default function Roadmap() {
  return (
    <SectionWrapper id="roadmap" dotGrid>
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-[5%] top-[20%] h-[500px] w-[400px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 60%)" }}
        />
        <div
          className="absolute right-[5%] bottom-[20%] h-[400px] w-[400px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.03) 0%, transparent 60%)" }}
        />
      </div>

      <motion.div variants={fadeUp} className="text-center relative">
        <div className="text-[8rem] sm:text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter select-none bg-gradient-to-b from-white to-white/10 bg-clip-text text-transparent drop-shadow-lg">
          {progressPercent}%
        </div>
        <SectionHeading className="-mt-6 sm:-mt-8 md:-mt-12">
          {remainingCount} phases to <GradientText className="drop-shadow-lg">launch</GradientText>
        </SectionHeading>
        <p className="mx-auto mt-8 max-w-3xl text-lg text-muted-dark leading-relaxed font-light">
          Cloud integration, web app, orchestrator hardening, and distribution.
          Click any phase to explore the full task breakdown.
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div variants={fadeUp} className="mt-14 mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-white/60 mb-4">
          <span className="font-medium tracking-wide">{completedCount} of {totalPhases} phases complete</span>
          <span className="text-brand-cyan font-bold text-sm drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">{progressPercent}%</span>
        </div>
        <div className="relative h-2.5 rounded-full bg-white/[0.06] shadow-inner">
          <motion.div
            className="relative h-full rounded-full bg-gradient-to-r from-brand-cyan via-blue-400 to-brand-purple shadow-[0_0_15px_rgba(168,85,247,0.5)] overflow-hidden"
            initial={{ width: 0 }}
            whileInView={{ width: progressWidth }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
          >
            {/* Shimmer pulse at leading edge */}
            <div
              className="absolute inset-0 animate-progress-shimmer"
              style={{
                background: "linear-gradient(90deg, transparent 70%, rgba(255,255,255,0.15) 90%, transparent 100%)",
                backgroundSize: "200% 100%",
              }}
            />
          </motion.div>
          {/* Glowing dot at the leading edge */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-brand-cyan animate-progress-dot-breathe"
            style={{ boxShadow: "0 0 6px rgba(6,182,212,0.8), 0 0 12px rgba(6,182,212,0.4)" }}
            initial={{ left: "0%" }}
            whileInView={{ left: progressWidth }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
          />
        </div>
        {/* Phase markers */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-white/50 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-brand-emerald drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]" />
            <span>Phases 1–{completedCount} shipped</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-white/30" />
            <span>Phases {firstRemainingPhase}–{totalPhases} remaining</span>
          </div>
        </div>
      </motion.div>

      {/* Phase overview strip */}
      <motion.div variants={fadeUp} className="mt-10 mx-auto max-w-4xl">
        <PhaseCardStrip phases={phaseCardData} />
      </motion.div>

      <motion.div variants={fadeUp} className="mt-10 mx-auto max-w-3xl rounded-2xl border border-brand-cyan/30 bg-gradient-to-r from-brand-cyan/10 to-brand-purple/10 px-6 py-5 shadow-[0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/imgs/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-cyan/20 ring-1 ring-brand-cyan/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Rocket className="h-6 w-6 text-brand-cyan" />
          </div>
          <div>
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-brand-cyan drop-shadow-sm">Next major milestone</p>
            <p className="mt-1.5 text-base text-white/90 font-medium leading-relaxed">Complete <span className="text-white font-bold">Cloud Integration</span> and <span className="text-white font-bold">Web App</span> to unlock distribution hardening.</p>
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        variants={staggerContainer}
        className="mt-20 mx-auto max-w-4xl"
      >
        {phases.map((phase, i) => (
          <RoadmapCard key={phase.id} phase={phase} index={i} />
        ))}
      </motion.div>

    </SectionWrapper>
  );
}
