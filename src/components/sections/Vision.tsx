"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  Mail, MessageSquare, Github, CreditCard, Calendar, HardDrive,
} from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import TerminalChrome from "@/components/TerminalChrome";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, revealFromBelow } from "@/lib/animations";

import type { LucideIcon } from "lucide-react";

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

export default function Vision() {
  const prefersReducedMotion = useReducedMotion();
  const [agents, setAgents] = useState(initialAgents);
  const [flashIdx, setFlashIdx] = useState<number | null>(null);

  const totalExec = agents.reduce((s, a) => s + a.executions, 0);

  const tick = useCallback(() => {
    const idx = Math.floor(Math.random() * agents.length);
    const bump = 1 + Math.floor(Math.random() * 3);

    setAgents((prev) => {
      const next = [...prev];
      const agent = { ...next[idx] };
      agent.executions += bump;

      // ~20% chance to toggle between running/idle (skip healing agent)
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
  }, [agents.length, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const schedule = () => {
      const delay = 3000 + Math.random() * 2000; // 3-5s
      return setTimeout(() => {
        tick();
        timerRef = schedule();
      }, delay);
    };
    let timerRef = schedule();
    return () => clearTimeout(timerRef);
  }, [tick, prefersReducedMotion]);

  // Compute status summary
  const statusCounts = agents.reduce(
    (acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; },
    {} as Record<string, number>,
  );
  const statusSummary = [
    statusCounts.running && `${statusCounts.running} running`,
    statusCounts.healing && `${statusCounts.healing} healing`,
    statusCounts.idle && `${statusCounts.idle} idle`,
  ].filter(Boolean).join(" \u00b7 ");

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <SectionWrapper id="vision" className="relative overflow-hidden py-20 md:py-24">
      <div ref={containerRef} className="absolute inset-0 pointer-events-none">
        {/* Background image */}
        <motion.div style={{ y }} className="absolute inset-0 h-[120%] -top-[10%]">
          <Image
            src="/imgs/illustration_hd.jpg"
            alt="Futuristic command center with AI personality cards"
            fill className="object-cover object-center" sizes="100vw" quality={80}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAGAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIBAAAgIBBAMBAAAAAAAAAAAAAQIAAwQFERIhBjFBUf/EABQBAQAAAAAAAAAAAAAAAAAAAAP/xAAYEQADAQEAAAAAAAAAAAAAAAABAgMAEf/aAAwDAQACEQMRAD8AyTDw8nPyFx8WprLG6KoJLH4BLPp3h+T6ULaW/wBJZX1sVh7XjuIiVeli5Ef/2Q=="
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background" />
        <div className="absolute inset-0 bg-linear-to-r from-background/40 via-transparent to-background/40" />
      </div>

      <div className="mx-auto max-w-3xl text-center relative z-10">
        <motion.div variants={fadeUp} className="mx-auto mb-5 flex max-w-4xl flex-wrap items-center justify-center gap-3">
          {[
            "Design once",
            "Observe continuously",
            "Deploy where it fits",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/3 px-4 py-2 text-xs font-mono tracking-wider text-white/80 backdrop-blur-sm transition-colors hover:bg-white/8 hover:text-white shadow-[0_0_10px_rgba(255,255,255,0.02)]"
            >
              {item}
            </span>
          ))}
        </motion.div>

        <motion.div variants={revealFromBelow}>
          <SectionHeading className="leading-[1.1]">
            Your personal army of{" "}
            <GradientText className="drop-shadow-lg">AI specialists</GradientText>
          </SectionHeading>
        </motion.div>

      </div>

      {/* Agent monitoring dashboard — compact */}
      <motion.div variants={fadeUp} className="mt-12 mx-auto max-w-2xl relative z-10">
        <div className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]">
          <TerminalChrome
            title="agent-monitor"
            status="live"
            info={`${totalExec.toLocaleString()} total exec`}
            className="px-4 py-3 sm:px-5"
          />

          {/* Agent rows */}
          <div className="divide-y divide-white/3">
            {agents.map((agent, i) => {
              const st = statusStyles[agent.status];
              return (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                  className={`group grid grid-cols-[1fr_auto] items-center gap-2 sm:gap-3 px-4 py-3 sm:px-5 transition-all duration-500 hover:bg-white/5 hover:backdrop-blur-md hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] ${flashIdx === i ? "bg-brand-cyan/4" : ""}`}
                >
                  {/* Left: icon + name + status */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${agent.color}12` }}>
                      <agent.icon className="h-3.5 w-3.5" style={{ color: agent.color }} />
                    </div>
                    <span className="text-[13px] font-medium text-white/80 truncate">{agent.name}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      <span className={`text-[10px] font-mono ${st.text}`}>{st.label}</span>
                    </div>
                  </div>

                  {/* Right: executions + success rate */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[11px] font-mono text-white/50 tabular-nums">{agent.executions.toLocaleString()}</div>
                      <div className="text-[9px] font-mono text-white/20">runs</div>
                    </div>
                    <div className="w-12">
                      <div className="h-1 rounded-full bg-white/4 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: agent.rate >= 90 ? "#34d399" : agent.rate >= 80 ? "#fbbf24" : "#f43f5e" }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${agent.rate}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                      <div className="text-[9px] font-mono text-white/25 text-center mt-0.5">{agent.rate}%</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/4 px-4 py-3 sm:px-5 text-[10px] font-mono tracking-wider uppercase text-white/30">
            <span>Fleet health overview</span>
            <span className="text-brand-emerald/60">{statusSummary}</span>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
