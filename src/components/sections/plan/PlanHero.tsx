"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import FloatingParticles from "@/components/FloatingParticles";

const completedCount = 11;
const totalCount = 15;
const percentage = Math.round((completedCount / totalCount) * 100);

/* Phase ring segments — pre-computed for the arc visualization */
const phases = Array.from({ length: totalCount }, (_, i) => ({
  index: i + 1,
  completed: i < completedCount,
}));

function ProgressArc() {
  const radius = 110;
  const strokeWidth = 6;
  const gap = 4; // gap between segments in degrees
  const segmentAngle = (360 - gap * totalCount) / totalCount;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="260" height="260" viewBox="0 0 260 260" className="drop-shadow-[0_0_30px_rgba(6,182,212,0.1)]">
        <defs>
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(6,182,212,0.8)" />
            <stop offset="100%" stopColor="rgba(168,85,247,0.8)" />
          </linearGradient>
          <filter id="arcGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx="130" cy="130" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={strokeWidth}
        />

        {/* Phase segments */}
        {phases.map((phase, i) => {
          const startAngle = i * (segmentAngle + gap) - 90;
          const endAngle = startAngle + segmentAngle;
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          const x1 = 130 + radius * Math.cos(startRad);
          const y1 = 130 + radius * Math.sin(startRad);
          const x2 = 130 + radius * Math.cos(endRad);
          const y2 = 130 + radius * Math.sin(endRad);

          return (
            <path
              key={phase.index}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke={phase.completed ? "url(#arcGradient)" : "rgba(255,255,255,0.06)"}
              strokeWidth={phase.completed ? strokeWidth : strokeWidth - 1}
              strokeLinecap="round"
              filter={phase.completed ? "url(#arcGlow)" : undefined}
              opacity={phase.completed ? 1 : 0.5}
            />
          );
        })}

        {/* Inner decorative ring */}
        <circle
          cx="130" cy="130" r={radius - 20}
          fill="none"
          stroke="rgba(255,255,255,0.02)"
          strokeWidth="0.5"
          strokeDasharray="3 8"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tracking-tight bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent">
          {percentage}%
        </span>
        <span className="text-xs text-muted-dark font-mono tracking-wider mt-1">
          {completedCount}/{totalCount} PHASES
        </span>
      </div>
    </div>
  );
}

export default function PlanHero() {
  return (
    <section className="noise relative flex min-h-[85vh] items-center overflow-hidden px-6 pt-24">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="animate-pulse-slow absolute left-[10%] top-[20%] h-[500px] w-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 60%)" }}
        />
        <div
          className="animate-pulse-slower absolute right-[5%] bottom-[10%] h-[600px] w-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 60%)" }}
        />
      </div>

      <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" />
      <FloatingParticles />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 50%, rgba(10,10,18,0.6) 100%)" }}
      />

      {/* Content — asymmetric split layout */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 mx-auto max-w-6xl w-full grid gap-12 md:grid-cols-2 items-center"
      >
        {/* Left — text */}
        <div>
          <motion.div variants={fadeUp}>
            <span className="relative inline-flex items-center overflow-hidden rounded-full border border-brand-purple/20 bg-brand-purple/5 px-4 py-1.5 text-xs font-medium tracking-wider uppercase text-brand-purple font-mono">
              <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-brand-purple/10 to-transparent" style={{ animationDuration: "3s" }} />
              <span className="relative">Implementation Roadmap</span>
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-8 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl"
          >
            <span className="block">From scaffold to</span>
            <GradientText className="block mt-1">production-ready</GradientText>
          </motion.h1>

          <motion.div variants={fadeUp} className="mt-6 h-px w-32 bg-gradient-to-r from-brand-purple/20 via-brand-cyan/15 to-transparent" />

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-lg text-lg leading-relaxed text-muted"
          >
            15 phases taking Personas from Tauri scaffold to a distributed AI agent platform
            with desktop app, cloud orchestrator, and marketing site.
          </motion.p>

          {/* Quick stats */}
          <motion.div variants={fadeUp} className="mt-8 flex gap-6">
            {[
              { value: "228", label: "Rust tests" },
              { value: "70+", label: "Tauri commands" },
              { value: "24", label: "DB tables" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-xl font-bold tracking-tight">{stat.value}</div>
                <div className="text-[11px] text-muted-dark font-mono tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Logo watermark */}
          <motion.div variants={fadeUp} className="mt-10 flex items-center gap-3">
            <Image
              src="/imgs/logo.png"
              alt="Personas"
              width={28}
              height={28}
              className="opacity-60"
            />
            <span className="text-sm text-muted-dark">Personas Desktop</span>
            <span className="h-3 w-px bg-white/[0.06]" />
            <span className="text-xs text-muted-dark/60 font-mono">v0.1.0</span>
          </motion.div>
        </div>

        {/* Right — progress arc */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-center"
        >
          <ProgressArc />
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/60 to-transparent" />
    </section>
  );
}
