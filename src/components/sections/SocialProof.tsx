"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveStats } from "@/hooks/useLiveStats";

function AnimatedStat({
  value,
  suffix,
  label,
  delay,
  prefix,
}: {
  value: number;
  suffix: string;
  label: string;
  delay: number;
  prefix?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [displayValue, setDisplayValue] = useState(0);

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
      setDisplayValue(Math.round(value * eased));
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [delay, inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="group text-center"
    >
      <div className="text-3xl font-extrabold tracking-tight md:text-4xl drop-shadow-sm">
        <span className="bg-linear-to-b from-white to-white/50 bg-clip-text text-transparent">
          {prefix ?? ""}
          {displayValue}
        </span>
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.45, duration: 0.25 }}
          className="text-brand-cyan/80 text-xl ml-0.5 inline-block"
        >
          {suffix}
        </motion.span>
      </div>
      <div className="mt-2 text-[11px] font-mono tracking-widest uppercase text-muted-dark transition-colors duration-300 group-hover:text-white/90 font-medium">
        {label}
      </div>
    </motion.div>
  );
}

export default function SocialProof() {
  const liveStats = useLiveStats();

  const stats = useMemo(() => [
    { value: liveStats.roadmapCompleted, suffix: `/${liveStats.roadmapTotal}`, label: "Agentic templates" },
    { value: liveStats.totalUsers, suffix: "+", label: "Users" },
    { value: Math.round(liveStats.totalExecutions / 1_000), suffix: "K", label: "Ran operations" },
    { value: liveStats.totalToolsConnected, suffix: "", label: "Tools connected" },
    { value: liveStats.totalCliCommands, suffix: "+", label: "CLI Commands" },
    { value: liveStats.coldStartSeconds, suffix: "s", label: "Cold Start", prefix: "<" },
  ], [liveStats]);

  return (
    <section className="relative border-y border-white/3 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-linear-to-r from-brand-cyan/2 via-transparent to-brand-purple/2" />

      <div className="relative mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-3 gap-6 md:grid-cols-6 md:gap-4">
          {stats.map((stat, i) => (
            <AnimatedStat
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              delay={i * 0.1}
              prefix={stat.prefix}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
