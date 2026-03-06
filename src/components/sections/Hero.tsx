"use client";

import { useId, useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { Download, Github, ChevronDown, LayoutDashboard } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import FloatingParticles from "@/components/FloatingParticles";
import PrimaryCTA from "@/components/PrimaryCTA";
import { useAuthStore } from "@/stores/authStore";

const completedCount = 11;
const totalCount = 15;
const percentage = Math.round((completedCount / totalCount) * 100);

const phases = Array.from({ length: totalCount }, (_, i) => ({
  index: i + 1,
  completed: i < completedCount,
}));

function ProgressArc({ disableFilter = false }: { disableFilter?: boolean }) {
  const uid = useId();
  const gradientId = `${uid}-arcGradient`;
  const glowId = `${uid}-arcGlow`;
  const radius = 90;
  const strokeWidth = 5;
  const gap = 4;
  const segmentAngle = (360 - gap * totalCount) / totalCount;

  return (
    <div className="relative flex items-center justify-center group">
      <svg width="220" height="220" viewBox="0 0 220 220" className="drop-shadow-[0_0_30px_rgba(6,182,212,0.08)] transition-all duration-500 group-hover:drop-shadow-[0_0_40px_rgba(6,182,212,0.2)]">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(6,182,212,0.8)" />
            <stop offset="100%" stopColor="rgba(168,85,247,0.8)" />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
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
              fill="none" stroke={phase.completed ? `url(#${gradientId})` : "rgba(255,255,255,0.06)"}
              strokeWidth={phase.completed ? strokeWidth : strokeWidth - 1} strokeLinecap="round"
              filter={phase.completed && !disableFilter ? `url(#${glowId})` : undefined} opacity={phase.completed ? 1 : 0.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: phase.completed ? 1 : 0.5 }}
              transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
            />
          );
        })}
        <circle cx="110" cy="110" r={radius - 18} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" strokeDasharray="3 8" />
        <circle cx="110" cy="110" r={radius - 25} fill={`url(#${gradientId})`} opacity="0.1" className="animate-pulse-slow" filter={disableFilter ? undefined : `url(#${glowId})`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight bg-linear-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
          {percentage}%
        </span>
        <span className="text-[10px] text-muted-dark font-mono tracking-wider mt-1">
          {completedCount}/{totalCount} PHASES
        </span>
      </div>
    </div>
  );
}

const heroStats = [
  { value: 42, decimals: 0, suffix: "", label: "Agents" },
  { value: 18.4, decimals: 1, suffix: "k", label: "Executions" },
  { value: 120, decimals: 0, suffix: "+", label: "Templates" },
];

function HeroAnimatedStat({
  value,
  decimals,
  suffix,
  label,
  delay,
  className,
  labelClassName,
}: {
  value: number;
  decimals: number;
  suffix: string;
  label: string;
  delay: number;
  className?: string;
  labelClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    let rafId = 0;
    const start = performance.now() + delay * 1000;
    const duration = 1100;

    const tick = (timestamp: number) => {
      if (timestamp < start) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = value * eased;
      setDisplay(decimals > 0 ? current.toFixed(decimals) : String(Math.round(current)));
      if (t < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [delay, inView, value, decimals]);

  return (
    <div ref={ref} className="group">
      <div className={className}>
        {display}
        {suffix && <span className="text-brand-cyan/70">{suffix}</span>}
      </div>
      <div className={labelClassName}>{label}</div>
    </div>
  );
}

export default function Hero() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const uid = useId();
  const ring1Id = `${uid}-ringGradient1`;
  const ring2Id = `${uid}-ringGradient2`;
  const operatingModes = ["Design in one sentence", "Run locally for free", "Scale to cloud when needed"];
  const prefersReducedMotion = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, prefersReducedMotion ? 1 : 0]);

  // 3D Tilt effect for the right card
  const [isInteracting, setIsInteracting] = useState(false);
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
    if (!isInteracting) setIsInteracting(true);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsInteracting(false);
  };

  return (
    <section ref={containerRef} className="noise relative flex min-h-screen items-center justify-center overflow-hidden px-4 sm:px-6" style={{ contain: "layout style paint" }} data-animate-when-visible>
      {/* Background layers */}
      <motion.div style={{ y: y1, opacity, willChange: "transform" }} className="pointer-events-none absolute inset-0">
        <div className="animate-pulse-slow absolute left-[15%] top-[15%] h-200 w-200 rounded-full mix-blend-screen" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0.02) 50%, transparent 70%)" }} />
        <div className="animate-pulse-slower absolute bottom-[10%] right-[5%] h-225 w-225 rounded-full mix-blend-screen" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(6,182,212,0.02) 50%, transparent 70%)" }} />
        <div className="animate-pulse-slow absolute left-1/2 top-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen" style={{ background: "radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 60%)", animationDelay: "3s" }} />
      </motion.div>

      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
      <FloatingParticles />

      {/* Orbital ring */}
      <motion.div style={{ y: y2, opacity, willChange: "transform, opacity" }} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="animate-spin-slow" style={{ width: 800, height: 800 }}>
          <svg viewBox="0 0 800 800" className="h-full w-full opacity-60">
            <circle cx="400" cy="400" r="380" fill="none" stroke={`url(#${ring1Id})`} strokeWidth="1" strokeDasharray="4 12" />
            <circle cx="400" cy="400" r="280" fill="none" stroke={`url(#${ring2Id})`} strokeWidth="1" strokeDasharray="3 15" />
            <circle cx="400" cy="20" r="3" fill="rgba(6,182,212,0.4)" className="animate-pulse" />
            <circle cx="120" cy="400" r="2" fill="rgba(168,85,247,0.4)" className="animate-pulse" style={{ animationDelay: "1s" }} />
            <defs>
              <linearGradient id={ring1Id} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(6,182,212,0.1)" />
                <stop offset="50%" stopColor="rgba(168,85,247,0.02)" />
                <stop offset="100%" stopColor="rgba(6,182,212,0.1)" />
              </linearGradient>
              <linearGradient id={ring2Id} x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(168,85,247,0.1)" />
                <stop offset="50%" stopColor="rgba(6,182,212,0.02)" />
                <stop offset="100%" stopColor="rgba(168,85,247,0.1)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(10,10,18,0.8) 100%)" }} />

      {/* Content */}
      <motion.div
        initial="hidden" animate="visible" variants={staggerContainer}
        className="relative z-10 mx-auto max-w-6xl w-full grid gap-12 lg:grid-cols-[1fr_auto] items-center"
      >
        {/* Left — text */}
        <div className="text-center lg:text-left">
          <motion.div variants={fadeUp}>
            <span className="relative inline-flex items-center overflow-hidden rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-1.5 text-xs font-medium tracking-wider uppercase text-brand-cyan font-mono shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <span className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-brand-cyan/10 to-transparent" style={{ animationDuration: "3s" }} />
              <span className="relative">AI Agent Platform</span>
            </span>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 relative">
            <SectionHeading as="h1" className="leading-[1.05]">
              <span className="block text-transparent bg-clip-text bg-linear-to-b from-white to-white/70 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">Intelligent agents</span>
              <GradientText className="block mt-2 drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">that work for you</GradientText>
            </SectionHeading>
          </motion.div>

          <motion.div variants={fadeUp} className="mx-auto lg:mx-0 mt-8 h-px w-40 bg-linear-to-r from-brand-cyan/40 via-brand-purple/30 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.5)]" />

          <motion.p variants={fadeUp} className="mx-auto lg:mx-0 mt-8 max-w-2xl text-lg leading-relaxed text-muted-dark md:text-xl font-light">
            Design agents in natural language. Orchestrate them locally or in the
            cloud. <span className="text-white/80 font-medium drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">No workflow diagrams. No code.</span>
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {operatingModes.map((mode) => (
              <span
                key={mode}
                className="rounded-full border border-white/10 bg-white/3 px-4 py-2 text-xs font-mono tracking-wide text-muted-dark backdrop-blur-sm transition-colors hover:bg-white/6 hover:text-white cursor-default"
              >
                {mode}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="mt-16 flex w-full flex-col items-center justify-center gap-5 sm:w-auto sm:flex-row lg:items-start">
            {isAuthenticated ? (
              <PrimaryCTA href="/dashboard" icon={LayoutDashboard} label="Open Dashboard" />
            ) : (
              <PrimaryCTA href="#download" icon={Download} label="Download for Windows" />
            )}
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex w-[min(100%,20rem)] items-center justify-center gap-3 rounded-full border border-white/8 bg-white/2 px-8 py-4 text-sm font-medium text-muted-dark transition-all duration-300 hover:border-white/15 hover:text-white sm:w-auto">
              <Github className="h-5 w-5" />
              <span>View on GitHub</span>
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-white/6 bg-white/2 px-4 py-3 lg:hidden">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-dark">Adoption snapshot</div>
            <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-white/6">
              <div
                className="h-full rounded-full bg-linear-to-r from-brand-cyan to-brand-purple"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-center gap-6 text-center">
              {heroStats.map((stat, i) => (
                <HeroAnimatedStat
                  key={stat.label}
                  {...stat}
                  delay={i * 0.2}
                  className="text-sm font-bold tracking-tight font-mono"
                  labelClassName="text-[10px] text-muted-dark font-mono tracking-wider"
                />
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
            <ProgressArc disableFilter={isInteracting} />
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="rounded-full border border-white/6 bg-white/2 px-4 py-1.5 text-[10px] font-mono tracking-wider text-muted-dark uppercase shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                Adoption
              </div>
              <div className="flex gap-6 text-center">
                {heroStats.map((stat, i) => (
                  <HeroAnimatedStat
                    key={stat.label}
                    {...stat}
                    delay={i * 0.2}
                    className="text-xl font-bold tracking-tight transition-colors group-hover:text-brand-cyan drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]"
                    labelClassName="text-[10px] text-muted-dark font-mono tracking-wider transition-colors group-hover:text-white/70"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1 }} className="flex flex-col items-center gap-1">
          <span className="text-[10px] tracking-widest uppercase text-muted-dark">Scroll</span>
          <ChevronDown className="h-4 w-4 text-muted-dark animate-scroll-hint" />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background via-background/80 to-transparent" />
    </section>
  );
}
