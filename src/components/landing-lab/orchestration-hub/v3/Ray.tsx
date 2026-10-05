"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import type { TriggerDef } from "@/components/sections/orchestration-hub/data";
import { mix, timedLoop } from "../shared/scene-kit";
import { OX, OY, R0, R1, SUN_R, SWEEP_S, at, wedge } from "./geometry";

interface RayProps {
  trigger: TriggerDef;
  a0: MotionValue<number>;
  a1: MotionValue<number>;
  on: boolean;
  live: boolean;
  uid: string;
  onSelect: (id: string) => void;
}

const ICON = 30;
/** A band of light enters at the rim and runs down the ray into the agent, fading as it lands. */
const SWEEP = { r: [R1, R1, R1 - 0.22 * (R1 - SUN_R), SUN_R], opacity: [0, 0, 0.6, 0] };
const sweepTimes = (k: number) => [0, 0.02 + k * 0.3, 0.12 + k * 0.3, 0.55 + k * 0.3];

/**
 * One ray of the sunrise: a wedge of coloured glass in its trigger's tone,
 * brighter toward the rim. Its edges come from springs, so the fan opens the
 * active ray like an iris. The open ray carries the signal: two bands of light
 * sweep down it into the agent, clipped to the wedge. (Pointer convenience
 * only - the keyboard path is the label button.)
 */
export default function Ray({ trigger, a0, a1, on, live, uid, onSelect }: RayProps) {
  const tone = BRAND_VAR[trigger.brand];
  const Icon = trigger.icon;
  const id = `${uid}-${trigger.id}`;
  const d = useTransform([a0, a1], ([s, e]: number[]) => wedge(s, e));
  const iconX = useTransform([a0, a1], ([s, e]: number[]) => at(R1 - 52, (s + e) / 2).x - ICON / 2);
  const iconY = useTransform([a0, a1], ([s, e]: number[]) => at(R1 - 52, (s + e) / 2).y - ICON / 2);

  return (
    <g>
      <defs>
        <radialGradient id={`${id}-glass`} gradientUnits="userSpaceOnUse" cx={OX} cy={OY} r={R1}>
          <stop offset={R0 / R1} stopColor={tone} stopOpacity={on ? 0.42 : 0.04} />
          <stop offset="1" stopColor={tone} stopOpacity={on ? 0.12 : 0.16} />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <motion.path d={d} />
        </clipPath>
      </defs>
      <motion.path
        d={d}
        fill={`url(#${id}-glass)`}
        stroke={mix(tone, on ? 70 : 26)}
        strokeWidth={on ? 1.8 : 1}
        className="cursor-pointer"
        onClick={() => onSelect(trigger.id)}
      />
      <g clipPath={`url(#${id}-clip)`} className="pointer-events-none">
        {[0, 1].map((k) => (
          <motion.circle
            key={k}
            cx={OX}
            cy={OY}
            fill="none"
            stroke={tone}
            strokeWidth="22"
            initial={false}
            animate={live && on ? SWEEP : { r: (R1 + R0) / 2, opacity: on ? 0.22 : 0 }}
            transition={timedLoop(live && on, SWEEP_S, sweepTimes(k), "linear")}
          />
        ))}
      </g>
      <motion.g style={{ x: iconX, y: iconY }} className="pointer-events-none" initial={false} animate={{ opacity: on ? 0 : 1 }}>
        <Icon width={ICON} height={ICON} color={mix(tone, 90)} strokeWidth={1.75} aria-hidden="true" />
      </motion.g>
    </g>
  );
}
