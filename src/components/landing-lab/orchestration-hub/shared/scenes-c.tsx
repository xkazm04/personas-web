"use client";

import { motion } from "framer-motion";
import { INK, SOFT, PAPER, SOLID, SELF, beat, mix, type SceneProps } from "./scene-kit";

/* Vignettes for chain, composite and manual - see scenes.ts. */

/** A full circle of radius 24 around (cx, 60), drawn clockwise from 12 o'clock so pathLength fills like progress. */
const ring = (cx: number) => `M${cx} 36 A24 24 0 1 1 ${cx - 0.01} 36`;

/** Chain: the upstream agent finishes, and its output is handed to the next agent, which starts. */
export function ChainScene({ run, tone }: SceneProps) {
  return (
    <>
      <line x1="62" y1="60" x2="98" y2="60" stroke={SOFT} strokeWidth="1.6" strokeDasharray="3 4" />
      <circle cx="38" cy="60" r="19" fill={PAPER} stroke={INK} strokeWidth="1.6" />
      <motion.path d={ring(38)} stroke={INK} strokeWidth="2.4" strokeLinecap="round"
        {...beat(run, { pathLength: [0, 1, 1, 1] }, { pathLength: 1 }, [0, 0.35, 0.9, 1])} />
      <motion.path d="M30 60 l6 6 l11 -12" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
        {...beat(run, { pathLength: [0, 0, 1, 1, 0] }, { pathLength: 1 }, [0, 0.36, 0.44, 0.9, 1])} />
      <motion.g {...beat(run, { x: [0, 0, 36, 36, 36], opacity: [0, 0, 1, 0, 0] }, { x: 26, opacity: 1 }, [0, 0.44, 0.66, 0.72, 1])}>
        <rect x="56" y="54" width="14" height="12" rx="3" fill={mix(tone, 40)} stroke={tone} strokeWidth="1.4" />
        <line x1="59" y1="60" x2="67" y2="60" stroke={tone} strokeWidth="1.6" strokeLinecap="round" />
      </motion.g>
      <circle cx="122" cy="60" r="19" fill={SOLID} />
      <motion.circle cx="122" cy="60" r="19" fill={mix(tone, 30)} stroke={tone} strokeWidth="1.8"
        {...beat(run, { fillOpacity: [0.1, 0.1, 1, 1, 0.1] }, { fillOpacity: 1 }, [0, 0.68, 0.74, 0.92, 1])} />
      <motion.path d={ring(122)} stroke={tone} strokeWidth="2.4" strokeLinecap="round"
        {...beat(run, { pathLength: [0, 0, 0, 0.4, 0] }, { pathLength: 0.4 }, [0, 0.5, 0.72, 0.95, 1])} />
      <path d="M117 52 l10 8 l-10 8 z" fill={tone} />
    </>
  );
}

const WIRE_1 = "M32 32 H60 V52 H84";
const WIRE_2 = "M32 88 H60 V68 H84";

/** Composite: two conditions arrive one after another; only when both hold does the gate pass the signal on. */
export function CompositeScene({ run, tone }: SceneProps) {
  return (
    <>
      <path d={WIRE_1} stroke={SOFT} strokeWidth="1.6" />
      <path d={WIRE_2} stroke={SOFT} strokeWidth="1.6" />
      <motion.path d={WIRE_1} stroke={tone} strokeWidth="2.4" strokeLinecap="round"
        {...beat(run, { pathLength: [0, 1, 1, 1, 0] }, { pathLength: 1 }, [0, 0.22, 0.5, 0.9, 1])} />
      <motion.path d={WIRE_2} stroke={tone} strokeWidth="2.4" strokeLinecap="round"
        {...beat(run, { pathLength: [0, 0, 1, 1, 0] }, { pathLength: 1 }, [0, 0.26, 0.48, 0.9, 1])} />
      <circle cx="22" cy="32" r="10" fill={PAPER} stroke={INK} strokeWidth="1.6" />
      <path d="M22 26 v6 h4" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="22" cy="88" r="10" fill={PAPER} stroke={INK} strokeWidth="1.6" />
      <path d="M22 82 v8 m-3.5 -3.5 l3.5 3.5 l3.5 -3.5 M16.5 91 v1.5 h11 v-1.5" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M84 42 H100 A18 18 0 0 1 100 78 H84 Z" fill={SOLID} stroke={INK} strokeWidth="1.6" />
      <motion.path d="M84 42 H100 A18 18 0 0 1 100 78 H84 Z" fill={mix(tone, 36)} stroke={tone} strokeWidth="1.8"
        {...beat(run, { opacity: [0, 0, 1, 1, 0] }, { opacity: 1 }, [0, 0.48, 0.53, 0.9, 1])} />
      <path d="M92 54 l5 6 l-5 6 M100 54 l5 6 l-5 6" stroke={INK} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      <line x1="118" y1="60" x2="138" y2="60" stroke={SOFT} strokeWidth="1.6" />
      <motion.line x1="118" y1="60" x2="138" y2="60" stroke={tone} strokeWidth="2.4" strokeLinecap="round"
        {...beat(run, { pathLength: [0, 0, 1, 1, 0] }, { pathLength: 1 }, [0, 0.53, 0.66, 0.9, 1])} />
      <motion.circle cx="145" cy="60" r="7" fill={tone} style={SELF}
        {...beat(run, { scale: [0.6, 0.6, 1.2, 1, 0.6], opacity: [0.3, 0.3, 1, 1, 0.3] }, { scale: 1, opacity: 1 }, [0, 0.64, 0.7, 0.9, 1])} />
    </>
  );
}

/** Manual: you click Run, the button presses in and the run starts. */
export function ManualScene({ run, tone }: SceneProps) {
  return (
    <>
      <motion.circle cx="84" cy="58" r="20" stroke={tone} strokeWidth="2" style={SELF}
        {...beat(run, { opacity: [0, 0, 0.8, 0], scale: [1, 1, 1, 2.6] }, { opacity: 0.35, scale: 1.8 }, [0, 0.42, 0.46, 0.8])} />
      <motion.g style={SELF} {...beat(run, { scale: [1, 1, 0.92, 1, 1] }, { scale: 1 }, [0, 0.42, 0.46, 0.52, 1])}>
        <rect x="40" y="42" width="80" height="32" rx="16" fill={SOLID} />
        <motion.rect x="40" y="42" width="80" height="32" rx="16" fill={mix(tone, 34)} stroke={tone} strokeWidth="2"
          {...beat(run, { fillOpacity: [0.25, 0.25, 1, 1, 0.25] }, { fillOpacity: 1 }, [0, 0.44, 0.48, 0.9, 1])} />
        <path d="M58 51 l12 7 l-12 7 z" fill={tone} />
        <line x1="78" y1="58" x2="104" y2="58" stroke={tone} strokeWidth="3" strokeLinecap="round" />
      </motion.g>
      {[56, 76].map((x, i) => (
        <g key={x}>
          <rect x={x} y="90" width="17" height="16" rx="4" fill={PAPER} stroke={i ? tone : SOFT} strokeWidth="1.4" />
          <line x1={x + 5} y1="98" x2={x + 12} y2="98" stroke={i ? tone : SOFT} strokeWidth="1.8" strokeLinecap="round" />
        </g>
      ))}
      <motion.g {...beat(run, { x: [44, 44, 0, 0, 44], y: [40, 40, 0, 0, 40] }, { x: 0, y: 0 }, [0, 0.1, 0.4, 0.8, 1])}>
        <path d="M88 60 v18 l5 -4.5 l4 8 l3 -1.4 l-4 -7.8 h7 z" fill="var(--foreground)" stroke={SOLID} strokeWidth="1.2" strokeLinejoin="round" />
      </motion.g>
    </>
  );
}
