"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR } from "@/lib/brand-theme";
import { ArtBox, MemoryShell, ReplayButton, StylisedTag, frame } from "../shared/Frame";
import { beat, clamp01, usePlay } from "../shared/motion";
import { catColor } from "../shared/categories";
import { BOTTOM_Y, FAILS, H, SHELF_Y, T, W } from "./geometry";
import Lanes from "./Lanes";
import { TOKENS, passAt, r2Of } from "./parts";

/**
 * Features lab - Remembers what works, V1 "Run twice, relit" (the direct
 * successor). Same concept and replay control as the live section: run 1
 * wanders and fails twice, each failure becomes a memory (a warning and a
 * learning) on the shelf between the lanes, and run 12 recalls both and goes
 * straight to the goal. Upgraded with lit lanes, failure bursts, category
 * tokens, recall beams, a comet head and the outcome stated as a label.
 */

const DURATION = 4.6;
const { place, fs } = frame(W, H);

function Fade({ p, at, style, className = "", children }: {
  p: MotionValue<number>;
  at: (v: number) => number;
  style: CSSProperties;
  className?: string;
  children: ReactNode;
}) {
  const opacity = useTransform(p, at);
  const y = useTransform(opacity, (o) => (1 - o) * 6);
  return (
    <motion.span className={`absolute whitespace-nowrap leading-none ${className}`} style={{ ...style, opacity, y }}>
      {children}
    </motion.span>
  );
}

export default function LabVariant() {
  const t = useTranslation().t;
  const copy = t.featuresLab.memory;
  const live = t.memorySection;
  const ref = useRef<HTMLDivElement>(null);
  const { p, play, still } = usePlay(ref, DURATION);

  const runLabel = "absolute font-bold tracking-tight leading-none";
  const stat = "font-semibold";

  return (
    <MemoryShell>
      <ArtBox w={W} h={H} boxRef={ref} label={copy.v1.artLabel}>
        <Lanes p={p} />

        <span className={`${runLabel} text-foreground/70`} style={{ ...place(52, 56), ...fs(34, 16) }}>
          {live.run1}
        </span>
        <Fade p={p} at={(v) => beat(v, T.run1[1] - 0.02, T.drop[0] + 0.04)} className={stat} style={{ ...place(52, 102), ...fs(21, 14), color: BRAND_VAR.rose }}>
          {copy.v1.retries.replace("{n}", "2")}
        </Fade>

        <span
          className="absolute font-mono font-semibold uppercase tracking-[0.18em]"
          style={{ ...place(52, SHELF_Y - 11), ...fs(17, 12), color: BRAND_VAR.purple }}
        >
          {live.memory}
        </span>
        {TOKENS.map((k, i) => (
          <Fade
            key={k}
            p={p}
            at={(v) => beat(v, T.drop[1] - 0.02 + i * 0.03, T.drop[1] + 0.03 + i * 0.03)}
            className="font-semibold"
            style={{ ...place(FAILS[i].x + 42, SHELF_Y - 11), ...fs(21, 14), color: catColor(k) }}
          >
            {copy.categories[k]}
          </Fade>
        ))}

        <span className={runLabel} style={{ ...place(52, 376), ...fs(34, 16), color: BRAND_VAR.cyan }}>
          {live.run12}
        </span>
        <Fade p={p} at={(v) => beat(v, T.goal[0], T.goal[0] + 0.06)} className={stat} style={{ ...place(52, 422), ...fs(21, 14), color: BRAND_VAR.emerald }}>
          {copy.v1.noRetries}
        </Fade>
        {TOKENS.map((k, i) => (
          <Fade
            key={k}
            p={p}
            at={(v) => clamp01((r2Of(v) - passAt(i)) / 0.08)}
            className="font-mono uppercase tracking-[0.14em] text-foreground/75"
            style={{ ...place(FAILS[i].x, BOTTOM_Y + 36), ...fs(16, 12), translate: "-50% 0" }}
          >
            {copy.v1.recalled}
          </Fade>
        ))}

        <ReplayButton onClick={play} disabled={still} style={place(1132, 42)} />
        <StylisedTag style={{ ...place(52, 512), ...fs(12, 12) }} />
      </ArtBox>
    </MemoryShell>
  );
}
