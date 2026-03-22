"use client";

import { useId, useMemo, useRef } from "react";
import { motion, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Download, Github, ChevronDown } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import FloatingParticles from "@/components/FloatingParticles";
import PrimaryCTA from "@/components/PrimaryCTA";
import { useLiveStats } from "@/hooks/useLiveStats";
import { useAnimationPauseRegister } from "@/hooks/useAnimationPause";
import { completedCount, totalPhases, progressPercent } from "@/data/roadmap-phases";

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

const percentage = progressPercent;

const phases = Array.from({ length: totalPhases }, (_, i) => ({
  index: i + 1,
  completed: i < completedCount,
}));

/* ── Agent dot positions (inner workspace scene) ───────────────────── */
const agentDots = [
  { cx: 75, cy: 95, color: "var(--brand-cyan)", label: "cyan" },
  { cx: 145, cy: 85, color: "var(--brand-purple)", label: "purple" },
  { cx: 110, cy: 130, color: "var(--brand-emerald)", label: "emerald" },
] as const;

function CommandCenterIllustration() {
  const uid = useId();
  const arcGradientId = `${uid}-arcGrad`;
  const arcGlowId = `${uid}-arcGlow`;
  const cyanGlowId = `${uid}-cyanGlow`;
  const purpleGlowId = `${uid}-purpleGlow`;
  const emeraldGlowId = `${uid}-emeraldGlow`;
  const radius = 100;
  const strokeWidth = 4;
  const gap = 4;
  const segmentAngle = (360 - gap * totalPhases) / totalPhases;
  const glowFilters = [cyanGlowId, purpleGlowId, emeraldGlowId];

  return (
    <div className="relative flex items-center justify-center group">
      <svg width="220" height="220" viewBox="0 0 220 220" className="drop-shadow-lg transition-all duration-500 group-hover:drop-shadow-xl">
        <defs>
          <linearGradient id={arcGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--muted)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0.7" />
          </linearGradient>
          <filter id={arcGlowId}><feGaussianBlur stdDeviation="1.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id={cyanGlowId}><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id={purpleGlowId}><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id={emeraldGlowId}><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        {/* Outer segmented arc ring */}
        <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} />
        {phases.map((phase, i) => {
          const startAngle = i * (segmentAngle + gap) - 90;
          const endAngle = startAngle + segmentAngle;
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          const x1 = 110 + radius * Math.cos(startRad);
          const y1 = 110 + radius * Math.sin(startRad);
          const x2 = 110 + radius * Math.cos(endRad);
          const y2 = 110 + radius * Math.sin(endRad);
          return (
            <motion.path key={phase.index} d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
              fill="none" stroke={phase.completed ? `url(#${arcGradientId})` : "rgba(255,255,255,0.06)"}
              strokeWidth={phase.completed ? strokeWidth : strokeWidth - 1} strokeLinecap="round"
              filter={phase.completed ? `url(#${arcGlowId})` : undefined} opacity={phase.completed ? 1 : 0.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: phase.completed ? 1 : 0.5 }}
              transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
            />
          );
        })}

        {/* Inner scene: glassmorphism workspace panel */}
        <rect x="60" y="65" width="100" height="70" rx="8" ry="8"
          fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        {/* Title bar */}
        <rect x="60" y="65" width="100" height="12" rx="8" ry="8" fill="var(--foreground)" fillOpacity="0.03" />
        <rect x="60" y="73" width="100" height="4" rx="0" ry="0" fill="var(--foreground)" fillOpacity="0.03" />
        {/* Window dots */}
        <circle cx="68" cy="71" r="1.5" fill="var(--brand-rose)" fillOpacity="0.6" />
        <circle cx="74" cy="71" r="1.5" fill="var(--brand-amber)" fillOpacity="0.6" />
        <circle cx="80" cy="71" r="1.5" fill="var(--brand-emerald)" fillOpacity="0.6" />
        {/* "PERSONAS" label */}
        <text x="110" y="72" textAnchor="middle" fontSize="4" fill="var(--foreground)" fillOpacity="0.3" fontFamily="monospace">PERSONAS</text>

        {/* Connecting arc lines between agents */}
        <motion.path d={`M ${agentDots[0].cx} ${agentDots[0].cy} Q 110 70 ${agentDots[1].cx} ${agentDots[1].cy}`}
          fill="none" stroke="var(--brand-cyan)" strokeOpacity="0.15" strokeWidth="0.8" strokeDasharray="3 2"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1.8, ease: "easeOut" }} />
        <motion.path d={`M ${agentDots[1].cx} ${agentDots[1].cy} Q 140 115 ${agentDots[2].cx} ${agentDots[2].cy}`}
          fill="none" stroke="var(--brand-purple)" strokeOpacity="0.15" strokeWidth="0.8" strokeDasharray="3 2"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 2.0, ease: "easeOut" }} />
        <motion.path d={`M ${agentDots[2].cx} ${agentDots[2].cy} Q 80 120 ${agentDots[0].cx} ${agentDots[0].cy}`}
          fill="none" stroke="var(--brand-emerald)" strokeOpacity="0.15" strokeWidth="0.8" strokeDasharray="3 2"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 2.2, ease: "easeOut" }} />

        {/* Pulsing agent dots */}
        {agentDots.map((dot, i) => (
          <g key={dot.label}>
            <motion.circle cx={dot.cx} cy={dot.cy} r="6"
              fill={dot.color} opacity={0} filter={`url(#${glowFilters[i]})`}
              animate={{ opacity: [0.15, 0.35, 0.15] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }} />
            <motion.circle cx={dot.cx} cy={dot.cy} r="3"
              fill={dot.color} filter={`url(#${glowFilters[i]})`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.5 + i * 0.2, ease: "easeOut" }} />
            <motion.circle cx={dot.cx} cy={dot.cy} r="3"
              fill="none" stroke={dot.color} strokeWidth="0.5"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.8 + i * 0.5, ease: "easeOut" }} />
          </g>
        ))}

        {/* Inner decorative ring */}
        <circle cx="110" cy="110" r={radius - 18} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" strokeDasharray="3 8" />
      </svg>

      {/* Center overlay: percentage + phases */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          {percentage}%
        </span>
        <span className="text-[10px] text-muted-dark font-mono tracking-wider mt-1">
          {completedCount}/{totalPhases} PHASES
        </span>
      </div>
    </div>
  );
}

export default function HeroClient() {
  const operatingModes = ["Design in one sentence", "Run locally for free", "Scale to cloud when needed"];
  const liveStats = useLiveStats();
  const DOWNLOAD_URL = process.env.NEXT_PUBLIC_DOWNLOAD_URL;
  const sectionRef = useRef<HTMLElement>(null);
  useAnimationPauseRegister(sectionRef);

  const heroStats = useMemo(() => [
    { value: String(liveStats.totalAgents), label: "Agents" },
    { value: formatCompact(liveStats.totalExecutions), label: "Executions" },
    { value: `${liveStats.totalTemplates}+`, label: "Templates" },
  ], [liveStats.totalAgents, liveStats.totalExecutions, liveStats.totalTemplates]);

  // 3D Tilt effect for the right card
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section ref={sectionRef} aria-labelledby="hero-heading" className="noise relative flex min-h-screen items-center justify-center overflow-hidden px-4 sm:px-6" style={{ contain: "layout style paint" }} data-animate-when-visible>
      {/* Background layers */}
      <FloatingParticles />

      <div className="hero-vignette pointer-events-none absolute inset-0" />

      {/* Content */}
      <motion.div
        initial="hidden" animate="visible" variants={staggerContainer}
        className="relative z-10 mx-auto max-w-6xl w-full grid gap-12 lg:grid-cols-[1fr_auto] items-center"
      >
        {/* Left — text */}
        <div className="text-center lg:text-left">
          <motion.div variants={fadeUp}>
            <span className="relative inline-flex items-center overflow-hidden rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-1.5 text-xs font-medium tracking-wider uppercase text-brand-cyan font-mono shadow-[0_0_15px_color-mix(in_srgb,var(--brand-cyan)_20%,transparent)]">
              <span className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-brand-cyan/10 to-transparent" style={{ animationDuration: "3s" }} />
              <span className="relative">AI Agent Platform</span>
            </span>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 relative">
            <SectionHeading as="h1" id="hero-heading" className="leading-[1.05]">
              <span className="block text-transparent bg-clip-text bg-linear-to-b from-foreground to-foreground/70 drop-shadow-[0_0_20px_color-mix(in_srgb,var(--foreground)_10%,transparent)]">Intelligent agents</span>
              <GradientText className="block mt-2 drop-shadow-[0_0_30px_color-mix(in_srgb,var(--accent)_30%,transparent)]">that work for you</GradientText>
            </SectionHeading>
          </motion.div>

          <motion.div variants={fadeUp} className="mx-auto lg:mx-0 mt-8 h-px w-40 bg-linear-to-r from-brand-cyan/40 via-brand-purple/30 to-transparent shadow-[0_0_10px_color-mix(in_srgb,var(--brand-cyan)_50%,transparent)]" />

          <motion.p variants={fadeUp} className="mx-auto lg:mx-0 mt-8 max-w-2xl text-lg leading-relaxed text-muted-dark md:text-xl font-light">
            Design agents in natural language. Orchestrate them locally or in the
            cloud. <span className="text-foreground/80 font-medium drop-shadow-[0_0_5px_color-mix(in_srgb,var(--foreground)_50%,transparent)]">No workflow diagrams. No code.</span>
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {operatingModes.map((mode, i) => (
              <motion.span
                key={mode}
                whileHover={{ scale: 1.05 }}
                className="rounded-full border border-white/8 bg-white/3 px-4 py-2 text-xs font-mono tracking-wide text-muted-dark transition-colors duration-300 hover:bg-white/6 hover:text-white hover:border-white/15 cursor-default"
              >
                {mode}
              </motion.span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="mt-12 flex w-full flex-col items-center justify-center gap-6 sm:w-auto sm:flex-row lg:items-start">
            <PrimaryCTA
              href={DOWNLOAD_URL ? "/api/download" : "#download"}
              icon={Download}
              label={DOWNLOAD_URL ? "Download for Windows" : "Join Windows Waitlist"}
            />
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="group relative flex w-[min(100%,20rem)] items-center justify-center gap-3 rounded-full border border-white/10 bg-white/2 px-8 py-4 text-sm font-medium text-muted transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/5 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] sm:w-auto overflow-hidden focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:outline-none">
              <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <Github className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <span className="relative z-10">View on GitHub</span>
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-white/6 bg-white/2 px-4 py-3 lg:hidden" data-testid="mock-stats">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-dark">Adoption snapshot</div>
            <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-white/6">
              <div
                className="h-full rounded-full bg-linear-to-r from-brand-cyan to-brand-purple"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-center gap-6 text-center">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-sm font-bold tracking-tight font-mono">{stat.value}</div>
                  <div className="text-[10px] text-muted-dark font-mono tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right — progress arc */}
        <motion.div
          variants={fadeUp}
          className="hidden lg:flex flex-col items-center gap-4 perspective-1000"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        >
          <div className="relative p-8 rounded-3xl border border-white/5 bg-white/2 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-white/10 hover:bg-white/5" style={{ transform: "translateZ(50px)" }}>
            <CommandCenterIllustration />
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="rounded-full border border-white/6 bg-white/2 px-4 py-1.5 text-[10px] font-mono tracking-wider text-muted-dark uppercase shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                Command Center
              </div>
              <div className="flex gap-6 text-center" data-testid="mock-stats">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="group">
                    <div className="text-xl font-bold tracking-tight transition-colors group-hover:text-brand-cyan drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{stat.value}</div>
                    <div className="text-[10px] text-muted-dark font-mono tracking-wider transition-colors group-hover:text-white/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }} className="flex flex-col items-center gap-1">
          <span className="text-[10px] tracking-widest uppercase text-muted-dark">Scroll</span>
          <ChevronDown className="h-4 w-4 text-muted-dark animate-scroll-hint" />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background via-background/80 to-transparent" />
    </section>
  );
}
