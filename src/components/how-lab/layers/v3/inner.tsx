"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { loopTransition } from "@/lib/motion/loop-gate";
import { SvgToolGlyph } from "../shared/ToolGlyph";
import type { ToolId } from "../shared/layers";
import { AGENT_CARD } from "./geometry";

/** The two inner frames, each in its own 1320x500 local units. */

const PU = BRAND_VAR.purple;
const CY = BRAND_VAR.cyan;

/** A - One task: a plain sentence becomes an agent with three steps. */
export function TaskScene({ live, uid, prompt, steps }: { live: boolean; uid: string; prompt: string; steps: string[] }) {
  return (
    <g>
      <rect x="540" y="60" width="740" height="92" rx="46" fill={tint("purple", 12)} stroke={tint("purple", 70)} strokeWidth="3" />
      <clipPath id={`${uid}-type`}>
        <motion.rect
          x="570"
          y="70"
          height="72"
          initial={false}
          animate={live ? { width: [0, 700, 700] } : { width: 700 }}
          transition={loopTransition(live, { duration: 5, ease: "linear", repeatDelay: 0.4 })}
        />
      </clipPath>
      <text x="582" y="120" fontSize="38" fill="var(--foreground)" clipPath={`url(#${uid}-type)`}>
        {prompt}
      </text>
      <path d="M910 162 V206 M896 192 L910 208 L924 192" stroke={tint("purple", 80)} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="842" y="214" width="136" height="104" rx="34" fill={tint("purple", 18)} stroke={PU} strokeWidth="4" />
      <circle cx="886" cy="266" r="9" fill={PU} />
      <circle cx="934" cy="266" r="9" fill={PU} />
      <path d="M910 214 V188" stroke={PU} strokeWidth="4" strokeLinecap="round" />
      <circle cx="910" cy="184" r="6" fill={PU} />
      {steps.map((s, i) => {
        const x = 580 + i * 240;
        return (
          <g key={s}>
            {i > 0 && <path d={`M${x - 46} 408 H${x - 8}`} stroke={tint("purple", 55)} strokeWidth="3" strokeLinecap="round" />}
            <rect x={x} y="372" width="200" height="72" rx="36" fill={tint("purple", 8)} stroke={PU} strokeWidth="3" />
            <motion.rect
              x={x}
              y="372"
              width="200"
              height="72"
              rx="36"
              fill={tint("purple", 34)}
              initial={false}
              animate={live ? { opacity: [0, 0, 1, 1] } : { opacity: 0.75 }}
              transition={loopTransition(live, { duration: 5.4, ease: "linear", delay: 0.6 * i })}
            />
            <text x={x + 100} y="420" fontSize="32" textAnchor="middle" fill="var(--foreground)" fontWeight="600">
              {s}
            </text>
          </g>
        );
      })}
    </g>
  );
}

const TOOLS: { tool: ToolId; x: number }[] = [
  { tool: "gmail", x: 170 },
  { tool: "slack", x: 820 },
  { tool: "github", x: 1150 },
];
const NODE_Y = 280;
const SEGMENTS = [
  [234, AGENT_CARD.x],
  [AGENT_CARD.x + AGENT_CARD.w, 756],
  [884, 1086],
];

/** B - A chain: mail lands, the agent works, Slack and GitHub hear about it. */
export function ChainScene({ live, uid, labels }: { live: boolean; uid: string; labels: string[] }) {
  return (
    <g>
      {SEGMENTS.map(([a, b], i) => (
        <g key={a}>
          <path d={`M${a} ${NODE_Y} H${b - 14}`} stroke={tint("cyan", 60)} strokeWidth="5" strokeDasharray="10 10" />
          <path d={`M${b - 26} ${NODE_Y - 14} L${b - 8} ${NODE_Y} L${b - 26} ${NODE_Y + 14}`} stroke={CY} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <motion.circle
            cy={NODE_Y}
            r="11"
            fill={CY}
            initial={false}
            animate={live ? { cx: [a, b - 12], opacity: [0, 1, 1, 0] } : { cx: (a + b) / 2, opacity: 1 }}
            transition={loopTransition(live, { duration: 1, ease: "easeInOut", delay: 0.75 * i, repeatDelay: 1.5 })}
          />
        </g>
      ))}
      {TOOLS.map(({ tool, x }) => (
        <g key={tool}>
          <circle cx={x} cy={NODE_Y} r="64" fill={tint("cyan", 12)} stroke={CY} strokeWidth="4" />
          <SvgToolGlyph id={`${uid}-${tool}`} tool={tool} x={x - 32} y={NODE_Y - 32} size={64} />
        </g>
      ))}
      <rect x={AGENT_CARD.x} y={AGENT_CARD.y} width={AGENT_CARD.w} height={AGENT_CARD.h} rx="18" fill="color-mix(in srgb, var(--surface) 92%, transparent)" stroke={PU} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      {[TOOLS[0].x, AGENT_CARD.x + AGENT_CARD.w / 2, TOOLS[1].x, TOOLS[2].x].map((x, i) => (
        <text key={x} x={x} y="410" fontSize="30" fontWeight="600" textAnchor="middle" fill={i === 1 ? PU : "var(--muted)"}>
          {labels[i]}
        </text>
      ))}
    </g>
  );
}

/** The same chain as a quiet sketch, for the fleet's other cards. */
export function ChainSketch() {
  const c = "color-mix(in srgb, var(--foreground) 35%, transparent)";
  return (
    <g fill="none" stroke={c} strokeWidth="8">
      {SEGMENTS.map(([a, b]) => (
        <path key={a} d={`M${a} ${NODE_Y} H${b}`} />
      ))}
      {TOOLS.map(({ x }) => (
        <circle key={x} cx={x} cy={NODE_Y} r="64" />
      ))}
      <rect x={AGENT_CARD.x} y={AGENT_CARD.y} width={AGENT_CARD.w} height={AGENT_CARD.h} rx="18" />
    </g>
  );
}
