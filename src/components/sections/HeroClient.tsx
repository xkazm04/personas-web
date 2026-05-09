"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Download, Github, ChevronDown } from "lucide-react";
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

function formatDelta(n: number): string {
  const abs = Math.abs(n);
  return n > 0 ? `+${formatCompact(abs)}` : `-${formatCompact(abs)}`;
}

type Direction = "up" | "down" | "flat";

function directionOf(delta: number): Direction {
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "flat";
}

/**
 * 18px-tall sparkline showing the last 7 daily snapshots of a metric.
 * Y axis is normalized within the series window so a flat-but-low series
 * still renders as a flat line in the middle of the box.
 */
function Sparkline({ values, direction }: { values: number[]; direction: Direction }) {
  const width = 36;
  const height = 18;
  const padY = 2;

  if (values.length < 2) return <div style={{ width, height }} aria-hidden />;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const stepX = width / (values.length - 1);

  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = range === 0 ? height / 2 : padY + (height - padY * 2) * (1 - (v - min) / range);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const stroke =
    direction === "up" ? "rgb(52 211 153)" :
    direction === "down" ? "rgb(251 113 133)" :
    "rgba(255,255,255,0.4)";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${stroke})` }}
      />
    </svg>
  );
}

function DeltaPill({ delta, direction, label }: { delta: number; direction: Direction; label: string }) {
  if (direction === "flat") return null;
  const arrow = direction === "up" ? "↑" : "↓";
  const cls =
    direction === "up"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
      : "border-rose-400/30 bg-rose-400/10 text-rose-300";

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-px text-[10px] font-mono font-semibold leading-none tabular-nums ${cls}`}
      title={`${formatDelta(delta)} ${label} this week`}
    >
      <span aria-hidden>{arrow}</span>
      {formatDelta(delta)}
    </span>
  );
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
  const operatingModes = [t.hero.mode1, t.hero.mode2, t.hero.mode3];
  const liveStats = useLiveStats();
  const DOWNLOAD_URL = process.env.NEXT_PUBLIC_DOWNLOAD_URL;
  const sectionRef = useRef<HTMLElement>(null);
  useAnimationPauseRegister(sectionRef);

  const heroStats = useMemo(() => {
    const build = (
      raw: number,
      formatted: string,
      label: string,
      series: number[],
      prev: number,
    ) => {
      const delta = raw - prev;
      return {
        value: formatted,
        label,
        series,
        delta,
        direction: directionOf(delta),
      };
    };
    return [
      build(
        liveStats.totalAgents,
        String(liveStats.totalAgents),
        t.hero.agents,
        liveStats.series.totalAgents,
        liveStats.trend7d.totalAgents,
      ),
      build(
        liveStats.totalExecutions,
        formatCompact(liveStats.totalExecutions),
        t.hero.executions,
        liveStats.series.totalExecutions,
        liveStats.trend7d.totalExecutions,
      ),
      build(
        liveStats.totalTemplates,
        `${liveStats.totalTemplates}+`,
        t.hero.templates,
        liveStats.series.totalTemplates,
        liveStats.trend7d.totalTemplates,
      ),
    ];
  }, [
    liveStats.totalAgents,
    liveStats.totalExecutions,
    liveStats.totalTemplates,
    liveStats.trend7d.totalAgents,
    liveStats.trend7d.totalExecutions,
    liveStats.trend7d.totalTemplates,
    liveStats.series.totalAgents,
    liveStats.series.totalExecutions,
    liveStats.series.totalTemplates,
    t,
  ]);

  // 3D Tilt effect for the right card.
  // Skipped on coarse pointers and when the user prefers reduced motion;
  // updates are coalesced to one write per animation frame, the bounding
  // rect is cached on enter (avoiding forced layout per mousemove), and
  // CSS transition handles damping so we don't pay for spring interpolation.
  const reducedMotion = useReducedMotion();
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(pointer: coarse)");
    setCoarsePointer(mql.matches);
    const listener = (e: MediaQueryListEvent) => setCoarsePointer(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  const tiltDisabled = !!reducedMotion || coarsePointer;

  const tiltCardRef = useRef<HTMLDivElement>(null);
  const tiltRectRef = useRef<DOMRect | null>(null);
  const tiltRafRef = useRef<number | null>(null);
  const tiltTargetRef = useRef<{ xPct: number; yPct: number }>({ xPct: 0, yPct: 0 });

  const writeTiltTransform = (xPct: number, yPct: number) => {
    const el = tiltCardRef.current;
    if (!el) return;
    const rotateX = (-yPct) * 20; // [-0.5,0.5] -> [10deg,-10deg]
    const rotateY = xPct * 20;    // [-0.5,0.5] -> [-10deg,10deg]
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleTiltEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tiltDisabled) return;
    tiltRectRef.current = e.currentTarget.getBoundingClientRect();
  };

  const handleTiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tiltDisabled) return;
    const rect = tiltRectRef.current;
    if (!rect) return;
    tiltTargetRef.current = {
      xPct: (e.clientX - rect.left) / rect.width - 0.5,
      yPct: (e.clientY - rect.top) / rect.height - 0.5,
    };
    if (tiltRafRef.current !== null) return;
    tiltRafRef.current = requestAnimationFrame(() => {
      tiltRafRef.current = null;
      const { xPct, yPct } = tiltTargetRef.current;
      writeTiltTransform(xPct, yPct);
    });
  };

  const handleTiltLeave = () => {
    tiltRectRef.current = null;
    if (tiltRafRef.current !== null) {
      cancelAnimationFrame(tiltRafRef.current);
      tiltRafRef.current = null;
    }
    writeTiltTransform(0, 0);
  };

  useEffect(() => {
    return () => {
      if (tiltRafRef.current !== null) cancelAnimationFrame(tiltRafRef.current);
    };
  }, []);

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
            <span className="relative inline-flex items-center overflow-hidden rounded-full border border-brand-cyan/80 bg-brand-cyan/5 px-4 py-1.5 text-lg font-bold tracking-wider uppercase text-brand-cyan font-mono shadow-[0_0_15px_color-mix(in_srgb,var(--brand-cyan)_20%,transparent)]">
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
            {operatingModes.map((mode, i) => (
              <motion.span
                key={mode}
                whileHover={{ scale: 1.05 }}
                className="rounded-full border border-white/8 bg-white/3 px-4 py-2 text-sm font-mono tracking-wide text-muted-dark transition-colors duration-300 hover:bg-white/6 hover:text-white hover:border-white/15 cursor-default"
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
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="text-sm font-bold tracking-tight font-mono">{stat.value}</div>
                    <Sparkline values={stat.series} direction={stat.direction} />
                  </div>
                  <div className="mt-0.5 flex items-center justify-center gap-1.5">
                    <div className="text-sm text-muted-dark font-mono tracking-wider">{stat.label}</div>
                    <DeltaPill delta={stat.delta} direction={stat.direction} label={stat.label} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right — progress arc */}
        <motion.div
          variants={fadeUp}
          className="hidden lg:flex flex-col items-center gap-4 perspective-1000"
        >
          <div
            ref={tiltCardRef}
            onMouseEnter={tiltDisabled ? undefined : handleTiltEnter}
            onMouseMove={tiltDisabled ? undefined : handleTiltMove}
            onMouseLeave={tiltDisabled ? undefined : handleTiltLeave}
            style={{
              transformStyle: "preserve-3d",
              transition: tiltDisabled ? undefined : "transform 200ms ease-out",
              transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
              willChange: tiltDisabled ? undefined : "transform",
            }}
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
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="text-xl font-bold tracking-tight transition-colors group-hover:text-brand-cyan drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{stat.value}</div>
                      <Sparkline values={stat.series} direction={stat.direction} />
                    </div>
                    <div className="mt-0.5 flex items-center justify-center gap-1.5">
                      <div className="text-sm text-muted-dark font-mono tracking-wider transition-colors group-hover:text-white/70">{stat.label}</div>
                      <DeltaPill delta={stat.delta} direction={stat.direction} label={stat.label} />
                    </div>
                  </div>
                ))}
              </div>
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
