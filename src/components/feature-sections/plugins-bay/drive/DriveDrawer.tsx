"use client";

import { motion } from "framer-motion";
import { FILES } from "./driveData";

const E = "var(--brand-emerald)";
const mix = (c: string, p: number) => `color-mix(in srgb, ${c} ${p}%, transparent)`;

/**
 * The drawer your agents' exports drop into and stay in (ported from the
 * features lab's power-strip variant, relit for the bay window). Each agent
 * sits over its own slot and its file falls down the chute on a spring. On
 * the update beat a scan line sweeps the drawer and every file stays put,
 * each slot's lamp lit and ticked.
 */
export default function DriveDrawer({
  landed,
  updating,
  updated,
  run,
}: {
  landed: number;
  updating: boolean;
  updated: boolean;
  run: boolean;
}) {
  return (
    <svg viewBox="0 0 420 290" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="bay-drive-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="color-mix(in srgb, var(--brand-emerald) 28%, var(--background))" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--brand-emerald) 8%, var(--background))" />
        </linearGradient>
        <radialGradient id="bay-drive-glow" cx="0.5" cy="1" r="0.8">
          <stop offset="0" stopColor="color-mix(in srgb, var(--brand-emerald) 30%, transparent)" />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect x={0} y={100} width={420} height={190} fill="url(#bay-drive-glow)" />
      {/* the agents that export, each over its own slot, with a chute down to it */}
      {FILES.map((f, i) => {
        const Icon = f.agentIcon;
        const hot = run && i === landed - 1 && !updated && !updating;
        const done = i < landed;
        return (
          <g key={`agent-${f.ext}`}>
            <line
              x1={f.x}
              y1={50}
              x2={f.x}
              y2={118}
              stroke={hot ? E : mix(E, done ? 40 : 18)}
              strokeWidth={hot ? 2 : 1.2}
              strokeDasharray="3 5"
              style={{ transition: "stroke 300ms" }}
            />
            <rect
              x={f.x - 19}
              y={8}
              width={38}
              height={38}
              rx={11}
              fill={hot ? mix(E, 26) : mix(E, done ? 12 : 6)}
              stroke={hot ? E : mix(E, done ? 45 : 25)}
              strokeWidth={1.4}
              style={{ transition: "fill 300ms, stroke 300ms", filter: hot ? `drop-shadow(0 0 8px ${mix(E, 70)})` : undefined }}
            />
            <Icon x={f.x - 10} y={17} width={20} height={20} color={done ? "var(--brand-emerald)" : mix(E, 55)} strokeWidth={1.8} />
          </g>
        );
      })}
      {/* back wall of the drawer */}
      <rect x={30} y={142} width={360} height={104} rx={14} fill={mix(E, 7)} stroke={mix(E, 35)} />
      {FILES.map((f, i) => {
        const shown = i < landed;
        const fresh = shown && run && i === landed - 1 && !updated && !updating;
        return (
          <motion.g
            key={`${f.ext}-${shown}`}
            initial={fresh ? { y: -96, opacity: 0 } : false}
            animate={{ y: 0, opacity: shown ? 1 : 0 }}
            transition={run ? { type: "spring", stiffness: 170, damping: 15 } : { duration: 0 }}
          >
            <path d={`M${f.x - 26} 126 h38 l14 14 v70 h-52 z`} fill="color-mix(in srgb, var(--background) 82%, var(--brand-emerald))" stroke={E} strokeWidth={1.5} />
            <path d={`M${f.x + 12} 126 v14 h14`} fill="none" stroke={E} strokeWidth={1.5} />
            <rect x={f.x - 17} y={150} width={30} height={3} rx={1.5} fill={mix("var(--foreground)", 32)} />
            <rect x={f.x - 17} y={158} width={22} height={3} rx={1.5} fill={mix("var(--foreground)", 22)} />
            <text x={f.x} y={182} textAnchor="middle" fontSize={16} fontWeight={700} fontFamily="var(--font-mono)" fill={E}>
              .{f.ext}
            </text>
          </motion.g>
        );
      })}
      {/* the update: one scan line down the drawer, nothing it passes is lost */}
      <motion.rect
        x={22}
        width={376}
        height={3}
        rx={1.5}
        fill={E}
        style={{ filter: `drop-shadow(0 0 6px ${E})` }}
        initial={false}
        animate={updating && run ? { y: [110, 268], opacity: [0, 1, 1, 0] } : { y: 110, opacity: 0 }}
        transition={updating && run ? { duration: 0.85, ease: "easeInOut" } : { duration: 0 }}
      />
      {/* drawer front */}
      <rect x={18} y={200} width={384} height={70} rx={16} fill="url(#bay-drive-front)" stroke={E} strokeWidth={1.5} />
      <rect x={176} y={220} width={68} height={8} rx={4} fill={mix(E, 60)} />
      {FILES.map((f, i) => {
        const on = i < landed;
        return (
          <g key={f.ext}>
            <circle cx={f.x} cy={252} r={updated && on ? 6 : 3.5} fill={on ? E : mix(E, 25)} style={{ transition: "r 300ms, fill 300ms" }} />
            <path
              d={`M${f.x - 2.6} 252 l1.8 1.9 l3.4 -3.8`}
              fill="none"
              stroke="var(--background)"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={updated && on ? 1 : 0}
              style={{ transition: "opacity 300ms" }}
            />
          </g>
        );
      })}
    </svg>
  );
}
