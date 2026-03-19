"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Shield, Cpu, FlaskConical, Users, Dna, Brain, Heart, Zap,
  Rocket, BarChart3, Package, Wrench, Plug,
} from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animations";

const features = [
  { icon: Shield, label: "Credential Vault", href: "#vault", color: "#f43f5e" },
  { icon: Cpu, label: "Design Engine", href: "#design", color: "#a855f7" },
  { icon: FlaskConical, label: "Lab & Arena", href: "#lab", color: "#fbbf24" },
  { icon: Users, label: "Team Canvas", href: "#teams", color: "#34d399" },
  { icon: Dna, label: "Prompt Genome", href: "#genome", color: "#06b6d4" },
  { icon: Brain, label: "Agent Memory", href: "#memory", color: "#a855f7" },
  { icon: Heart, label: "Self-Healing", href: "#healing", color: "#f43f5e" },
  { icon: Zap, label: "8 Trigger Types", href: "#triggers", color: "#fbbf24" },
  { icon: Rocket, label: "Multi-Deploy", href: "#deploy", color: "#60a5fa" },
  { icon: BarChart3, label: "Observability", href: "#observe", color: "#34d399" },
  { icon: Package, label: "Bundle Sharing", href: "#sharing", color: "#06b6d4" },
  { icon: Wrench, label: "DevTools Suite", href: "#devtools", color: "#a855f7" },
  { icon: Plug, label: "40+ Connectors", href: "#connectors", color: "#f43f5e" },
];

const stats = [
  { value: 631, suffix: "", label: "Backend commands" },
  { value: 40, suffix: "+", label: "Connectors" },
  { value: 8, suffix: "", label: "Trigger types" },
  { value: 21, suffix: "", label: "Feature modules" },
];

function AnimatedCounter({ value, suffix, delay }: { value: number; suffix: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let rafId = 0;
    const start = performance.now() + delay;
    const duration = 1200;
    const tick = (ts: number) => {
      if (ts < start) { rafId = requestAnimationFrame(tick); return; }
      const t = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView, value, delay]);

  return (
    <div ref={ref} className="text-3xl sm:text-4xl font-bold tracking-tight bg-linear-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
      {display}{suffix}
    </div>
  );
}

export default function TodoHero() {
  return (
    <SectionWrapper id="overview" className="pt-8 md:pt-16">
      {/* Background orb */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 animate-pulse-slow" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)" }} />
      </div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="mx-auto max-w-4xl text-center relative z-10">
        <motion.div variants={fadeUp}>
          <span className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-5 py-2 text-xs font-mono tracking-wider uppercase text-brand-cyan shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <span className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-brand-cyan/10 to-transparent" style={{ animationDuration: "3s" }} />
            <span className="relative flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_6px_rgba(6,182,212,0.8)] animate-pulse" />
              Full Feature Map
            </span>
          </span>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8">
          <SectionHeading>
            Everything your agents{" "}
            <GradientText className="drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">actually do</GradientText>
          </SectionHeading>
        </motion.div>

        <motion.div variants={fadeUp} className="mx-auto mt-6 h-px w-40 bg-linear-to-r from-transparent via-brand-cyan/40 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.5)]" />

        <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-lg text-muted-dark leading-relaxed font-light">
          The desktop app ships with <span className="text-white/80 font-medium">631 backend commands</span> across 21 feature modules.
          Here is every capability — from encrypted credential vaults to genetic prompt evolution.
        </motion.p>

        {/* Feature pills */}
        <motion.div variants={fadeUp} className="mt-12 flex flex-wrap justify-center gap-2.5">
          {features.map((f, i) => (
            <motion.a
              key={f.label}
              href={f.href}
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4, type: "spring", bounce: 0.3 }}
              whileHover={{ scale: 1.08, boxShadow: `0 0 20px ${f.color}25` }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center gap-2 overflow-hidden rounded-full border border-white/8 bg-white/3 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/8 hover:text-white"
            >
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <f.icon className="relative h-3.5 w-3.5 transition-all duration-300 group-hover:scale-110" style={{ color: f.color }} />
              <span className="relative">{f.label}</span>
            </motion.a>
          ))}
        </motion.div>

        {/* Stats with animated counters */}
        <motion.div variants={fadeUp} className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 mx-auto max-w-2xl">
          {stats.map((stat, i) => (
            <div key={stat.label} className="group relative rounded-2xl border border-white/6 bg-white/2 px-4 py-5 backdrop-blur-sm transition-all duration-300 hover:border-white/15 hover:bg-white/5">
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(circle at 50% 50%, rgba(6,182,212,0.05), transparent 70%)" }} />
              <AnimatedCounter value={stat.value} suffix={stat.suffix} delay={i * 200} />
              <div className="text-[10px] font-mono text-muted-dark tracking-wider uppercase mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
}
