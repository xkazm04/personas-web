"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { ARENA_ROUNDS } from "../../../data";
import { instrumentCopy } from "../copy";
import { SIDE_COLOR } from "./arena";

/**
 * The round register: one cell per input. A cell latches its winner and
 * margin once its round locks; the current cell carries the cursor. Cells
 * are keys - pressing one jumps the scope to that round's locked reading.
 */
export default function RoundStrip({
  current,
  locked,
  still,
  onPick,
}: {
  current: number;
  locked: boolean;
  still: boolean;
  onPick: (round: number) => void;
}) {
  return (
    <ol className="grid grid-cols-5 gap-1.5">
      {ARENA_ROUNDS.map((r, i) => {
        const latched = i < current || (i === current && locked);
        const on = i === current;
        const k = SIDE_COLOR[r.winner];
        return (
          <li key={r.id}>
            <button
              type="button"
              aria-pressed={on}
              aria-label={fillTemplate(instrumentCopy.arena.roundCell, { n: r.id })}
              onClick={() => onPick(i)}
              className="relative flex w-full flex-col items-start overflow-hidden rounded-md border px-2 py-1 text-left font-mono transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: on ? tint(k, 60) : "var(--border-glass)",
                background: latched ? tint(k, on ? 14 : 7) : "transparent",
              }}
            >
              <span className="text-sm uppercase tracking-[0.12em] text-foreground/60">
                {fillTemplate(instrumentCopy.arena.roundShort, { n: r.id })}
              </span>
              <motion.span
                className="text-base font-bold tabular-nums"
                initial={false}
                animate={{ opacity: latched ? 1 : 0.6 }}
                transition={{ duration: still ? 0 : 0.3 }}
                style={{ color: latched ? BRAND_VAR[k] : "var(--foreground)" }}
              >
                {latched ? `${r.winner} +${Math.abs(r.scoreA - r.scoreB)}` : "—"}
              </motion.span>
              {on && (
                <motion.span
                  layoutId="instrument-round-cursor"
                  transition={still ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-0.5"
                  style={{ background: BRAND_VAR[k] }}
                />
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
