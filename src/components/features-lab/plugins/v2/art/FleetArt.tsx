"use client";

import { motion } from "framer-motion";

const C = "var(--brand-cyan)";
const DONE = "var(--brand-emerald)";
const ASK = "var(--brand-purple)";
const mix = (c: string, p: number) => `color-mix(in srgb, ${c} ${p}%, transparent)`;

/** The order the fleet finishes in, and the three sessions blocked on a question. */
const ORDER = [0, 5, 10, 15, 3, 6, 9, 12, 1, 4, 11, 14, 2, 7, 8, 13];
const ASKS = new Set([4, 11, 14]);
const W = 80;
const H = 40;
const GAP = 12;
const X0 = 32;
const Y0 = 22;
const pos = (i: number) => ({ x: X0 + (i % 4) * (W + GAP), y: Y0 + Math.floor(i / 4) * (H + GAP) });

/**
 * Dev Tools, drawn: sixteen terminals at once. Each one lands green in turn;
 * the three blocked on a question wait in violet until the triage light
 * reaches them. `step` is the clock (0..16), owned by the caller's loop gate.
 */
export default function FleetArt({ step, run }: { step: number; run: boolean }) {
  const current = ORDER[Math.min(step, ORDER.length - 1)];
  const orb = pos(current);
  return (
    <svg viewBox="0 0 420 240" className="h-full w-full" aria-hidden="true">
      {ORDER.map((_, i) => {
        const { x, y } = pos(i);
        const rank = ORDER.indexOf(i);
        const done = rank < step;
        const asking = !done && ASKS.has(i);
        const tone = done ? DONE : asking ? ASK : C;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={W}
              height={H}
              rx={8}
              fill={mix(tone, done ? 16 : 6)}
              stroke={mix(tone, done ? 70 : asking ? 80 : 35)}
              strokeWidth={1.2}
              style={{ transition: "fill 500ms, stroke 500ms" }}
            />
            <rect x={x + 10} y={y + 12} width={8} height={3} rx={1.5} fill={tone} />
            <rect x={x + 22} y={y + 12} width={done ? 40 : 26} height={3} rx={1.5} fill={mix("var(--foreground)", 35)} />
            <rect x={x + 10} y={y + 23} width={done ? 52 : 34} height={3} rx={1.5} fill={mix("var(--foreground)", 20)} />
            {asking && (
              <g>
                <circle cx={x + W - 11} cy={y + 11} r={9} fill={ASK} />
                <text x={x + W - 11} y={y + 15.5} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--background)">?</text>
              </g>
            )}
          </g>
        );
      })}
      <motion.circle
        r={13}
        fill={mix(C, 30)}
        stroke={C}
        strokeWidth={2}
        initial={false}
        animate={{ cx: orb.x + W / 2, cy: orb.y + H / 2 }}
        transition={run ? { duration: 0.45, ease: "easeInOut" } : { duration: 0 }}
        style={{ filter: `drop-shadow(0 0 8px ${C})` }}
      />
    </svg>
  );
}
