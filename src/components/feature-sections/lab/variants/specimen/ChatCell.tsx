"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { SpecTag } from "./Plate";
import { specimenCopy } from "./copy";

/*
 * The persona as one cell under the microscope. Its traits are the config the
 * chat edits: urgency spines (the over-eager urgent flag) are trimmed by
 * mutation M1, and M2 grows a newsletter wall that pushes newsletters out of
 * the cell. The nucleus reads the measured urgent rate. `phase` is how many
 * mutations are grafted (0-2), 3 once the replay has measured the result.
 */

const S = 360;
const C = S / 2;
const R = 92;
const r2 = (n: number) => Math.round(n * 100) / 100;

function membrane(spine: number, wobble: number): string {
  const pts: string[] = [];
  const steps = 168;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = R + wobble * Math.sin(3 * a + 1) + spine * Math.max(0, Math.sin(14 * a)) ** 6;
    pts.push(`${i === 0 ? "M" : "L"}${r2(C + Math.cos(a) * r)} ${r2(C + Math.sin(a) * r)}`);
  }
  return `${pts.join(" ")} Z`;
}

const WILD = membrane(30, 4);
const TAMED = membrane(6, 3);
const WALL_R = 128;
const TICKS = Array.from({ length: 60 }, (_, i) => i);
/** Newsletters drifting at the membrane, pushed past the wall by M2. */
const LETTERS = [-150, -112, -40, 22, 70, 118].map((deg) => (deg * Math.PI) / 180);
const ORGANELLES = [
  { x: 136, y: 150, rx: 13, ry: 7, rot: -24 },
  { x: 220, y: 214, rx: 15, ry: 8, rot: 32 },
  { x: 150, y: 226, rx: 9, ry: 6, rot: 10 },
  { x: 224, y: 140, rx: 8, ry: 5, rot: -50 },
];

export default function ChatCell({ phase, running, still }: { phase: number; running: boolean; still: boolean }) {
  const copy = specimenCopy.chat;
  const t = (d: number) => (still ? { duration: 0 } : { duration: d, ease: "easeInOut" as const });
  const rate = phase >= 3 ? copy.rateAfter : copy.rateBefore;

  return (
    <div className="relative aspect-square" style={{ width: "min(100cqw, 100cqh - 2.75rem)" }}>
      <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 h-full w-full" aria-hidden fill="none">
        <defs>
          <radialGradient id="spc-lens">
            <stop offset="0%" stopColor={BRAND_VAR.cyan} stopOpacity={0.1} />
            <stop offset="100%" stopColor={BRAND_VAR.cyan} stopOpacity={0.02} />
          </radialGradient>
        </defs>
        {/* reticle: the microscope's field of view */}
        <circle cx={C} cy={C} r={170} fill="url(#spc-lens)" stroke="var(--foreground)" strokeOpacity={0.28} strokeWidth={1.4} />
        <circle cx={C} cy={C} r={176} stroke="var(--foreground)" strokeOpacity={0.12} strokeWidth={6} />
        {TICKS.map((i) => {
          const a = (i / 60) * Math.PI * 2;
          const inner = i % 5 === 0 ? 156 : 162;
          return (
            <line
              key={i}
              x1={r2(C + Math.cos(a) * inner)}
              y1={r2(C + Math.sin(a) * inner)}
              x2={r2(C + Math.cos(a) * 168)}
              y2={r2(C + Math.sin(a) * 168)}
              stroke="var(--foreground)"
              strokeOpacity={i % 5 === 0 ? 0.4 : 0.18}
            />
          );
        })}
        <path d={`M${C} 22 V${S - 22} M22 ${C} H${S - 22}`} stroke="var(--foreground)" strokeOpacity={0.07} strokeDasharray="3 6" />

        {/* M2: the newsletter wall, drawn as it grows */}
        <motion.circle
          cx={C}
          cy={C}
          r={WALL_R}
          stroke={BRAND_VAR.emerald}
          strokeWidth={2.4}
          strokeDasharray="5 6"
          initial={false}
          animate={{ pathLength: phase >= 2 ? 1 : 0, opacity: phase >= 2 ? 1 : 0 }}
          transition={t(1.1)}
        />
        {LETTERS.map((a, i) => {
          const out = phase >= 2;
          const r = out ? 148 : 108;
          return (
            <motion.g
              key={i}
              initial={false}
              animate={{ x: r2(Math.cos(a) * r), y: r2(Math.sin(a) * r), opacity: out ? 0.7 : 1 }}
              transition={still ? { duration: 0 } : { duration: 0.9, delay: 0.3 + i * 0.06, ease: "easeOut" }}
            >
              <rect x={C - 7} y={C - 5} width={14} height={10} rx={1.5} fill="var(--background)" stroke={out ? BRAND_VAR.emerald : BRAND_VAR.rose} strokeWidth={1.4} />
              <path d={`M${C - 7} ${C - 5} L${C} ${C + 1} L${C + 7} ${C - 5}`} stroke={out ? BRAND_VAR.emerald : BRAND_VAR.rose} strokeWidth={1.2} />
            </motion.g>
          );
        })}

        {/* the cell: breathes while the plate is observed */}
        <motion.g
          initial={false}
          animate={running ? { scale: [1, 1.025, 1] } : { scale: 1 }}
          transition={running ? { duration: 4.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
        >
          <motion.path
            d={WILD}
            fill={tint("cyan", 12)}
            stroke={BRAND_VAR.rose}
            strokeWidth={2}
            strokeLinejoin="round"
            initial={false}
            animate={{ opacity: phase >= 1 ? 0 : 1 }}
            transition={t(0.9)}
          />
          <motion.path
            d={TAMED}
            fill={tint("cyan", 14)}
            stroke={BRAND_VAR.cyan}
            strokeWidth={2.2}
            strokeLinejoin="round"
            initial={false}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
            transition={t(0.9)}
          />
          {ORGANELLES.map((o, i) => (
            <ellipse
              key={i}
              cx={o.x}
              cy={o.y}
              rx={o.rx}
              ry={o.ry}
              transform={`rotate(${o.rot} ${o.x} ${o.y})`}
              fill={tint("purple", 14)}
              stroke={tint("purple", 55)}
            />
          ))}
          <circle cx={C} cy={C} r={40} fill="var(--background)" fillOpacity={0.7} />
          <motion.circle
            cx={C}
            cy={C}
            r={40}
            fill={tint("purple", 16)}
            stroke={BRAND_VAR.purple}
            strokeWidth={1.8}
            initial={false}
            animate={{ scale: phase >= 3 ? 1.08 : 1 }}
            transition={still ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 14 }}
          />
        </motion.g>
      </svg>

      {/* the nucleus reads the measured urgent rate */}
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <motion.span
          key={rate}
          initial={still ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-xl font-bold tabular-nums"
          style={{ color: phase >= 3 ? BRAND_VAR.emerald : BRAND_VAR.rose }}
        >
          {rate}
        </motion.span>
        <span className="mt-1 hidden font-mono text-sm text-foreground/75 sm:inline">{copy.rateLabel}</span>
      </div>

      {/* trait tags pinned to the cell: what each mutation changed */}
      <motion.div
        className="absolute right-0 top-[6%] hidden sm:block"
        initial={false}
        animate={{ opacity: phase >= 1 ? 1 : 0.85 }}
      >
        <SpecTag color={phase >= 1 ? "cyan" : "rose"} solid={phase >= 1}>
          {phase >= 1 ? "M1 · " : ""}
          {copy.spines}
        </SpecTag>
      </motion.div>
      <motion.div
        className="absolute bottom-[4%] left-0 hidden sm:block"
        initial={false}
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 6 }}
        transition={t(0.5)}
      >
        <SpecTag color="emerald" solid>
          M2 · {copy.wall}
        </SpecTag>
      </motion.div>
    </div>
  );
}
