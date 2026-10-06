"use client";

import { motion } from "framer-motion";
import { loopTransition } from "@/lib/motion/loop-gate";
import { AGENTS, BUS_Y, BADGE_R, HANDOFFS, PHASE_MS, TRAVEL_PHASE, VB_H, VB_W, keyframesOf, pathOf, type HandoffId } from "./geometry";

const IDS = Object.keys(HANDOFFS) as HandoffId[];
const KF = Object.fromEntries(IDS.map((id) => [id, keyframesOf(HANDOFFS[id])])) as Record<HandoffId, ReturnType<typeof keyframesOf>>;

/**
 * The circuit: a glass bus bar (the shared hub) with each agent's tap, and the
 * hand-offs drawn on as the work moves - a packet runs down into the hub, along
 * it, and up into whichever agents listen for it, leaving its trace lit. At the
 * last phase the whole chain is lit, which is also the reduced-motion frame.
 */
export default function Circuit({ uid, phase, run, tone }: { uid: string; phase: number; run: boolean; tone: string }) {
  const travelS = (id: HandoffId) => PHASE_MS[TRAVEL_PHASE[id]] / 1000;
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <filter id={`${uid}-glow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id={`${uid}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1.3" fill="var(--foreground)" fillOpacity="0.09" />
        </pattern>
        <filter id={`${uid}-soft`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <linearGradient id={`${uid}-bus`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      <rect x={0} y={0} width={VB_W} height={VB_H} rx={28} fill={`url(#${uid}-grid)`} />
      <motion.rect
        x={60}
        y={BUS_Y - 22}
        width={VB_W - 120}
        height={44}
        rx={22}
        fill={tone}
        filter={`url(#${uid}-soft)`}
        initial={false}
        animate={{ opacity: phase >= 1 ? 0.28 : 0.08 }}
        transition={{ duration: run ? 0.6 : 0 }}
      />

      {/* Agent taps: thin rails from each badge to the hub. */}
      {Object.values(AGENTS).map((a) => (
        <line key={a.x + a.y} x1={a.x} y1={a.y < BUS_Y ? a.y + BADGE_R : a.y - BADGE_R} x2={a.x} y2={BUS_Y} stroke="var(--foreground)" strokeOpacity={0.22} strokeWidth={2} strokeDasharray="4 6" />
      ))}

      {/* The shared hub: one glass bar every agent is wired to. */}
      <rect x={30} y={BUS_Y - 17} width={VB_W - 60} height={34} rx={17} fill={`url(#${uid}-bus)`} stroke={tone} strokeOpacity={0.45} strokeWidth={1.5} />
      <motion.line
        x1={48}
        x2={VB_W - 48}
        y1={BUS_Y}
        y2={BUS_Y}
        stroke={tone}
        strokeOpacity={0.55}
        strokeWidth={2}
        strokeDasharray="2 14"
        animate={{ strokeDashoffset: run ? [0, -160] : 0 }}
        transition={loopTransition(run, { duration: 4, ease: "linear" })}
      />

      {/* Solder pads where each tap meets the hub. */}
      {Object.values(AGENTS).map((a) => (
        <circle key={`pad-${a.x}-${a.y}`} cx={a.x} cy={BUS_Y} r={7} fill="var(--background)" stroke={tone} strokeOpacity={0.7} strokeWidth={2} />
      ))}

      {IDS.map((id) => {
        const lit = phase >= TRAVEL_PHASE[id];
        const live = run && phase === TRAVEL_PHASE[id];
        return (
          <motion.path
            key={`t-${id}`}
            d={pathOf(HANDOFFS[id])}
            fill="none"
            stroke={tone}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: lit ? 1 : 0, opacity: lit ? 0.85 : 0 }}
            transition={{ duration: live ? travelS(id) : 0, ease: "linear" }}
          />
        );
      })}

      {IDS.map((id) => {
        const live = run && phase === TRAVEL_PHASE[id];
        const kf = KF[id];
        return (
          <motion.circle
            key={`p-${id}`}
            r={9}
            fill={tone}
            filter={`url(#${uid}-glow)`}
            initial={{ cx: kf.cx[0], cy: kf.cy[0], opacity: 0 }}
            animate={live ? { cx: kf.cx, cy: kf.cy, opacity: 1 } : { opacity: 0 }}
            transition={live ? { duration: travelS(id), times: kf.times, ease: "linear", opacity: { duration: 0.12 } } : { duration: run ? 0.2 : 0 }}
          />
        );
      })}
    </svg>
  );
}
