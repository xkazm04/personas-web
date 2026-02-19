"use client";

import { motion } from "framer-motion";
import { Wand2, Zap, Cloud, Activity } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GlowCard from "@/components/GlowCard";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";

const features = [
  {
    icon: Wand2,
    accent: "purple" as const,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    iconRing: "ring-purple-500/[0.08]",
    iconGlow: "shadow-[0_0_12px_rgba(168,85,247,0.08)]",
    number: "01",
    title: "Design with natural language",
    description:
      "Describe what you want your agent to do. The design engine analyzes feasibility, suggests tools, and generates the optimal prompt structure.",
    visual: (
      <div className="mt-6 space-y-2.5 rounded-xl border border-purple-500/8 bg-purple-500/[0.02] p-5 font-mono text-xs relative overflow-hidden">
        {/* Scanline decoration */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(168,85,247,0.15) 3px, rgba(168,85,247,0.15) 4px)",
        }} />
        <div className="relative">
          <div className="flex items-center gap-2 text-purple-400/40">
            <div className="h-2 w-2 rounded-full bg-purple-400/30 shadow-[0_0_4px_rgba(168,85,247,0.3)]" />
            <span>agent.config</span>
          </div>
          <div className="pl-4 border-l border-purple-500/10 space-y-1.5 mt-2.5">
            <div>
              <span className="text-purple-400">role</span>
              <span className="text-muted-dark">{": "}</span>
              <span className="text-emerald-400">{'"Email triage assistant"'}</span>
            </div>
            <div>
              <span className="text-purple-400">tools</span>
              <span className="text-muted-dark">{": "}</span>
              <span className="text-amber-400">{"[gmail, slack, jira]"}</span>
            </div>
            <div>
              <span className="text-purple-400">trigger</span>
              <span className="text-muted-dark">{": "}</span>
              <span className="text-cyan-400">{'"every 15 minutes"'}</span>
            </div>
            <div>
              <span className="text-purple-400">healing</span>
              <span className="text-muted-dark">{": "}</span>
              <span className="text-emerald-400">true</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Zap,
    accent: "cyan" as const,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    iconRing: "ring-cyan-500/[0.08]",
    iconGlow: "shadow-[0_0_12px_rgba(6,182,212,0.08)]",
    number: "02",
    title: "Agents that coordinate",
    description:
      "Built-in event bus lets agents trigger each other. Email agent → Slack agent → GitHub agent. Runs locally, no cloud required.",
    visual: (
      <div className="mt-6 flex items-center justify-center gap-2 py-3 relative">
        {/* Background connection line */}
        <div className="pointer-events-none absolute top-1/2 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-cyan-500/8 to-transparent -translate-y-1/2" />
        {["Email", "Slack", "GitHub"].map((name, i) => (
          <div key={name} className="flex items-center gap-2">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/15 bg-cyan-500/8 text-xs font-mono text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.06)]">
              {name.slice(0, 2)}
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-xl border border-cyan-400/20 animate-glow-border" />
              {/* Corner dot */}
              <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-cyan-400/60 shadow-[0_0_4px_rgba(6,182,212,0.4)]" />
            </div>
            {i < 2 && (
              <div className="flex items-center gap-0.5">
                <div className="h-px w-3 bg-gradient-to-r from-cyan-500/40 to-cyan-500/10" />
                <div className="h-2 w-2 rounded-full bg-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.5)] animate-glow-border" />
                <div className="h-px w-3 bg-gradient-to-r from-cyan-500/10 to-cyan-500/40" />
              </div>
            )}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Cloud,
    accent: "emerald" as const,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    iconRing: "ring-emerald-500/[0.08]",
    iconGlow: "shadow-[0_0_12px_rgba(52,211,153,0.08)]",
    number: "03",
    title: "One-click cloud deployment",
    description:
      "When you need 24/7 operation, deploy your agents to the cloud with one click. Bring your own infrastructure or use ours.",
    visual: (
      <div className="mt-6 flex items-center justify-center gap-3 py-3 relative">
        {/* Background gradient strip */}
        <div className="pointer-events-none absolute top-1/2 left-[10%] right-[10%] h-8 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-emerald-500/[0.02] to-transparent" />
        <div className="relative rounded-xl border border-emerald-500/12 bg-emerald-500/5 px-4 py-2.5 text-xs font-mono text-emerald-400">
          <div className="text-[10px] text-emerald-400/40 mb-0.5">local</div>
          Desktop
          {/* Status dot */}
          <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400/70 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <svg width="48" height="8" className="text-emerald-500/30">
            <line x1="0" y1="4" x2="48" y2="4" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            <polygon points="44,1 48,4 44,7" fill="currentColor" />
          </svg>
          <span className="text-[9px] text-muted-dark font-mono">deploy</span>
        </div>
        <div className="relative rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-mono text-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.10)]">
          <div className="text-[10px] text-emerald-400/40 mb-0.5">cloud</div>
          24/7
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-xl border border-emerald-400/10 animate-glow-border" />
        </div>
      </div>
    ),
  },
  {
    icon: Activity,
    accent: "amber" as const,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    iconRing: "ring-amber-500/[0.08]",
    iconGlow: "shadow-[0_0_12px_rgba(251,191,36,0.08)]",
    number: "04",
    title: "Full visibility",
    description:
      "Real-time execution streaming, event audit trails, healing engine, and usage analytics. Know exactly what your agents are doing.",
    visual: (
      <div className="mt-6 relative">
        {/* Baseline */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />
        <div className="flex items-end justify-center gap-[5px] py-3">
          {[30, 55, 40, 70, 45, 80, 60, 90, 50, 75, 65, 85].map((h, i) => (
            <div
              key={i}
              className="w-3 rounded-sm bg-gradient-to-t from-amber-500/15 to-amber-400/40 animate-bar-grow relative"
              style={{
                height: `${h * 0.5}px`,
                animationDelay: `${i * 0.05}s`,
              }}
            >
              {/* Shine on top of tallest bars */}
              {h >= 80 && (
                <div className="absolute -top-px inset-x-0 h-px bg-amber-400/50 shadow-[0_0_4px_rgba(251,191,36,0.4)]" />
              )}
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function Features() {
  return (
    <SectionWrapper id="features" dotGrid>
      {/* Background accent orb */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute right-[10%] top-[20%] h-[400px] w-[400px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 60%)" }}
        />
        <div
          className="absolute left-[5%] bottom-[10%] h-[300px] w-[300px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.03) 0%, transparent 60%)" }}
        />
      </div>

      <motion.div variants={fadeUp} className="text-center relative">
        <span className="inline-block rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3.5 py-1 text-[11px] font-medium tracking-wider uppercase text-brand-cyan/70 font-mono mb-6">
          Platform
        </span>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Everything you need to{" "}
          <GradientText>build &amp; operate</GradientText>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted leading-relaxed">
          A complete platform for designing, testing, executing, and monitoring
          AI agents — from your desktop.
        </p>
        {/* Decorative line */}
        <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-brand-cyan/15 to-transparent" />
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="mt-16 grid gap-6 md:grid-cols-2"
      >
        {features.map((f) => (
          <GlowCard key={f.title} accent={f.accent} className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${f.iconBg} ${f.iconRing} ${f.iconGlow}`}
                >
                  <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold text-[15px]">{f.title}</h3>
              </div>
              <span className="font-mono text-xs text-muted-dark/50 tabular-nums">{f.number}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {f.description}
            </p>
            {f.visual}
          </GlowCard>
        ))}
      </motion.div>

      {/* Section divider */}
      <div className="section-line mt-20 opacity-50" />
    </SectionWrapper>
  );
}
