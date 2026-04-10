"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Github,
  CreditCard,
  Calendar,
  HardDrive,
} from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, revealFromBelow, staggerContainer } from "@/lib/animations";

import type { LucideIcon } from "lucide-react";

/* ────────────────────────── Data ────────────────────────── */

interface AgentData {
  name: string;
  icon: LucideIcon;
  status: string;
  executions: number;
  rate: number;
  color: string;
}

const initialAgents: AgentData[] = [
  { name: "Email Triage", icon: Mail, status: "running", executions: 12_847, rate: 94, color: "#06b6d4" },
  { name: "Slack Digest", icon: MessageSquare, status: "running", executions: 8_320, rate: 87, color: "#a855f7" },
  { name: "PR Reviewer", icon: Github, status: "running", executions: 5_614, rate: 99, color: "#34d399" },
  { name: "Deploy Monitor", icon: CreditCard, status: "healing", executions: 3_271, rate: 72, color: "#f43f5e" },
  { name: "Meeting Notes", icon: Calendar, status: "idle", executions: 2_908, rate: 100, color: "#fbbf24" },
  { name: "Doc Indexer", icon: HardDrive, status: "running", executions: 1_456, rate: 91, color: "#60a5fa" },
];

const statusStyles: Record<string, { dot: string; label: string; text: string }> = {
  running: { dot: "bg-brand-emerald shadow-[0_0_6px_rgba(52,211,153,0.6)]", label: "Running", text: "text-brand-emerald" },
  healing: { dot: "bg-brand-amber shadow-[0_0_6px_rgba(251,191,36,0.6)] animate-glow-border", label: "Healing", text: "text-brand-amber" },
  idle: { dot: "bg-white/20", label: "Idle", text: "text-muted-dark" },
};

/* ────────────────────────── Card animation ────────────────────────── */

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

/* ────────────────────────── Component ────────────────────────── */

export default function VisionGrid() {
  const prefersReducedMotion = useReducedMotion();
  const [agents, setAgents] = useState(initialAgents);
  const [flashIdx, setFlashIdx] = useState<number | null>(null);

  /* ── Activity tick (3-5s random interval) ── */
  const tick = useCallback(() => {
    const idx = Math.floor(Math.random() * initialAgents.length);
    const bump = 1 + Math.floor(Math.random() * 3);

    setAgents((prev) => {
      const next = [...prev];
      const agent = { ...next[idx] };
      agent.executions += bump;
      if (agent.status !== "healing" && Math.random() < 0.2) {
        agent.status = agent.status === "running" ? "idle" : "running";
      }
      next[idx] = agent;
      return next;
    });

    if (!prefersReducedMotion) {
      setFlashIdx(idx);
      setTimeout(() => setFlashIdx(null), 600);
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const schedule = () => {
      const delay = 3000 + Math.random() * 2000;
      return setTimeout(() => {
        tick();
        timerRef = schedule();
      }, delay);
    };
    let timerRef = schedule();
    return () => clearTimeout(timerRef);
  }, [tick, prefersReducedMotion]);

  return (
    <SectionWrapper id="vision-grid" className="relative overflow-hidden">
      {/* ── Heading ── */}
      <div className="mx-auto max-w-3xl text-center relative z-10 mb-14">
        <motion.div variants={revealFromBelow}>
          <SectionHeading>
            Your personal army of{" "}
            <GradientText>AI specialists</GradientText>
          </SectionHeading>
        </motion.div>
      </div>

      {/* ── Agent card grid: 6 columns on desktop ── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="relative z-10 mx-auto max-w-6xl grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3"
      >
        {agents.map((agent, i) => {
          const st = statusStyles[agent.status];
          const Icon = agent.icon;
          const isFlashing = flashIdx === i;
          const rateColor =
            agent.rate >= 90 ? "#34d399" : agent.rate >= 80 ? "#fbbf24" : "#f43f5e";

          return (
            <motion.div
              key={agent.name}
              variants={cardVariants}
              className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:bg-white/[0.05] hover:border-white/[0.10]"
            >
              {/* Flash overlay */}
              {isFlashing && (
                <motion.div
                  className="absolute inset-0 pointer-events-none rounded-xl"
                  style={{ backgroundColor: `${agent.color}08` }}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              )}

              {/* Status dot — fixed top right */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <div className={`h-2 w-2 rounded-full ${st.dot}`} />
              </div>

              <div className="relative flex flex-col items-center px-3 py-5">
                {/* Name above icon */}
                <span className="text-sm font-medium text-foreground/80 truncate max-w-full mb-3">
                  {agent.name}
                </span>

                {/* Dominant icon */}
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl mb-3"
                  style={{ backgroundColor: `${agent.color}18` }}
                >
                  <Icon className="h-6 w-6" style={{ color: agent.color }} />
                </div>

                {/* Executions */}
                <div className="text-sm font-mono font-semibold text-foreground tabular-nums tracking-tight">
                  {agent.executions.toLocaleString()}
                </div>
                <div className="text-sm font-mono uppercase tracking-wider text-muted-dark mb-2">
                  executions
                </div>

                {/* Success rate bar */}
                <div className="w-full">
                  <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: rateColor }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${agent.rate}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <div className="text-center mt-1">
                    <span
                      className="text-sm font-mono font-medium tabular-nums"
                      style={{ color: rateColor }}
                    >
                      {agent.rate}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionWrapper>
  );
}
