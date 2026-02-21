"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Mail, MessageSquare, Github, CreditCard, Calendar, HardDrive,
} from "lucide-react";
import GradientText from "@/components/GradientText";
import { fadeUp, revealFromBelow } from "@/lib/animations";

const agents = [
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

const stats = [
  { value: "100x", label: "Faster than manual" },
  { value: "24/7", label: "Always running" },
  { value: "0", label: "Code required" },
];

export default function Vision() {
  const totalExec = agents.reduce((s, a) => s + a.executions, 0);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/imgs/illustration_hd.jpg"
          alt="Futuristic command center with AI personality cards"
          fill className="object-cover object-center" sizes="100vw" quality={80}
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
      </div>

      <motion.div
        initial="hidden" whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-28 md:py-44"
      >
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2 variants={revealFromBelow} className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl lg:text-[4.5rem] leading-[1.1] drop-shadow-md">
            Your personal army of{" "}
            <GradientText className="drop-shadow-lg">AI specialists</GradientText>
          </motion.h2>

          <motion.p variants={fadeUp} className="mt-8 text-lg text-white/80 leading-relaxed sm:text-xl font-light">
            Imagine a world where every repetitive task is handled by a
            purpose-built AI agent — designed by you in plain English,
            coordinated through an intelligent event bus, and running
            autonomously on your desktop or in the cloud.
          </motion.p>

          <motion.div variants={fadeUp} className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-3">
            {[
              "Design once",
              "Observe continuously",
              "Deploy where it fits",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-xs font-mono tracking-wider text-white/80 backdrop-blur-sm transition-colors hover:bg-white/[0.08] hover:text-white shadow-[0_0_10px_rgba(255,255,255,0.02)]"
              >
                {item}
              </span>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="text-6xl font-black tracking-tight md:text-7xl lg:text-8xl bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent drop-shadow-sm">{stat.value}</div>
                <div className="mt-3 text-sm text-white/60 font-mono tracking-widest uppercase font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Agent monitoring dashboard — compact */}
        <motion.div variants={fadeUp} className="mt-16 mx-auto max-w-2xl">
          <div className="rounded-2xl border border-white/[0.08] bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]">
            {/* Dashboard header */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5 border-b border-white/[0.05]">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-brand-rose/40" />
                  <div className="h-2 w-2 rounded-full bg-brand-amber/40" />
                  <div className="h-2 w-2 rounded-full bg-brand-emerald/40" />
                </div>
                <span className="text-[10px] font-mono text-white/25 ml-1">agent-monitor</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-[10px] font-mono text-white/20">{totalExec.toLocaleString()} total exec</span>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-emerald shadow-[0_0_4px_rgba(52,211,153,0.5)] animate-glow-border" />
                  <span className="text-[10px] font-mono text-brand-emerald/50">live</span>
                </div>
              </div>
            </div>

            {/* Agent rows */}
            <div className="divide-y divide-white/[0.03]">
              {agents.map((agent, i) => {
                const st = statusStyles[agent.status];
                return (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.25 }}
                    className="group grid grid-cols-[1fr_auto] items-center gap-2 sm:gap-3 px-4 py-3 sm:px-5 transition-colors duration-200 hover:bg-white/[0.02]"
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
                        <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
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

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.04] px-4 py-3 sm:px-5 text-[10px] font-mono tracking-wider uppercase text-white/30">
              <span>Fleet health overview</span>
              <span className="text-brand-emerald/60">4 running · 1 healing · 1 idle</span>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
