"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { completedCount, totalPhases } from "@/data/roadmap-phases";

const phases = Array.from({ length: totalPhases }, (_, i) => ({
  index: i + 1,
  completed: i < completedCount,
}));

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";

interface Props {
  publicBetaLabel: string;
}

export default function CommandCenterIllustration({ publicBetaLabel }: Props) {
  const uid = useId();
  const arcGradientId = `${uid}-arcGrad`;
  const arcGlowId = `${uid}-arcGlow`;
  const radius = 100;
  const strokeWidth = 4;
  const gap = 4;
  const segmentAngle = (360 - gap * totalPhases) / totalPhases;

  return (
    <div className="relative flex items-center justify-center group">
      <svg
        width="220"
        height="220"
        viewBox="0 0 220 220"
        className="drop-shadow-lg transition-all duration-500 group-hover:drop-shadow-xl"
      >
        <defs>
          <linearGradient id={arcGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--muted)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0.7" />
          </linearGradient>
          <filter id={arcGlowId}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} />
        {phases.map((phase, i) => {
          const startAngle = i * (segmentAngle + gap) - 90;
          const endAngle = startAngle + segmentAngle;
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          const x1 = (110 + radius * Math.cos(startRad)).toFixed(4);
          const y1 = (110 + radius * Math.sin(startRad)).toFixed(4);
          const x2 = (110 + radius * Math.cos(endRad)).toFixed(4);
          const y2 = (110 + radius * Math.sin(endRad)).toFixed(4);
          return (
            <motion.path
              key={phase.index}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke={phase.completed ? `url(#${arcGradientId})` : "rgba(255,255,255,0.06)"}
              strokeWidth={phase.completed ? strokeWidth : strokeWidth - 1}
              strokeLinecap="round"
              filter={phase.completed ? `url(#${arcGlowId})` : undefined}
              opacity={phase.completed ? 1 : 0.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: phase.completed ? 1 : 0.5 }}
              transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
            />
          );
        })}

        <circle
          cx="110"
          cy="110"
          r={radius - 18}
          fill="none"
          stroke="rgba(255,255,255,0.02)"
          strokeWidth="0.5"
          strokeDasharray="3 8"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          {APP_VERSION}
        </span>
        <span className="text-base text-muted-dark font-mono tracking-wider mt-1">
          {publicBetaLabel}
        </span>
      </div>
    </div>
  );
}
