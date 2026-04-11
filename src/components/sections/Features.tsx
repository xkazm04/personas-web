"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Wand2, Zap, Cloud, Activity, BookOpen } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GlowCard from "@/components/GlowCard";
import GradientText from "@/components/GradientText";
import { fadeUp, TRANSITION_NORMAL } from "@/lib/animations";

interface GuideLink {
  label: string;
  category: string;
  topic: string;
}

/* ── Choreographed entrance variants ── */
const cardOrchestrator: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const heroSlideIn: Variants = {
  hidden: { opacity: 0, x: -60, scale: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const gridCardVariants: Variants[] = [
  {
    hidden: { opacity: 0, x: -40, rotate: -2 },
    visible: {
      opacity: 1,
      x: 0,
      rotate: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  },
  {
    hidden: { opacity: 0, y: 40, rotate: -1 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  },
  {
    hidden: { opacity: 0, x: 40, rotate: 2 },
    visible: {
      opacity: 1,
      x: 0,
      rotate: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  },
];

const connectorDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.8, delay: 0.9, ease: "easeOut" },
  },
};

/* ── Feature visuals (extracted for readability & independent editing) ── */

function DesignVisual() {
  return (
    <div className="mt-6 space-y-2.5 rounded-xl border border-purple-500/8 bg-purple-500/2 p-4 font-mono text-xs relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(168,85,247,0.15) 3px, rgba(168,85,247,0.15) 4px)",
      }} />
      <div className="relative">
        {/* eslint-disable-next-line custom-a11y/no-low-text-opacity -- decorative code visual */}
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
  );
}

function CoordinateVisual() {
  return (
    <div className="mt-6 flex items-center justify-center gap-2 py-3 relative">
      <div className="pointer-events-none absolute top-1/2 left-[15%] right-[15%] h-px bg-linear-to-r from-transparent via-cyan-500/8 to-transparent -translate-y-1/2" />
      {["Email", "Slack", "GitHub"].map((name, i) => (
        <div key={name} className="flex items-center gap-2">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/15 bg-cyan-500/8 text-xs font-mono text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.06)]">
            {name.slice(0, 2)}
            <div className="absolute inset-0 rounded-xl border border-cyan-400/20 animate-glow-border" />
            <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-cyan-400/60 shadow-[0_0_4px_rgba(6,182,212,0.4)]" />
          </div>
          {i < 2 && (
            <div className="flex items-center gap-0.5">
              <div className="h-px w-3 bg-linear-to-r from-cyan-500/40 to-cyan-500/10" />
              <div className="h-2 w-2 rounded-full bg-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.5)] animate-glow-border" />
              <div className="h-px w-3 bg-linear-to-r from-cyan-500/10 to-cyan-500/40" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DeployVisual() {
  return (
    <div className="mt-6 flex items-center justify-center gap-3 py-3 relative">
      <div className="pointer-events-none absolute top-1/2 left-[10%] right-[10%] h-8 -translate-y-1/2 rounded-full bg-linear-to-r from-transparent via-emerald-500/2 to-transparent" />
      <div className="relative rounded-xl border border-emerald-500/12 bg-emerald-500/5 px-4 py-2.5 text-xs font-mono text-emerald-400">
        {/* eslint-disable-next-line custom-a11y/no-low-text-opacity -- decorative label in visual */}
        <div className="text-[10px] text-emerald-400/40 mb-0.5">local</div>
        Desktop
        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400/70 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
      </div>
      <div className="flex flex-col items-center gap-1">
        {/* eslint-disable-next-line custom-a11y/no-low-text-opacity -- decorative SVG arrow */}
        <svg width="48" height="8" className="text-emerald-500/30">
          <line x1="0" y1="4" x2="48" y2="4" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <polygon points="44,1 48,4 44,7" fill="currentColor" />
        </svg>
        <span className="text-[9px] text-muted-dark font-mono">deploy</span>
      </div>
      <div className="relative rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-mono text-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.10)]">
        {/* eslint-disable-next-line custom-a11y/no-low-text-opacity -- decorative label in visual */}
        <div className="text-[10px] text-emerald-400/40 mb-0.5">cloud</div>
        24/7
        <div className="absolute inset-0 rounded-xl border border-emerald-400/10 animate-glow-border" />
      </div>
    </div>
  );
}

function TelemetryVisual() {
  return (
    <div className="mt-6 relative">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-amber-500/10 to-transparent" />
      <div className="flex items-end justify-center gap-1.25 py-3">
        {[30, 55, 40, 70, 45, 80, 60, 90, 50, 75, 65, 85].map((h, i) => (
          <div
            key={i}
            className="w-3 rounded-sm bg-linear-to-t from-amber-500/15 to-amber-400/40 animate-bar-grow relative"
            style={{
              height: `${h * 0.5}px`,
              animationDelay: `${i * 0.05}s`,
            }}
          >
            {h >= 80 && (
              <div className="absolute -top-px inset-x-0 h-px bg-amber-400/50 shadow-[0_0_4px_rgba(251,191,36,0.4)]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Feature data ── */

const features = [
  {
    icon: Wand2,
    accent: "purple" as const,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    iconRing: "ring-purple-500/8",
    iconGlow: "shadow-[0_0_12px_rgba(168,85,247,0.08)]",
    number: "01",
    title: "Design with natural language",
    proof: "Prompt scaffolding",
    description:
      "Describe what you want your agent to do. The design engine analyzes feasibility, suggests tools, and generates the optimal prompt structure.",
    visual: <DesignVisual />,
    guideTopics: [
      { label: "Creating a new agent", category: "agents-prompts", topic: "creating-a-new-agent" },
      { label: "Writing effective prompts", category: "agents-prompts", topic: "writing-effective-prompts" },
    ] as GuideLink[],
  },
  {
    icon: Zap,
    accent: "cyan" as const,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    iconRing: "ring-cyan-500/8",
    iconGlow: "shadow-[0_0_12px_rgba(6,182,212,0.08)]",
    number: "02",
    title: "Agents that coordinate",
    proof: "Event-driven chaining",
    description:
      "Built-in event bus lets agents trigger each other. Email agent → Slack agent → GitHub agent. Runs locally, no cloud required.",
    visual: <CoordinateVisual />,
    guideTopics: [
      { label: "Event-based triggers", category: "triggers", topic: "event-based-triggers" },
      { label: "Chain triggers", category: "triggers", topic: "chain-triggers" },
    ] as GuideLink[],
  },
  {
    icon: Cloud,
    accent: "emerald" as const,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    iconRing: "ring-emerald-500/8",
    iconGlow: "shadow-[0_0_12px_rgba(52,211,153,0.08)]",
    number: "03",
    title: "One-click cloud deployment",
    proof: "Hybrid execution",
    description:
      "When you need 24/7 operation, deploy your agents to the cloud with one click. Bring your own infrastructure or use ours.",
    visual: <DeployVisual />,
    guideTopics: [
      { label: "Local vs cloud execution", category: "deployment", topic: "local-vs-cloud-execution" },
      { label: "Cloud orchestrator setup", category: "deployment", topic: "connecting-to-the-cloud-orchestrator" },
    ] as GuideLink[],
  },
  {
    icon: Activity,
    accent: "amber" as const,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    iconRing: "ring-amber-500/8",
    iconGlow: "shadow-[0_0_12px_rgba(251,191,36,0.08)]",
    number: "04",
    title: "Full visibility",
    proof: "Operational telemetry",
    description:
      "Real-time execution streaming, event audit trails, healing engine, and usage analytics. Know exactly what your agents are doing.",
    visual: <TelemetryVisual />,
    guideTopics: [
      { label: "Cost tracking per model", category: "monitoring", topic: "cost-tracking-per-model" },
      { label: "Success rate metrics", category: "monitoring", topic: "success-rate-metrics" },
    ] as GuideLink[],
  },
];

type Feature = (typeof features)[number];

function FeatureCardHeader({ f }: { f: Feature }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${f.iconBg} ${f.iconRing} ${f.iconGlow}`}
        >
          <f.icon className={`h-5 w-5 ${f.iconColor}`} />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-[15px] leading-tight">{f.title}</h3>
          <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-muted-dark">{f.proof}</p>
        </div>
      </div>
      <span className="shrink-0 font-mono text-xs text-muted-dark tabular-nums md:hidden">{f.number}</span>
    </div>
  );
}

export default function Features() {
  return (
    <SectionWrapper id="features">
      <motion.div variants={fadeUp} className="relative">
        {/* Large ghost number */}
        {/* eslint-disable-next-line custom-a11y/no-low-text-opacity -- decorative ghost number, not readable text */}
        <span className="pointer-events-none absolute -top-6 -left-2 select-none font-mono font-bold text-[6rem] sm:text-[8rem] leading-none text-white/3">
          01–04
        </span>

        <div className="relative">
          <span className="inline-block rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-brand-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)] font-mono mb-6">
            Platform
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-6xl drop-shadow-md">
            Everything you need to{" "}
            <GradientText className="drop-shadow-lg">build &amp; operate</GradientText>
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-muted-dark leading-relaxed font-light">
            A complete platform for designing, testing, executing, and monitoring
            AI agents — from your desktop.
          </p>
        </div>
      </motion.div>

      <motion.div variants={cardOrchestrator} className="relative mt-16">
        {/* ── Progression thread (desktop only) ── */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 hidden md:flex flex-col items-center" style={{ width: 32 }}>
          {/* Vertical dashed line */}
          <motion.div
            className="absolute inset-x-3.75 top-6 bottom-6 w-px border-l border-dashed border-white/6"
            variants={{ hidden: { scaleY: 0 }, visible: { scaleY: 1, transition: { duration: 1.2, delay: 0.3, ease: "easeOut" } } }}
            style={{ transformOrigin: "top" }}
          />
          {/* Step nodes */}
          {features.map((f, i) => (
            <motion.div
              key={f.number}
              className="absolute flex items-center justify-center"
              style={{ top: i === 0 ? 28 : `calc(50% + ${(i - 1) * 80 - 40}px)`, left: 8 }}
              variants={{ hidden: { scale: 0, opacity: 0 }, visible: { scale: 1, opacity: 1, transition: { delay: 0.4 + i * 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }}
            >
              <div className={`flex items-center justify-center rounded-full border text-[9px] font-mono font-bold tabular-nums ${
                i === 0
                  ? "h-7 w-7 border-brand-purple/30 bg-brand-purple/10 text-brand-purple shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                  : "h-5 w-5 border-white/8 bg-white/3 text-white/70"
              }`}>
                {f.number}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Cards area (offset on desktop to make room for thread) ── */}
        <div className="md:pl-10 space-y-6">
          {/* Hero card — full width, slides in from left with scale-up */}
          <div className="p-px rounded-2xl">
            <GlowCard accent={features[0].accent} texture="dense-grid" className="p-6 md:p-8 rounded-2xl" variants={heroSlideIn}>
              <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                {/* Text side */}
                <div>
                  <FeatureCardHeader f={features[0]} />
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {features[0].description}
                  </p>
                  {features[0].guideTopics && features[0].guideTopics.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap gap-x-4 gap-y-1.5">
                      {features[0].guideTopics.map((gt) => (
                        <Link
                          key={gt.topic}
                          href={`/guide/${gt.category}/${gt.topic}`}
                          className="inline-flex items-center gap-1.5 text-xs text-muted-dark hover:text-brand-cyan transition-colors"
                        >
                          <BookOpen className="h-3 w-3 shrink-0" />
                          <span>{gt.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                {/* Visual side */}
                <div>{features[0].visual}</div>
              </div>
            </GlowCard>
          </div>

          {/* Connecting line — draws after hero lands */}
          <svg className="pointer-events-none mx-auto block h-8 w-px overflow-visible" viewBox="0 0 2 32">
            <motion.line
              x1="1" y1="0" x2="1" y2="32"
              stroke="rgba(168,85,247,0.15)"
              strokeWidth="1"
              strokeDasharray="3 3"
              variants={connectorDraw}
            />
          </svg>

          {/* Remaining 3 features — cascade with alternating directions */}
          <div className="grid gap-6 md:grid-cols-3">
            {features.slice(1).map((f, i) => (
              <motion.div
                key={f.title}
                variants={gridCardVariants[i]}
                whileHover={{ scale: 1.02, boxShadow: `0 0 20px rgba(255,255,255,0.05)` }}
                transition={TRANSITION_NORMAL}
              >
                <GlowCard accent={f.accent} className="p-6 md:p-8 h-full">
                  <FeatureCardHeader f={f} />
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {f.description}
                  </p>
                  {f.visual}
                  {f.guideTopics && f.guideTopics.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5">
                      {f.guideTopics.map((gt) => (
                        <Link
                          key={gt.topic}
                          href={`/guide/${gt.category}/${gt.topic}`}
                          className="flex items-center gap-1.5 text-xs text-muted-dark hover:text-brand-cyan transition-colors"
                        >
                          <BookOpen className="h-3 w-3 shrink-0" />
                          <span className="truncate">{gt.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
