"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import {
  phases,
  CX,
  CY,
  RADIUS,
  STROKE,
  SEGMENT_ANGLE,
  SEGMENT_STEP,
  INNER_R,
  polar,
  sweepPath,
  sweepLead,
  sweepTrail,
  spinOrigin,
} from "./command-center-geometry";
import AgentConstellation from "./AgentConstellation";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";

interface Props {
  publicBetaLabel: string;
}

export default function CommandCenterIllustration({ publicBetaLabel }: Props) {
  // useId() namespaces the SVG <linearGradient> / <filter> definition IDs
  // so this component can mount multiple times on a page without ID
  // collisions, and so the IDs stay stable across SSR/CSR (avoiding
  // hydration warnings). Don't simplify to a hardcoded string — that
  // breaks both invariants.
  const uid = useId();
  // Continuous loops (radar sweep, orbit, breathing core) are gated on reduced
  // motion per the animation contract; the static structure renders either way.
  const reduced = useReducedMotion() ?? false;
  const arcGradientId = `${uid}-arcGrad`;
  const arcGlowId = `${uid}-arcGlow`;
  const sweepGradId = `${uid}-sweep`;
  const coreGlowId = `${uid}-core`;
  const cyan = BRAND_VAR.cyan;

  return (
    <div data-tour-diagram="command-center" className="relative flex items-center justify-center group">
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
          <linearGradient
            id={sweepGradId}
            gradientUnits="userSpaceOnUse"
            x1={sweepLead.x.toFixed(2)}
            y1={sweepLead.y.toFixed(2)}
            x2={sweepTrail.x.toFixed(2)}
            y2={sweepTrail.y.toFixed(2)}
          >
            <stop offset="0%" stopColor={cyan} stopOpacity="0.34" />
            <stop offset="100%" stopColor={cyan} stopOpacity="0" />
          </linearGradient>
          <radialGradient id={coreGlowId}>
            <stop offset="0%" stopColor={cyan} stopOpacity="0.5" />
            <stop offset="65%" stopColor={cyan} stopOpacity="0.06" />
            <stop offset="100%" stopColor={cyan} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Breathing core glow behind the version readout */}
        {reduced ? (
          <circle cx={CX} cy={CY} r={46} fill={`url(#${coreGlowId})`} opacity={0.5} />
        ) : (
          <motion.circle
            cx={CX}
            cy={CY}
            r={46}
            fill={`url(#${coreGlowId})`}
            initial={{ opacity: 0.35, scale: 0.92 }}
            animate={{ opacity: [0.35, 0.62, 0.35], scale: [0.92, 1.05, 0.92] }}
            transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
            style={spinOrigin}
          />
        )}

        {/* Base track */}
        <circle cx={CX} cy={CY} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={STROKE} />

        {/* Progress arcs — one per roadmap phase, completed ones lit */}
        {phases.map((phase, i) => {
          const start = i * SEGMENT_STEP;
          const p1 = polar(RADIUS, start);
          const p2 = polar(RADIUS, start + SEGMENT_ANGLE);
          const d = `M ${p1.x.toFixed(4)} ${p1.y.toFixed(4)} A ${RADIUS} ${RADIUS} 0 0 1 ${p2.x.toFixed(4)} ${p2.y.toFixed(4)}`;
          return (
            <motion.path
              key={phase.index}
              d={d}
              fill="none"
              stroke={phase.completed ? `url(#${arcGradientId})` : "rgba(255,255,255,0.06)"}
              strokeWidth={phase.completed ? STROKE : STROKE - 1}
              strokeLinecap="round"
              filter={phase.completed ? `url(#${arcGlowId})` : undefined}
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: phase.completed ? 1 : 0.5 }}
              transition={reduced ? { duration: 0 } : { duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
            />
          );
        })}

        {/* Radar sweep — rotates clockwise, grazing the progress ring */}
        {!reduced && (
          <motion.path
            d={sweepPath}
            fill={`url(#${sweepGradId})`}
            animate={{ rotate: 360 }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            style={spinOrigin}
          />
        )}

        {/* Inner dashed guide ring — slow counter-rotation for ambient life */}
        {reduced ? (
          <circle
            cx={CX}
            cy={CY}
            r={INNER_R}
            fill="none"
            stroke="rgba(255,255,255,0.02)"
            strokeWidth="0.5"
            strokeDasharray="3 8"
          />
        ) : (
          <motion.circle
            cx={CX}
            cy={CY}
            r={INNER_R}
            fill="none"
            stroke="rgba(255,255,255,0.035)"
            strokeWidth="0.5"
            strokeDasharray="3 8"
            animate={{ rotate: -360 }}
            transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
            style={spinOrigin}
          />
        )}

        {/* Orbiting agents — the constellation the command center orchestrates */}
        <AgentConstellation cyan={cyan} reduced={reduced} />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight text-foreground drop-shadow-[0_0_10px_color-mix(in_srgb,var(--foreground)_30%,transparent)]">
          {APP_VERSION}
        </span>
        <span className="text-base text-muted-dark font-mono tracking-wider mt-1">
          {publicBetaLabel}
        </span>
      </div>
    </div>
  );
}
