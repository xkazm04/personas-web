"use client";

import { useId, useMemo, useRef } from "react";
import { motion, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Download, Github, ChevronDown, GitBranch, Puzzle, ShieldCheck, Cpu, HeartPulse } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import FloatingParticles from "@/components/FloatingParticles";
import PrimaryCTA from "@/components/PrimaryCTA";
import { useLiveStats } from "@/hooks/useLiveStats";
import { useAnimationPauseRegister } from "@/hooks/useAnimationPause";
import { completedCount, totalPhases, progressPercent } from "@/data/roadmap-phases";
import { useTranslation } from "@/i18n/useTranslation";

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

function CommandCenterIllustration({ phasesLabel }: { phasesLabel: string }) {
  const uid = useId();
  const arcGradientId = `${uid}-arcGrad`;
  const arcGlowId = `${uid}-arcGlow`;
  const radius = 100;
  const strokeWidth = 4;
  const gap = 4;
  const segmentAngle = (360 - gap * totalPhases) / totalPhases;

  return (
    <div className="relative flex items-center justify-center group">
      <svg width="220" height="220" viewBox="0 0 220 220" className="drop-shadow-lg transition-all duration-500 group-hover:drop-shadow-xl">
        <defs>
          <linearGradient id={arcGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--muted)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0.7" />
          </linearGradient>
          <filter id={arcGlowId}><feGaussianBlur stdDeviation="1.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
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



        {/* Inner decorative ring */}
        <circle cx="110" cy="110" r={radius - 18} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" strokeDasharray="3 8" />
      </svg>

      {/* Center overlay: percentage + phases */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          {percentage}%
        </span>
        <span className="text-sm text-muted-dark font-mono tracking-wider mt-1">
          {completedCount}/{totalPhases} {phasesLabel}
        </span>
      </div>
    </div>
  );
}

export default function HeroClient() {
  const { t } = useTranslation();
  const differentiators = [
    { label: t.hero.mode1, Icon: GitBranch },
    { label: t.hero.mode2, Icon: Puzzle },
    { label: t.hero.mode3, Icon: ShieldCheck },
    { label: t.hero.mode4, Icon: Cpu },
    { label: t.hero.mode5, Icon: HeartPulse },
  ];
  const liveStats = useLiveStats();
  const DOWNLOAD_URL = process.env.NEXT_PUBLIC_DOWNLOAD_URL;
  const sectionRef = useRef<HTMLElement>(null);
  useAnimationPauseRegister(sectionRef);

  const heroStats = useMemo(() => [
    { value: String(liveStats.totalAgents), label: t.hero.agents },
    { value: formatCompact(liveStats.totalExecutions), label: t.hero.executions },
    { value: `${liveStats.totalTemplates}+`, label: t.hero.templates },
  ], [liveStats.totalAgents, liveStats.totalExecutions, liveStats.totalTemplates, t]);

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
            <span className="ml-[500px] relative inline-flex items-center overflow-hidden rounded-full border border-brand-cyan/80 bg-brand-cyan/5 px-4 py-1.5 text-lg font-bold tracking-wider uppercase text-brand-cyan font-mono shadow-[0_0_15px_color-mix(in_srgb,var(--brand-cyan)_20%,transparent)]">
              <span className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-brand-cyan/10 to-transparent" style={{ animationDuration: "3s" }} />
              <span className="relative">{t.hero.badge}</span>
            </span>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 relative">
            <SectionHeading as="h1" id="hero-heading" className="leading-[1.05]">
              <span className="block text-transparent bg-clip-text bg-linear-to-b from-foreground to-foreground/70 drop-shadow-[0_0_20px_color-mix(in_srgb,var(--foreground)_10%,transparent)]">{t.hero.headingLine1}</span>
              <GradientText className="block mt-2 drop-shadow-[0_0_30px_color-mix(in_srgb,var(--accent)_30%,transparent)]">{t.hero.headingLine2}</GradientText>
            </SectionHeading>
          </motion.div>

          <motion.div variants={fadeUp} className="mx-auto lg:mx-0 mt-8 h-px w-40 bg-linear-to-r from-brand-cyan/40 via-brand-purple/30 to-transparent shadow-[0_0_10px_color-mix(in_srgb,var(--brand-cyan)_50%,transparent)]" />

          <motion.p variants={fadeUp} className="mx-auto lg:mx-0 mt-8 max-w-2xl text-lg leading-relaxed text-muted-dark md:text-xl font-light">
            {t.hero.description} <span className="text-foreground/80 font-medium drop-shadow-[0_0_5px_color-mix(in_srgb,var(--foreground)_50%,transparent)]">{t.hero.descriptionBold}</span>
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {differentiators.map(({ label, Icon }) => (
              <motion.span
                key={label}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 rounded-full border border-white/8 bg-white/3 px-4 py-2 text-sm font-mono tracking-wide text-muted-dark transition-colors duration-300 hover:bg-white/6 hover:text-white hover:border-white/15 cursor-default"
              >
                <Icon className="h-3.5 w-3.5 opacity-60" />
                {label}
              </motion.span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="mt-12 flex w-full flex-col items-center justify-center gap-6 sm:w-auto sm:flex-row lg:items-start">
            <PrimaryCTA
              href={DOWNLOAD_URL ? "/api/download" : "#download"}
              icon={Download}
              label={DOWNLOAD_URL ? t.hero.downloadForWindows : t.hero.joinWaitlist}
            />
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="group relative flex w-[min(100%,20rem)] items-center justify-center gap-3 rounded-full border border-white/10 bg-white/2 px-8 py-4 text-sm font-medium text-muted transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/5 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] sm:w-auto overflow-hidden focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:outline-none">
              <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <Github className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <span className="relative z-10">{t.hero.viewOnGithub}</span>
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-white/6 bg-white/2 px-4 py-3 lg:hidden" data-testid="mock-stats">
            <div className="text-sm font-mono uppercase tracking-wider text-muted-dark">{t.hero.adoptionSnapshot}</div>
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
                  <div className="text-sm text-muted-dark font-mono tracking-wider">{stat.label}</div>
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
            <CommandCenterIllustration phasesLabel={t.hero.phases} />
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="rounded-full border border-white/6 bg-white/2 px-4 py-1.5 text-sm font-mono tracking-wider text-muted-dark uppercase shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                {t.hero.commandCenter}
              </div>
              <div className="flex gap-6 text-center" data-testid="mock-stats">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="group">
                    <div className="text-xl font-bold tracking-tight transition-colors group-hover:text-brand-cyan drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{stat.value}</div>
                    <div className="text-sm text-muted-dark font-mono tracking-wider transition-colors group-hover:text-white/70">{stat.label}</div>
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
          <span className="text-sm tracking-widest uppercase text-muted-dark">{t.hero.scroll}</span>
          <ChevronDown className="h-4 w-4 text-muted-dark animate-scroll-hint" />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background via-background/80 to-transparent" />
    </section>
  );
}
