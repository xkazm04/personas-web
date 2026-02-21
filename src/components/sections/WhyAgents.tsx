"use client";

import { motion } from "framer-motion";
import { X, Check, GitBranch, Sparkles, ArrowRight } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import { fadeUp, slideInLeft, slideInRight } from "@/lib/animations";

const painPoints = [
  "Visual diagrams required for every flow",
  "Breaks on unexpected input",
  "Pre-built connectors only (400 max)",
  "Branch explosion for complex logic",
  "Cannot reason about edge cases",
];

const benefits = [
  "Natural language instructions",
  "Adapts and reasons about edge cases",
  "Any API via Claude Code CLI",
  "Single agent handles nuance",
  "Self-healing on errors",
];

export default function WhyAgents() {
  const comparisonHighlights = [
    "Deterministic flows break on edge cases",
    "Agent systems adapt under uncertainty",
    "One prompt can replace branch-heavy diagrams",
  ];

  return (
    <SectionWrapper id="why-agents">
      {/* Section background accent orb */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/4 h-[500px] w-[700px] -translate-x-1/2 rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(244,63,94,0.03) 0%, rgba(6,182,212,0.02) 40%, transparent 70%)" }}
        />
      </div>

      <motion.div variants={fadeUp} className="text-center relative">
        <p className="text-xl italic text-muted-dark mb-8 font-light tracking-wide">What if your workflows could think?</p>
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl drop-shadow-md">
          Why agents, <span className="font-black text-brand-rose drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">not</span> <GradientText className="drop-shadow-lg">workflows</GradientText>
        </h2>
        <p className="mx-auto mt-8 max-w-3xl text-lg text-muted-dark leading-relaxed font-light">
          Traditional workflow engines execute deterministic A→B→C pipelines.
          Personas agents reason, adapt, and coordinate.
        </p>
        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-3">
          {comparisonHighlights.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-xs font-mono tracking-wider text-muted backdrop-blur-sm transition-colors hover:bg-white/[0.08] hover:text-white shadow-[0_0_10px_rgba(255,255,255,0.02)]"
            >
              {item}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="mt-16 grid gap-6 md:grid-cols-2 md:gap-8 relative">
        {/* VS divider — desktop only */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.08] bg-background shadow-[0_0_40px_rgba(0,0,0,0.6)]">
            {/* Pulsing ring behind */}
            <div className="absolute inset-0 rounded-full border border-brand-cyan/10 animate-glow-border" />
            <ArrowRight className="h-4 w-4 text-brand-cyan" />
          </div>
        </div>

        {/* Connector line — desktop only */}
        <div className="hidden md:block absolute left-1/2 top-[15%] bottom-[15%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />

        {/* Pain column */}
        <motion.div
          variants={slideInLeft}
          transition={{ duration: 0.6 }}
          className="texture-stripes group rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.015] to-transparent p-6 md:p-8 relative overflow-hidden transition-all duration-500 hover:border-white/[0.06]"
        >
          {/* Subtle red tint in corner */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-brand-rose/[0.04] blur-3xl" />
          {/* Bottom accent line */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-rose/8 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {/* Grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.012]"
            style={{
              backgroundImage: "linear-gradient(rgba(244,63,94,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(244,63,94,0.08) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Corner accent — top-left */}
          <div className="pointer-events-none absolute top-0 left-0 w-10 h-10">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-brand-rose/10 to-transparent" />
            <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-brand-rose/10 to-transparent" />
          </div>

          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-rose/10 ring-1 ring-brand-rose/[0.06]">
              <GitBranch className="h-5 w-5 text-brand-rose" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-muted">Traditional Workflows</h3>
              <p className="text-xs text-muted-dark mt-0.5">Rigid, breakable, limited</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-brand-rose/50 mt-1.5">Best for fixed linear tasks</p>
            </div>
          </div>

          <ul className="relative mt-7 space-y-4">
            {painPoints.map((point, i) => (
              <motion.li
                key={point}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.3 }}
                className="flex items-start gap-3 text-muted-dark group/item"
              >
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-rose/8 ring-1 ring-brand-rose/[0.06] transition-all duration-300 group-hover/item:ring-brand-rose/15">
                  <X className="h-3 w-3 text-brand-rose/60" />
                </div>
                <span className="text-sm leading-relaxed transition-colors duration-300 group-hover/item:text-muted">{point}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Benefits column */}
        <motion.div
          variants={slideInRight}
          transition={{ duration: 0.6 }}
          className="texture-dots group rounded-2xl border border-brand-cyan/10 bg-gradient-to-br from-brand-cyan/[0.03] to-transparent p-6 md:p-8 shadow-[0_0_80px_rgba(6,182,212,0.04)] relative overflow-hidden transition-all duration-500 hover:border-brand-cyan/15 hover:shadow-[0_0_100px_rgba(6,182,212,0.06)]"
        >
          {/* Subtle cyan tint */}
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-brand-cyan/[0.04] blur-3xl" />
          {/* Second accent glow — top-right */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-brand-purple/[0.03] blur-3xl" />
          {/* Bottom accent line */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/10 to-transparent" />
          {/* Grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.012]"
            style={{
              backgroundImage: "linear-gradient(rgba(6,182,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.08) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Corner accent — bottom-right */}
          <div className="pointer-events-none absolute bottom-0 right-0 w-10 h-10">
            <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-brand-cyan/10 to-transparent" />
            <div className="absolute bottom-0 right-0 h-full w-px bg-gradient-to-t from-brand-cyan/10 to-transparent" />
          </div>

          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-cyan/10 ring-1 ring-brand-cyan/[0.08] shadow-[0_0_15px_rgba(6,182,212,0.08)]">
              <Sparkles className="h-5 w-5 text-brand-cyan" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Personas Agents</h3>
              <p className="text-xs text-muted-dark mt-0.5">Intelligent, adaptive, connected</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-brand-cyan/50 mt-1.5">Best for evolving real-world workflows</p>
            </div>
          </div>

          <ul className="relative mt-7 space-y-4">
            {benefits.map((point, i) => (
              <motion.li
                key={point}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.3 }}
                className="flex items-start gap-3 group/item"
              >
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-cyan/10 ring-1 ring-brand-cyan/[0.08] transition-all duration-300 group-hover/item:ring-brand-cyan/20 group-hover/item:shadow-[0_0_8px_rgba(6,182,212,0.12)]">
                  <Check className="h-3 w-3 text-brand-cyan" />
                </div>
                <span className="text-sm leading-relaxed text-muted transition-colors duration-300 group-hover/item:text-foreground">{point}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

    </SectionWrapper>
  );
}
