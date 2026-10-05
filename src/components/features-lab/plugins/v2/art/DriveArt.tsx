"use client";

import { motion } from "framer-motion";

const E = "var(--brand-emerald)";
const mix = (c: string, p: number) => `color-mix(in srgb, ${c} ${p}%, transparent)`;

/** What agents export (file types, shown as code), each landing in its own slot of the drawer. */
const FILES = [
  { ext: "pdf", x: 70 },
  { ext: "png", x: 136 },
  { ext: "csv", x: 202 },
  { ext: "mp4", x: 268 },
  { ext: "md", x: 334 },
];

/**
 * Drive, drawn: a drawer your agents' exports drop into and stay in. `step`
 * counts how many have landed this cycle; each new file falls into its slot.
 */
export default function DriveArt({ step, run }: { step: number; run: boolean }) {
  const landed = step % (FILES.length + 2);
  return (
    <svg viewBox="0 0 420 240" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="flab-drive-tray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="color-mix(in srgb, var(--brand-emerald) 30%, var(--background))" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--brand-emerald) 10%, var(--background))" />
        </linearGradient>
      </defs>
      {/* back wall of the drawer */}
      <rect x={34} y={96} width={352} height={104} rx={14} fill={mix(E, 7)} stroke={mix(E, 35)} />
      {FILES.map((f, i) => {
        const shown = i < landed;
        return (
          <motion.g
            key={`${f.ext}-${shown}`}
            initial={shown && run && i === landed - 1 ? { y: -110, opacity: 0 } : false}
            animate={{ y: 0, opacity: shown ? 1 : 0 }}
            transition={run ? { type: "spring", stiffness: 180, damping: 16 } : { duration: 0 }}
          >
            <path
              d={`M${f.x - 24} 82 h36 l12 12 v66 h-48 z`}
              fill="color-mix(in srgb, var(--background) 82%, var(--brand-emerald))"
              stroke={E}
              strokeWidth={1.4}
            />
            <path d={`M${f.x + 12} 82 v12 h12`} fill="none" stroke={E} strokeWidth={1.4} />
            <rect x={f.x - 16} y={106} width={28} height={3} rx={1.5} fill={mix("var(--foreground)", 30)} />
            <rect x={f.x - 16} y={114} width={20} height={3} rx={1.5} fill={mix("var(--foreground)", 22)} />
            <text x={f.x} y={132} textAnchor="middle" fontSize={13} fontWeight={700} fontFamily="var(--font-mono)" fill={E}>
              .{f.ext}
            </text>
          </motion.g>
        );
      })}
      {/* drawer front */}
      <rect x={22} y={152} width={376} height={64} rx={16} fill="url(#flab-drive-tray)" stroke={E} strokeWidth={1.4} />
      <rect x={176} y={174} width={68} height={8} rx={4} fill={mix(E, 60)} />
      {FILES.map((f, i) => (
        <circle key={f.ext} cx={f.x} cy={200} r={3} fill={i < landed ? E : mix(E, 25)} style={{ transition: "fill 300ms" }} />
      ))}
    </svg>
  );
}
