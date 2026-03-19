"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AlertTriangle, Activity, RefreshCw, CheckCircle, Shield } from "lucide-react";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import CinematicBg from "@/components/todo/CinematicBg";
import { fadeUp, staggerContainer } from "@/lib/animations";

const healingStages = [
  { icon: AlertTriangle, label: "Detect", desc: "Transient failure detected — API timeout on Slack connector", color: "#f43f5e", statusLabel: "error" },
  { icon: Activity, label: "Diagnose", desc: "Root cause: rate limit exceeded (429). Circuit breaker engaged.", color: "#fbbf24", statusLabel: "analyzing" },
  { icon: RefreshCw, label: "Recover", desc: "Exponential backoff initiated. Retry in 30s with fallback provider.", color: "#06b6d4", statusLabel: "healing" },
  { icon: CheckCircle, label: "Resolve", desc: "Slack connector recovered. 47ms response time. Circuit breaker reset.", color: "#34d399", statusLabel: "healthy" },
];

export default function HealingEngine() {
  const prefersReducedMotion = useReducedMotion();
  const [activeStage, setActiveStage] = useState(-1);
  const [autoplay, setAutoplay] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cycleRef = useRef(0);

  const advance = useCallback(() => {
    setActiveStage(prev => {
      const next = prev + 1;
      if (next >= healingStages.length) {
        // Reset after pause
        setTimeout(() => setActiveStage(-1), 2000);
        return prev;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !autoplay) return;
    const cycle = () => {
      cycleRef.current++;
      setActiveStage(-1);
      let step = 0;
      const run = () => {
        timerRef.current = setTimeout(() => {
          setActiveStage(step);
          step++;
          if (step < healingStages.length) {
            run();
          } else {
            // Restart after showing complete
            timerRef.current = setTimeout(cycle, 3000);
          }
        }, step === 0 ? 1000 : 1500);
      };
      run();
    };
    cycle();
    return () => clearTimeout(timerRef.current);
  }, [autoplay, prefersReducedMotion]);

  return (
    <SectionWrapper id="healing" className="relative overflow-hidden">
      <CinematicBg src="/imgs/features/healing.png" alt="Self-healing android heart with circuit repair" opacity={78} />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center relative z-10">
        <motion.div variants={fadeUp}>
          <SectionHeading>
            Self-healing{" "}
            <GradientText className="drop-shadow-lg">recovery engine</GradientText>
          </SectionHeading>
        </motion.div>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-muted-dark font-light">
          Agents detect failures, diagnose root causes, and recover automatically.
          <span className="text-white/80 font-medium"> Circuit breakers, exponential backoff, provider failover</span> — all built in.
        </motion.p>
      </motion.div>

      {/* Animated healing pipeline */}
      <div className="mt-16 mx-auto max-w-3xl relative z-10">
        <div className="relative">
          {/* Vertical connection line with progress */}
          <div className="absolute left-8 top-0 bottom-0 w-px overflow-hidden">
            <div className="h-full bg-white/6" />
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-brand-rose via-brand-amber via-brand-cyan to-brand-emerald"
              animate={{
                height: activeStage >= 0 ? `${((activeStage + 1) / healingStages.length) * 100}%` : "0%",
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {healingStages.map((stage, i) => {
            const isActive = activeStage === i;
            const isDone = activeStage > i;
            const isReached = activeStage >= i;
            return (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: isReached ? 1 : 0.3 }}
                transition={{ duration: 0.5 }}
                className="relative mb-8 last:mb-0 flex items-start gap-6"
              >
                {/* Stage node */}
                <div className={`relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border transition-all duration-500 ${
                  isActive
                    ? "border-white/20 bg-black/60 shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                    : isDone
                    ? "border-white/10 bg-black/40"
                    : "border-white/6 bg-black/30"
                }`}>
                  <stage.icon
                    className="h-7 w-7 transition-all duration-500"
                    style={{
                      color: isReached ? stage.color : "rgba(255,255,255,0.15)",
                      filter: isActive ? `drop-shadow(0 0 8px ${stage.color}80)` : undefined,
                    }}
                  />
                  {/* Pulse ring on active */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2"
                      style={{ borderColor: `${stage.color}40` }}
                      animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  {/* Status dot */}
                  <div
                    className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background transition-all duration-500 ${
                      isActive ? "scale-100" : isDone ? "scale-100" : "scale-0"
                    }`}
                    style={{
                      backgroundColor: isReached ? stage.color : "transparent",
                      boxShadow: isActive ? `0 0 10px ${stage.color}80` : undefined,
                    }}
                  />
                </div>

                {/* Content card */}
                <motion.div
                  animate={{
                    borderColor: isActive ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)",
                    backgroundColor: isActive ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.01)",
                  }}
                  transition={{ duration: 0.4 }}
                  className="flex-1 rounded-xl border p-5 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-base font-semibold transition-colors duration-500 ${isReached ? "text-white/90" : "text-white/30"}`}>
                      {stage.label}
                    </span>
                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider"
                          style={{ borderColor: `${stage.color}30`, color: `${stage.color}cc`, backgroundColor: `${stage.color}10` }}
                        >
                          {stage.statusLabel}
                        </motion.span>
                      )}
                      {isDone && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-[9px] font-mono text-brand-emerald/50"
                        >
                          complete
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className={`text-xs leading-relaxed transition-colors duration-500 ${isReached ? "text-muted-dark" : "text-white/15"}`}>
                    {stage.desc}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="mt-14 mx-auto max-w-2xl grid grid-cols-3 gap-4 text-center relative z-10">
        {[
          { icon: Shield, value: "Auto", label: "Failure detection", sub: "No manual monitoring needed" },
          { icon: RefreshCw, value: "< 30s", label: "Recovery time", sub: "Backoff + provider failover" },
          { icon: Activity, value: "100%", label: "Audit coverage", sub: "Every healing event logged" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.03, borderColor: "rgba(255,255,255,0.15)" }}
            className="rounded-xl border border-white/6 bg-white/2 p-5 transition-all duration-300"
          >
            <stat.icon className="h-5 w-5 mx-auto mb-2 text-brand-cyan/50" />
            <div className="text-xl font-bold bg-linear-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-xs font-medium text-white/70 mt-1">{stat.label}</div>
            <div className="text-[10px] text-muted-dark mt-0.5">{stat.sub}</div>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
