"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Clock, Globe, Clipboard, FolderOpen, Link, Radio, Timer, MousePointerClick, Zap,
} from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animations";

import type { LucideIcon } from "lucide-react";

interface Trigger {
  icon: LucideIcon;
  name: string;
  color: string;
  desc: string;
  detail: string;
  example: string;
}

const triggers: Trigger[] = [
  { icon: MousePointerClick, name: "Manual", color: "#06b6d4", desc: "On-demand from the UI", detail: "Click to run instantly. Supports dry-run mode and custom JSON input.", example: "\"Run my PR reviewer now\"" },
  { icon: Clock, name: "Schedule", color: "#a855f7", desc: "Cron expressions", detail: "5-field cron with next-run preview. Background scheduler checks every 5 seconds.", example: "0 9 * * MON-FRI" },
  { icon: Globe, name: "Webhook", color: "#34d399", desc: "Inbound HTTP POST", detail: "Custom path routing, header validation, request logging with replay.", example: "POST /webhook/deploy" },
  { icon: Clipboard, name: "Clipboard", color: "#fbbf24", desc: "System clipboard watch", detail: "Regex-based filtering. Captures text, URLs, JSON from clipboard.", example: "/^JIRA-\\d+/" },
  { icon: FolderOpen, name: "File Watch", color: "#f43f5e", desc: "Filesystem events", detail: "Watch directories with globs. Triggers on create/modify/delete with debounce.", example: "~/Downloads/*.csv" },
  { icon: Link, name: "Chain", color: "#60a5fa", desc: "Agent-to-agent", detail: "Output from one persona triggers the next. JSON mapping between agents.", example: "Triage → Classify → Route" },
  { icon: Radio, name: "Event Bus", color: "#a855f7", desc: "Custom event subscriptions", detail: "Pattern matching on event type and data. Dead-letter queue for failures.", example: "on: deploy.failed" },
  { icon: Timer, name: "Polling", color: "#06b6d4", desc: "Interval-based checks", detail: "Every N seconds, check condition. Smart deduplication prevents redundant runs.", example: "Every 60s: check API" },
];

export default function TriggerSystem() {
  const prefersReducedMotion = useReducedMotion();
  const [activeTrigger, setActiveTrigger] = useState<number>(0);
  const [firing, setFiring] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Auto-cycle through triggers with "firing" animation
  const fire = useCallback(() => {
    const idx = Math.floor(Math.random() * triggers.length);
    setFiring(idx);
    setActiveTrigger(idx);
    setTimeout(() => setFiring(null), 1000);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const schedule = () => {
      timerRef.current = setTimeout(() => { fire(); schedule(); }, 3000 + Math.random() * 2000);
    };
    schedule();
    return () => clearTimeout(timerRef.current);
  }, [fire, prefersReducedMotion]);

  const active = triggers[activeTrigger];

  return (
    <SectionWrapper id="triggers">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center">
        <motion.div variants={fadeUp}>
          <SectionHeading>
            8 ways to{" "}
            <GradientText className="drop-shadow-lg">trigger your agents</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-muted-dark font-light">
          Schedule, webhook, clipboard, file watch, chaining, event bus, polling, or manual.
          <span className="text-white/80 font-medium"> Combine triggers for complex automation.</span>
        </motion.p>
      </motion.div>

      <div className="mt-16 mx-auto max-w-4xl grid gap-12 lg:grid-cols-[1fr_1.2fr] items-center">
        {/* Left: Trigger wheel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto w-[320px] h-[320px] sm:w-[360px] sm:h-[360px]"
        >
          {/* Center hub */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={firing !== null ? { scale: [1, 1.15, 1], boxShadow: ["0 0 0px rgba(6,182,212,0)", `0 0 30px ${triggers[firing ?? 0].color}40`, "0 0 0px rgba(6,182,212,0)"] } : {}}
              transition={{ duration: 0.6 }}
              className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black/60 backdrop-blur-xl z-10"
            >
              <Zap className="h-8 w-8 text-brand-cyan/60" />
            </motion.div>
            {/* Orbit ring */}
            <div className="absolute inset-8 rounded-full border border-dashed border-white/6" />
          </div>

          {/* Trigger nodes around the circle */}
          {triggers.map((t, i) => {
            const angle = (i / triggers.length) * 360 - 90; // Start from top
            const rad = (angle * Math.PI) / 180;
            const radius = 42; // % from center
            const isActive = activeTrigger === i;
            const isFiring = firing === i;

            return (
              <motion.button
                key={t.name}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: "spring", bounce: 0.4 }}
                onClick={() => { setActiveTrigger(i); setFiring(null); }}
                className={`absolute flex items-center justify-center rounded-xl border transition-all duration-400 cursor-pointer ${
                  isActive
                    ? "h-14 w-14 border-white/20 bg-white/8 z-20 shadow-lg"
                    : "h-11 w-11 border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/6 z-10"
                }`}
                style={{
                  left: `${50 + radius * Math.cos(rad)}%`,
                  top: `${50 + radius * Math.sin(rad)}%`,
                  transform: "translate(-50%, -50%)",
                  boxShadow: isActive ? `0 0 25px ${t.color}30` : undefined,
                }}
              >
                <t.icon
                  className={`transition-all duration-300 ${isActive ? "h-6 w-6" : "h-4.5 w-4.5"}`}
                  style={{
                    color: isActive ? t.color : "rgba(255,255,255,0.4)",
                    filter: isActive ? `drop-shadow(0 0 6px ${t.color}80)` : undefined,
                  }}
                />
                {/* Firing pulse */}
                {isFiring && (
                  <motion.div
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 rounded-xl border-2"
                    style={{ borderColor: t.color }}
                  />
                )}
                {/* Connection line to center */}
                {isActive && (
                  <motion.div
                    layoutId="trigger-connection"
                    className="absolute w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"
                    style={{
                      height: `${radius * 1.8}%`,
                      transformOrigin: "top center",
                      top: "50%",
                      left: "50%",
                      transform: `rotate(${angle + 180}deg)`,
                    }}
                  />
                )}
              </motion.button>
            );
          })}

          {/* Label ring */}
          {triggers.map((t, i) => {
            const angle = (i / triggers.length) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const labelRadius = 56;
            const isActive = activeTrigger === i;
            return (
              <span
                key={`label-${t.name}`}
                className={`absolute text-[9px] font-mono uppercase tracking-wider transition-all duration-300 pointer-events-none ${
                  isActive ? "text-white/60" : "text-white/15"
                }`}
                style={{
                  left: `${50 + labelRadius * Math.cos(rad)}%`,
                  top: `${50 + labelRadius * Math.sin(rad)}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {t.name}
              </span>
            );
          })}
        </motion.div>

        {/* Right: Active trigger detail */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTrigger}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm p-8"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${active.color}15` }}>
                  <active.icon className="h-7 w-7" style={{ color: active.color }} />
                </div>
                <div>
                  <div className="text-xl font-semibold text-white/90">{active.name}</div>
                  <div className="text-sm text-muted-dark">{active.desc}</div>
                </div>
              </div>
              <div className="text-sm text-white/60 leading-relaxed mb-5">{active.detail}</div>
              <div className="rounded-lg border border-white/6 bg-black/30 px-4 py-3">
                <div className="text-[10px] font-mono text-white/25 mb-1 uppercase tracking-wider">Example</div>
                <div className="text-sm font-mono" style={{ color: `${active.color}99` }}>{active.example}</div>
              </div>

              {/* Trigger type indicator */}
              <div className="mt-5 flex gap-2">
                {triggers.map((t, i) => (
                  <button
                    key={t.name}
                    onClick={() => { setActiveTrigger(i); setFiring(null); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeTrigger ? "w-6" : "w-1.5"
                    }`}
                    style={{ backgroundColor: i === activeTrigger ? active.color : "rgba(255,255,255,0.1)" }}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
}
