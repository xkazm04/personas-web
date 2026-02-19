"use client";

import { motion } from "framer-motion";
import {
  Box, Database, Cable, Layout, Play, Radio, Wand2, Shield, Heart, Monitor, UserCheck,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";

const completed = [
  { phase: 1, name: "Scaffold", icon: Box, scope: "Tauri 2.0 + Vite + React 19", accent: "text-cyan-400", bg: "bg-cyan-500/10" },
  { phase: 2, name: "Database", icon: Database, scope: "24 tables, 95 tests", accent: "text-purple-400", bg: "bg-purple-500/10" },
  { phase: 3, name: "IPC Layer", icon: Cable, scope: "70+ commands, ts-rs", accent: "text-emerald-400", bg: "bg-emerald-500/10" },
  { phase: 4, name: "Frontend", icon: Layout, scope: "65+ components, Zustand", accent: "text-blue-400", bg: "bg-blue-500/10" },
  { phase: 5, name: "Execution", icon: Play, scope: "Claude CLI, streaming", accent: "text-amber-400", bg: "bg-amber-500/10" },
  { phase: 6, name: "Event Bus", icon: Radio, scope: "Bus + scheduler + cron", accent: "text-cyan-400", bg: "bg-cyan-500/10" },
  { phase: 7, name: "Design AI", icon: Wand2, scope: "Analysis + refinement", accent: "text-purple-400", bg: "bg-purple-500/10" },
  { phase: 8, name: "Security", icon: Shield, scope: "AES-256-GCM vault", accent: "text-emerald-400", bg: "bg-emerald-500/10" },
  { phase: 9, name: "Healing", icon: Heart, scope: "Auto-fix + backoff", accent: "text-rose-400", bg: "bg-rose-500/10" },
  { phase: 10, name: "Desktop", icon: Monitor, scope: "Tray + notifications", accent: "text-blue-400", bg: "bg-blue-500/10" },
  { phase: 11, name: "Auth", icon: UserCheck, scope: "Google OAuth + keyring", accent: "text-amber-400", bg: "bg-amber-500/10" },
];

export default function CompletedPhases() {
  return (
    <SectionWrapper id="completed">
      <motion.div variants={fadeUp} className="text-center relative">
        <span className="inline-block rounded-full border border-brand-emerald/20 bg-brand-emerald/5 px-3.5 py-1 text-[11px] font-medium tracking-wider uppercase text-brand-emerald/70 font-mono mb-6">
          Completed
        </span>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          <GradientText>11 phases</GradientText> shipped
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted leading-relaxed">
          The foundation is solid — database, IPC, execution engine, event bus, security, and native desktop features are all done.
        </p>
        <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-brand-emerald/15 to-transparent" />
      </motion.div>

      {/* Horizontal scrolling card strip */}
      <motion.div variants={fadeUp} className="mt-14 relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />

        <div className="flex gap-3 overflow-x-auto pb-4 px-6 scrollbar-hide snap-x snap-mandatory">
          {completed.map((phase, i) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              className="group relative flex-none w-[160px] snap-start rounded-xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent p-4 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.025]"
            >
              {/* Phase number */}
              <div className="absolute top-2.5 right-3 text-[10px] font-mono text-muted-dark/30">
                {String(phase.phase).padStart(2, "0")}
              </div>

              {/* Completed checkmark */}
              <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-brand-emerald/20 flex items-center justify-center ring-2 ring-background">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4L3 5.5L6.5 2" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Icon */}
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${phase.bg} mb-3`}>
                <phase.icon className={`h-4 w-4 ${phase.accent}`} />
              </div>

              {/* Name */}
              <h4 className="text-sm font-medium leading-tight">{phase.name}</h4>
              <p className="mt-1 text-[10px] leading-relaxed text-muted-dark line-clamp-2">{phase.scope}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="section-line mt-16 opacity-50" />
    </SectionWrapper>
  );
}
