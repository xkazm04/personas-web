"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import {
  SectionPauseProvider,
  useSectionPauseController,
} from "@/hooks/useSectionPause";
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
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp, revealFromBelow } from "@/lib/animations";

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

/** Cardinal labels for the radar */
const CARDINALS = [
  { label: "DESIGN", angle: -90 },
  { label: "EXECUTE", angle: 0 },
  { label: "DEPLOY", angle: 90 },
  { label: "MONITOR", angle: 180 },
] as const;

/** Evenly space agents around the radar */
function agentPosition(index: number, total: number, rate: number, radius: number) {
  const angleDeg = (360 / total) * index - 90; // start at top
  // Higher rate → closer to center (invert the distance)
  const distance = radius * (1 - rate / 100) * 0.7 + radius * 0.2;
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.cos(angleRad) * distance,
    y: Math.sin(angleRad) * distance,
    angleDeg,
  };
}

/* ────────────────────────── Animated counter ────────────────────────── */

function AnimatedCounter({ value }: { value: number }) {
  const motionVal = useMotionValue(value - 50);
  const display = useTransform(motionVal, (v) =>
    Math.round(v).toLocaleString(),
  );

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, motionVal]);

  return <motion.span>{display}</motion.span>;
}

/* ────────────────────────── Component ────────────────────────── */

export default function VisionGlobe() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const pauseValue = useSectionPauseController({ ref: sectionRef });
  const { paused } = pauseValue;
  const [agents, setAgents] = useState(initialAgents);
  const [flashIdx, setFlashIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const rotorRef = useRef<HTMLDivElement | null>(null);
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalExec = agents.reduce((s, a) => s + a.executions, 0);

  // Precompute each agent's normalized radar angle once. Rate / position are
  // fixed for the lifetime of the component, so this never re-runs after mount.
  const agentAngles = useMemo(
    () =>
      initialAgents.map((a, i) => {
        const { angleDeg } = agentPosition(i, initialAgents.length, a.rate, 1);
        return ((angleDeg % 360) + 360) % 360;
      }),
    [],
  );

  /* ── Sweep rotor + sweep-detection ── */
  // The rotor itself rotates via CSS keyframes (no React state per frame).
  // A ref-driven RAF reads the elapsed time, derives swept-agent indices,
  // and imperatively plays a pulse animation on each newly-swept ring —
  // no setState, no React render cycle at 60 fps.
  useEffect(() => {
    const rotor = rotorRef.current;
    if (rotor) {
      rotor.style.animationPlayState = paused ? "paused" : "running";
    }
    if (paused) return;

    const start = performance.now();
    const sweptState = new Array<boolean>(initialAgents.length).fill(false);
    let rafId = 0;

    const tick = () => {
      const angle = ((performance.now() - start) * 0.03) % 360;

      for (let i = 0; i < initialAgents.length; i++) {
        const normalised = agentAngles[i];
        const diff = Math.abs(((angle - normalised + 540) % 360) - 180);
        const isSweptNow = diff < 18;
        if (isSweptNow !== sweptState[i]) {
          sweptState[i] = isSweptNow;
          if (isSweptNow) {
            const ring = ringRefs.current[i];
            if (ring && typeof ring.animate === "function") {
              ring.style.borderColor = initialAgents[i].color;
              ring.animate(
                [
                  { opacity: 0.7, transform: "scale(0.5)" },
                  { opacity: 0, transform: "scale(1.8)" },
                ],
                { duration: 800, easing: "ease-out", fill: "forwards" },
              );
            }
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [agentAngles, paused]);

  /* ── Activity tick ── */
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
      // Cancel any pending flash so a new tick mid-flight doesn't get cleared
      // by the prior timer, and so unmount-while-pending doesn't setState on
      // a torn-down component.
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      setFlashIdx(idx);
      flashTimerRef.current = setTimeout(() => {
        setFlashIdx(null);
        flashTimerRef.current = null;
      }, 800);
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (paused) return;
    const schedule = () => {
      const delay = 2500 + Math.random() * 2000;
      return setTimeout(() => {
        tick();
        timerRef = schedule();
      }, delay);
    };
    let timerRef = schedule();
    return () => clearTimeout(timerRef);
  }, [tick, paused]);

  /* ── Radar constants ── */
  const RADAR_SIZE = 420;
  const RADAR_R = RADAR_SIZE / 2;
  const RING_COUNT = 4;

  return (
    <SectionPauseProvider value={pauseValue}>
    <SectionWrapper id="vision-globe" className="relative overflow-hidden" ref={sectionRef}>
      {/* ── Heading ── */}
      <div className="mx-auto max-w-3xl text-center relative z-10 mb-14">
        <motion.div variants={revealFromBelow}>
          <SectionHeading className="leading-[1.1]">
            Your personal army of{" "}
            <GradientText className="drop-shadow-lg">AI specialists</GradientText>
          </SectionHeading>
        </motion.div>
      </div>

      {/* ── Radar visualization ── */}
      <motion.div variants={fadeUp} className="relative z-10 mx-auto max-w-2xl">
        <div className="rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]">
          <TerminalChrome
            title="mission-control"
            status="scanning"
            info={<><AnimatedCounter value={totalExec} /> total exec</>}
            className="px-4 py-3 sm:px-5"
          />

          {/* Radar canvas */}
          <div className="relative flex items-center justify-center py-10 px-4">
            <div
              className="relative"
              style={{ width: RADAR_SIZE, height: RADAR_SIZE }}
            >
              {/* ── SVG rings + grid lines ── */}
              <svg
                viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
                className="absolute inset-0 w-full h-full"
                aria-hidden
              >
                {/* Concentric rings */}
                {Array.from({ length: RING_COUNT }).map((_, i) => {
                  const r = ((i + 1) / RING_COUNT) * (RADAR_R - 10);
                  return (
                    <circle
                      key={i}
                      cx={RADAR_R}
                      cy={RADAR_R}
                      r={r}
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth={1}
                    />
                  );
                })}
                {/* Cross-hairs */}
                <line x1={RADAR_R} y1={8} x2={RADAR_R} y2={RADAR_SIZE - 8} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                <line x1={8} y1={RADAR_R} x2={RADAR_SIZE - 8} y2={RADAR_R} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                {/* Diagonal grid */}
                <line x1={RADAR_R - (RADAR_R - 10) * 0.707} y1={RADAR_R - (RADAR_R - 10) * 0.707} x2={RADAR_R + (RADAR_R - 10) * 0.707} y2={RADAR_R + (RADAR_R - 10) * 0.707} stroke="rgba(255,255,255,0.025)" strokeWidth={1} />
                <line x1={RADAR_R + (RADAR_R - 10) * 0.707} y1={RADAR_R - (RADAR_R - 10) * 0.707} x2={RADAR_R - (RADAR_R - 10) * 0.707} y2={RADAR_R + (RADAR_R - 10) * 0.707} stroke="rgba(255,255,255,0.025)" strokeWidth={1} />
              </svg>

              {/* ── Sweep line (rotating) ──
                  CSS keyframe animation handles the rotation off the React
                  render loop. The companion ref-driven RAF only mutates DOM
                  on per-agent sweep transitions. */}
              <div
                ref={rotorRef}
                className="absolute inset-0 pointer-events-none animate-radar-sweep"
              >
                {/* Sweep cone gradient */}
                <div
                  className="absolute"
                  style={{
                    top: RADAR_R,
                    left: RADAR_R,
                    width: RADAR_R - 10,
                    height: 1,
                    transformOrigin: "0% 50%",
                    background: "linear-gradient(90deg, rgba(6,182,212,0.35), transparent)",
                  }}
                />
                {/* Wider translucent trail */}
                <svg
                  viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
                  className="absolute inset-0 w-full h-full"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="sweep-grad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgba(6,182,212,0.12)" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M ${RADAR_R} ${RADAR_R} L ${RADAR_SIZE - 10} ${RADAR_R} A ${RADAR_R - 10} ${RADAR_R - 10} 0 0 0 ${RADAR_R + (RADAR_R - 10) * Math.cos(-30 * Math.PI / 180)} ${RADAR_R + (RADAR_R - 10) * Math.sin(-30 * Math.PI / 180)} Z`}
                    fill="url(#sweep-grad)"
                  />
                </svg>
              </div>

              {/* ── Cardinal labels ── */}
              {CARDINALS.map(({ label, angle }) => {
                const rad = (angle * Math.PI) / 180;
                const dist = RADAR_R - 2;
                const x = RADAR_R + Math.cos(rad) * dist;
                const y = RADAR_R + Math.sin(rad) * dist;
                return (
                  <span
                    key={label}
                    className="absolute text-[9px] font-mono tracking-widest text-white/20 pointer-events-none select-none"
                    style={{
                      left: x,
                      top: y,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {label}
                  </span>
                );
              })}

              {/* ── Center total counter ── */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-2xl font-bold font-mono text-white/90 tabular-nums tracking-tight drop-shadow-lg">
                  <AnimatedCounter value={totalExec} />
                </div>
                <div className="text-[10px] font-mono text-white/30 mt-0.5 uppercase tracking-widest">
                  executions
                </div>
              </div>

              {/* ── Agent blips ── */}
              {agents.map((agent, i) => {
                const { x, y } = agentPosition(
                  i,
                  agents.length,
                  agent.rate,
                  RADAR_R - 30,
                );
                const st = statusStyles[agent.status];
                const isFlashing = flashIdx === i;
                const isHovered = hoveredIdx === i;
                // Sweep brightening lives in the imperative RAF; here we only
                // model status + the (rare) flash event in React.
                const blipBrightness = isFlashing ? 1 : agent.status === "idle" ? 0.4 : 0.7;

                return (
                  <div
                    key={agent.name}
                    className="absolute group cursor-pointer"
                    style={{
                      left: RADAR_R + x,
                      top: RADAR_R + y,
                      transform: "translate(-50%, -50%)",
                      zIndex: isHovered ? 30 : 10,
                    }}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* Pulse ring — always mounted, animated imperatively
                        via WAAPI when the radar sweeps over this agent.
                        The flash ring still goes through React (rare event). */}
                    <div
                      ref={(el) => {
                        ringRefs.current[i] = el;
                      }}
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: 36,
                        height: 36,
                        left: -18,
                        top: -18,
                        border: `1.5px solid ${agent.color}`,
                        opacity: 0,
                      }}
                    />
                    {isFlashing && (
                      <motion.div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          width: 36,
                          height: 36,
                          left: -18,
                          top: -18,
                          border: `1.5px solid ${agent.color}`,
                        }}
                        initial={{ opacity: 0.7, scale: 0.5 }}
                        animate={{ opacity: 0, scale: 1.8 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    )}

                    {/* Blip dot */}
                    <motion.div
                      className="relative flex items-center justify-center rounded-full"
                      style={{
                        width: 28,
                        height: 28,
                        left: -14,
                        top: -14,
                        backgroundColor: `${agent.color}${Math.round(blipBrightness * 30).toString(16).padStart(2, "0")}`,
                        boxShadow: isFlashing
                          ? `0 0 14px ${agent.color}80, 0 0 30px ${agent.color}40`
                          : `0 0 6px ${agent.color}30`,
                      }}
                      animate={{ opacity: blipBrightness }}
                      transition={{ duration: 0.3 }}
                    >
                      <agent.icon
                        className="h-3 w-3"
                        style={{ color: agent.color }}
                      />
                    </motion.div>

                    {/* Status indicator */}
                    <div
                      className={`absolute h-[5px] w-[5px] rounded-full ${st.dot}`}
                      style={{ left: 6, top: -16 }}
                    />

                    {/* Hover tooltip */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.92 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.18 }}
                          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 whitespace-nowrap rounded-lg border border-white/10 bg-black/80 backdrop-blur-lg px-3 py-2 shadow-xl z-40"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <agent.icon className="h-3 w-3" style={{ color: agent.color }} />
                            <span className="text-[11px] font-semibold text-white/90">{agent.name}</span>
                            <span className={`text-[9px] font-mono ${st.text}`}>{st.label}</span>
                          </div>
                          <div className="text-[10px] font-mono text-white/50 space-y-0.5">
                            <div>{agent.executions.toLocaleString()} executions</div>
                            <div>Success rate: {agent.rate}%</div>
                          </div>
                          {/* little caret */}
                          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-white/10" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Status legend ── */}
          <div className="flex flex-wrap items-center justify-center gap-4 border-t border-white/4 px-4 py-3 sm:px-5">
            {(["running", "healing", "idle"] as const).map((key) => {
              const st = statusStyles[key];
              const count = agents.filter((a) => a.status === key).length;
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                  <span className={`text-[10px] font-mono ${st.text}`}>
                    {count} {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
    </SectionPauseProvider>
  );
}
