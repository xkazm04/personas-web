"use client";

import { createElement, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import type { TriggerDef } from "@/components/sections/orchestration-hub/data";
import { SCENES } from "../shared/scenes";
import { mix } from "../shared/scene-kit";
import { PORT_R } from "./geometry";

interface PortholeProps {
  trigger: TriggerDef;
  /** Centre, in fan units: the open ray's middle. */
  x: number;
  y: number;
  live: boolean;
  still: boolean;
}

const SCENE_W = 216;
const SCENE_H = 162;

/**
 * The open ray's window onto the visitor's world: a round pane in the ray,
 * with the trigger's vignette acting out the moment it fires. It blooms open
 * once the iris has made room, and closes before the next ray opens.
 */
export default function Porthole({ trigger, x, y, live, still }: PortholeProps) {
  const uid = useId();
  const tone = BRAND_VAR[trigger.brand];

  return (
    <AnimatePresence mode="wait">
      <motion.g
        key={trigger.id}
        className="pointer-events-none"
        initial={still ? false : { opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={still ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
        transition={still ? { duration: 0 } : { duration: 0.55, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <clipPath id={`${uid}-pane`}>
          <circle cx={x} cy={y} r={PORT_R - 3} />
        </clipPath>
        <circle cx={x} cy={y} r={PORT_R + 12} fill="none" stroke={mix(tone, 22)} strokeWidth="1" strokeDasharray="2 6" />
        <circle cx={x} cy={y} r={PORT_R} fill="var(--background)" stroke={tone} strokeWidth="2.5" />
        <circle cx={x} cy={y} r={PORT_R} fill={mix(tone, 10)} />
        <g clipPath={`url(#${uid}-pane)`}>
          <svg x={x - SCENE_W / 2} y={y - SCENE_H / 2 + 4} width={SCENE_W} height={SCENE_H} viewBox="0 0 160 120" fill="none" overflow="visible">
            {createElement(SCENES[trigger.id], { run: live, tone })}
          </svg>
        </g>
        <circle cx={x} cy={y} r={PORT_R - 1} fill="none" stroke={mix(tone, 35)} strokeWidth="6" opacity="0.5" />
      </motion.g>
    </AnimatePresence>
  );
}
