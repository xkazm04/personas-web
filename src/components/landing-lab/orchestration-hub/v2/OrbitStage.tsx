"use client";

import { useEffect, useId } from "react";
import { motion, useSpring } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { TRIGGERS } from "@/components/sections/orchestration-hub/data";
import { timedLoop } from "../shared/scene-kit";
import { useDialSteps } from "../shared/useDialSteps";
import type { HubPlayback } from "../shared/useHubPlayback";
import OrbitNode from "./OrbitNode";
import Core from "./Core";
import { BEAM_S, CORE_R, CORE_Y, FRONT_Y, H, LENS_SCALE, NODE_D, OX, OY, RX, RY, W } from "./geometry";

const BEAM_FROM = FRONT_Y - (NODE_D * 1.3 * LENS_SCALE) / 2 + 4;
const BEAM_TO = CORE_Y + CORE_R - 6;
const RISE = BEAM_TO - BEAM_FROM;
/** Three motes climb the shaft one after another, each fading in low and out at the agent. */
const mote = () => ({ y: [0, 0, RISE * 0.24, RISE, RISE], opacity: [0, 0, 1, 0, 0] });
const moteTimes = (i: number) => [0, i * 0.18, i * 0.18 + 0.12, i * 0.18 + 0.5, 1];

/**
 * The orbit seen in perspective: ten triggers ride an ellipse around the agent
 * and the whole ring swings (a spring on the turn) to bring the active one to
 * the front. From there its signal rises as a shaft of light into the agent,
 * which answers with a swell. Stopped or reduced, the ring is still and the
 * shaft holds a single mote halfway up.
 */
export default function OrbitStage({ hub }: { hub: HubPlayback }) {
  const uid = useId();
  const copy = useTranslation().t.orchestrationSection;
  const tone = BRAND_VAR[hub.trigger.brand];
  const steps = useDialSteps(hub.state.active, TRIGGERS.length);
  const turn = useSpring(steps, { stiffness: 38, damping: 13, mass: 1.1 });
  useEffect(() => {
    if (hub.still) turn.jump(steps);
    else turn.set(steps);
  }, [steps, hub.still, turn]);

  return (
    <div
      role="group"
      aria-label={copy.ringLabel}
      className="@container relative mx-auto aspect-[4/3] w-full stage:w-[min(100%,calc(100cqh_*_4_/_3))]"
      {...hub.holdProps}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id={`${uid}-floor`}>
            <stop offset="0%" stopColor={tone} stopOpacity="0.2" />
            <stop offset="60%" stopColor={tone} stopOpacity="0.05" />
            <stop offset="100%" stopColor={tone} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-orbit`} gradientUnits="userSpaceOnUse" x1="0" y1={OY - RY} x2="0" y2={OY + RY}>
            <stop offset="0%" stopColor="rgba(var(--surface-overlay), 0.08)" />
            <stop offset="100%" stopColor={tone} stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id={`${uid}-shaft`} gradientUnits="userSpaceOnUse" x1="0" y1={BEAM_FROM} x2="0" y2={BEAM_TO}>
            <stop offset="0%" stopColor={tone} stopOpacity="0.55" />
            <stop offset="100%" stopColor={tone} stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <ellipse cx={OX} cy={OY + 10} rx={RX + 70} ry={RY + 40} fill={`url(#${uid}-floor)`} />
        <ellipse cx={OX} cy={OY} rx={RX} ry={RY} fill="none" stroke={`url(#${uid}-orbit)`} strokeWidth="1.5" />
        <ellipse cx={OX} cy={OY} rx={RX - 26} ry={RY - 12} fill="none" stroke="rgba(var(--surface-overlay), 0.06)" strokeDasharray="2 8" />
        <ellipse cx={OX} cy={OY} rx={RX + 26} ry={RY + 12} fill="none" stroke="rgba(var(--surface-overlay), 0.05)" />
      </svg>

      <Core trigger={hub.trigger} live={hub.live} still={hub.still} />

      <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 z-[25] h-full w-full" aria-hidden="true">
        <path
          d={`M${OX - 16} ${BEAM_FROM} L${OX + 16} ${BEAM_FROM} L${OX + 56} ${BEAM_TO} L${OX - 56} ${BEAM_TO} Z`}
          fill={`url(#${uid}-shaft)`}
        />
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`${hub.trigger.id}-${i}`}
            cx={OX + (i - 1) * 10}
            cy={BEAM_FROM}
            r={i === 1 ? 5 : 3}
            fill={i === 1 ? "var(--foreground)" : tone}
            initial={false}
            animate={hub.live ? mote() : { y: RISE / 2, opacity: i === 1 ? 1 : 0 }}
            transition={timedLoop(hub.live, BEAM_S, moteTimes(i), "linear")}
          />
        ))}
      </svg>

      {TRIGGERS.map((t, i) => (
        <OrbitNode key={t.id} index={i} turn={turn} on={i === hub.state.active} live={hub.live} still={hub.still} onSelect={hub.select} />
      ))}
    </div>
  );
}
