"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { TerminalPanel } from "@/components/primitives";
import TerminalChrome from "@/components/TerminalChrome";
import { fadeUp } from "@/lib/animations";
import { initialAgents, statusStyles, CARDINALS, agentPosition } from "./data";
import AnimatedCounter from "./components/AnimatedCounter";
import RadarGrid from "./components/RadarGrid";
import RadarSweep from "./components/RadarSweep";
import AgentBlip from "./components/AgentBlip";

export default function VisionGlobe() {
  const prefersReducedMotion = useReducedMotion();
  const [agents, setAgents] = useState(initialAgents);
  const [flashIdx, setFlashIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [sweepAngle, setSweepAngle] = useState(0);
  const sweepRef = useRef<number | null>(null);

  const totalExec = agents.reduce((s, a) => s + a.executions, 0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let lastTime = performance.now();
    const step = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      setSweepAngle((prev) => (prev + delta * 0.03) % 360);
      sweepRef.current = requestAnimationFrame(step);
    };
    sweepRef.current = requestAnimationFrame(step);
    return () => {
      if (sweepRef.current) cancelAnimationFrame(sweepRef.current);
    };
  }, [prefersReducedMotion]);

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
      setTimeout(() => setFlashIdx(null), 800);
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const schedule = () => {
      const delay = 2500 + Math.random() * 2000;
      return setTimeout(() => {
        tick();
        timerRef = schedule();
      }, delay);
    };
    let timerRef = schedule();
    return () => clearTimeout(timerRef);
  }, [tick, prefersReducedMotion]);

  const sweptIndices = useMemo(() => {
    const set = new Set<number>();
    agents.forEach((agent, i) => {
      const { angleDeg } = agentPosition(i, agents.length, agent.rate, 1);
      const normalised = ((angleDeg % 360) + 360) % 360;
      const diff = Math.abs(((sweepAngle - normalised + 540) % 360) - 180);
      if (diff < 18) set.add(i);
    });
    return set;
  }, [sweepAngle, agents]);

  const RADAR_SIZE = 420;
  const RADAR_R = RADAR_SIZE / 2;
  const RING_COUNT = 4;

  return (
    <SectionWrapper id="vision-globe" className="relative overflow-hidden">
      <SectionIntro
        heading="Your personal army of"
        gradient="AI specialists"
        descriptionMaxWidth="max-w-3xl"
        className="mb-14"
      />

      <motion.div variants={fadeUp} className="relative z-10 mx-auto max-w-2xl">
        <TerminalPanel
          header={
            <TerminalChrome
              title="mission-control"
              status="scanning"
              info={
                <>
                  <AnimatedCounter value={totalExec} /> total exec
                </>
              }
              className="px-4 py-3 sm:px-5"
            />
          }
        >

          <div className="relative flex items-center justify-center py-10 px-4">
            <div className="relative" style={{ width: RADAR_SIZE, height: RADAR_SIZE }}>
              <RadarGrid size={RADAR_SIZE} radius={RADAR_R} ringCount={RING_COUNT} />
              <RadarSweep size={RADAR_SIZE} radius={RADAR_R} sweepAngle={sweepAngle} />

              {CARDINALS.map(({ label, angle }) => {
                const rad = (angle * Math.PI) / 180;
                const dist = RADAR_R - 2;
                const x = RADAR_R + Math.cos(rad) * dist;
                const y = RADAR_R + Math.sin(rad) * dist;
                return (
                  <span
                    key={label}
                    className="absolute text-base font-mono tracking-widest text-white/60 pointer-events-none select-none"
                    style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
                  >
                    {label}
                  </span>
                );
              })}

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-2xl font-bold font-mono text-white/90 tabular-nums tracking-tight drop-shadow-lg">
                  <AnimatedCounter value={totalExec} />
                </div>
                <div className="text-base font-mono text-white/60 mt-0.5 uppercase tracking-widest">executions</div>
              </div>

              {agents.map((agent, i) => (
                <AgentBlip
                  key={agent.name}
                  agent={agent}
                  index={i}
                  total={agents.length}
                  radarRadius={RADAR_R}
                  isFlashing={flashIdx === i}
                  isSwept={sweptIndices.has(i)}
                  isHovered={hoveredIdx === i}
                  onHoverStart={() => setHoveredIdx(i)}
                  onHoverEnd={() => setHoveredIdx(null)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 border-t border-white/4 px-4 py-3 sm:px-5">
            {(["running", "healing", "idle"] as const).map((key) => {
              const st = statusStyles[key];
              const count = agents.filter((a) => a.status === key).length;
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                  <span className={`text-base font-mono ${st.text}`}>
                    {count} {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </TerminalPanel>
      </motion.div>
    </SectionWrapper>
  );
}
