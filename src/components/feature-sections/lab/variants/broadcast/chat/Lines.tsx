"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { CAPS, Plate } from "../Frame";
import { beat } from "../useOnAir";
import { broadcastCopy } from "../copy";
import { URGENT_STAT } from "./plays";

/** One spoken line of the huddle: a speaker plate and the line, slid in from its side. */
export function SpokenLine({ who, tone, tag, text, shown, moving }: { who: string; tone: BrandKey; tag?: string; text: string; shown: boolean; moving: boolean }) {
  return (
    <motion.div
      className="relative border-l-[3px] pl-3"
      style={{ borderColor: BRAND_VAR[tone] }}
      initial={false}
      animate={{ opacity: shown ? 1 : 0, x: shown ? 0 : -10 }}
      transition={beat(moving, 0.4)}
    >
      <div className="mb-1 flex items-center gap-2">
        <Plate tone={tone} solid>
          {who}
        </Plate>
        {tag && <span className={`${CAPS} text-sm text-foreground/70`}>{tag}</span>}
      </div>
      <p className="text-base leading-relaxed text-foreground/90">{text}</p>
    </motion.div>
  );
}

const pct = (v: number) => `${(v / URGENT_STAT.scaleMax) * 100}%`;

/**
 * The final-whistle stat graphic: the urgent-flag rate before and after the
 * refinement on one 0-40% scale, with the benchmark band behind both bars,
 * so "back inside the benchmark" reads at a glance.
 */
export function StatOverlay({ shown, moving }: { shown: boolean; moving: boolean }) {
  const c = broadcastCopy.chat;
  const rows: { label: string; value: number; tone: BrandKey }[] = [
    { label: c.statBefore, value: URGENT_STAT.before, tone: "rose" },
    { label: c.statAfter, value: URGENT_STAT.after, tone: "emerald" },
  ];
  return (
    <motion.div
      className="rounded-lg border border-glass bg-foreground/[0.03] px-3 py-2.5"
      initial={false}
      animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 8 }}
      transition={beat(moving, 0.4)}
    >
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <span className={`${CAPS} text-base text-foreground`}>{c.statLabel}</span>
        <span className="font-mono text-sm text-foreground/70">{c.statBenchmark}</span>
      </div>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={r.label} className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-2">
            <span className="truncate text-sm text-foreground/80">{r.label}</span>
            <span className="relative h-3 overflow-hidden rounded-sm bg-foreground/[0.06]">
              <span
                aria-hidden
                className="absolute inset-y-0"
                style={{ left: pct(URGENT_STAT.benchLo), width: pct(URGENT_STAT.benchHi - URGENT_STAT.benchLo), background: tint("emerald", 22) }}
              />
              <motion.span
                className="absolute inset-y-0 left-0 w-full origin-left -skew-x-12"
                style={{ background: BRAND_VAR[r.tone] }}
                initial={false}
                animate={{ scaleX: shown ? r.value / URGENT_STAT.scaleMax : 0 }}
                transition={beat(moving, 0.7, 0.15 + i * 0.25)}
              />
            </span>
            <span className="text-right font-mono text-base font-semibold tabular-nums" style={{ color: BRAND_VAR[r.tone] }}>
              {r.value}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
