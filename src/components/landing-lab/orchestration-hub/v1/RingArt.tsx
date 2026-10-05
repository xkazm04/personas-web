"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { loopTransition } from "@/lib/motion/loop-gate";
import type { TriggerId } from "@/components/sections/orchestration-hub/data";
import { mix, SELF } from "../shared/scene-kit";
import Spin from "../shared/Spin";
import { BEZEL_R, C, HUB_R, NODES, R, SIGNAL_S, STEP_DEG, TICKS, TILE, VB } from "./geometry";

interface RingArtProps {
  activeId: TriggerId;
  /** Cumulative dial steps (useDialSteps) - the bezel marker turns the short way. */
  dialSteps: number;
  live: boolean;
  still: boolean;
}

const HEAD_Y = C - R; // the comet starts inside the trigger's tile...
const LAND_Y = C - HUB_R - 6; // ...and lands on the agent's lens
const TAIL = 58;

/**
 * The instrument behind the tiles: a ticked bezel whose marker turns to the
 * active trigger, a faint track, ten spokes, an ambient drift of signals on
 * every idle spoke, and on the active spoke a comet that leaves the trigger and
 * lands on the agent - the lens answers with a shockwave and a swell of light.
 * Every loop runs only while `live`; stopped, the comet rests just short of the
 * lens with the shockwave mid-ring, so a still frame still tells the story.
 */
export default function RingArt({ activeId, dialSteps, live, still }: RingArtProps) {
  const uid = useId();
  const active = NODES.find((n) => n.trigger.id === activeId) ?? NODES[0];
  const tone = BRAND_VAR[active.trigger.brand];
  const beat = (frames: Record<string, number[]>, rest: Record<string, number>, times: number[]) => ({
    initial: false as const,
    animate: live ? frames : rest,
    transition: loopTransition(live, { duration: SIGNAL_S, ease: "easeInOut", times }),
  });

  return (
    <svg viewBox={`0 0 ${VB} ${VB}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-floor`}>
          <stop offset="0%" stopColor={tone} stopOpacity="0.2" />
          <stop offset="55%" stopColor={tone} stopOpacity="0.05" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-tail`} gradientUnits="userSpaceOnUse" x1={C} y1={HEAD_Y - TAIL} x2={C} y2={HEAD_Y}>
          <stop offset="0%" stopColor={tone} stopOpacity="0" />
          <stop offset="100%" stopColor={tone} stopOpacity="1" />
        </linearGradient>
      </defs>

      <circle cx={C} cy={C} r={BEZEL_R} fill={`url(#${uid}-floor)`} />
      <circle cx={C} cy={C} r={BEZEL_R} fill="none" stroke="rgba(var(--surface-overlay), 0.1)" />
      {TICKS.map(({ a, b, major }, i) => (
        <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={`rgba(var(--surface-overlay), ${major ? 0.3 : 0.12})`} strokeWidth={major ? 1.6 : 1} />
      ))}
      <Spin
        x={C} y={C} r={BEZEL_R}
        initial={false}
        animate={{ rotate: dialSteps * STEP_DEG }}
        transition={still ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 17 }}
      >
        <path d={`M-70 ${9.5 - BEZEL_R} A${BEZEL_R} ${BEZEL_R} 0 0 1 70 ${9.5 - BEZEL_R}`} fill="none" stroke={tone} strokeWidth="3" strokeLinecap="round" opacity="0.85" />
        <path d={`M-7 ${18 - BEZEL_R} L0 ${28 - BEZEL_R} L7 ${18 - BEZEL_R} Z`} fill={tone} />
      </Spin>

      <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(var(--surface-overlay), 0.07)" strokeWidth={TILE * 0.62} />
      <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(var(--surface-overlay), 0.12)" strokeDasharray="2 6" />

      {NODES.map((n, i) => {
        const on = n.trigger.id === activeId;
        return (
          <g key={n.trigger.id} transform={`rotate(${n.deg} ${C} ${C})`}>
            <line x1={C} y1={C - R} x2={C} y2={LAND_Y} stroke={on ? mix(tone, 55) : "rgba(var(--surface-overlay), 0.1)"} strokeWidth={on ? 2 : 1} />
            <motion.circle
              cx={C} cy={C - R + TILE / 2} r="2.4" fill={BRAND_VAR[n.trigger.brand]}
              initial={false}
              animate={live && !on ? { y: [0, R - TILE / 2 - HUB_R - 10], opacity: [0, 0.55, 0] } : { y: 0, opacity: 0 }}
              transition={loopTransition(live && !on, { duration: 4.2, ease: "easeIn", delay: i * 0.42 })}
            />
          </g>
        );
      })}

      <circle cx={C} cy={C} r={150} fill={`url(#${uid}-floor)`} />
      <motion.circle cx={C} cy={C} r={HUB_R + 6} fill="none" stroke={tone} strokeWidth="2" style={SELF}
        {...beat({ scale: [1, 1, 1, 1.75], opacity: [0, 0, 0.75, 0] }, { scale: 1.3, opacity: 0.35 }, [0, 0.5, 0.55, 1])} />
      <motion.circle cx={C} cy={C} r={HUB_R + 22} fill="none" stroke="rgba(var(--surface-overlay), 0.14)" strokeDasharray="1 7" strokeWidth="2"
        initial={false} animate={{ rotate: live ? 360 : 0 }} transition={loopTransition(live, { duration: 40, ease: "linear" })} />

      <g key={active.trigger.id} transform={`rotate(${active.deg} ${C} ${C})`}>
        <motion.g {...beat({ y: [0, 0, LAND_Y - HEAD_Y, LAND_Y - HEAD_Y], opacity: [0, 1, 1, 0] }, { y: LAND_Y - HEAD_Y - 18, opacity: 1 }, [0, 0.08, 0.52, 0.56])}>
          <line x1={C} y1={HEAD_Y - TAIL} x2={C} y2={HEAD_Y} stroke={`url(#${uid}-tail)`} strokeWidth="6" strokeLinecap="round" />
          <circle cx={C} cy={HEAD_Y} r="16" fill={tone} opacity="0.18" />
          <circle cx={C} cy={HEAD_Y} r="8" fill={tone} opacity="0.35" />
          <circle cx={C} cy={HEAD_Y} r="4.5" fill="var(--foreground)" />
        </motion.g>
      </g>
    </svg>
  );
}
